                export function parseEmail(raw = '') {
                  const [headerText, ...bodyParts] = raw.split(/

/);
                  const headers = Object.fromEntries(headerText.split('
').filter(Boolean).map((line) => {
                    const [key, ...rest] = line.split(':');
                    return [key.trim().toLowerCase(), rest.join(':').trim()];
                  }));
                  return { headers, body: bodyParts.join('

').trim() };
                }

                export function toSlackPayload(raw) {
                  const email = typeof raw === 'string' ? parseEmail(raw) : raw;
                  return {
                    text: `${email.headers.subject || 'New email'} from ${email.headers.from || 'unknown sender'}`,
                    blocks: [
                      { type: 'header', text: { type: 'plain_text', text: email.headers.subject || 'New email' } },
                      { type: 'section', text: { type: 'mrkdwn', text: `*From:* ${email.headers.from || 'unknown'}
*Body:* ${email.body || '(empty)'}` } },
                    ],
                  };
                }

                if (import.meta.url === `file://${process.argv[1]}`) {
                  console.log(JSON.stringify(toSlackPayload('From: ops@example.com
Subject: Build failed

Deployment broke.'), null, 2));
                }
