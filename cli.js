#!/usr/bin/env node
import fs from 'node:fs/promises';
import { postToSlack, toSlackPayload } from './index.js';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file') args.file = argv[++i];
    else if (arg === '--webhook') args.webhook = argv[++i];
  }
  return args;
}

async function readInput(file) {
  if (file) return fs.readFile(file, 'utf8');
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return chunks.join('');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const raw = await readInput(args.file);
  const payload = toSlackPayload(raw);

  if (args.webhook) {
    await postToSlack(args.webhook, payload);
    console.log('Posted to Slack webhook.');
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
