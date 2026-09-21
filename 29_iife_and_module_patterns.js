/**
 * ============================================================================
 * STEP 29 / 28+5 · IIFE & MODULE PATTERNS   Phase 9 · Extra Concepts You Use
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What an IIFE is: a function expression that runs the moment it is defined
 *   2. The syntax rules: why the parentheses are needed (and the ! + void prefixes)
 *   3. Private scope: nothing declared inside leaks to the outside
 *   4. The module pattern and revealing module pattern (private state + public API)
 *   5. Singleton with a lazy IIFE, "use strict" wrappers, async IIFE
 *
 * WHY THIS MATTERS
 *   Before let/const and ES modules existed, the IIFE was THE way to keep code
 *   private. You will still meet it in libraries, config initialisation, and as
 *   the "top-level await" trick in CommonJS files. Understanding it also locks in
 *   your knowledge of expressions vs statements and closures (steps 05, 10).
 *
 * RUN IT      node 29_iife_and_module_patterns.js
 * PREV STEP   <-  28_testing_and_debugging.js
 * NEXT STEP   ->  30_recursion_and_memoization.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// IIFE = Immediately Invoked Function Expression.
//
//   (function () { /* private scope */ })();      <- classic
//   (() => { /* private scope */ })();            <- arrow version
//   (function (config) { /* ... */ })({ a: 1 });  <- with arguments
//   !function () { /* ... */ }();                 <- prefix trick (also + ~ void)
//
// WHY THE PARENTHESES?
//   `function foo() {}` at the start of a statement is a DECLARATION; you cannot
//   call a declaration on the same line (that is a SyntaxError). Wrapping the
//   function in ( ) turns it into an EXPRESSION, and expressions can be invoked
//   immediately. Any operator that forces expression position works: ! + - ~ void.
//
// WHAT IT GIVES YOU
//   1. A private scope: const/let inside exist only inside (no global pollution).
//   2. One-time setup code that cannot be called again by accident.
//   3. A place to return an API object -> the MODULE PATTERN:
//        const api = (function () {
//          const privateState = 0;          // hidden
//          return { publicMethod() { ... } };   // the "revealing module pattern"
//        })();
//   4. A lazy SINGLETON when the returned object caches a single instance.
//   5. An async wrapper: (async () => { await ... })() - top-level await for
//      CommonJS files, where `await` is otherwise not allowed at the top level.
//
// TODAY vs THEN
//   let/const blocks, classes with #private fields and ES modules cover most of
//   this now - but IIFEs remain in the wild, and the patterns they taught are
//   exactly what modules and frameworks still do internally.
//
// STRICT MODE inside an IIFE keeps the wrapper isolated: "use strict" at the top
//   of the function applies only to that function (see step 08 on globals).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 29 · IIFE & MODULE PATTERNS  (Phase 9 · Extra Concepts You Use)");
console.log("=".repeat(62));

console.log("\n--- 1. the shape of an IIFE ---");
(function () {
  console.log("classic IIFE ran");                      // -> classic IIFE ran
})();

(() => {
  console.log("arrow IIFE ran");                        // -> arrow IIFE ran
})();

(function (name, version) {
  console.log(`initialised ${name} v${version}`);       // -> initialised todo-app v1.0.0
})("todo-app", "1.0.0");

// Prefixes that force expression position (all valid, all slightly cryptic):
!function () {
  console.log("the ! prefix works too");                // -> the ! prefix works too
}();
// (function () { ... }()) is the same idea with the call INSIDE the parens.

console.log("\n--- 2. nothing declared inside leaks out ---");
(function () {
  const secret = "hidden inside";
  let attempts = 0;
  console.log("inside ->", secret);                     // -> inside -> hidden inside
})();
console.log("outside typeof secret   ->", typeof secret);      // -> undefined
console.log("outside typeof attempts  ->", typeof attempts);   // -> undefined

console.log("\n--- 3. the module pattern: private state + public API ---");
const cart = (function () {
  const items = [];                                 // private - nobody outside can touch it
  const formatItem = (item) => `${item.name} x${item.qty}`;

  return {                                          // only THIS is the public API
    add(name, qty = 1) {
      const existing = items.find((item) => item.name === name);
      if (existing) existing.qty += qty;
      else items.push({ name, qty });
      return this;                                  // chainable
    },
    total() { return items.reduce((sum, item) => sum + item.qty, 0); },
    list() { return items.map(formatItem); },       // hand out copies, not the array
  };
})();
cart.add("pen").add("pen", 2).add("book");
console.log("total ->", cart.total());              // -> total -> 3
console.log("list  ->", JSON.stringify(cart.list()));
// -> list  -> ["pen x3","book x1"]
console.log("private items ->", cart.items);        // -> private items -> undefined

console.log("\n--- 4. revealing module pattern (define privately, reveal a map) ---");
const counterModule = (function () {
  let count = 0;                                    // private
  function increment(step = 1) { count += step; return count; }
  function decrement(step = 1) { count -= step; return count; }
  function value() { return count; }

  return { increment, decrement, value };           // reveal only what is needed
})();
counterModule.increment();
counterModule.increment(5);
counterModule.decrement(2);
console.log("revealing ->", counterModule.value()); // -> revealing -> 4
console.log("reset is hidden ->", typeof counterModule.reset);   // -> undefined

