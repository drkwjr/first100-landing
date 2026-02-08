#!/usr/bin/env node
/**
 * First 100 Illustration Generator
 * 
 * Generates consistent, child-friendly illustrations using OpenAI image models.
 * 
 * Usage:
 *   node scripts/generate-illustrations.js              # Generate all
 *   node scripts/generate-illustrations.js --dry-run    # Estimate cost only
 *   node scripts/generate-illustrations.js --only=cat,dog,apple  # Generate specific
 *   node scripts/generate-illustrations.js --category=animals    # Generate by category
 *   node scripts/generate-illustrations.js --model=gpt-image-1.5-2025-12-16 # Override model
 *   node scripts/generate-illustrations.js --auto-model # Pick a valid image model from API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OBJECTS, buildPrompt, estimateCost, getObjectsByCategory } from './illustration-prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'illustrations');
const LOG_FILE = path.join(ROOT_DIR, 'generation-log.json');
const MANIFEST_FILE = path.join(ROOT_DIR, 'src', 'data', 'illustrations.json');

// Configuration — OpenAI GPT Image 1.5 (Image API: /v1/images/generations)
// GPT Image models always return base64; do not send response_format for them (API rejects it).
const CONFIG = {
  size: '1024x1024',
  quality: 'medium',
  responseFormat: 'b64_json', // only used for dall-e-2 / dall-e-3
  batchDelay: 1000,
};

const DEFAULT_MODEL = 'gpt-image-1.5';
const GPT_IMAGE_MODELS = new Set(['gpt-image-1.5', 'gpt-image-1', 'gpt-image-1-mini']);
const FALLBACK_MODEL = 'gpt-image-1'; // try this if gpt-image-1.5 returns 404 (e.g. org has access to 1 but not 1.5)

function isGptImageModel(model) {
  return model.startsWith('gpt-image-') || GPT_IMAGE_MODELS.has(model);
}

function isGptImage15(model) {
  return model === 'gpt-image-1.5' || model.startsWith('gpt-image-1.5-');
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    only: null,
    category: null,
    verbose: false,
    model: null,
    autoModel: false,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg.startsWith('--only=')) {
      options.only = arg.replace('--only=', '').split(',').map(s => s.trim());
    } else if (arg.startsWith('--category=')) {
      options.category = arg.replace('--category=', '').trim();
    } else if (arg.startsWith('--model=')) {
      options.model = arg.replace('--model=', '').trim();
    } else if (arg === '--auto-model') {
      options.autoModel = true;
    }
  }

  return options;
}

/**
 * Load or initialize the generation log
 */
function loadLog() {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  }
  return {
    runs: [],
    totalSpent: 0,
    totalGenerated: 0,
  };
}

/**
 * Save the generation log
 */
function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

/**
 * Load or initialize the illustrations manifest
 */
function loadManifest() {
  if (fs.existsSync(MANIFEST_FILE)) {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  }
  return { illustrations: [] };
}

/**
 * Save the illustrations manifest
 */
