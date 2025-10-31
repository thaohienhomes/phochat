#!/usr/bin/env node
/**
 * convert-oklch.js
 *
 * Convert color values in a JSON file from CSS oklch(...) (and oklch(... / alpha))
 * to sRGB hex. Outputs a new JSON preserving structure, replacing color strings.
 *
 * Usage:
 *   node scripts/convert-oklch.js --in pho-chat/docs/design/tokens.ios.json --out pho-chat/docs/design/tokens.ios.rgb.json [--alpha rgba|ignore]
 *
 * Notes:
 * - Supports values like "oklch(0.985 0 0)" and "oklch(1 0 0 / 10%)".
 * - Default alpha handling: ignore (drops alpha). Use --alpha rgba to embed as #RRGGBBAA.
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { in: null, out: null, alpha: 'ignore' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--in') opts.in = args[++i];
    else if (a === '--out') opts.out = args[++i];
    else if (a === '--alpha') opts.alpha = args[++i];
  }
  if (!opts.in || !opts.out) {
    console.error('Usage: node scripts/convert-oklch.js --in <input.json> --out <output.json> [--alpha rgba|ignore]');
    process.exit(1);
  }
  return opts;
}

function clamp01(x) { return Math.min(1, Math.max(0, x)); }

// OKLCH -> sRGB conversion based on https://bottosson.github.io/posts/oklab/
function oklchToRgb(L, C, Hdeg) {
  const h = (Hdeg || 0) * Math.PI / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b2 = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  function toSrgb(u) {
    if (u <= 0.0031308) return 12.92 * u;
    return 1.055 * Math.pow(u, 1 / 2.4) - 0.055;
  }

  r = clamp01(toSrgb(r));
  g = clamp01(toSrgb(g));
  b2 = clamp01(toSrgb(b2));
  return [r, g, b2];
}

function rgbaToHex(r, g, b, a = 1, alphaMode = 'ignore') {
  const R = Math.round(r * 255);
  const G = Math.round(g * 255);
  const B = Math.round(b * 255);
  const A = Math.round(clamp01(a) * 255);
  const hex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
  if (alphaMode === 'rgba' && A < 255) return `#${hex(R)}${hex(G)}${hex(B)}${hex(A)}`;
  return `#${hex(R)}${hex(G)}${hex(B)}`;
}

const OKLCH_RE = /^oklch\(\s*([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s*(?:\/\s*([0-9]*\.?[0-9]+%?))?\s*\)$/i;

function parseOklch(s) {
  const m = String(s).trim().match(OKLCH_RE);
  if (!m) return null;
  const L = parseFloat(m[1]);
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]);
  let A = 1;
  if (m[4] != null) {
    const a = m[4].trim();
    A = a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a);
  }
  return { L, C, H, A };
}

function transformValues(obj, alphaMode) {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) return obj.map((v) => transformValues(v, alphaMode));
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = transformValues(v, alphaMode);
    }
    return out;
  }
  if (typeof obj === 'string' && obj.toLowerCase().startsWith('oklch(')) {
    const parsed = parseOklch(obj);
    if (!parsed) return obj;
    const { L, C, H, A } = parsed;
    const [r, g, b] = oklchToRgb(L, C, H);
    return rgbaToHex(r, g, b, A, alphaMode);
  }
  return obj;
}

(function main() {
  const opts = parseArgs();
  const input = fs.readFileSync(path.resolve(opts.in), 'utf8');
  const json = JSON.parse(input);
  const converted = transformValues(json, opts.alpha);
  fs.mkdirSync(path.dirname(path.resolve(opts.out)), { recursive: true });
  fs.writeFileSync(path.resolve(opts.out), JSON.stringify(converted, null, 2));
  console.log(`Converted ${opts.in} -> ${opts.out}`);
})();

