#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const LANGUAGES_FILE = path.join(ROOT_DIR, 'src', 'data', 'languages.json');
const STICKERS_FILE = path.join(ROOT_DIR, 'src', 'data', 'stickers.json');
const TRANSLATIONS_FILE = path.join(ROOT_DIR, 'src', 'data', 'word-translations.json');

const DEFAULT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    overwrite: false,
    dryRun: false,
    model: DEFAULT_MODEL,
    languages: null,
    words: null,
  };

  for (const arg of args) {
    if (arg === '--overwrite') {
      options.overwrite = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--model=')) {
      options.model = arg.replace('--model=', '').trim();
    } else if (arg.startsWith('--languages=')) {
      options.languages = arg
        .replace('--languages=', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith('--words=')) {
      options.words = arg
        .replace('--words=', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildPrompt(targetLanguage, entries) {
  return [
    `Translate the English toddler vocabulary into ${targetLanguage.name} (${targetLanguage.nativeName || targetLanguage.name}).`,
    'Return only JSON with this shape: {"translations":{"word_id":"translated_word"}}',
    'Rules:',
    '- Keep translations child-friendly and common.',
    '- Prefer a single word; use short phrase only if necessary.',
    '- Do not include explanations, transliterations, or pronunciation notes.',
    '- Keep numbers as translated words, not digits.',
    '- Preserve each word_id exactly as provided.',
    '',
    `Words: ${JSON.stringify(entries)}`,
  ].join('\n');
}

async function translateLanguage(client, model, language, entries) {
  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a precise multilingual translator for children vocabulary.',
      },
      {
        role: 'user',
        content: buildPrompt(language, entries),
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`No response content for language ${language.slug}`);
  }

  const parsed = JSON.parse(content);
  const translations = parsed.translations && typeof parsed.translations === 'object'
    ? parsed.translations
    : parsed;

  const result = {};
  for (const entry of entries) {
    const translated = translations[entry.id];
    if (typeof translated === 'string' && translated.trim()) {
      result[entry.id] = translated.trim();
    }
  }
  return result;
}

function ensureEnglishWords(baseWords, stickers) {
  for (const sticker of stickers) {
    if (!baseWords[sticker.id]) {
      baseWords[sticker.id] = {};
    }
    baseWords[sticker.id].en = baseWords[sticker.id].en || sticker.label;
  }
}

function reorderWords(words, stickers, languages) {
  const orderedWordIds = [...new Set([...stickers.map((s) => s.id), ...Object.keys(words)])];
  const languageOrder = ['en', ...languages.map((l) => l.slug)];

  const orderedWords = {};
  for (const wordId of orderedWordIds) {
    const entry = words[wordId] || {};
    const orderedEntry = {};

    for (const languageKey of languageOrder) {
      if (entry[languageKey]) {
        orderedEntry[languageKey] = entry[languageKey];
      }
    }

    for (const extraKey of Object.keys(entry).sort()) {
      if (!orderedEntry[extraKey]) {
        orderedEntry[extraKey] = entry[extraKey];
      }
    }

    orderedWords[wordId] = orderedEntry;
  }

  return orderedWords;
}

async function main() {
  const options = parseArgs();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is required.');
    process.exit(1);
  }

  const languagesData = readJson(LANGUAGES_FILE);
  const stickersData = readJson(STICKERS_FILE);
  const translationsData = readJson(TRANSLATIONS_FILE);

  const allLanguages = languagesData.languages || [];
  const stickers = stickersData.stickers || [];
  const words = translationsData.words || {};
  ensureEnglishWords(words, stickers);

  const targetLanguages = (options.languages
    ? allLanguages.filter((language) => options.languages.includes(language.slug))
    : allLanguages
  ).filter((language) => language.slug !== 'en');

  const targetWordIds = options.words
    ? stickers.filter((sticker) => options.words.includes(sticker.id)).map((sticker) => sticker.id)
    : stickers.map((sticker) => sticker.id);

  if (!targetLanguages.length) {
    console.log('No target languages selected.');
    return;
  }

  const client = new OpenAI({ apiKey });
  let translatedCount = 0;

  for (const language of targetLanguages) {
    const entriesToTranslate = targetWordIds
      .filter((wordId) => options.overwrite || !words[wordId]?.[language.slug])
      .map((wordId) => ({
        id: wordId,
        english: words[wordId]?.en || wordId,
      }));

    if (!entriesToTranslate.length) {
      console.log(`Skipping ${language.slug}: no missing entries.`);
      continue;
    }

    console.log(`Translating ${entriesToTranslate.length} words -> ${language.slug}...`);
    const translated = await translateLanguage(client, options.model, language, entriesToTranslate);

    for (const entry of entriesToTranslate) {
      if (!words[entry.id]) {
        words[entry.id] = { en: entry.english };
      }
      words[entry.id][language.slug] = translated[entry.id] || entry.english;
      translatedCount += 1;
    }
  }

  const output = {
    defaultLanguage: translationsData.defaultLanguage || 'en',
    words: reorderWords(words, stickers, allLanguages),
  };

  if (options.dryRun) {
    console.log(`Dry run complete. Would write ${translatedCount} translations.`);
    return;
  }

  writeJson(TRANSLATIONS_FILE, output);
  console.log(`Done. Wrote ${translatedCount} translations to ${TRANSLATIONS_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
