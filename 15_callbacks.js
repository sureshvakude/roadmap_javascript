/**
 * ============================================================================
 * STEP 15 / 28  ·  CALLBACKS               Phase 4 · Asynchronous JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What a callback is and when it runs
 *   2. Synchronous callbacks (map/filter) vs asynchronous callbacks (setTimeout)
 *   3. The error-first callback convention Node.js uses everywhere
 *   4. Callback hell: nesting, and why promises/async-await came next
 *   5. Callback pitfalls: double calls, swallowed errors, losing `this`
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value".
 *   ASYNC CAUTION: lines produced inside setTimeout/callbacks run AFTER the
 *   synchronous code, so they appear at the very end of the run - that is the
 *   whole point of this phase. Section 3 shows the real ordering.
 *
 * RUN IT      node 15_callbacks.js
 * PREV STEP   <-  14_destructuring_and_spread_rest.js
 * NEXT STEP   ->  16_promises.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// A CALLBACK is a function you hand to another function so it can call it later.
// "Don't call me, I'll call you."
//
//   Synchronous callback  : runs immediately, in the same turn - map, filter,
//     sort comparators, forEach. Order is easy to predict.
//   Asynchronous callback : runs after the current work finishes - setTimeout,
//     addEventListener, fs.readFile, network requests, database drivers.
//
// ERROR-FIRST CONVENTION (Node.js style)
//   callback(error, data)  -> check the error FIRST, then use data:
//   readFile("a.txt", (error, data) => { if (error) return handle(error); ... })
//
// WHY PROMISES EXIST
//   Nesting callbacks ("callback hell") hides control flow, mixes error handling
//   with each level, and gives up control to the callee (it might call you twice,
//   never call you, or throw). Promises make all three problems manageable.
//
// ORDER RULE TO MEMORISE: synchronous code first, then microtasks (promises),
//   then macrotasks (timers, events). Step 18 proves it.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 15 · CALLBACKS  (Phase 4 · Asynchronous JavaScript)");
console.log("=".repeat(62));

console.log("\n--- 1. synchronous callbacks ---");
const numbers = [1, 2, 3];
console.log("map ->", numbers.map((n) => n * 2).join(","));        // -> map -> 2,4,6

function processOnce(value, transform) {
  const result = transform(value);      // called right now, same line of execution
  console.log("inside processOnce ->", result);                    // -> inside processOnce -> 6
  return result;
}
console.log("returned ->", processOnce(5, (n) => n + 1));           // -> returned -> 6

console.log("\n--- 2. asynchronous callbacks and printing order ---");
console.log("1 · first synchronous line");
setTimeout(() => console.log("4 · timer callback (even with 0 ms)"), 0);
Promise.resolve().then(() => console.log("3 · promise microtask"));
console.log("2 · second synchronous line");

console.log("\n--- 3. the error-first callback convention ---");
function readUser(id, callback) {
  setTimeout(() => {
    if (id <= 0) return callback(new Error(`invalid id: ${id}`));   // error path
    callback(null, { id, name: "Ada" });                            // (error, data)
  }, 20);
}
readUser(1, (error, user) => {
  if (error) return console.log("   user error ->", error.message);
  console.log("   user ok ->", user.name);                          // async: prints later
});
readUser(-1, (error, user) => {
  if (error) return console.log("   user error ->", error.message);  // async: prints later
  console.log("   user ok ->", user.name);
});

console.log("\n--- 4. nested callbacks: callback hell ---");
function loadStep(name, ms, callback) {
  setTimeout(() => callback(`loaded ${name}`), ms);
}
loadStep("config", 5, (config) => {
  loadStep("data", 5, (data) => {
    loadStep("cache", 5, (cache) => {
      console.log("nested ->", [config, data, cache].join(" | "));   // async: prints later
    });
  });
});

console.log("\n--- 5. the same flow with a promise instead ---");
const loadStepAsync = (name, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(`loaded ${name}`), ms));
Promise.all([loadStepAsync("config", 5), loadStepAsync("data", 5)])
  .then(([config, data]) => console.log("promise ->", [config, data].join(" | ")));  // async

console.log("\n--- 6. all synchronous work is already finished here ---");

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// Everything up to the "all synchronous work is already finished" line prints in
// order. The asynchronous callbacks then fire, so they appear AFTER the last
// synchronous line (and after the footer below) - this is the key lesson of
// Phase 4. The exact order of the async tail can differ by a few milliseconds
// between machines.
//
// STEP 15 · CALLBACKS  (Phase 4 · Asynchronous JavaScript)
// ==============================================================
//
// --- 1. synchronous callbacks ---
// map -> 2,4,6
// inside processOnce -> 6
// returned -> 6
//
// --- 2. asynchronous callbacks and printing order ---
// 1 · first synchronous line
// 2 · second synchronous line
//
// --- 3. the error-first callback convention ---
//
// --- 4. nested callbacks: callback hell ---
//
// --- 5. the same flow with a promise instead ---
//
// --- 6. all synchronous work is already finished here ---
// practice 3 -> because the callback runs in a later turn of the
//               event loop: synchronous code always finishes first.
//
// ✓ STEP 15 complete — next: node 16_promises.js
//
// ---- async tail (observed run) ------------------------------------------------
// 3 · promise microtask                  <- microtasks always beat timers
// 4 · timer callback (even with 0 ms)
// promise -> loaded config | loaded data
// practice 1 -> Hello Ada
// practice 2 -> Hello Bob
//    user ok -> Ada
//    user error -> invalid id: -1
// nested -> loaded config | loaded data | loaded cache

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Expecting setTimeout(fn, 0) to run before the next line - it never does.
// Wrapping async work in try/catch and expecting it to catch callback errors.
// Forgetting `return` after calling the callback with an error (double work happens).
// Calling a callback twice (very common with caches/retries) - call it once, guard it.
// Nesting four levels deep instead of returning early / using promises.
// Passing obj.method directly and losing `this` (bind or use an arrow wrapper).
// Mixing sync and async behaviour in the same function (sometimes callback now,
//   sometimes later) - that is "Zalgo"; pick one style.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is a callback?   A: A function passed to another function to be invoked
//    later, either immediately (sync) or after an async operation.
// Q: Are callbacks always asynchronous?   A: No - map, filter, sort comparators and
//    forEach call them synchronously.
// Q: What is the error-first convention?   A: callback(error, data) - always check
//    the error before using data.
// Q: What is callback hell and how do you avoid it?   A: Deep nesting that mixes
//    flow and errors; avoid it with promises/async-await, early returns and
//    named (not inline) callbacks.
// Q: Why can't try/catch catch an async callback error?   A: The callback runs in a
//    later turn of the event loop, outside the try block's stack.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write delayedGreet(name, ms, callback) using the error-first style.
// 2. Wrap a callback API in a promise (your own promisify).
// 3. Explain why "practice 1" prints after "STEP 15 complete".

// ------------------------------ ANSWERS ------------------------------------
function delayedGreet(name, ms, callback) {                         // 1
  setTimeout(() => {
    if (!name) return callback(new Error("name is required"));
    callback(null, `Hello ${name}`);
  }, ms);
}
delayedGreet("Ada", 10, (error, message) => {
  console.log("practice 1 ->", error ? error.message : message);     // -> Hello Ada
});

const promisify = (fn) => (...args) =>                              // 2
  new Promise((resolve, reject) => {
    fn(...args, (error, data) => (error ? reject(error) : resolve(data)));
  });
const greetAsync = promisify(delayedGreet);
greetAsync("Bob", 10)
  .then((message) => console.log("practice 2 ->", message))          // -> Hello Bob
  .catch((error) => console.log("practice 2 error ->", error.message));

console.log("practice 3 -> because the callback runs in a later turn of the");  // 3
console.log("              event loop: synchronous code always finishes first.\n");

console.log("✓ STEP 15 complete — next: node 16_promises.js");