console.log("\n--- 5. singleton: one shared, lazily created instance ---");
const configStore = (function () {
  let instance = null;                              // private cache
  const create = () => ({
    env: "dev",
    retries: 3,
    log() { return `[${this.env}] retries=${this.retries}`; },
  });
  return { get: () => instance ?? (instance = create()) };
})();
const first = configStore.get();
const second = configStore.get();                   // same object, created once
first.env = "prod";
console.log("same instance ->", first === second, "| shared state ->", second.env);
// -> same instance -> true | shared state -> prod
console.log("config ->", second.log());             // -> config -> [prod] retries=3

console.log("\n--- 6. IIFE + strict mode: an isolated, safe wrapper ---");
(function () {
  "use strict";                                     // applies to this function only
  // accidentalGlobal = 1;   // in strict mode this would THROW instead of leaking
  const scopedOnly = "strict mode inside this wrapper";
  console.log("strict ->", scopedOnly);             // -> strict -> strict mode inside this wrapper
})();
console.log("still no leak ->", typeof scopedOnly); // -> still no leak -> undefined

console.log("\n--- 7. async IIFE: the top-level-await trick for CommonJS ---");
(async () => {
  const settings = await Promise.resolve({ theme: "dark" });   // pretend this is fetch()
  console.log("async IIFE ->", JSON.stringify(settings));      // printed at the END (async)
})();

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. the shape of an IIFE ---
// classic IIFE ran
// arrow IIFE ran
// initialised todo-app v1.0.0
// the ! prefix works too
//
// --- 2. nothing declared inside leaks out ---
// inside -> hidden inside
// outside typeof secret   -> undefined
// outside typeof attempts  -> undefined
//
// --- 3. the module pattern ---
// total -> 3
// list  -> ["pen x3","book x1"]
// private items -> undefined
//
// --- 4. revealing module pattern ---
// revealing -> 4
// reset is hidden -> undefined
//
// --- 5. singleton ---
// same instance -> true | shared state -> prod
// config -> [prod] retries=3
//
// --- 6. IIFE + strict mode ---
// strict -> strict mode inside this wrapper
// still no leak -> undefined
//
// --- 7. async IIFE --- (async: printed at the very end)
// async IIFE -> {"theme":"dark"}

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Forgetting the outer parentheses: function () {}(); is a SyntaxError.
// Writing an IIFE whose RESULT you wanted: an IIFE returns whatever the inner
//   function returns - capture it (const api = (function(){ return {...} })();).
// Calling it twice and expecting shared state - every IIFE invocation creates a
//   NEW scope. Use the singleton pattern when you need one shared instance.
// Returning the private array/object itself instead of a copy (list() above).
// Using an async IIFE but forgetting to handle its rejection: (async () => { ... })()
//   returns a promise nobody awaits -> unhandledRejection. Add .catch().
// Modern code still using IIFEs where a plain block { } with let/const, a class
//   with #private fields, or an ES module would be clearer.
// Nesting arrow IIFEs so deep the code becomes unreadable.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is an IIFE?   A: A function expression that is invoked immediately
//    after it is defined, creating a private scope that runs exactly once.
// Q: Why are the parentheses required?   A: A function keyword at the start of a
//    statement is a declaration and cannot be called in place; wrapping (or a
//    prefix operator like !) puts the function into expression position.
// Q: What is the module pattern?   A: An IIFE that closes over private state and
//    returns a public API object - the "revealing module pattern" defines
//    everything privately, then reveals selected functions in the return object.
// Q: How does a lazy singleton work?   A: An IIFE keeps a private `instance`
//    variable; the getter creates the instance on first call and reuses it after.
// Q: Are IIFEs still needed?   A: Rarely - block scope, #private fields and ES
//    modules replaced most uses. They remain common for one-time setup, library
//    bundles, and as the top-level-await workaround in CommonJS files.
// Q: What does an async IIFE return?   A: A promise - usually fire-and-forget,
//    so attach .catch or the process may crash on an unhandled rejection.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Wrap this snippet in an IIFE so `temp` never reaches the global scope:
//      let temp = 42; console.log(temp);
// 2. Build an IIFE that returns createId() producing 1, 2, 3, ... on each call.
// 3. Explain the difference between (function () { ... }()) and (function () { ... })();
// 4. When would you still reach for an IIFE in modern code?

// ------------------------------ ANSWERS ------------------------------------
(() => {                                                        // 1
  const temp = 42;
  console.log("\npractice 1 -> temp inside:", temp);            // -> temp inside: 42
})();
console.log("practice 1 -> outside typeof temp:", typeof temp); // -> undefined

const createIdFactory = (function () {                          // 2
  let nextId = 0;                       // private state, one per factory call
  return () => ++nextId;
})();
const newId = createIdFactory();
createIdFactory();
console.log("practice 2 -> third id:", createIdFactory(), "| captured:", newId);
// -> practice 2 -> third id: 3 | captured: 1

console.log("practice 3 -> identical behaviour: the call happens before vs after");  // 3
console.log("              the closing paren - both run the expression immediately.");

console.log("practice 4 -> one-time config/init, library bundles, and wrapping");   // 4
console.log("              await at the top level of a CommonJS file.\n");

setTimeout(() => {
  console.log("practice 5 -> the async IIFE line above appears last (it is a promise).\n");
  console.log("✓ STEP 29 complete — next: node 30_recursion_and_memoization.js");
}, 20);



