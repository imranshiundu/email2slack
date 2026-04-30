#!/usr/bin/env node
import fs from 'node:fs/promises';
import { postToSlack, toSlackPayload } from './index.js';

function printHelp() {
  console.log(`email2slack

Usage:
  node cli.js [--file email.eml] [--post] [--webhook URL]

Options:
  --file <path>       Read email from file instead of stdin
  --webhook <url>     Slack webhook URL. Defaults to SLACK_WEBHOOK_URL
  --post              Send to Slack. Without this, prints JSON only
  --channel <name>    Optional Slack channel override
  --username <name>   Optional Slack username override
  --max-body <n>      Body preview length. Default: 700
  --no-redact         Disable secret redaction
  --help              Show this help
`);
}

function parseArgs(argv) {
  const args = { redact: true, post: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file') args.file = argv[++i];
    else if (arg === '--webhook') args.webhook = argv[++i];
    else if (arg === '--post') args.post = true;
    else if (arg === '--channel') args.channel = argv[++i];
    else if (arg === '--username') args.username = argv[++i];
    else if (arg === '--max-body') args.maxBody = Number(argv[++i]);
    else if (arg === '--no-redact') args.redact = false;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return args;
}

async function readInput(file) {
  if (file) return fs.readFile(file, 'utf8');
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks.map((chunk) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))).toString('utf8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();

  const raw = await readInput(args.file);
  if (!raw.trim()) throw new Error('No email content received. Pass --file or pipe email text into stdin.');

  const payload = toSlackPayload(raw, args);
  const webhook = args.webhook || process.env.SLACK_WEBHOOK_URL;

  if (args.post) {
    await postToSlack(webhook, payload);
    console.log('Posted to Slack webhook.');
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
