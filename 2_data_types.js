/**
 * ============================================================================
 * STEP 02 / 28  ·  DATA TYPES                       Phase 1 · JavaScript Basics
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. The 7 primitive types and the object type
 *   2. typeof results - including the famous typeof null === "object"
 *   3. Value copy vs reference sharing
 *   4. Number gotchas: NaN, Infinity, 0.1 + 0.2, Number.isNaN
 *   5. Truthy / falsy values, strings, BigInt and Symbol
 *
 * RUN IT      node 2_data_types.js
 * PREV STEP   <-  1_variables.js
 * NEXT STEP   ->  3_operators.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// JAVASCRIPT HAS 8 TYPE CATEGORIES
//   Primitive (immutable, copied by value):
//     string, number, bigint, boolean, undefined, null, symbol
//   Object (mutable, copied by reference): object, plus everything built on it
//     (arrays, functions, dates, maps, sets, promises ...)
//
// typeof - THE PRACTICAL CHEAT SHEET
//   typeof "a"        -> "string"
//   typeof 1          -> "number"
//   typeof 1n         -> "bigint"
//   typeof true       -> "boolean"
//   typeof undefined  -> "undefined"
//   typeof null       -> "object"   <- historical bug, never "fixable"
//   typeof Symbol()   -> "symbol"
//   typeof {}  []     -> "object"   (use Array.isArray(x) for arrays)
//   typeof (() => {}) -> "function" (functions get their own typeof result)
//
// VALUE vs REFERENCE  (the single most important idea on this page)
//   Primitives are copied:  let b = a  ->  two independent values.
//   Objects are shared:     let b = a  ->  one object, two names pointing at it.
//
// TRUTHY / FALSY
//   Only 8 values are falsy: false, 0, -0, 0n, "", null, undefined, NaN.
//   Everything else is truthy - including "0", "false", [] and {}.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 02 · DATA TYPES  (Phase 1 · JavaScript Basics)");
console.log("=".repeat(62));

console.log("\n--- 1. the 7 primitive types ---");
const s = "text";                 // string
const num = 42;                   // number
const big = 9007199254740993n;    // bigint (note the trailing n)
const bool = true;                // boolean
const und = undefined;            // value is absent
const nul = null;                 // intentional absence
const sym = Symbol("id");         // unique identifier
console.log(typeof s, typeof num, typeof big, typeof bool,
            typeof und, typeof nul, typeof sym);
// -> string number bigint boolean undefined object symbol   (typeof null === "object")

console.log("\n--- 2. everything else is an object ---");
const arr = [1, 2, 3];
const obj = { a: 1 };
const fn = () => {};
console.log(typeof arr, typeof obj, typeof fn, Array.isArray(arr)); // -> object object function true

console.log("\n--- 3. primitives are copied, objects are shared ---");
let x = 1;
let y = x;              // copy of the value
y = 99;
console.log(x, y);      // -> 1 99

const first = { count: 1 };
const second = first;   // SAME reference, not a copy
second.count = 99;
console.log(JSON.stringify(first), JSON.stringify(second)); // -> {"count":99} {"count":99}
console.log("same object?", first === second);              // -> same object? true

console.log("\n--- 4. number gotchas ---");
console.log(0.1 + 0.2, 0.1 + 0.2 === 0.3);      // -> 0.30000000000000004 false
console.log(1 / 0, -1 / 0, 0 / 0);              // -> Infinity -Infinity NaN
console.log(Number.isNaN(NaN), isNaN("abc"));   // -> true true (global isNaN coerces!)
console.log(Number("abc"), Number("42"), parseInt("42px", 10), parseFloat("3.14abc"));
// -> NaN 42 42 3.14
console.log(Number.isInteger(42), Number.isFinite(Infinity)); // -> true false
console.log(Number.MAX_SAFE_INTEGER);           // -> 9007199254740991
console.log((0.1 + 0.2).toFixed(2));            // -> 0.30
console.log(Object.is(NaN, NaN), NaN === NaN, Object.is(-0, 0)); // -> true false false

console.log("\n--- 5. truthy / falsy ---");
const falsy = [false, 0, -0, 0n, "", null, undefined, NaN];
console.log(falsy.map(Boolean).join(","));      // -> false,false,false,false,false,false,false,false
console.log(Boolean("false"), Boolean(" "), Boolean([]), Boolean({})); // -> true true true true

console.log("\n--- 6. strings and template literals ---");
const who = "world";
console.log(`hello ${who}, 1 + 2 = ${1 + 2}`);  // -> hello world, 1 + 2 = 3
console.log("abc".length, "abc".toUpperCase(), " a ".trim()); // -> 3 ABC a
console.log("a,b,c".split(","), ["a", "b"].join("-"));        // -> [ 'a', 'b', 'c' ] a-b

console.log("\n--- 7. bigint for integers beyond 2^53 - 1 ---");
console.log(9007199254740992n * 2n);            // -> 18014398509481984n
// console.log(1n + 1);  // Uncomment -> TypeError: Cannot mix BigInt and other types

console.log("\n--- 8. symbol: a guaranteed-unique property key ---");
const id = Symbol("id");
const record = { [id]: 7, name: "Ada" };
console.log(record[id], Object.keys(record));   // -> 7 [ 'name' ]
console.log(Symbol("id") === Symbol("id"));     // -> false (never equal)

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// STEP 02 · DATA TYPES  (Phase 1 · JavaScript Basics)
// ==============================================================
//
// --- 1. the 7 primitive types ---
// string number bigint boolean undefined object symbol
//
// --- 2. everything else is an object ---
// object object function true
//
// --- 3. primitives are copied, objects are shared ---
// 1 99
// {"count":99} {"count":99}
// same object? true
//
// --- 4. number gotchas ---
// 0.30000000000000004 false
// Infinity -Infinity NaN
// true true
// NaN 42 42 3.14
// true false
// 9007199254740991
// 0.30
// true false false
//
// --- 5. truthy / falsy ---
// false,false,false,false,false,false,false,false
// true true true true
//
// --- 6. strings and template literals ---
// hello world, 1 + 2 = 3
// 3 ABC a
// [ 'a', 'b', 'c' ] a-b
//
// --- 7. bigint for integers beyond 2^53 - 1 ---
// 18014398509481984n
//
// --- 8. symbol: a guaranteed-unique property key ---
// 7 [ 'name' ]
// false

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Trusting typeof null -> always compare with "=== null".
// Using typeof to detect arrays -> use Array.isArray(x).
// Comparing objects with === and expecting value equality (it compares references).
// Using the global isNaN() -> it coerces ("abc" becomes NaN). Use Number.isNaN().
// Comparing decimals directly: (0.1 + 0.2 === 0.3) is false - round first.
// Treating "0", "false", [] or {} as falsy - they are truthy.
// Mixing BigInt and number in arithmetic -> TypeError, convert explicitly.
// Using User input strings without Number()/parseInt() conversion.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: How many data types exist in JavaScript?
// A: 7 primitives + object = 8 categories. Functions are objects with a
//    "function" typeof result.
// Q: Why does typeof null return "object"?
// A: A bug from the first JS engine (a type tag of 0 meant object). Fixing it
//    would break the web, so it stays.
// Q: Primitive vs reference types?
// A: Primitives hold the value itself and are copied on assignment; objects
//    hold a reference, so assignment copies the reference, not the data.
// Q: Why is 0.1 + 0.2 !== 0.3?
// A: Numbers are IEEE-754 doubles (binary fractions); 0.1 and 0.2 cannot be
//    represented exactly. Compare with a tolerance, or use cents/integers.
// Q: What is NaN and how do you test for it?
// A: "Not a Number", the result of invalid numeric operations. Test with
//    Number.isNaN(x); NaN is the only value not equal to itself.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write typeOf(value) that returns "array" for arrays, "null" for null,
//    otherwise the normal typeof result (so it is safe to use everywhere).
// 2. Show that a shallow spread copy still shares a NESTED array.
// 3. Explain the difference between Number("12.5abc") and parseFloat("12.5abc").
// 4. Make 0.1 + 0.2 compare equal to 0.3 safely.

// ------------------------------ ANSWERS ------------------------------------
const typeOf = (value) => {                                    // 1
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};
console.log("\npractice 1 ->", typeOf([]), typeOf(null), typeOf(1), typeOf(() => {}), typeOf(Symbol()));
// -> array null number function symbol

const original = { list: [1] };                                // 2
const shallow = { ...original };   // copies only the top level
shallow.list.push(2);              // the nested array is shared
console.log("practice 2 ->", JSON.stringify(original.list), "shared nested array");

console.log("practice 3 -> Number:", Number("12.5abc"), " parseFloat:", parseFloat("12.5abc"));
// Number requires the WHOLE string to be numeric -> NaN; parseFloat reads the
// longest valid numeric prefix -> 12.5

const sum = 0.1 + 0.2;                                         // 4
console.log("practice 4 ->", Math.abs(sum - 0.3) < Number.EPSILON * 10); // -> true

console.log("\n✓ STEP 02 complete — next: node 3_operators.js");

