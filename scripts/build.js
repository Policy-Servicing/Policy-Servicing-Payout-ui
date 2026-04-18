/**
 * scripts/build.js
 *
 * Cross-platform production build script.
 * Works identically on Windows (locally) and Linux (Vercel/CI).
 *
 * What it does:
 *   1. Patches http-deceiver so it doesn't crash on Node 12+ (where
 *      process.binding('http_parser') was removed). This runs BEFORE
 *      any webpack code is loaded.
 *   2. Spawns `ng build --prod` as a child process with NODE_OPTIONS
 *      correctly injected into the child's environment — this is the
 *      only reliable cross-platform way to set it.
 *
 * No new npm packages required. Uses only Node.js built-ins.
 */

'use strict';

var childProcess = require('child_process');
var path         = require('path');
var fs           = require('fs');

// ── Step 1: Patch http-deceiver ──────────────────────────────────────────────

var targetFile = path.resolve(__dirname, '..', 'node_modules', 'http-deceiver', 'lib', 'deceiver.js');

if (fs.existsSync(targetFile)) {
  var src = fs.readFileSync(targetFile, 'utf8');

  if (src.indexOf('PATCHED_') === -1) {
    // Strategy A: replace the mode-detection block
    var stratA_old = "var mode = /^v0\\.8\\./.test(process.version) ? 'rusty' :\n           /^v0\\.(9|10)\\./.test(process.version) ? 'old' :\n           /^v0\\.12\\./.test(process.version) ? 'normal' :\n           'modern';";
    var stratA_new = [
      "// PATCHED_NODE12: wrap http_parser binding — removed in Node 21+",
      "var mode;",
      "try {",
      "  mode = /^v0\\.8\\./.test(process.version) ? 'rusty' :",
      "         /^v0\\.(9|10)\\./. test(process.version) ? 'old' :",
      "         /^v0\\.12\\./.test(process.version) ? 'normal' : 'modern';",
      "  if (mode === 'modern' || mode === 'normal') process.binding('http_parser');",
      "} catch (_e) { mode = 'old'; }"
    ].join('\n');

    if (src.indexOf("var mode = /^v0\\.8\\./") !== -1 || src.indexOf("var mode = /^v0.8./") !== -1) {
      // Strategy B (simpler): patch just the single crashing line
      src = src
        .split("HTTPParser = process.binding('http_parser').HTTPParser;")
        .join([
          "// PATCHED_NODE12: safe fallback for Node 12+",
          "    try { HTTPParser = process.binding('http_parser').HTTPParser; }",
          "    catch (_e) { mode = 'old'; }"
        ].join('\n'));

      src = src
        .split("methods = process.binding('http_parser').methods;")
        .join("methods = []; // PATCHED_NODE12");

      fs.writeFileSync(targetFile, src, 'utf8');
      console.log('[build] http-deceiver patched for Node 12+ compatibility.');
    }
  } else {
    console.log('[build] http-deceiver already patched — skip.');
  }
} else {
  console.log('[build] http-deceiver not found — skip patch.');
}

// ── Step 2: ng build --prod ──────────────────────────────────────────────────

// Find ng binary — works on both Windows (.cmd) and Linux/Mac
var ngBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'ng');
var isProd = process.argv.indexOf('--prod') !== -1 ||
             process.env.NODE_ENV === 'production' ||
             process.env.VERCEL === '1';

var args = ['build'];
if (isProd) { args.push('--prod'); }
args.push('--output-hashing', 'all');

console.log('[build] Running: ng ' + args.join(' '));

var isWin = process.platform === 'win32';

// On Windows, .cmd wrappers require shell:true to execute correctly
var result = childProcess.spawnSync(
  isWin ? ngBin + '.cmd' : ngBin,
  args,
  {
    stdio: 'inherit',
    shell: isWin,
    // Inject NODE_OPTIONS correctly into child env — cross-platform reliable
    env: Object.assign({}, process.env, {
      NODE_OPTIONS: '--openssl-legacy-provider'
    })
  }
);

if (result.error) {
  console.error('[build] Failed to start ng:', result.error.message);
  process.exit(1);
}

process.exit(result.status || 0);
