# email2slack

**email2slack** turns raw email into a safe Slack alert. It can read from `stdin`, a `.eml` file, or a JSON payload, classify urgency, redact secrets, format a Slack Block Kit message, and optionally post to an incoming Slack webhook.

This is useful for small teams that receive alerts by email but want the operational speed of Slack without building a full email gateway.

## Features

- Raw `.eml` parsing with folded-header support
- Slack Block Kit payload generation
- Urgency classification for outages, payment issues, warnings, and normal mail
- Secret redaction for API keys, bearer tokens, passwords, and long tokens
- Dry-run mode for safe testing
- Optional direct webhook posting
- File input or pipe input
- Zero runtime dependencies

## Install

```bash
npm install
```

Requires Node.js 20+.

## Usage

Print a Slack payload from a file:

```bash
node cli.js --file sample.eml
```

Pipe an email from another process:

```bash
cat sample.eml | node cli.js
```

Post to Slack:

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..." \
node cli.js --file sample.eml --post
```

Override destination metadata:

```bash
node cli.js --file sample.eml --channel "#ops" --username "Email Bridge"
```

Disable redaction only when debugging trusted local data:

```bash
node cli.js --file sample.eml --no-redact
```

## CLI options

| Option | Description |
| --- | --- |
| `--file <path>` | Read an email file instead of stdin |
| `--webhook <url>` | Slack webhook URL. Can also use `SLACK_WEBHOOK_URL` |
| `--post` | Actually send to Slack. Without it, the CLI prints JSON only |
| `--channel <name>` | Add Slack channel override metadata |
| `--username <name>` | Add Slack username override metadata |
| `--max-body <n>` | Limit body preview length. Default: `700` |
| `--no-redact` | Do not redact secrets |
| `--help` | Print help |

## Example email

```text
From: alerts@example.com
Subject: CRITICAL: API latency is above threshold
Date: Tue, 30 Apr 2026 12:00:00 +0000

The API p95 is above 3s for 10 minutes.
Bearer token: abcdefghijklmnopqrstuvwxyz123456
```

Output is a Slack-ready JSON payload with the token redacted.

## Development

```bash
npm test
node cli.js --file sample.eml
```

## Design notes

The project intentionally avoids an always-on server. It is safer and easier to deploy as a small Unix-style tool: cron, mail hooks, serverless functions, GitHub Actions, or any process that can pipe an email into the CLI.
