import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEmail, toSlackPayload } from '../index.js';

test('parseEmail extracts headers and body', () => {
  const parsed = parseEmail('From: ops@example.com\nSubject: Build failed\n\nDeployment broke in prod.');
  assert.equal(parsed.headers.from, 'ops@example.com');
  assert.equal(parsed.headers.subject, 'Build failed');
  assert.equal(parsed.body, 'Deployment broke in prod.');
});

test('toSlackPayload classifies urgent mail as danger', () => {
  const payload = toSlackPayload('From: ops@example.com\nSubject: Critical outage\n\nProduction is down.');
  assert.match(payload.text, /🚨/);
  assert.equal(payload.blocks[1].fields[1].text, '*Level*\ndanger');
});
