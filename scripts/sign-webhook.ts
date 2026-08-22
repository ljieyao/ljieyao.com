#!/usr/bin/env node
/**
 * Compute a GitHub-style webhook signature for a payload file.
 *
 * Usage:
 *   node --import tsx scripts/sign-webhook.ts <payload-file>
 *
 * Reads WEBHOOK_SECRET (or GITHUB_WEBHOOK_SECRET) from the environment,
 * prints the header to send:
 *   x-hub-signature-256: sha256=<hex>
 */
import { createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseArgs } from './common';

const HELP = `Usage: node --import tsx scripts/sign-webhook.ts <payload-file>

Options:
  --help, -h   Show this help

Env:
  WEBHOOK_SECRET          Shared secret (preferred)
  GITHUB_WEBHOOK_SECRET   Fallback secret name

Prints the signature header for testing the LinkedIn Worker webhook:
  x-hub-signature-256: sha256=<hex>`;

async function main(): Promise<void> {
  const { flags, positional } = parseArgs(process.argv.slice(2));

  if (flags['help'] === true || flags['h'] === true) {
    console.log(HELP);
    return;
  }

  const payloadPath = positional[0];
  if (!payloadPath) {
    console.error('Error: payload file is required.');
    console.log(HELP);
    process.exit(1);
  }

  const secret = process.env['WEBHOOK_SECRET'] ?? process.env['GITHUB_WEBHOOK_SECRET'];
  if (!secret) {
    console.error('Error: WEBHOOK_SECRET (or GITHUB_WEBHOOK_SECRET) is not set.');
    process.exit(1);
  }

  // Sign the raw bytes exactly as they will be sent — do not re-serialize the JSON.
  const payload = await readFile(payloadPath);
  const signature = createHmac('sha256', secret).update(payload).digest('hex');

  console.log(`x-hub-signature-256: sha256=${signature}`);
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exit(1);
});
