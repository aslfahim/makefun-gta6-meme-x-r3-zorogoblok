import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const EXPECTED_STATUS_ID: string = "2123973592060731832";
const MAX_POST_BYTES: number = 16384;
const POST_URL_PATTERN: RegExp = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/(\d+)$/;

function fail(message: string): never {
  console.error(`gta6-meme-x-01: ${message}`);
  process.exit(1);
}

function main(): void {
  const botDir: string = resolve(process.env.MAKEFUN_BOT_DIR ?? "/bot");
  const outputDir: string = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  const postPath: string = join(botDir, "POST.json");

  if (!existsSync(postPath)) {
    fail(`POST.json is missing in bot dir ${botDir} (expected the X post record)`);
  }

  const size: number = statSync(postPath).size;
  if (size > MAX_POST_BYTES) {
    fail(`POST.json is too large: ${size} bytes exceeds ${MAX_POST_BYTES}`);
  }

  const raw: string = readFileSync(postPath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("POST.json is not valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    fail("POST.json must contain a JSON object");
  }

  const urlValue: unknown = (parsed as Record<string, unknown>).url;
  if (typeof urlValue !== "string") {
    fail('POST.json "url" field must be a string');
  }

  const match: RegExpExecArray | null = POST_URL_PATTERN.exec(urlValue);
  if (!match) {
    fail('POST.json "url" field is not a valid X status URL');
  }

  if (match[1] !== EXPECTED_STATUS_ID) {
    fail(`POST.json status id ${match[1]} does not match expected ${EXPECTED_STATUS_ID}`);
  }

  mkdirSync(outputDir, { recursive: true });
  const destination: string = join(outputDir, "POST.json");
  copyFileSync(postPath, destination);

  console.log("Leonida library overdue card: POST.json verified and copied to output");
}

main();
