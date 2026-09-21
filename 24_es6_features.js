/**
 * ============================================================================
 * STEP 24 / 28  ·  ES6+ FEATURES            Phase 6 · Modern JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What "ES6+" means, and the features you now use every single day
 *   2. Modern syntax in one place: arrows, templates, destructuring, spread,
 *      defaults, shorthand properties, computed keys, optional chaining, ??=
 *   3. ES modules: named/default exports, dynamic import(), import.meta
 *   4. Iterators, generators and async generators (for await...of)
 *   5. Quality-of-life methods: includes, at, flat, Object.entries, BigInt
 *
 * HOW THIS FILE RUNS IN NODE
 *   This repo uses CommonJS .js files, so import/export cannot sit at the top
 *   level here. The file demonstrates real ESM by importing a module built from
 *   a data: URL with dynamic import() - the same API you use for code splitting.
 *
 * RUN IT      node 24_es6_features.js
 * PREV STEP   <-  23_browser_apis.js
 * NEXT STEP   ->  25_debounce.js   (Phase 7)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// "ES6" = ECMAScript 2015. It was the biggest update in the language's history
// (let/const, arrows, classes, modules, promises, destructuring, generators...).
// Since then a new edition lands EVERY YEAR - that is what "ES6+" means.
//
// YOU ALREADY LEARNED MOST OF IT IN THE PREVIOUS STEPS:
//   step 01 let/const          step 05 arrow functions, default/rest params
//   step 02 template literals, Symbol, BigInt
//   step 06/07 includes, find, Object.keys/values/entries
//   step 12 class / extends / static / getters / private fields
//   step 13/14 spread, rest, destructuring, computed keys, shorthand
//   step 16/17 promises, async/await, for await...of
//   step 18 micro/macrotasks
//
// NEW IN THIS STEP
//   * optional chaining ?.  and nullish coalescing ??  (ES2020)
//   * logical assignment &&= ||= ??=                     (ES2021)
//   * Array.prototype.at / findLast, Object.hasOwn, structuredClone  (ES2022)
//   * top-level await in modules                         (ES2022)
//   * ES modules: import / export, default vs named, dynamic import()
//   * iterators, generators (function*, yield) and async generators
//
// MODULES CHEAT SHEET
//   export const x = 1;            import { x } from "./m.js";
//   export default function f(){}  import f from "./m.js";     // any local name
//   export * as ns from "./m.js";  import * as ns from "./m.js";
//   import("./m.js")               -> dynamic, returns a promise (code splitting)
//   Node: .mjs is always ESM, .cjs is always CommonJS, .js follows package.json
//   ("type": "module" for ESM). ESM has its own scope, is strict by default and
// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 24 · ES6+ FEATURES  (Phase 6 · Modern JavaScript)");
console.log("=".repeat(62));

console.log("\n--- 1. the modern syntax you use every day ---");
const user = { first: "Ada", last: "Lovelace", roles: ["admin"] };
const { first, last, roles: [mainRole] = [] } = user;          // destructuring + default
const fullName = `${first} ${last}`;                           // template literal
const greeting = (name = "guest") => `Hello, ${name}!`;        // arrow + default param
console.log("greeting ->", greeting(fullName));                // -> Hello, Ada Lovelace!
console.log("main role ->", mainRole ?? "none");               // -> admin
console.log("optional chaining ->", user.address?.city ?? "no city");   // -> no city

const key = "score";
const stats = { [key]: 9, [`${key}Label`]: "nine" };           // computed keys
console.log("computed ->", JSON.stringify(stats));             // -> {"score":9,"scoreLabel":"nine"}
console.log("spread ->", [...user.roles, "editor"].join(",")); // -> admin,editor

console.log("\n--- 2. quality-of-life additions ---");
console.log("at(-1)   ->", [1, 2, 3].at(-1));                  // -> 3
console.log("includes ->", "javascript".includes("script"));   // -> true
console.log("flatMap  ->", [1, 2].flatMap((n) => [n, n * 10]).join(",")); // -> 1,10,2,20
console.log("hasOwn   ->", Object.hasOwn(user, "first"), Object.hasOwn(user, "toString")); // -> true false
console.log("padStart ->", String(7).padStart(3, "0"));        // -> 007
const settings = { retries: null, debug: false };
settings.retries ??= 3;                                        // logical assignment
settings.debug ||= true;
console.log("logical assignment ->", JSON.stringify(settings)); // -> {"retries":3,"debug":true}
console.log("numeric separator ->", 1_000_000, "| BigInt ->", 10n * 2n); // -> 1000000 20n

const original = { nested: { done: false } };
const clone = structuredClone(original);
clone.nested.done = true;
console.log("structuredClone is deep ->", original.nested.done, "|", clone.nested.done);
// -> structuredClone is deep -> false | true

console.log("\n--- 3. ES modules: export / import ---");
// This repo uses CommonJS, so ESM is demonstrated with dynamic import() of a
// module created on the fly. In a real project you would write two files:
//   math.js      : export const answer = 42;  export default function double(n){...}
//   app.js       : import double, { answer } from "./math.js";
const moduleSource = [
  "export const answer = 42;",
  "export const triple = (n) => n * 3;",
  "export default function double(n) { return n * 2; }",
].join("\n");
const moduleUrl = `data:text/javascript,${encodeURIComponent(moduleSource)}`;
import(moduleUrl).then((esm) => {
  console.log("named export   ->", esm.answer);                 // -> 42
  console.log("named export   ->", esm.triple(3));              // -> 9
  console.log("default export ->", esm.default(21));            // -> 42
  console.log("namespace keys ->", Object.keys(esm).join(","));  // -> answer,default,triple
});

console.log("\n--- 4. generators: lazy sequences that never run out ---");
function* idGenerator(start = 1) {
  let id = start;
  while (true) yield id++;                    // yields on demand, not all at once
}
const ids = idGenerator(100);
console.log("next() calls ->", ids.next().value, ids.next().value, ids.next().value);
// -> 100 101 102

function* take(iterable, count) {              // limit ANY iterable, including infinite ones
  let taken = 0;
  for (const value of iterable) {
    if (taken >= count) return;
    taken += 1;
    yield value;
  }
}
console.log("take 4 ->", [...take(idGenerator(1), 4)].join(","));   // -> 1,2,3,4
const [firstId, ...restIds] = take(idGenerator(50), 3);            // destructuring works too
console.log("destructured ->", firstId, JSON.stringify(restIds));   // -> 50 [51,52]

console.log("\n--- 5. async generators + for await...of ---");
async function* countdown(from, delayMs = 5) {
  for (let value = from; value > 0; value -= 1) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    yield value;
  }
}
(async () => {
  const collected = [];
  for await (const value of countdown(3)) collected.push(value);
  console.log("async generator ->", collected.join(","));           // -> 3,2,1
})();

// ---------------------------------------------------------------------------
// 6 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// Synchronous part (exact order):
// --- 1. the modern syntax you use every day ---
// greeting -> Hello, Ada Lovelace!
// main role -> admin
// optional chaining -> no city
// computed -> {"score":9,"scoreLabel":"nine"}
// spread -> admin,editor
//
// --- 2. quality-of-life additions ---
// at(-1)   -> 3
// includes -> true
// flatMap  -> 1,10,2,20
// hasOwn   -> true false
// padStart -> 007
// logical assignment -> {"retries":3,"debug":true}
// numeric separator -> 1000000 | BigInt -> 20n
// structuredClone is deep -> false | true
//
// --- 4. generators (they run synchronously) ---
// next() calls -> 100 101 102
// take 4 -> 1,2,3,4
// destructured -> 50 [51,52]
//
// Asynchronous part (after the sync code, order can vary):
// named export   -> 42
// named export   -> 9
// default export -> 42
// namespace keys -> answer,default,triple
// async generator -> 3,2,1

// ---------------------------------------------------------------------------
// 7 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Mixing require() and static import in the same CommonJS file (use one system).
// Expecting import to be reassignable - ESM bindings are read-only live views.
// Confusing default and named exports in imports (braces change the meaning).
// Circular imports: works with ESM's live bindings but often ends in undefined.
// Calling a generator and expecting an array - you get an iterator (spread it).
// Using for..of on a non-iterable plain object (use Object.entries).
// Assuming top-level await works in every file - only ES modules support it.
// Using || when 0/""/false are valid values - reach for ?? instead.

// ---------------------------------------------------------------------------
// 8 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is ES6?   A: The 2015 spec (ES2015) that added let/const, arrows,
//    classes, modules, promises, generators, destructuring, spread and more;
//    yearly editions since then are what "ES6+" means.
// Q: ESM vs CommonJS?   A: ESM uses static import/export, is hoisted, strict by
//    default, has live bindings and top-level await; CommonJS uses require() and
//    module.exports, is synchronous and can be conditionally executed.
// Q: Default vs named exports?   A: one default per module (imported without
//    braces, any name); any number of named exports (imported with braces).
// Q: What is a generator?   A: A function (function*) that returns an iterator
//    and can pause at each yield, producing values lazily.
// Q: What is the iterator protocol?   A: An object with a next() method returning
//    { value, done }; for..of, spread and destructuring all use it.
// Q: Why optional chaining?   A: It replaces long && chains for optional data:
//    user?.address?.city ?? "unknown".

// ---------------------------------------------------------------------------
// 9 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Modernise: var n = "Ada"; function add(a,b){ return a+b; } "Hi " + n;
//    arr.concat([1]); arr.indexOf(x) > -1
// 2. Write a generator that yields Fibonacci numbers; take the first 6.
// 3. Explain the main differences between require() and import.

// ------------------------------ ANSWERS ------------------------------------
// 1. const n = "Ada";                 //      const add = (a, b) => a + b;
//    const greeting = `Hi ${n}`;      //      const copy = [...arr, 1];
//    if (arr.includes(x)) { ... }
console.log("\npractice 1 -> modernised versions are in the comments above");

const fibonacci = function* () {                                // 2
  let [previous, current] = [0, 1];
  while (true) {
    yield current;                       // 1, 1, 2, 3, 5, 8, ...
    [previous, current] = [current, previous + current];
  }
};
const firstSix = [];
for (const value of fibonacci()) {
  if (firstSix.length === 6) break;      // stop consuming the infinite generator
  firstSix.push(value);
}
console.log("practice 2 ->", firstSix.join(","));                 // -> 1,1,2,3,5,8

console.log("practice 3 -> require() is CommonJS: synchronous, evaluated at run");  // 3
console.log("              time, conditionally allowed. import is ESM: static (so");
console.log("              bundlers can tree-shake), hoisted, live bindings, and");
console.log("              import() is the async form used for code splitting.\n");

console.log("✓ STEP 24 complete — next: node 25_debounce.js  (Phase 7)");


