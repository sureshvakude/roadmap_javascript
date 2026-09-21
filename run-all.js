#!/usr/bin/env node
/**
 * ============================================================================
 * run-all.js  ·  ROADMAP RUNNER
 * ============================================================================
 *
 * Runs every lesson file (1_variables.js ... 28_testing_and_debugging.js) in
 * roadmap order, prints each lesson's output, then a PASS/FAIL summary.
 *
 * Usage:
 *   node run-all.js              # full output + summary
 *   node run-all.js --quiet      # summary only
 *   npm run all                  # same as "node run-all.js"
 * ============================================================================
 */
"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const QUIET = process.argv.includes("--quiet") || process.argv.includes("--summary");
const LESSON_FILE = /^(\d+)_([a-z0-9_]+)\.js$/i;

const lessons = fs
  .readdirSync(ROOT)
  .filter((name) => LESSON_FILE.test(name))
  .sort((a, b) => Number(a.match(LESSON_FILE)[1]) - Number(b.match(LESSON_FILE)[1]));

if (lessons.length === 0) {
  console.error("No lesson files found. Expected files named like 1_variables.js");
  process.exit(1);
}

const line = "=".repeat(78);
console.log(line);
console.log(`  JavaScript roadmap runner — ${lessons.length} lessons`);
console.log(`  Node ${process.version}${QUIET ? "  (quiet mode: lesson output hidden)" : ""}`);
console.log(line);

const results = [];

for (const file of lessons) {
  const step = Number(file.match(LESSON_FILE)[1]);
  const startedAt = Date.now();

  const run = spawnSync(process.execPath, [path.join(ROOT, file)], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30_000,
  });

  const ms = Date.now() - startedAt;
  const output = `${run.stdout || ""}${run.stderr || ""}`.trimEnd();
  const ok = run.status === 0 && !run.error;

  if (!QUIET) {
    console.log(`\n----- STEP ${String(step).padStart(2, "0")} · ${file} -----`);
    console.log(output || "(no output)");
  }

  results.push({ step, file, ok, ms, output });
}

console.log(`\n${line}\n  SUMMARY\n${line}`);
for (const r of results) {
  const status = r.ok ? "PASS" : "FAIL";
  console.log(
    `  ${status}  step ${String(r.step).padStart(2, "0")}  ${r.file.padEnd(36)} ${String(r.ms).padStart(5)} ms`
  );
}

const failed = results.filter((r) => !r.ok);
console.log(`\n  ${results.length - failed.length}/${results.length} lessons ran cleanly.`);

if (failed.length > 0) {
  console.log("\n  Details of the failures:");
  for (const f of failed) {
    console.log(`\n  [${f.file}]`);
    console.log(f.output.split(/\r?\n/).slice(-12).join("\n"));
  }
  process.exit(1);
}

console.log("\n  🎉 Every lesson in the roadmap executed without errors.");
console.log("  Next: open README.md, tick your progress boxes, then run the next step.\n");
