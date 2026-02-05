#!/usr/bin/env node
/**
 * First 100 Illustration Generator
 * 
 * Generates consistent, child-friendly illustrations using OpenAI's gpt-image-1.5 model.
 * 
 * Usage:
 *   node scripts/generate-illustrations.js              # Generate all
 *   node scripts/generate-illustrations.js --dry-run    # Estimate cost only
 *   node scripts/generate-illustrations.js --only=cat,dog,apple  # Generate specific
 *   node scripts/generate-illustrations.js --category=animals    # Generate by category
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OBJECTS, buildPrompt, estimateCost, getObjectsByCategory } from './illustration-prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'illustrations');
const LOG_FILE = path.join(ROOT_DIR, 'generation-log.json');
const MANIFEST_FILE = path.join(ROOT_DIR, 'src', 'data', 'illustrations.json');

// Configuration
const CONFIG = {
  model: 'gpt-image-1',  // OpenAI's latest image model
  size: '1024x1024',
  quality: 'medium',
  responseFormat: 'b64_json', // Base64 for easy saving
  batchDelay: 1000, // ms between requests to avoid rate limiting
};

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
 * Generate a single illustration using OpenAI API
 */
async function generateIllustration(openai, object, options) {
  const prompt = buildPrompt(object);
  
  if (options.verbose) {
    console.log(`\n  Prompt: ${prompt.substring(0, 100)}...`);
  }

  try {
    const response = await openai.images.generate({
      model: CONFIG.model,
      prompt: prompt,
      n: 1,
      size: CONFIG.size,
      quality: CONFIG.quality,
      response_format: CONFIG.responseFormat,
    });

    const imageData = response.data[0].b64_json;
    const buffer = Buffer.from(imageData, 'base64');
    
    return {
      success: true,
      buffer,
      revisedPrompt: response.data[0].revised_prompt || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
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
  
  console.log('\n🎨 First 100 Illustration Generator\n');
  console.log('━'.repeat(50));
  
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
  const openai = new OpenAI({ apiKey });
  
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
    
    const result = await generateIllustration(openai, obj, options);
    
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
