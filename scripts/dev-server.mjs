#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUNTIME_DIR = path.join(ROOT_DIR, '.codex');
const PID_FILE = path.join(RUNTIME_DIR, 'dev-server.pid');
const LOG_FILE = path.join(RUNTIME_DIR, 'dev-server.log');
const META_FILE = path.join(RUNTIME_DIR, 'dev-server.json');
const ASTRO_BIN = path.join(ROOT_DIR, 'node_modules', 'astro', 'astro.js');
const DEFAULT_HOST = process.env.HOST || '127.0.0.1';
const DEFAULT_PORT = Number(process.env.PORT || 4321);

function ensureRuntimeDir() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
}

function readPid() {
  if (!fs.existsSync(PID_FILE)) return null;
  const raw = fs.readFileSync(PID_FILE, 'utf8').trim();
  const pid = Number(raw);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

function isRunning(pid = readPid()) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readMeta() {
  if (!fs.existsSync(META_FILE)) {
    return { host: DEFAULT_HOST, port: DEFAULT_PORT };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    return {
      host: parsed.host || DEFAULT_HOST,
      port: Number(parsed.port) || DEFAULT_PORT,
    };
  } catch {
    return { host: DEFAULT_HOST, port: DEFAULT_PORT };
  }
}

function writeMeta(host, port) {
  fs.writeFileSync(META_FILE, JSON.stringify({ host, port }, null, 2));
}

function removeStateFiles() {
  if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  if (fs.existsSync(META_FILE)) fs.unlinkSync(META_FILE);
}

function cleanupStaleState() {
  const pid = readPid();
  if (pid && !isRunning(pid)) {
    removeStateFiles();
  }
}

function ensureExpectedProcess(pid) {
  try {
    const cmd = execSync(`ps -p ${pid} -o command=`, { encoding: 'utf8' }).trim();
    return /astro\.js\s+dev|astro\s+dev/.test(cmd);
  } catch {
    return false;
  }
}

function sendSignal(pid, signal) {
  try {
    process.kill(-pid, signal);
    return;
  } catch {
    // Fall back to signaling only the tracked pid.
  }
  process.kill(pid, signal);
}

function tailLogPreview(lineCount = 40) {
  if (!fs.existsSync(LOG_FILE)) return '';
  const lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n');
  return lines.slice(-lineCount).join('\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServer() {
  ensureRuntimeDir();
  cleanupStaleState();

  const pid = readPid();
  if (pid && isRunning(pid)) {
    const { host, port } = readMeta();
    console.log(`Dev server is already running (pid ${pid}).`);
    console.log(`URL: http://${host}:${port}/`);
    return;
  }

  const host = DEFAULT_HOST;
  const port = DEFAULT_PORT;
  const logFd = fs.openSync(LOG_FILE, 'a');

  console.log(`Starting dev server on http://${host}:${port}/ ...`);
  const child = spawn(
    process.execPath,
    [ASTRO_BIN, 'dev', '--host', host, '--port', String(port)],
    {
      cwd: ROOT_DIR,
      detached: true,
      stdio: ['ignore', logFd, logFd],
      env: { ...process.env, CI: 'true' },
    }
  );
  fs.closeSync(logFd);
  child.unref();

  fs.writeFileSync(PID_FILE, String(child.pid));
  writeMeta(host, port);

  await sleep(2000);
  if (!isRunning(child.pid)) {
    removeStateFiles();
    console.error('Failed to start dev server. Recent logs:');
    const preview = tailLogPreview();
    if (preview) console.error(preview);
    process.exit(1);
  }

  console.log(`Started (pid ${child.pid}).`);
  console.log(`Logs: ${LOG_FILE}`);
}

async function stopServer() {
  cleanupStaleState();
  const pid = readPid();

  if (!pid || !isRunning(pid)) {
    console.log('Dev server is not running.');
    return;
  }

  if (!ensureExpectedProcess(pid)) {
    console.error(`Refusing to stop pid ${pid}; it does not look like the dev server.`);
    console.error(`Remove ${PID_FILE} manually if it is stale.`);
    process.exit(1);
  }

  console.log(`Stopping dev server (pid ${pid}) ...`);
  try {
    sendSignal(pid, 'SIGTERM');
  } catch {
    removeStateFiles();
    console.log('Stopped.');
    return;
  }

  for (let i = 0; i < 20; i += 1) {
    if (!isRunning(pid)) {
      removeStateFiles();
      console.log('Stopped.');
      return;
    }
    await sleep(500);
  }

  console.log('Process did not exit in time; forcing stop.');
  try {
    sendSignal(pid, 'SIGKILL');
  } catch {
    // no-op
  }

  removeStateFiles();
  console.log('Stopped.');
}

function showStatus() {
  cleanupStaleState();
  const pid = readPid();

  if (pid && isRunning(pid) && ensureExpectedProcess(pid)) {
    const { host, port } = readMeta();
    console.log(`Dev server is running (pid ${pid}).`);
    console.log(`URL: http://${host}:${port}/`);
    console.log(`Logs: ${LOG_FILE}`);
    return;
  }

  if (pid) {
    removeStateFiles();
  }

  console.log('Dev server is not running.');
  console.log('Run: npm run dev:server');
}

function showLogs() {
  ensureRuntimeDir();
  fs.closeSync(fs.openSync(LOG_FILE, 'a'));
  const tail = spawn('tail', ['-n', '50', '-f', LOG_FILE], { stdio: 'inherit' });
  tail.on('exit', (code) => process.exit(code ?? 0));
}

function showUsage() {
  console.log(`Usage: node scripts/dev-server.mjs <command>

Commands:
  start     Start dev server in background (persists after terminal closes)
  stop      Stop dev server safely
  restart   Restart dev server
  status    Show server status
  logs      Tail dev server logs`);
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await startServer();
      break;
    case 'stop':
      await stopServer();
      break;
    case 'restart':
      await stopServer();
      await startServer();
      break;
    case 'status':
      showStatus();
      break;
    case 'logs':
      showLogs();
      break;
    default:
      showUsage();
      process.exit(1);
  }
}

await main();
