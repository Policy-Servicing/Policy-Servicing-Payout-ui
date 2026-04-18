/**
 * scripts/patch-http-deceiver.js
 *
 * Patches http-deceiver so it does NOT crash on Node 12+ where
 * process.binding('http_parser') was permanently removed.
 *
 * This is safe because http-deceiver is only used by webpack-dev-server
 * for HTTP/2 proxying — functionality never invoked during `ng build`.
 * By catching the binding error and falling back to 'old' mode, the
 * module loads cleanly and the unused code path never executes.
 *
 * Run automatically via postinstall. Safe to re-run (idempotent).
 */

'use strict';

var fs   = require('fs');
var path = require('path');

var targetFile = path.resolve(__dirname, '..', 'node_modules', 'http-deceiver', 'lib', 'deceiver.js');

if (!fs.existsSync(targetFile)) {
  console.log('[patch-http-deceiver] File not found — skip (OK if not installed).');
  process.exit(0);
}

var src = fs.readFileSync(targetFile, 'utf8');

// Idempotency guard — skip if already patched
if (src.indexOf('PATCHED_NODE12_COMPAT') !== -1) {
  console.log('[patch-http-deceiver] Already patched — skip.');
  process.exit(0);
}

// ── The Patch ─────────────────────────────────────────────────────────────
// Original (crashes on Node 12+ where http_parser binding is gone):
//
//   var mode = /^v0\.8\./.test(process.version) ? 'rusty' :
//              /^v0\.(9|10)\./.test(process.version) ? 'old' :
//              /^v0\.12\./.test(process.version) ? 'normal' :
//              'modern';
//
// Patched: test whether the binding exists first; fall back to 'old' if not.
// 'old' mode uses string-based parser constants — no binding needed.

var ORIGINAL = "var mode = /^v0\\.8\\./.test(process.version) ? 'rusty' :\n" +
               "           /^v0\\.(9|10)\\./.test(process.version) ? 'old' :\n" +
               "           /^v0\\.12\\./.test(process.version) ? 'normal' :\n" +
               "           'modern';";

var PATCHED  = "// PATCHED_NODE12_COMPAT — safe fallback for Node 12+ where http_parser binding removed\n" +
               "var mode;\n" +
               "try {\n" +
               "  mode = /^v0\\.8\\./.test(process.version) ? 'rusty' :\n" +
               "         /^v0\\.(9|10)\\./.test(process.version) ? 'old' :\n" +
               "         /^v0\\.12\\./.test(process.version) ? 'normal' :\n" +
               "         'modern';\n" +
               "  // Probe the binding; throws on Node 21+ where it was removed\n" +
               "  if (mode === 'modern' || mode === 'normal') { process.binding('http_parser'); }\n" +
               "} catch (_bindErr) {\n" +
               "  mode = 'old'; // string-based constants; no binding required\n" +
               "}";

if (src.indexOf(ORIGINAL) === -1) {
  console.warn('[patch-http-deceiver] Target string not found — http-deceiver may have updated.');
  console.warn('[patch-http-deceiver] Attempting fallback line-level patch…');

  // Fallback: just suppress the crash by wrapping the entire binding block
  var FALLBACK_ORIGINAL = "HTTPParser = process.binding('http_parser').HTTPParser;";
  var FALLBACK_PATCHED  =
    "try {\n" +
    "    HTTPParser = process.binding('http_parser').HTTPParser;\n" +
    "  } catch (_e) { mode = 'old'; } // PATCHED_NODE12_COMPAT";

  if (src.indexOf(FALLBACK_ORIGINAL) === -1) {
    console.error('[patch-http-deceiver] Fallback patch point also not found. Manual fix required.');
    process.exit(0); // Don't fail the install — just let it be handled at runtime
  }

  src = src.replace(FALLBACK_ORIGINAL, FALLBACK_PATCHED);
} else {
  src = src.replace(ORIGINAL, PATCHED);
}

fs.writeFileSync(targetFile, src, 'utf8');
console.log('[patch-http-deceiver] ✅ Patched successfully — compatible with all Node versions.');
