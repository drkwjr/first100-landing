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

const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'showcase');
const MANIFEST_FILE = path.join(ROOT_DIR, 'src', 'data', 'showcase-variants.json');

const CATEGORIES = [
  'Animals',
  'Colors',
  'Body Parts',
  'Family',
  'Food & Drink',
  'Numbers',
  'Actions',
  'Nature',
  'Feelings',
  'Core Responses',
  'Home Objects',
  'Daily Words'
];

const DEFAULT_LANGUAGE_PAIRS = [
  { source: 'English', target: 'Somali' },
  { source: 'English', target: 'Spanish' },
  { source: 'English', target: 'Arabic' },
  { source: 'English', target: 'French' },
  { source: 'English', target: 'Swahili' },
  { source: 'English', target: 'Amharic' }
];

const SCREEN_REFERENCES = [
  path.join(ROOT_DIR, 'first100screen1.PNG'),
  path.join(ROOT_DIR, 'first100screen2.PNG'),
  path.join(ROOT_DIR, 'first100screen3.PNG')
];

const MARKETING_REFERENCES = [
  path.join(ROOT_DIR, 'appmarketing01.png'),
  path.join(ROOT_DIR, 'appmarketing02.png'),
  path.join(ROOT_DIR, 'appmarketing03.png'),
  path.join(ROOT_DIR, 'appmarketing04.png'),
  path.join(ROOT_DIR, 'appmarketing05.png'),
  path.join(ROOT_DIR, 'appmarketing06.png')
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    maxJobs: 12,
    editModel: 'gpt-image-1',
    fallbackModel: 'gpt-image-1.5',
    allowFallback: false,
    size: '1024x1024',
    quality: 'medium',
    categories: null,
    pairs: null,
    referenceSet: 'screens+marketing',
    skipExisting: true,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--max-jobs=')) {
      options.maxJobs = Number(arg.replace('--max-jobs=', ''));
    } else if (arg.startsWith('--edit-model=')) {
      options.editModel = arg.replace('--edit-model=', '').trim();
    } else if (arg.startsWith('--fallback-model=')) {
      options.fallbackModel = arg.replace('--fallback-model=', '').trim();
    } else if (arg === '--allow-fallback') {
      options.allowFallback = true;
    } else if (arg.startsWith('--size=')) {
      options.size = arg.replace('--size=', '').trim();
    } else if (arg.startsWith('--quality=')) {
      options.quality = arg.replace('--quality=', '').trim();
    } else if (arg.startsWith('--categories=')) {
      options.categories = arg.replace('--categories=', '').split(',').map((item) => item.trim()).filter(Boolean);
    } else if (arg.startsWith('--pairs=')) {
      options.pairs = arg
        .replace('--pairs=', '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((pair) => {
          const [source, target] = pair.split(':').map((token) => token.trim());
          return { source, target };
        })
        .filter((pair) => pair.source && pair.target);
    } else if (arg.startsWith('--reference-set=')) {
      options.referenceSet = arg.replace('--reference-set=', '').trim();
    } else if (arg === '--no-skip-existing') {
      options.skipExisting = false;
    }
  }

  return options;
}

function resolveReferenceImages(referenceSet) {
  if (referenceSet === 'screens') {
    return SCREEN_REFERENCES;
  }
  if (referenceSet === 'marketing') {
    return MARKETING_REFERENCES;
  }
  return [...SCREEN_REFERENCES, ...MARKETING_REFERENCES];
}

function buildJobs(options) {
  const selectedCategories = options.categories && options.categories.length > 0 ? options.categories : CATEGORIES;
  const selectedPairs = options.pairs && options.pairs.length > 0 ? options.pairs : DEFAULT_LANGUAGE_PAIRS;
  const targetCount = Math.max(1, options.maxJobs);
  const jobs = [];
  let index = 0;

  while (jobs.length < targetCount) {
    const category = selectedCategories[index % selectedCategories.length];
    const pair = selectedPairs[Math.floor(index / selectedCategories.length) % selectedPairs.length];
    const pairSlug = `${slugify(pair.source)}-${slugify(pair.target)}`;
    const categorySlug = slugify(category);

    jobs.push({
      category,
      categorySlug,
      pair,
      pairSlug,
      outputPath: path.join(OUTPUT_DIR, pairSlug, `${categorySlug}.png`),
    });

    index += 1;
  }

  return jobs;
}