function saveManifest(manifest) {
  // Ensure directory exists
  const dir = path.dirname(MANIFEST_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

/**
 * Build request options for images.generate. GPT Image models must not receive response_format.
 */
function buildGenerateOptions(model) {
  const base = {
    model,
    prompt: null, // set per call
    n: 1,
    size: CONFIG.size,
    quality: CONFIG.quality,
  };
  if (!isGptImageModel(model)) {
    base.response_format = CONFIG.responseFormat;
  }
  return base;
}

function logErrorDetails(error, label) {
  if (!error) {
    return;
  }
  const status = error?.status ?? error?.response?.status ?? null;
  const data = error?.error ?? error?.response?.data ?? null;
  const requestId =
    error?.response?.headers?.['x-request-id'] ??
    error?.response?.headers?.['x-request-id'.toLowerCase()] ??
    null;
  const details = {
    label,
    status,
    message: error?.message ?? null,
    type: error?.type ?? error?.error?.type ?? null,
    code: error?.code ?? error?.error?.code ?? null,
    param: error?.param ?? error?.error?.param ?? null,
    requestId,
    data,
  };
  console.log('\n  Error details:', JSON.stringify(details, null, 2));
}

async function listModelIds(openai, options) {
  try {
    const models = await openai.models.list();
    return models.data.map((model) => model.id);
  } catch (error) {
    if (options.verbose) {
      logErrorDetails(error, 'models:list');
    }
    return null;
  }
}

function pickLatest(ids) {
  return ids.slice().sort().pop() || null;
}

function pickPreferredImageModel(modelIds, preferredModel) {
  if (!modelIds || modelIds.length === 0) {
    return preferredModel;
  }

  const available = new Set(modelIds);
  if (preferredModel && available.has(preferredModel)) {
    return preferredModel;
  }

  const byPrefix = (prefix) => modelIds.filter((id) => id.startsWith(prefix));

  const priority = [
    { prefix: 'gpt-image-1.5-', pick: pickLatest },
    { prefix: 'gpt-image-1.5', pick: (ids) => ids[0] || null },
    { prefix: 'gpt-image-1-', pick: pickLatest },
    { prefix: 'gpt-image-1', pick: (ids) => ids[0] || null },
    { prefix: 'gpt-image-1-mini', pick: (ids) => ids[0] || null },
    { prefix: 'dall-e-3', pick: (ids) => ids[0] || null },
    { prefix: 'dall-e-2', pick: (ids) => ids[0] || null },
  ];

  for (const { prefix, pick } of priority) {
    const matches = byPrefix(prefix);
    const selected = pick(matches);
    if (selected) {
      return selected;
    }
  }

  return preferredModel || modelIds[0];
}

async function resolveImageModel(openai, options, requestedModel) {
  const modelIds = await listModelIds(openai, options);
  const resolved = pickPreferredImageModel(modelIds, requestedModel || DEFAULT_MODEL);

  if (options.verbose) {
    const count = modelIds ? modelIds.length : 0;
    console.log(`  Model list retrieved: ${count} models`);
  }
  if (requestedModel && resolved !== requestedModel) {
    console.log(`  Requested model not found. Using: ${resolved}`);
  } else if (options.autoModel) {
    console.log(`  Auto-selected model: ${resolved}`);
  }

  return resolved;
}

/**
 * Generate a single illustration using OpenAI API. On 404 with gpt-image-1.5, retries once with gpt-image-1.
 */
async function generateIllustration(openai, object, options, model) {
  const prompt = buildPrompt(object);
  if (options.verbose) {
    console.log(`\n  Prompt: ${prompt.substring(0, 100)}...`);
  }

  async function tryGenerate(model) {
    const opts = buildGenerateOptions(model);
    opts.prompt = prompt;
    const response = await openai.images.generate(opts);
    const imageData = response.data[0].b64_json;
    const buffer = Buffer.from(imageData, 'base64');
    return {
      success: true,
      buffer,
      revisedPrompt: response.data[0].revised_prompt || null,
    };
  }

  function formatError(error) {
    const msg = error?.message || String(error);
    const status = error?.status ?? error?.response?.status ?? '';
    const body = error?.error ?? error?.response?.data;
    const bodyStr = body ? ` ${JSON.stringify(body)}` : '';
    return status ? `${msg} (${status})${bodyStr}` : `${msg}${bodyStr}`;
  }

  try {
    return await tryGenerate(model);
  } catch (error) {
    if (options.verbose) {
      logErrorDetails(error, `generate:${object.id}:${model}`);
    }
    const is404 = String(error?.status ?? error?.response?.status ?? '').includes('404');
    if (is404 && isGptImage15(model)) {
      if (options.verbose) {
        console.log(`\n  Retrying with ${FALLBACK_MODEL} after 404...`);
      }
      try {
        return await tryGenerate(FALLBACK_MODEL);
      } catch (fallbackError) {
        if (options.verbose) {
          logErrorDetails(fallbackError, `fallback:${object.id}:${FALLBACK_MODEL}`);
        }
        return {
          success: false,
          error: formatError(fallbackError),
        };
      }
    }
    return {
      success: false,
      error: formatError(error),
    };
  }
}

/**
 * Save image to file
 */
function saveImage(buffer, id) {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const filePath = path.join(OUTPUT_DIR, `${id}.png`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();
  const requestedModel = options.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
  
  console.log('\n🎨 First 100 Illustration Generator\n');
  console.log('━'.repeat(50));
  console.log(`  Requested model: ${requestedModel}`);

  // Report existing generated images (PNG = from API; SVG = fallback)
  const existingPngs = OBJECTS.filter((o) => fs.existsSync(path.join(OUTPUT_DIR, `${o.id}.png`)));
  const existingSvgs = OBJECTS.filter((o) => fs.existsSync(path.join(OUTPUT_DIR, `${o.id}.svg`)));
  if (existingPngs.length > 0) {
    console.log(`  Existing API-generated images: ${existingPngs.map((o) => o.id).join(', ')}`);
  } else {
    console.log('  No API-generated images yet (no .png in public/illustrations/). Using fallbacks if .svg exists.');
  }
  if (existingSvgs.length > 0) {
    console.log(`  Fallback SVGs present: ${existingSvgs.map((o) => o.id).join(', ')}`);
  }
  console.log('');

  // Determine which objects to generate
  let objectsToGenerate = [...OBJECTS];
  
  if (options.only) {
    objectsToGenerate = OBJECTS.filter(obj => options.only.includes(obj.id));
    if (objectsToGenerate.length === 0) {
      console.error(`\n❌ No objects found matching: ${options.only.join(', ')}`);
      console.log(`\nAvailable objects: ${OBJECTS.map(o => o.id).join(', ')}`);
      process.exit(1);
    }
  } else if (options.category) {
    objectsToGenerate = getObjectsByCategory(options.category);
    if (objectsToGenerate.length === 0) {
      console.error(`\n❌ No objects found in category: ${options.category}`);
      process.exit(1);
    }
  }
  
  console.log(`\nObjects to generate: ${objectsToGenerate.length}`);
  console.log(`Objects: ${objectsToGenerate.map(o => o.id).join(', ')}`);
  
  // Cost estimate
  const cost = estimateCost(objectsToGenerate.length);
  console.log(`\n💰 Estimated cost: $${cost.estimated.toFixed(2)} (range: $${cost.min.toFixed(2)} - $${cost.max.toFixed(2)})`);
  
  if (options.dryRun) {
    console.log('\n✨ Dry run complete. No images generated.');
    console.log('Remove --dry-run to generate images.\n');
    return;
  }
  
  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('\n❌ OPENAI_API_KEY environment variable is required.');
    console.log('Set it in your .env file or export it in your shell.\n');
    process.exit(1);
  }
  
  // Initialize OpenAI client
  const OpenAI = (await import('openai')).default;
  const orgId = process.env.OPENAI_ORG_ID;
  const projectId = process.env.OPENAI_PROJECT_ID;
  const clientOptions = { apiKey };
  if (orgId) {
    clientOptions.organization = orgId;
  }
  if (projectId) {
    clientOptions.project = projectId;
  }
  const openai = new OpenAI(clientOptions);
  if (options.verbose && (orgId || projectId)) {
    console.log(`  Using org/project override: ${orgId ?? 'none'} / ${projectId ?? 'none'}`);
  }

  const model = await resolveImageModel(openai, options, requestedModel);
  console.log(`  Selected model: ${model}`);

  // Load existing data
  const log = loadLog();
  const manifest = loadManifest();
  
  // Generate illustrations
  console.log('\n🚀 Starting generation...\n');
  
  const runLog = {
    timestamp: new Date().toISOString(),
    objects: [],
    successCount: 0,
    failCount: 0,
    estimatedCost: cost.estimated,
  };
  
  for (let i = 0; i < objectsToGenerate.length; i++) {
    const obj = objectsToGenerate[i];
    const progress = `[${i + 1}/${objectsToGenerate.length}]`;
    
    process.stdout.write(`${progress} Generating ${obj.id}... `);
    
    const result = await generateIllustration(openai, obj, options, model);
    
    if (result.success) {
      const filePath = saveImage(result.buffer, obj.id);
      console.log('✅');
      
      runLog.objects.push({
        id: obj.id,
        success: true,
        file: path.relative(ROOT_DIR, filePath),
      });
      runLog.successCount++;
      
      // Update manifest
      const existingIndex = manifest.illustrations.findIndex(i => i.id === obj.id);
      const entry = {
        id: obj.id,
        category: obj.category,
        file: `/illustrations/${obj.id}.png`,
        generatedAt: new Date().toISOString(),
      };
      
      if (existingIndex >= 0) {
        manifest.illustrations[existingIndex] = entry;
      } else {
        manifest.illustrations.push(entry);
      }
    } else {
      console.log(`❌ ${result.error}`);
      runLog.objects.push({
        id: obj.id,
        success: false,
        error: result.error,
      });
      runLog.failCount++;
    }
    
    // Delay between requests
    if (i < objectsToGenerate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.batchDelay));
    }
  }
  
  // Update and save logs
  log.runs.push(runLog);
  log.totalSpent += cost.estimated;
  log.totalGenerated += runLog.successCount;
  saveLog(log);
  
  // Save manifest
  saveManifest(manifest);
  
  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('\n📊 Generation Summary\n');
  console.log(`  ✅ Successful: ${runLog.successCount}`);
  console.log(`  ❌ Failed: ${runLog.failCount}`);
  console.log(`  💰 Estimated cost: $${cost.estimated.toFixed(2)}`);
  console.log(`  📁 Output: ${OUTPUT_DIR}`);
  console.log(`  📋 Manifest: ${MANIFEST_FILE}`);
  console.log(`  📝 Log: ${LOG_FILE}`);
  
  if (runLog.failCount > 0) {
    console.log('\n⚠️  Some generations failed. Re-run with --only=<ids> to retry.');
    const failedIds = runLog.objects.filter(o => !o.success).map(o => o.id).join(',');
    console.log(`   Example: node scripts/generate-illustrations.js --only=${failedIds}`);
  }
  
  console.log('\n✨ Done!\n');
}

main().catch(console.error);
