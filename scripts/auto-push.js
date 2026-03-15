/**
 * Watches the repo and runs: git add . && git commit && git push
 * when files change (debounced). Run from repo root: npm run auto-push
 */
const { execSync } = require('child_process');
const path = require('path');
const chokidar = require('chokidar');

const ROOT = path.resolve(__dirname, '..');
const DEBOUNCE_MS = parseInt(process.env.AUTO_PUSH_DEBOUNCE_MS || '15000', 10); // 15 sec default
const SKIP_PUSH = process.env.AUTO_PUSH_SKIP_PUSH === '1'; // set to only commit locally

let timeout = null;

function run(cmd, options = {}) {
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...options });
}

function syncToGit() {
  try {
    run('git add .');
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
    if (!status.trim()) {
      console.log('[auto-push] No changes to commit.');
      return;
    }
    const msg = `Auto sync: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
    run(`git commit -m "${msg}"`);
    if (!SKIP_PUSH) {
      run('git push');
    } else {
      console.log('[auto-push] Skipping push (AUTO_PUSH_SKIP_PUSH=1).');
    }
    console.log('[auto-push] Done.');
  } catch (e) {
    if (e.status !== undefined && e.status !== 0) {
      console.error('[auto-push] Error:', e.message || e);
    }
  }
}

function scheduleSync() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    timeout = null;
    console.log('[auto-push] Changes detected, syncing to Git...');
    syncToGit();
  }, DEBOUNCE_MS);
}

const watcher = chokidar.watch(ROOT, {
  ignored: [
    /node_modules/,
    /\.git\//,
    /velm-poc\.db$/,
    /\.db$/,
    /dist\//,
    /\.log$/,
  ],
  persistent: true,
  ignoreInitial: true,
});

watcher.on('add', scheduleSync);
watcher.on('change', scheduleSync);
watcher.on('unlink', scheduleSync);

console.log(`[auto-push] Watching ${ROOT} (debounce ${DEBOUNCE_MS / 1000}s). Press Ctrl+C to stop.`);
console.log('[auto-push] Local changes will be committed and pushed automatically.');
