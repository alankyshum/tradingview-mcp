#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const file = process.argv[2];
if (!file) {
  console.error(`Usage: ${process.argv[1]} path/to/file.pine`);
  process.exit(2);
}

const source = await readFile(file, 'utf8');
const formData = new URLSearchParams();
formData.append('source', source);

const response = await fetch(
  'https://pine-facade.tradingview.com/pine-facade/translate_light?user_name=Guest&pine_id=00000000-0000-0000-0000-000000000000',
  {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://www.tradingview.com/',
    },
    body: formData,
  },
);

if (!response.ok) {
  const raw = await response.text();
  console.error(`TradingView API returned ${response.status}: ${response.statusText}`);
  console.error(raw);
  process.exit(1);
}

const result = await response.json();
const inner = result?.result;
const diagnostics = [];
for (const e of inner?.errors2 || []) diagnostics.push({ ...e, severity: 'error' });
for (const w of inner?.warnings2 || []) diagnostics.push({ ...w, severity: 'warning' });
if (typeof result.error === 'string') diagnostics.push({ message: result.error, severity: 'error' });

for (const diagnostic of diagnostics) {
  const line = diagnostic.start?.line ?? 1;
  const column = diagnostic.start?.column ?? 1;
  console.log(`${file}:${line}:${column} ${diagnostic.severity} ${diagnostic.message}`);
}
process.exit(diagnostics.some(d => d.severity === 'error') ? 1 : 0);
