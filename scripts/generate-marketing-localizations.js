#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI, { toFile } from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'marketing', 'localized');
const MANIFEST_FILE = path.join(ROOT_DIR, 'src', 'data', 'marketing-localizations.json');

const TEMPLATE_IMAGES = [
  {
    id: 'appmarketing01',
    sourcePath: path.join(ROOT_DIR, 'appmarketing01.png'),
    defaultHeadline: 'Learn Somali',
    category: 'Actions'
  },
  {
    id: 'appmarketing02',
    sourcePath: path.join(ROOT_DIR, 'appmarketing02.png'),
    defaultHeadline: 'Fun Vocabulary',
    category: 'Animals'
  },
  {
    id: 'appmarketing03',
    sourcePath: path.join(ROOT_DIR, 'appmarketing03.png'),
    defaultHeadline: 'Interactive Learning',
    category: 'Home Objects'
  },
  {
    id: 'appmarketing04',
    sourcePath: path.join(ROOT_DIR, 'appmarketing04.png'),
    defaultHeadline: 'Bilingual Play',
    category: 'Colors'
  },
  {
    id: 'appmarketing05',
    sourcePath: path.join(ROOT_DIR, 'appmarketing05.png'),
    defaultHeadline: 'Kids Language',
    category: 'Family'
  },
  {
    id: 'appmarketing06',
    sourcePath: path.join(ROOT_DIR, 'appmarketing06.png'),
    defaultHeadline: 'Visual Learning',
    category: 'Nature'
  }
];

const DEFAULT_TARGET_LANGUAGES = [
  { slug: 'somali', name: 'Somali' },
  { slug: 'spanish', name: 'Spanish' },
  { slug: 'arabic', name: 'Arabic' },
  { slug: 'french', name: 'French' },
  { slug: 'swahili', name: 'Swahili' },
  { slug: 'amharic', name: 'Amharic' }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    model: 'gpt-image-1',
    quality: 'high',
    size: 'auto',
    maxJobs: null,
    templates: null,
    languages: null,
    skipExisting: true,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--model=')) {
      options.model = arg.replace('--model=', '').trim();
    } else if (arg.startsWith('--quality=')) {
      options.quality = arg.replace('--quality=', '').trim();
    } else if (arg.startsWith('--size=')) {
      options.size = arg.replace('--size=', '').trim();
    } else if (arg.startsWith('--max-jobs=')) {
      options.maxJobs = Number(arg.replace('--max-jobs=', ''));
    } else if (arg.startsWith('--templates=')) {
      options.templates = arg.replace('--templates=', '').split(',').map((item) => item.trim()).filter(Boolean);
    } else if (arg.startsWith('--languages=')) {
      options.languages = arg.replace('--languages=', '').split(',').map((item) => item.trim()).filter(Boolean);
    } else if (arg === '--no-skip-existing') {
      options.skipExisting = false;
    }
  }

  return options;
}

function estimateCost(jobCount) {
  const averagePerEdit = 0.08;
  return {
    min: jobCount * 0.04,
    estimated: jobCount * averagePerEdit,
    max: jobCount * 0.14,
  };
}

function selectTemplates(options) {
  if (!options.templates || options.templates.length === 0) {
    return TEMPLATE_IMAGES;
  }

  const wanted = new Set(options.templates.map((template) => template.toLowerCase()));
  return TEMPLATE_IMAGES.filter((template) => wanted.has(template.id.toLowerCase()));
}

function selectLanguages(options) {
  if (!options.languages || options.languages.length === 0) {
    return DEFAULT_TARGET_LANGUAGES;
  }

  const wanted = new Set(options.languages.map((language) => language.toLowerCase()));
  return DEFAULT_TARGET_LANGUAGES.filter((language) => wanted.has(language.slug.toLowerCase()) || wanted.has(language.name.toLowerCase()));
}

function buildJobs(options) {
  const templates = selectTemplates(options);
  const languages = selectLanguages(options);
  const jobs = [];

  for (const template of templates) {
    for (const language of languages) {
      jobs.push({
        template,
        language,
        outputPath: path.join(OUTPUT_DIR, language.slug, `${template.id}.png`),
      });
    }
  }

  if (options.maxJobs && Number.isFinite(options.maxJobs)) {
    return jobs.slice(0, Math.max(1, options.maxJobs));
  }

  return jobs;
}

