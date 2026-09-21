/**
 * ============================================================================
 * STEP 30 / 28+5 · RECURSION & MEMOIZATION   Phase 9 · Extra Concepts You Use
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What recursion is: a function that calls itself with a smaller input
 *   2. The two mandatory parts: a base case and a recursive case
 *   3. The call stack: how recursion uses it, and what "stack overflow" means
 *   4. When recursion beats loops (trees, nested data) and when it does not
 *   5. Memoization: caching results so repeated sub-problems are computed once
 *
 * RUN IT      node 30_recursion_and_memoization.js
 * PREV STEP   <-  29_iife_and_module_patterns.js
 * NEXT STEP   ->  31_regular_expressions.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// RECURSION is when a function calls itself to solve a smaller version of the
// same problem, then combines the results.
//
//   const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
//                                          ^ base case   ^ recursive case
//
// TWO MANDATORY INGREDIENTS
//   base case      : the smallest input, answered directly (stops the recursion)
//   recursive case : call yourself with input that MOVES TOWARDS the base case
//   Missing or unreachable base case = infinite recursion = stack overflow.
//
// HOW IT RUNS
//   Each call is pushed on the call stack (step 18). The stack has a limited
//   depth (~10k frames in Node), so a recursion that goes too deep throws
//   "Maximum call stack size exceeded". Loops do not have that limit.
//
// WHEN RECURSION SHINES
//   Nested data (files/folders, menus, JSON trees, DOM), divide and conquer
//   (sorting, binary search), backtracking (mazes, permutations). If the data is
//   flat and the count is huge, prefer a loop.
//
// MEMOIZATION
//   Cache the result of each input the first time you compute it (a Map), and
//   return the cached value afterwards. This turns exponential naive recursion
//   (naive fibonacci) into linear work. It works because the function is PURE
//   (same input -> same output, no side effects - step 13).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 30 · RECURSION & MEMOIZATION  (Phase 9 · Extra Concepts You Use)");
console.log("=".repeat(62));

console.log("\n--- 1. the two ingredients: base case + recursive case ---");
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
console.log("factorial(5) ->", factorial(5));               // -> 120
console.log("factorial(0) ->", factorial(0));               // -> 1   (base case)

const countdownList = (n) => (n <= 0 ? [] : [n, ...countdownList(n - 1)]);
console.log("countdown ->", countdownList(3).join(" -> "), "-> go");
// -> countdown -> 3 -> 2 -> 1 -> go

const sumDigits = (number) => {
  if (number < 10) return number;                           // base case: single digit
  return (number % 10) + sumDigits(Math.floor(number / 10));
};
console.log("sumDigits(9021) ->", sumDigits(9021));         // -> 12

console.log("\n--- 2. naive recursion can repeat the same work ---");
let naiveCalls = 0;
const fibNaive = (n) => {
  naiveCalls += 1;
  return n <= 1 ? n : fibNaive(n - 1) + fibNaive(n - 2);
};
console.log("fibNaive(10) ->", fibNaive(10), "| calls:", naiveCalls);

console.log("\n--- 3. memoization: compute each sub-problem once ---");
const createMemoFib = () => {
  const cache = new Map();
  let calls = 0;
  const fib = (n) => {
    calls += 1;
    if (n <= 1) return n;                       // base case
    if (cache.has(n)) return cache.get(n);      // already solved -> reuse
    const value = fib(n - 1) + fib(n - 2);      // solve once, then cache
    cache.set(n, value);
    return value;
  };
  return { fib, callsUsed: () => calls };
};
const memo = createMemoFib();
console.log("fibMemo(10) ->", memo.fib(10), "| calls:", memo.callsUsed());
console.log("fibMemo(40) ->", createMemoFib().fib(40), "(instant with a cache)");

console.log("\n--- 4. recursion on nested data (where it really shines) ---");
const nested = [1, [2, [3, [4]], 5], [[6]]];
const flatten = (items) =>
  items.flatMap((item) => (Array.isArray(item) ? flatten(item) : item));
console.log("flatten ->", JSON.stringify(flatten(nested)));   // -> [1,2,3,4,5,6]

const deepClone = (value) => {
  if (Array.isArray(value)) return value.map(deepClone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, deepClone(child)]));
  }
  return value;                                              // primitive -> done (base case)
};
const originalTree = { a: 1, child: { b: [2, 3] } };
const clonedTree = deepClone(originalTree);
clonedTree.child.b.push(99);
console.log("deepClone is independent ->", JSON.stringify(originalTree.child.b));
// -> deepClone is independent -> [2,3]

const menu = {
  label: "root",
  children: [
    { label: "file", children: [] },
    { label: "edit", children: [{ label: "copy", children: [] }, { label: "paste", children: [] }] },
  ],
};
const collectLabels = (node, depth = 0, out = []) => {
  out.push(`${"  ".repeat(depth)}- ${node.label}`);
  for (const child of node.children) collectLabels(child, depth + 1, out);
  return out;
};
console.log("menu tree:\n" + collectLabels(menu).join("\n"));
// menu tree:
// - root
//   - file
//   - edit
//     - copy
//     - paste

console.log("\n--- 5. a reusable memoize() wrapper (step 13 style) ---");
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);          // simple key for primitive arguments
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};
let expensiveRuns = 0;
const slowSquare = memoize((n) => {
  expensiveRuns += 1;                          // pretend this is expensive
  return n * n;
});
console.log("memoize ->", slowSquare(4), slowSquare(4), slowSquare(4), slowSquare(5));
// -> memoize -> 16 16 16 25
console.log("computed only", expensiveRuns, "times for 4 calls");   // -> computed only 2 times for 4 calls

console.log("\n--- 6. the danger: recursion without a reachable base case ---");
const brokenCountdown = (n) => brokenCountdown(n - 1);        // never stops
try {
  brokenCountdown(3);
} catch (error) {
  console.log("caught ->", error.message.slice(0, 34), "...");
  // -> caught -> Maximum call stack size exceeded ...
}

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. base case + recursive case ---
// factorial(5) -> 120
// factorial(0) -> 1
// countdown -> 3 -> 2 -> 1 -> go
// sumDigits(9021) -> 12
//
// --- 2. naive recursion repeats work ---
// fibNaive(10) -> 55 | calls: 177
//
// --- 3. memoization ---
// fibMemo(10) -> 55 | calls: 19
// fibMemo(40) -> 102334155 (instant with a cache)
//
// --- 4. nested data ---
// flatten -> [1,2,3,4,5,6]
// deepClone is independent -> [2,3]
// menu tree:
// - root
//   - file
//   - edit
//     - copy
//     - paste
//
// --- 5. memoize() wrapper ---
// memoize -> 16 16 16 25
// computed only 2 times for 4 calls
//
// --- 6. the danger ---
// caught -> Maximum call stack size exceeded ...

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// A base case that is missing or can never be reached (n <= 0 with negative input).
// Forgetting to RETURN the recursive call (return n * f(n-1), not just f(n-1)).
// Recursing on flat, huge data - loops do the same job without stack limits.
// Naive fibonacci-style recursion where memoization gives a 1000x speedup.
// Passing huge objects/arrays through every recursion level (memory copies).
// Mutating shared state while recursing (counters, arrays) - pass state as
//   parameters or return new values.
// Memoizing an IMPURE function (results depend on Date.now() or random values) -
//   the cache would then return stale results.
// JSON.stringify as a cache key with functions/undefined/Dates inside (they are
//   dropped or changed - use a stable key instead).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is recursion?   A: A function solving a problem by calling itself on a
//    smaller input, with a base case that stops the chain.
// Q: What is a stack overflow and why?   A: Too many nested calls exceed the call
//    stack limit - usually a missing/unreachable base case or data that is too deep.
// Q: What is memoization?   A: Caching a pure function's results by input so the
//    same sub-problem is never computed twice (turns exponential into linear).
// Q: Memoization vs caching?   A: Memoization is result caching for a function's
//    inputs; caching is the broader term (HTTP, DB, component caches...).
// Q: Recursion vs loops?   A: Recursion maps naturally onto nested/tree data and
//    divide-and-conquer; loops are better for flat data, huge counts and O(1) memory.
// Q: What is tail-call optimisation?   A: Some engines reuse the stack frame when
//    the recursive call is the last action; JavaScript engines do NOT do it in
//    practice (except Safari/JavaScriptCore) - do not rely on it.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write recursive power(base, exp) using only multiplication.
// 2. Write findFile(folder, name) for a nested folder tree (children arrays).
// 3. Rewrite a recursive sum as a loop - what do you gain?
// 4. Cache the result of a slow lookup so repeated ids hit the cache once.

// ------------------------------ ANSWERS ------------------------------------
const power = (base, exp) => (exp === 0 ? 1 : base * power(base, exp - 1));   // 1
console.log("\npractice 1 ->", power(2, 10));                       // -> 1024

const findFile = (node, name) => {                                  // 2
  if (node.name === name) return node;                              // base case
  for (const child of node.children ?? []) {
    const found = findFile(child, name);
    if (found) return found;
  }
  return null;
};
const fileTree = {
  name: "root",
  children: [{ name: "src", children: [{ name: "app.js", children: [] }] }],
};
console.log("practice 2 ->", findFile(fileTree, "app.js")?.name, "|", findFile(fileTree, "missing.js"));
// -> practice 2 -> app.js | null

const loopSum = (items) => {                                        // 3
  let total = 0;
  for (const item of items) total += item;
  return total;
};
console.log("practice 3 ->", loopSum([1, 2, 3, 4, 5]));
console.log("              gain: no call stack growth, so any length is safe.");

let fetchCount = 0;                                                 // 4
const fetchUserById = memoize((id) => {
  fetchCount += 1;                          // pretend this is a network call
  return { id, name: `user-${id}` };
});
fetchUserById(7);
fetchUserById(7);
console.log("practice 4 ->", JSON.stringify(fetchUserById(7)), "| fetches:", fetchCount);
// -> practice 4 -> {"id":7,"name":"user-7"} | fetches: 1

console.log("\n✓ STEP 30 complete — next: node 31_regular_expressions.js");