function buildPrompt(job) {
  return [
    'Use case: illustration-story.',
    'Asset type: toddler language app category illustration.',
    `Primary request: create a clean educational visual for the category "${job.category}" for ${job.pair.source} + ${job.pair.target}.`,
    'Use the attached reference images only as style and composition guidance.',
    'Preserve the same child-friendly visual language: rounded flat icons, soft pastel palette, clear spacing, minimal clutter.',
    'Include 4 to 6 objects that are unmistakably tied to the category.',
    'White background, no app frame, no overlays, no decorative UI chrome.',
    'No text, no letters, no numbers, no logo, no watermark.',
    `Cultural fit: choose objects that feel familiar and respectful for ${job.pair.target}-speaking households.`
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

async function generateFromEdit(client, references, job, options) {
  const imageInputs = await Promise.all(references.map((referencePath) => toImageUpload(referencePath)));
  const prompt = buildPrompt(job);

  const response = await client.images.edit({
    model: options.editModel,
    image: imageInputs,
    prompt,
    size: options.size,
    background: 'opaque',
  });

  return {
    imageB64: response.data?.[0]?.b64_json,
    method: 'edit',
    model: options.editModel,
    prompt,
  };
}

async function generateFallback(client, job, options) {
  const prompt = buildPrompt(job);
  const response = await client.images.generate({
    model: options.fallbackModel,
    prompt,
    size: options.size,
    quality: options.quality,
    background: 'opaque',
  });

  return {
    imageB64: response.data?.[0]?.b64_json,
    method: 'generate-fallback',
    model: options.fallbackModel,
    prompt,
  };
}

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function saveManifest(items, options, references) {
  const payload = {
    generatedAt: new Date().toISOString(),
    options: {
      editModel: options.editModel,
      fallbackModel: options.fallbackModel,
      allowFallback: options.allowFallback,
      size: options.size,
      quality: options.quality,
      referenceSet: options.referenceSet,
    },
    references: references.map((referencePath) => path.relative(ROOT_DIR, referencePath)),
    items,
  };
  fs.writeFileSync(MANIFEST_FILE, `${JSON.stringify(payload, null, 2)}\n`);
}

function estimateCost(jobCount) {
  const averagePerImage = 0.05;
  return {
    min: jobCount * 0.03,
    estimated: jobCount * averagePerImage,
    max: jobCount * 0.08,
  };
}

function formatError(error) {
  const status = error?.status ?? error?.response?.status;
  const message = error?.error?.message || error?.message || String(error);
  return status ? `${message} (status ${status})` : message;
}

async function main() {
  const options = parseArgs();
  const references = resolveReferenceImages(options.referenceSet);
  const jobs = buildJobs(options);
  const pricing = estimateCost(jobs.length);

  const missingReferences = references.filter((referencePath) => !fs.existsSync(referencePath));
  if (missingReferences.length > 0) {
    throw new Error(`Missing reference images: ${missingReferences.join(', ')}`);
  }

  if (options.dryRun) {
    console.log(`Dry run: ${jobs.length} showcase jobs`);
    console.log(`Edit model: ${options.editModel}`);
    console.log(`Fallback enabled: ${options.allowFallback ? `yes (${options.fallbackModel})` : 'no'}`);
    console.log(`Reference set: ${options.referenceSet} (${references.length} images)`);
    for (const referencePath of references) {
      console.log(`  ref: ${path.relative(ROOT_DIR, referencePath)}`);
    }
    console.log(`Estimated cost: $${pricing.min.toFixed(2)} - $${pricing.max.toFixed(2)} (avg $${pricing.estimated.toFixed(2)})`);
    for (const job of jobs) {
      console.log(`- ${job.pair.source} + ${job.pair.target} / ${job.category} -> ${path.relative(ROOT_DIR, job.outputPath)}`);
    }
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required.');
  }

  const client = new OpenAI({ apiKey });
  const manifestItems = [];
  let failures = 0;

  for (const [index, job] of jobs.entries()) {
    process.stdout.write(`[${index + 1}/${jobs.length}] ${job.pair.source} + ${job.pair.target} / ${job.category} ... `);

    if (options.skipExisting && fs.existsSync(job.outputPath)) {
      manifestItems.push({
        id: `${job.pairSlug}-${job.categorySlug}`,
        category: job.category,
        sourceLanguage: job.pair.source,
        targetLanguage: job.pair.target,
        pairSlug: job.pairSlug,
        imagePath: `/showcase/${job.pairSlug}/${job.categorySlug}.png`,
        method: 'existing',
        model: null,
      });
      console.log('skipped (existing)');
      continue;
    }

    try {
      let result;
      try {
        result = await generateFromEdit(client, references, job, options);
      } catch (editError) {
        if (!options.allowFallback) {
          throw new Error(`edit failed: ${formatError(editError)}`);
        }
        result = await generateFallback(client, job, options);
      }

      if (!result.imageB64) {
        throw new Error('No image data returned.');
      }

      ensureDirectory(job.outputPath);
      fs.writeFileSync(job.outputPath, Buffer.from(result.imageB64, 'base64'));

      manifestItems.push({
        id: `${job.pairSlug}-${job.categorySlug}`,
        category: job.category,
        sourceLanguage: job.pair.source,
        targetLanguage: job.pair.target,
        pairSlug: job.pairSlug,
        imagePath: `/showcase/${job.pairSlug}/${job.categorySlug}.png`,
        method: result.method,
        model: result.model,
      });

      console.log(`saved (${result.method})`);
    } catch (error) {
      failures += 1;
      console.log(`failed: ${formatError(error)}`);
    }
  }

  saveManifest(manifestItems, options, references);
  console.log(`\nDone. Generated ${manifestItems.length}/${jobs.length} showcase variants.`);
  console.log(`Manifest: ${path.relative(ROOT_DIR, MANIFEST_FILE)}`);

  if (failures > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