function buildPrompt(job) {
  return [
    'Use case: text-localization.',
    'Asset type: mobile app marketing poster.',
    `Primary request: edit this existing poster for ${job.language.name}.`,
    `This template currently represents the ${job.template.category} category and headline "${job.template.defaultHeadline}".`,
    'Change only language text while preserving design system.',
    'Keep composition, phone framing, icon illustrations, color palette, decorative stickers, and spacing nearly identical.',
    `Replace Somali and existing text labels with natural ${job.language.name} equivalents that match the category context.`,
    `Set the top language toggle to "English" and "${job.language.name}".`,
    'Translate card labels and subtitles consistently and keep text fully legible.',
    'Use clean UI typography with realistic app-screen text alignment and size.',
    'Do not add watermarks or extra branding. Do not redesign the layout.'
  ].join(' ');
}

async function toImageUpload(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeByExt = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  };
  const mimeType = mimeByExt[ext] || 'image/png';
  const buffer = await fs.promises.readFile(filePath);
  return toFile(buffer, path.basename(filePath), { type: mimeType });
}

function ensureFile(pathToFile) {
  if (!fs.existsSync(pathToFile)) {
    throw new Error(`Missing file: ${pathToFile}`);
  }
}

function ensureParent(pathToFile) {
  fs.mkdirSync(path.dirname(pathToFile), { recursive: true });
}

function saveManifest(items, options) {
  const payload = {
    generatedAt: new Date().toISOString(),
    options: {
      model: options.model,
      quality: options.quality,
      size: options.size,
    },
    items,
  };
  fs.writeFileSync(MANIFEST_FILE, `${JSON.stringify(payload, null, 2)}\n`);
}

function formatError(error) {
  const status = error?.status ?? error?.response?.status;
  const message = error?.error?.message || error?.message || String(error);
  return status ? `${message} (status ${status})` : message;
}

async function main() {
  const options = parseArgs();
  const jobs = buildJobs(options);

  if (jobs.length === 0) {
    throw new Error('No jobs selected. Check --templates and --languages filters.');
  }

  for (const job of jobs) {
    ensureFile(job.template.sourcePath);
  }

  const pricing = estimateCost(jobs.length);

  if (options.dryRun) {
    console.log(`Dry run: ${jobs.length} marketing localization jobs`);
    console.log(`Model: ${options.model}`);
    console.log(`Output directory: ${path.relative(ROOT_DIR, OUTPUT_DIR)}`);
    console.log(`Estimated cost: $${pricing.min.toFixed(2)} - $${pricing.max.toFixed(2)} (avg $${pricing.estimated.toFixed(2)})`);
    for (const job of jobs) {
      console.log(`- ${job.template.id} (${job.template.category}) -> ${job.language.name} -> ${path.relative(ROOT_DIR, job.outputPath)}`);
    }
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required.');
  }

  const client = new OpenAI({ apiKey });
  const items = [];
  let failures = 0;

  for (const [index, job] of jobs.entries()) {
    process.stdout.write(`[${index + 1}/${jobs.length}] ${job.template.id} -> ${job.language.name} ... `);

    if (options.skipExisting && fs.existsSync(job.outputPath)) {
      items.push({
        id: `${job.template.id}-${job.language.slug}`,
        templateId: job.template.id,
        category: job.template.category,
        language: job.language.name,
        languageSlug: job.language.slug,
        imagePath: `/marketing/localized/${job.language.slug}/${job.template.id}.png`,
        method: 'existing',
      });
      console.log('skipped (existing)');
      continue;
    }

    try {
      const inputImage = await toImageUpload(job.template.sourcePath);
      const response = await client.images.edit({
        model: options.model,
        image: inputImage,
        prompt: buildPrompt(job),
        size: options.size,
      });

      const imageB64 = response.data?.[0]?.b64_json;
      if (!imageB64) {
        throw new Error('No image data returned.');
      }

      ensureParent(job.outputPath);
      fs.writeFileSync(job.outputPath, Buffer.from(imageB64, 'base64'));

      items.push({
        id: `${job.template.id}-${job.language.slug}`,
        templateId: job.template.id,
        category: job.template.category,
        language: job.language.name,
        languageSlug: job.language.slug,
        imagePath: `/marketing/localized/${job.language.slug}/${job.template.id}.png`,
        method: 'edit',
      });

      console.log('saved');
    } catch (error) {
      failures += 1;
      console.log(`failed: ${formatError(error)}`);
    }
  }

  saveManifest(items, options);
  console.log(`\nDone. Generated ${items.length}/${jobs.length} localized marketing images.`);
  console.log(`Manifest: ${path.relative(ROOT_DIR, MANIFEST_FILE)}`);

  if (failures > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
