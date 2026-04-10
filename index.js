export function parseEmail(raw = '') {
  const normalized = raw.replace(/\r\n/g, '\n');
  const separator = normalized.indexOf('\n\n');
  const headerText = separator === -1 ? normalized : normalized.slice(0, separator);
  const body = separator === -1 ? '' : normalized.slice(separator + 2).trim();

  const lines = headerText.split('\n');
  const headers = {};
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^[\t ]/.test(line) && currentKey) {
      headers[currentKey] += ` ${line.trim()}`;
      continue;
    }
    const [key, ...rest] = line.split(':');
    currentKey = key.trim().toLowerCase();
    headers[currentKey] = rest.join(':').trim();
  }

  return { headers, body };
}

export function classifyEmail(email) {
  const text = `${email.headers.subject || ''}\n${email.body || ''}`.toLowerCase();
  if (/(urgent|critical|sev1|failed|outage|down)/.test(text)) return 'danger';
  if (/(warning|attention|payment|invoice|expired)/.test(text)) return 'warning';
  return 'info';
}

export function toSlackPayload(raw) {
  const email = typeof raw === 'string' ? parseEmail(raw) : raw;
  const level = classifyEmail(email);
  const preview = (email.body || '(empty)').slice(0, 280);
  const emoji = level === 'danger' ? '🚨' : level === 'warning' ? '⚠️' : '📩';

  return {
    text: `${emoji} ${email.headers.subject || 'New email'} from ${email.headers.from || 'unknown sender'}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `${emoji} ${email.headers.subject || 'New email'}` } },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: `*From*\n${email.headers.from || 'unknown'}` },
        { type: 'mrkdwn', text: `*Level*\n${level}` },
      ] },
      { type: 'section', text: { type: 'mrkdwn', text: preview || '(empty)' } },
    ],
  };
}

export async function postToSlack(webhookUrl, payload, fetchImpl = fetch) {
  const response = await fetchImpl(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Slack webhook failed with status ${response.status}`);
  return true;
}
