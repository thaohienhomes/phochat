#!/usr/bin/env node
/**
 * generate-token-mdx.js
 *
 * Read a Figma Tokens JSON (docs/design/figma-tokens.json) and generate a
 * Storybook MDX page that previews semantic color tokens and radius values.
 *
 * Usage:
 *   node scripts/generate-token-mdx.js --in pho-chat/docs/design/figma-tokens.json \
 *     --out pho-chat/docs/storybook/foundations/GeneratedTokens.mdx
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { in: null, out: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--in') opts.in = args[++i];
    else if (a === '--out') opts.out = args[++i];
  }
  if (!opts.in || !opts.out) {
    console.error('Usage: node scripts/generate-token-mdx.js --in <tokens.json> --out <output.mdx>');
    process.exit(1);
  }
  return opts;
}

function extractColorEntries(set) {
  const out = [];
  const color = (set && set.color) || {};
  for (const [name, obj] of Object.entries(color)) {
    if (obj && typeof obj === 'object' && typeof obj.$value === 'string') {
      out.push({ name, value: obj.$value });
    }
  }
  return out;
}

function generateMdx(lightEntries, darkEntries, radii) {
  const lightBlocks = lightEntries
    .map((e) => `    <div className="swatch"><div className="chip" style={{background:'${e.value}'}} />${e.name}</div>`) // not using CSS vars here; from tokens source
    .join('\n');
  const darkBlocks = darkEntries
    .map((e) => `    <div className="swatch"><div className="chip" style={{background:'${e.value}'}} />${e.name}</div>`) 
    .join('\n');

  const radiusBlocks = Object.entries(radii || {})
    .map(([k, v]) => `    <div className="radius" style={{borderRadius:'${v.$value || v}'}}>${k}</div>`) // value like "10px"
    .join('\n');

  return `import { Meta } from '@storybook/blocks';

<Meta title=\"Foundations/Generated Tokens\" />

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  .swatch { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-size: 12px; }
  .swatch .chip { height: 48px; }
  .swatch div:last-child { padding: 8px; }
  .radius { width: 140px; height: 60px; border: 1px solid #e5e7eb; background: #f6f7f8; display:flex; align-items:center; justify-content:center; font-size:12px; }
</style>

# Generated Tokens (from figma-tokens.json)

These values are generated directly from the tokens JSON and do not depend on runtime CSS variables.

## Light Colors

<div className="grid">
${lightBlocks}
</div>

## Dark Colors

<div className="grid">
${darkBlocks}
</div>

## Radius

<div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
${radiusBlocks}
</div>
`;
}

(function main(){
  const { in: inPath, out: outPath } = parseArgs();
  const json = JSON.parse(fs.readFileSync(path.resolve(inPath), 'utf8'));
  const lightEntries = extractColorEntries(json.light);
  const darkEntries = extractColorEntries(json.dark);
  const radii = (json.core && json.core.radius) || {};
  const mdx = generateMdx(lightEntries, darkEntries, radii);
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outPath), mdx);
  console.log(`Generated MDX: ${outPath}`);
})();

