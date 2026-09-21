/**
 * ============================================================================
 * STEP 10 / 28  ·  CLOSURES                Phase 3 · Intermediate JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What a closure is: a function plus the live scope it was created in
 *   2. Private state - the module pattern used by real libraries
 *   3. Factory functions: functions that build functions
 *   4. The classic loop pitfall and the two ways to fix it
 *   5. Closures used for caching (memoize) and what they cost in memory
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 10_closures.js
 * PREV STEP   <-  9_hoisting.js          NEXT STEP  ->  11_this_keyword.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// A CLOSURE is a function together with the lexical environment it was created
// in. The function keeps that environment ALIVE, so even after the outer
// function has returned, the inner function can still read and update its
// variables.
//
// You never "write" a closure: every function in JavaScript closes over the
// scope where it was defined. You just use the behaviour deliberately.
//
// WHERE YOU MEET CLOSURES IN REAL CODE
//   private state / module pattern (do not expose everything)
//   factories and partial application (step 26)
//   callbacks, event handlers, setTimeout closures
//   debounce / throttle (step 25), memoize caches
//   React hooks (useState keeps its value in a closure)
//
// MEMORY: captured variables live as long as the closure is reachable. Capture
// small values, not huge objects, and let closures go out of scope when done.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 10 · CLOSURES  (Phase 3 · Intermediate JavaScript)");
console.log("=".repeat(62));

console.log("\n--- 1. a function that remembers its scope ---");
function createCounter() {
  let count = 0;                       // lives on inside the returned function
  return function increment() {
    count += 1;
    return count;
  };
}
const counter = createCounter();
console.log(counter(), counter(), counter());  // -> 1 2 3
const secondCounter = createCounter();         // a separate closure with its own count
console.log("independent ->", secondCounter());  // -> independent -> 1

console.log("\n--- 2. private state: the module pattern ---");
function createBankAccount(owner, openingBalance) {
  let balance = openingBalance;        // truly private - no way in from outside
  const history = [];
  return {
    owner,
    deposit(amount) {
      if (amount <= 0) throw new Error("Deposit must be positive");
      balance += amount;
      history.push(`+${amount}`);
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      history.push(`-${amount}`);
      return balance;
    },
    statement: () => [...history],      // hand out a COPY, never the array itself
  };
}
const account = createBankAccount("Ada", 100);
account.deposit(50);
account.withdraw(30);
console.log("balance ->", account.deposit(10));    // -> balance -> 130
console.log("statement ->", JSON.stringify(account.statement()));
// -> statement -> ["+50","-30","+10"]
console.log("direct access ->", account.balance);  // -> direct access -> undefined

console.log("\n--- 3. factories: functions that make functions ---");
const makeMultiplier = (factor) => (value) => value * factor;
const double = makeMultiplier(2);
const triple = makeMultiplier(3);
console.log("multipliers ->", double(5), triple(5)); // -> multipliers -> 10 15

const greet = (greeting) => (name) => `${greeting}, ${name}!`;
console.log(greet("Hello")("Ada"), "|", greet("Hi")("Bob"));
// -> Hello, Ada! | Hi, Bob!

console.log("\n--- 4. the classic loop pitfall ---");
const varCallbacks = [];
for (var index = 0; index < 3; index++) {
  varCallbacks.push(function () { return `var ${index}`; });  // all share ONE index
}
console.log(varCallbacks.map((fn) => fn()).join(" | "));      // -> var 3 | var 3 | var 3

const letCallbacks = [];
for (let i = 0; i < 3; i++) {
  letCallbacks.push(() => `let ${i}`);                        // a new i each round
}
console.log(letCallbacks.map((fn) => fn()).join(" | "));      // -> let 0 | let 1 | let 2

// The other fix when you must keep var: capture the value in a new function scope
const captured = [];
for (var k = 0; k < 3; k++) {
  captured.push(((value) => () => `captured ${value}`)(k));
}
console.log(captured.map((fn) => fn()).join(" | "));          // -> captured 0 | captured 1 | captured 2

console.log("\n--- 5. closures for caching (memoize preview) ---");
function memoize(fn) {
  const cache = new Map();                 // private to this closure
  return (arg) => {
    if (cache.has(arg)) return `cached:${cache.get(arg)}`;
    const result = fn(arg);
    cache.set(arg, result);
    return `computed:${result}`;
  };
}
const square = memoize((n) => n * n);
console.log(square(4), square(4), square(5));
// -> computed:16 cached:16 computed:25
console.log("cache is private ->", typeof square.cache);   // -> cache is private -> undefined

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- 1 2 3                independent -> 1
// --- 2 --- balance -> 130       statement -> ["+50","-30","+10"]
//           direct access -> undefined
// --- 3 --- multipliers -> 10 15             Hello, Ada! | Hi, Bob!
// --- 4 --- var 3 | var 3 | var 3
//           let 0 | let 1 | let 2
//           captured 0 | captured 1 | captured 2
// --- 5 --- computed:16 cached:16 computed:25
//           cache is private -> undefined

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using var in a loop with callbacks and getting the final value every time.
// Exposing the private array/object directly instead of a copy (statement()).
// Creating a closure per item inside a huge loop - needless memory and CPU.
// Forgetting that every closure keeps its captured variables alive (memory leaks
//   when long-lived listeners capture big objects).
// Assuming two calls of the same factory share state - each call makes a NEW scope.
// Trying to read private variables (account.balance is undefined, not an error).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is a closure?   A: A function bundled with the lexical environment it
//    was created in; it can read and update those variables after the outer
//    function has returned.
// Q: Where do you use closures in practice?   A: Private state (module pattern),
//    factories, event handlers, memoization, debounce/throttle, currying.
// Q: Why does a var loop print the last index?   A: var has one binding for the
//    whole loop, so every closure shares it; let creates a new binding per round.
// Q: Any downside?   A: Memory: captured variables cannot be collected while the
//    closure is reachable, and stale closed-over values can confuse debugging.
// Q: How do closures relate to the module pattern?   A: An IIFE or factory returns
//    an object whose methods close over private variables - the only clean
//    pre-class way to get private data.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write once(fn): the wrapped function runs only the first time.
// 2. Write a counter factory with increment(), decrement() and value().
// 3. Explain why `for (var i ...)` callbacks all see the final value.

// ------------------------------ ANSWERS ------------------------------------
function once(fn) {                                          // 1
  let called = false;                 // captured, private
  let result;
  return (...args) => {
    if (called) return result;        // silently ignore later calls
    called = true;
    result = fn(...args);
    return result;
  };
}
const initOnce = once(() => "initialized");
console.log("\npractice 1 ->", initOnce(), "|", initOnce());  // -> initialized | initialized

const makeCounter = () => {                                  // 2
  let count = 0;
  return { increment: () => ++count, decrement: () => --count, value: () => count };
};
const tally = makeCounter();
tally.increment();
tally.increment();
tally.decrement();
console.log("practice 2 ->", tally.value());                 // -> 1

console.log("practice 3 -> var has a single binding shared by every iteration,"); // 3
console.log("              so all callbacks read i AFTER the loop finished (3)\n");

console.log("✓ STEP 10 complete — next: node 11_this_keyword.js");

