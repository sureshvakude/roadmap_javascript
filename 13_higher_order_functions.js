/**
 * ============================================================================
 * STEP 13 / 28 · HIGHER-ORDER FUNCTIONS   Phase 3 · Intermediate JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Functions are values: pass them around, return them, store them
 *   2. Higher-order functions (HOFs): take a function and/or return one
 *   3. Pure vs impure functions, and why purity makes testing easy
 *   4. Wrappers / decorators: logging, timing, guarding
 *   5. Composition: build small functions, then pipe() them together
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 13_higher_order_functions.js
 * PREV STEP   <-  12_prototypes_and_inheritance.js
 * NEXT STEP   ->  14_destructuring_and_spread_rest.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// FIRST-CLASS FUNCTIONS: a function is just a value - assign it, pass it, return
// it, store it in an array or object.
//
// HIGHER-ORDER FUNCTION (HOF): a function that
//   * receives one or more functions as arguments, or
//   * returns a function.
//   HOFs you already use: map, filter, reduce, sort, forEach, setTimeout,
//   addEventListener, debounce, memoize, connect(...) in middleware.
//
// WHY THEY MATTER
//   You separate WHAT happens (the strategy/callback) from HOW it runs (the loop,
//   the retry, the timing). Behaviour becomes data you can swap.
//
// PURE FUNCTION: same input -> same output and no side effects (no mutation of
//   arguments/globals, no I/O). Pure functions are trivial to test and safe to
//   cache; keep I/O at the edges of your program.
//
// WARS OF STYLE: small pure helpers + a HOF that combines them (compose/pipe) is
//   more readable and testable than one big function with flags.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 13 · HIGHER-ORDER FUNCTIONS  (Phase 3)");
console.log("=".repeat(62));

console.log("\n--- 1. functions as arguments ---");
const repeat = (times, action) => Array.from({ length: times }, (_, index) => action(index + 1));
console.log("repeat ->", repeat(3, (n) => `#${n}`).join(" "));   // -> repeat -> #1 #2 #3

const isEven = (n) => n % 2 === 0;
const double = (n) => n * 2;
console.log("reuse ->", [1, 2, 3, 4].filter(isEven).map(double).join(","));
// -> reuse -> 4,8      (the same tiny functions work in any pipeline)

console.log("\n--- 2. functions as return values (wrappers) ---");
function withLogging(label, fn) {
  return (...args) => {
    const result = fn(...args);
    console.log(`  ${label}(${args.join(", ")}) -> ${result}`);
    return result;
  };
}
const addTax = withLogging("addTax", (price) => +(price * 1.2).toFixed(2));
console.log("wrapped call ->");
addTax(100);                                   // ->   addTax(100) -> 120
addTax(250);                                   // ->   addTax(250) -> 300

console.log("\n--- 3. pure vs impure ---");
const pureAddItem = (items, item) => [...items, item];            // pure
const impureAddItem = (items, item) => { items.push(item); return items; };  // mutates
const basket = ["bread"];
console.log("pure   ->", JSON.stringify(pureAddItem(basket, "milk")), "| basket:", JSON.stringify(basket));
console.log("impure ->", JSON.stringify(impureAddItem(basket, "eggs")), "| basket:", JSON.stringify(basket));

console.log("\n--- 4. composition: pipe and compose ---");
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);        // left -> right
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value); // right -> left
const trim = (text) => text.trim();
const lower = (text) => text.toLowerCase();
const slugify = (text) => text.replace(/\s+/g, "-");
console.log("pipe    ->", pipe(trim, lower, slugify)("  Hello World  "));     // -> pipe    -> hello-world
console.log("compose ->", compose(slugify, lower, trim)("  Hello World  "));  // -> compose -> hello-world

console.log("\n--- 5. a HOF that adds behaviour: validation ---");
const withValidation = (validator, fn) => (value) => {
  if (!validator(value)) throw new TypeError(`invalid input: ${value}`);
  return fn(value);
};
const isPositiveNumber = (value) => typeof value === "number" && value > 0;
const half = withValidation(isPositiveNumber, (value) => value / 2);
console.log("valid   ->", half(10));                          // -> valid   -> 5
try {
  half(-2);
} catch (error) {
  console.log("invalid ->", error.message);                    // -> invalid -> invalid input: -2
}

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- repeat -> #1 #2 #3            reuse -> 4,8
// --- 2 --- wrapped call ->
//             addTax(100) -> 120
//             addTax(250) -> 300
// --- 3 --- pure   -> ["bread","milk"] | basket: ["bread"]
//           impure -> ["bread","eggs"] | basket: ["bread","eggs"]
// --- 4 --- pipe    -> hello-world        compose -> hello-world
// --- 5 --- valid   -> 5                  invalid -> invalid input: -2

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using forEach when you needed map (forEach returns undefined, not an array).
// reduce() without an initial value (throws on empty arrays, types can surprise).
// Side effects (push, console.log, mutation) inside map/filter callbacks.
// Wrapping everything in decorators until stack traces are unreadable - keep
//   wrappers thin and name your functions.
// Over-abstracting: a plain for loop is clearer than four chained HOFs for simple work.
// Forgetting that the callback is called with (value, index, array) - a second
//   parameter can change meaning (parseInt in map is the classic trap).
// Assuming wrapper functions preserve `this`, function.length or name.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is a higher-order function?   A: A function that takes a function as an
//    argument or returns one - e.g. map, filter, reduce, setTimeout, debounce.
// Q: What is a pure function?   A: Same input -> same output, no side effects.
//    Easy to test and safe to memoize.
// Q: What is function composition?   A: Combining small functions so the output of
//    one is the input of the next (pipe left-to-right, compose right-to-left).
// Q: Why is [1,2,3].map(parseInt) wrong?   A: map passes (value, index, array), so
//    parseInt receives the index as its radix. Use map((n) => parseInt(n, 10)).
// Q: Where are HOFs used in frameworks?   A: Event handlers, middleware (app.use),
//    array pipelines, hooks, redux thunks, router guards.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write times(n, fn) that runs fn n times and collects the results.
// 2. Write filterBy(predicate) that returns a reusable array filter.
// 3. Write tap(sideEffect) that runs it and returns the value unchanged (debugging).

// ------------------------------ ANSWERS ------------------------------------
const times = (n, fn) => Array.from({ length: n }, (_, index) => fn(index));   // 1
console.log("\npractice 1 ->", JSON.stringify(times(4, (i) => i * i)));       // -> [0,1,4,9]

const filterBy = (predicate) => (items) => items.filter(predicate);            // 2
const adults = filterBy((person) => person.age >= 18);
console.log("practice 2 ->", adults([{ age: 12 }, { age: 30 }, { age: 18 }]).length); // -> 2

const tap = (sideEffect) => (value) => { sideEffect(value); return value; };   // 3
const logged = tap((value) => console.log("  tap sees:", value));
console.log("practice 3 ->", [1, 2, 3].map((n) => logged(n * 10)).join(","));
// ->   tap sees: 10 /   tap sees: 20 /   tap sees: 30 / practice 3 -> 10,20,30

console.log("\n✓ STEP 13 complete — next: node 14_destructuring_and_spread_rest.js");

