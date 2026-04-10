# email2slack

Turn raw email content into a Slack-friendly JSON payload or post it directly to a Slack webhook.

## Usage

Print JSON payload:

```bash
cat sample.eml | node cli.js
```

Or from a file:

```bash
node cli.js --file sample.eml
```

Post directly:

```bash
node cli.js --file sample.eml --webhook https://hooks.slack.com/services/XXX/YYY/ZZZ
```
