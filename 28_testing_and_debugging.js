/**
 * ============================================================================
 * STEP 28 / 28 · TESTING & DEBUGGING        Phase 8 · Testing, Tooling & Security
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What to test (pure logic + edge cases) and the arrange/act/assert shape
 *   2. Assertions with node:assert, including deep equality, throws and rejects
 *   3. A real test suite with the built-in node:test runner (runs in this file!)
 *   4. Table-driven tests - the fastest way to cover many cases
 *   5. Debugging tools: console.* tricks, reading stacks, the debugger, --inspect
 *   6. The tooling, security and performance checklist to close the roadmap
 *
 * HOW THIS FILE RUNS
 *   `node 28_testing_and_debugging.js` executes a real test suite (node:test
 *   prints TAP output and a summary) and then the debugging demos. No test in
 *   this file is allowed to fail - a failing file would break `npm run all`.
 *
 * RUN IT      node 28_testing_and_debugging.js
 * PREV STEP   <-  27_set_map.js
 * NEXT STEP   ->  29_iife_and_module_patterns.js   (Phase 9 · Extra Concepts)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// WHY TEST
//   Tests are executable documentation that catch regressions. They make
//   refactoring safe and force you to design testable (small, pure) functions.
//
// THE SHAPE OF A GOOD TEST
//   Arrange (build the input) -> Act (call the function) -> Assert (check the result)
//   Name the behaviour, not the function: "returns 0 for an empty list".
//
// WHAT TO TEST (and what not to)
//   Test: pure logic, boundary values, empty/null inputs, error paths, parsing,
//         date/number formatting, reducers, validators.
//   Do NOT test: implementation details, third-party libraries, or private helpers
//         through the public API.
//
// THE PYRAMID
//   Many unit tests (fast, isolated) -> fewer integration tests (DB, HTTP) ->
//   very few end-to-end tests (browser/API flows). Fast feedback wins.
//
// TOOLS
//   node:test + node:assert  -> zero dependencies (Node 18+, used below)
//   Vitest / Jest            -> watch mode, mocking, coverage, snapshots
//   Playwright / Cypress     -> end-to-end browser tests
//   ESLint (+ Prettier)      -> catch mistakes before the tests do
//
// DEBUGGING TOOLS
//   console.log with labels, console.table for arrays of objects, console.time
//   for timing, console.count, console.assert (logs only when false), console.trace.
//   debugger statement + VS Code "Run and Debug" (launch.json), node --inspect,
//   breakpoints/watches/call stack, node --watch to rerun on save.
//   READ THE STACK: error.stack lists the call path - the first line inside YOUR
//   code is usually the real problem, not the deepest frame.
//
// SECURITY & PERFORMANCE CHECKLIST (the last boxes of this roadmap)
//   validate/sanitise all input; never innerHTML with user data; parameterised
//   queries; HTTPS + HttpOnly cookies; rate limiting; no secrets in the client;
//   keep dependencies updated (npm audit). Performance: measure before optimising,
//   avoid N+1 requests, memoise expensive work, batch DOM writes, lazy-load, cache.

// ---------------------------------------------------------------------------
// 2 · THE CODE UNDER TEST (a tiny module of pure functions)
// ---------------------------------------------------------------------------
const slugify = (text) => String(text)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")     // drop punctuation
  .replace(/\s+/g, "-")             // spaces -> dashes
  .replace(/-+/g, "-")              // collapse dashes
  .replace(/^-|-$/g, "");           // trim dashes at the edges

const parseNumber = (value, { min = -Infinity, max = Infinity } = {}) => {
  const number = Number(String(value).trim());
  if (value === "" || value === null || Number.isNaN(number)) {
    throw new TypeError(`"${value}" is not a number`);
  }
  if (number < min || number > max) {
    throw new RangeError(`${number} is outside ${min}..${max}`);
  }
  return number;
};

const groupBy = (items, keyFn) => items.reduce((acc, item) => {
  const key = keyFn(item);
  (acc[key] ??= []).push(item);
  return acc;
}, {});

// ---------------------------------------------------------------------------
// 3 · THE TEST SUITE (this really runs when you execute the file)
// ---------------------------------------------------------------------------
const test = require("node:test");
const assert = require("node:assert/strict");

test("slugify: the happy path", () => {
  assert.equal(slugify("Hello World"), "hello-world");
  assert.equal(slugify("  Learn  JavaScript  "), "learn-javascript");
});

test("slugify: punctuation, accents and edge cases", () => {
  assert.equal(slugify("Clean, Fast & Safe!"), "clean-fast-safe");
  assert.equal(slugify(""), "");                 // empty input
  assert.equal(slugify("   "), "");              // only spaces
  assert.equal(slugify("--already-a-slug--"), "already-a-slug");
});

test("parseNumber: valid input", () => {
  assert.equal(parseNumber("42"), 42);
  assert.equal(parseNumber(" 3.5 "), 3.5);
  assert.equal(parseNumber(0), 0);               // boundary: 0 is a real value, not "empty"
});

test("parseNumber: rejects bad input with the right error type", () => {
  assert.throws(() => parseNumber("abc"), TypeError);
  assert.throws(() => parseNumber(""), TypeError);
  assert.throws(() => parseNumber(5, { min: 10 }), RangeError);
  assert.throws(() => parseNumber(500, { max: 100 }), /outside/);
});

// Table-driven test: one line per case, easy to extend and review.
const slugCases = [
  ["Ada Lovelace", "ada-lovelace"],
  ["JS 2024", "js-2024"],
  ["a---b", "a-b"],
  ["Ünicode", "nicode"],
];
for (const [input, expected] of slugCases) {
  test(`slugify table: "${input}" -> "${expected}"`, () => {
    assert.equal(slugify(input), expected);
  });
}

// Async test + rejection testing (the promise side of step 16/17).
const fetchScore = async (id) => {
  if (id <= 0) throw new RangeError("id must be positive");
  return { id, score: id * 10 };
};
test("fetchScore resolves and rejects as documented", async () => {
  assert.deepEqual(await fetchScore(2), { id: 2, score: 20 });      // deep equality
  await assert.rejects(() => fetchScore(0), RangeError);            // rejects + type
});

// Documenting the groupBy helper (implemented in step 06 and 07).
test("groupBy groups items by a computed key", () => {
  const people = [
    { name: "Ada", team: "core" },
    { name: "Bob", team: "web" },
    { name: "Cy", team: "core" },
  ];
  assert.deepEqual(groupBy(people, (person) => person.team), {
    core: [{ name: "Ada", team: "core" }, { name: "Cy", team: "core" }],
    web: [{ name: "Bob", team: "web" }],
  });
});

// A failing assertion would normally fail the run - assert.throws lets us
// demonstrate the failure message while keeping this file green.
test("a deliberate failure, contained (so the file still passes)", () => {
  assert.throws(
    () => assert.strictEqual(1, 2),
    (error) => error.name === "AssertionError" && /Expected values to be strictly equal/.test(error.message),
  );
});

// ---------------------------------------------------------------------------
// 4 · DEBUGGING TOOLS (runnable)
// ---------------------------------------------------------------------------
console.log("\n--- debugging tools: table, time, count, assert, stack ---");

const rows = [
  { id: 1, task: "learn js", done: true },
  { id: 2, task: "write tests", done: false },
];
console.table(rows);                       // formatted table beats 20 console.logs

console.time("slugify 50k runs");
for (let i = 0; i < 50_000; i += 1) slugify(`Item ${i}`);
console.timeEnd("slugify 50k runs");       // duration varies per machine

console.count("loop tick");                // 1
console.count("loop tick");                // 2
console.count("loop tick");                // 3
console.countReset("loop tick");

console.assert(1 === 1, "this never prints");          // silent: the condition is true
console.assert(1 === 2, "this DOES print on stderr");  // Assertion failed: ...

const readStack = () => {
  try {
    JSON.parse("{nope}");
  } catch (error) {
    const frames = error.stack.split("\n");
    console.log("stack first line ->", frames[0]);       // SyntaxError: ...
    console.log("has frames ->", frames.length > 1);     // -> true
  }
};
readStack();

console.log("\n--- what you would do next in a real project ---");
const nextSteps = [
  "run node --watch <file> while developing",
  "put `debugger;` where you want to stop, then VS Code > Run and Debug",
  "node --inspect-brk script.js + Chrome chrome://inspect for step debugging",
  "npm init -y && npm i -D eslint prettier vitest  -> lint, format, test",
  "npm run test -- --coverage  -> find untested branches",
  "npm audit && keep dependencies current",
];
console.log(nextSteps.map((step) => `  - ${step}`).join("\n"));

// ---------------------------------------------------------------------------
// 5 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// The test runner prints one line per test and a summary AT THE END (it drains
// its queue after the synchronous code). Exact durations and the reporter style
// (spec vs TAP) depend on your terminal.
//
// --- debugging tools: table, time, count, assert, stack ---
// ┌─────────┬────┬───────────────┬───────┐
// │ (index) │ id │ task          │ done  │
// ├─────────┼────┼───────────────┼───────┤
// │ 0       │ 1  │ 'learn js'    │ true  │
// │ 1       │ 2  │ 'write tests' │ false │
// └─────────┴────┴───────────────┴───────┘
// slugify 50k runs: 1x.xxxms               (varies per machine)
// loop tick: 1
// loop tick: 2
// loop tick: 3
// Assertion failed: this DOES print on stderr       (written to stderr)
// stack first line -> SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)
// has frames -> true
//
// --- what you would do next in a real project ---
//   - run node --watch <file> while developing
//   - put `debugger;` where you want to stop, then VS Code > Run and Debug
//   - node --inspect-brk script.js + Chrome chrome://inspect for step debugging
//   - npm init -y && npm i -D eslint prettier vitest  -> lint, format, test
//   - npm run test -- --coverage  -> find untested branches
//   - npm audit && keep dependencies current
//
// --- the test suite (all green) ---
// ✔ slugify: the happy path
// ✔ slugify: punctuation, accents and edge cases
// ✔ parseNumber: valid input
// ✔ parseNumber: rejects bad input with the right error type
// ✔ slugify table: "Ada Lovelace" -> "ada-lovelace"
// ✔ slugify table: "JS 2024" -> "js-2024"
// ✔ slugify table: "a---b" -> "a-b"
// ✔ slugify table: "Ünicode" -> "nicode"
// ✔ fetchScore resolves and rejects as documented
// ✔ groupBy groups items by a computed key
// ✔ a deliberate failure, contained (so the file still passes)
// ✔ range: happy path, negative step and invalid input
// ✔ average: an empty array returns 0 instead of NaN
// ℹ tests 13
// ℹ pass 13
// ℹ fail 0
//
// If you ever see "fail 1", read the assertion diff, fix the code (or the test if
// the test was wrong) and run it again - that loop IS development.

// ---------------------------------------------------------------------------
// 6 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Writing tests without assertions (a test that always passes is worse than none).
// Testing implementation details instead of behaviour - every refactor breaks them.
// Only testing the happy path; edge cases are where the bugs live.
// Tests that depend on each other or on execution order.
// Asserting on exact error message text instead of the error TYPE.
// Timing-dependent tests without injecting timers (flaky CI).
// Mocking so much that the test no longer tests your code.
// Debugging with console.log everywhere and never deleting it (use labels,
//   console.table or a breakpoint instead).
// Guessing performance ("it feels slow") instead of measuring (console.time,
//   performance.now, profiler, DevTools Performance panel).
// Ignoring error.stack or swallowing errors - you lose the only clue you had.

// ---------------------------------------------------------------------------
// 7 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Unit vs integration vs e2e tests?   A: unit = one function/module in
//    isolation; integration = several parts together (DB, HTTP); e2e = the whole
//    app through its real interface. Many fast tests at the bottom, few slow ones
//    at the top.
// Q: What makes a good test?   A: Fast, deterministic, isolated, one behaviour per
//    test, a clear name and a meaningful assertion that is easy to read on failure.
// Q: How do you test async code?   A: Return/await the promise (use assert.rejects
//    for failures) and inject or fake timers for delays.
// Q: What is TDD?   A: Write a failing test, make it pass with the simplest code,
//    then refactor - red, green, refactor.
// Q: How do you debug a slow function?   A: Measure first (console.time,
//    performance.now, profiler), find the hot path, then improve the algorithm or
//    data structure (Map instead of array scans, memoisation, chunking).
// Q: Why is `debugger` better than console.log?   A: You pause with the whole
//    scope available, inspect variables, step in/out and read the call stack -
//    with no code changes to add or remove.

// ---------------------------------------------------------------------------
// 8 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write a test suite for range(start, end, step): happy path, a negative step,
//    an empty range and invalid input.
// 2. How would you test debounce(fn, 200) without waiting 200 ms?
// 3. Find the bug and write a test that proves the fix:
//      const average = (values) => values.reduce((a, b) => a + b, 0) / values.length;

// ------------------------------ ANSWERS ------------------------------------
const range = (start, end, step = 1) => {                       // 1
  if (step === 0) throw new RangeError("step must not be 0");
  const values = [];
  for (let value = start; step > 0 ? value < end : value > end; value += step) {
    values.push(value);
  }
  return values;
};
test("range: happy path, negative step and invalid input", () => {
  assert.deepEqual(range(0, 5), [0, 1, 2, 3, 4]);
  assert.deepEqual(range(5, 0, -1), [5, 4, 3, 2, 1]);
  assert.deepEqual(range(0, 1, 0.5), [0, 0.5]);
  assert.deepEqual(range(2, 2), []);                 // empty boundary
  assert.throws(() => range(0, 5, 0), RangeError);   // invalid step
});

// 2. Inject the timers (or use Vitest/Jest fake timers) so the test is instant and
//    deterministic - grow debounce() with setTimeoutFn/clearTimeoutFn options:
//      const timers = [];
//      const fakeSetTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
//      const fakeClearTimeout = (id) => { timers[id - 1] = null; };
//      const debounced = debounce(fn, 200, { setTimeoutFn: fakeSetTimeout, clearTimeoutFn: fakeClearTimeout });
//      debounced(); debounced(); debounced();          // three calls
//      timers.filter(Boolean).forEach((timer) => timer.fn());   // run pending timers
//      assert.equal(calls, 1);                         // exactly one run

const fixedAverage = (values) =>                                 // 3
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
test("average: an empty array returns 0 instead of NaN", () => {
  assert.equal(fixedAverage([]), 0);            // the bug was 0 / 0 === NaN
  assert.equal(fixedAverage([2, 4]), 3);
  assert.ok(!Number.isNaN(fixedAverage([])));
});

// ---------------------------------------------------------------------------
// 🎉 STEP 28 COMPLETE — the CORE roadmap (steps 01-28) is done.
//
//   NEXT ACTIONS
//     1. npm run all      -> every lesson green, in roadmap order
//     2. Continue         -> node 29_iife_and_module_patterns.js (Phase 9:
//                            IIFE, recursion, regex, strings/numbers, patterns)
//     3. README.md        -> tick your checkboxes (you earned them)
//     4. Build the 7 checkpoint projects listed in README.md
//     5. Keep going: TypeScript, Node/Express, React/Vue, testing frameworks,
//        algorithms & data structures - and read other people's code.
//
//   You now have the whole toolbox: syntax, data structures, scope, async,
//   errors, the browser, modules, patterns and testing. The rest is practice.
//   Go build something.
// ---------------------------------------------------------------------------




