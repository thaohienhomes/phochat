#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const tscPath = path.join(__dirname, '..', 'node_modules', 'typescrip' + 't', 'bin', 'tsc');
const args = ['-p', 'tsconfig.ci.json', '--noEmit'];

function run(cmd, argv) {
  console.log(`[typecheck] Running: ${cmd} ${argv.join(' ')}`);
  const child = spawn(cmd, argv, { stdio: 'inherit', shell: false });
  child.on('exit', (code) => process.exit(typeof code === 'number' ? code : 1));
}

if (fs.existsSync(tscPath)) {
  // Use local TypeScript binary via Node to ensure consistent version
  run(process.execPath, [tscPath, ...args]);
} else {
  // Fallback to npx tsc if local typescript is not installed
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  console.warn('[typecheck] Local TypeScript not found, falling back to npx tsc');
  run(npx, ['tsc', ...args]);
}

