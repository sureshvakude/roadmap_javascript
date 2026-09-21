/**
 * ============================================================================
 * STEP 01 / 28  ·  VARIABLES                        Phase 1 · JavaScript Basics
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. The three ways to declare a variable: const, let, var
 *   2. Declaration vs initialization vs assignment
 *   3. Block scope (let/const) vs function scope (var) and the TDZ
 *   4. Reassignment vs mutation - why a const object can still change
 *   5. Naming rules and the conventions used in real codebases
 *
 * RUN IT      node 1_variables.js
 * NEXT STEP   ->  2_data_types.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// DEFINITION
//   A variable is a named reference to a value in memory.
//
// WHY IT MATTERS
//   Most beginner bugs start with the wrong variable choice: reassigning
//   something that should be constant, or letting a variable escape the block
//   where it belongs.
//
// THE THREE KEYWORDS
//   const : block scoped, MUST be initialized, cannot be reassigned  <- default
//   let   : block scoped, CAN be reassigned          <- only when it must change
//   var   : function scoped, hoisted as undefined, allows redeclaration.
//           Legacy. You will read it in old code; do not write new code with it.
//
// DECLARATION / INITIALIZATION / ASSIGNMENT
//   let score;      // declaration  (value is undefined)
//   score = 10;     // assignment
//   let level = 1;  // declaration + initialization
//
// SCOPE IN ONE LINE
//   let/const live inside the nearest { } block, var lives until the end of the
//   enclosing FUNCTION (see 8_scope.js and 9_hoisting.js for the details).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 01 · VARIABLES  (Phase 1 · JavaScript Basics)");
console.log("=".repeat(62));

console.log("\n--- 1. the three keywords ---");
let name = "Alice";        // can be reassigned
const age = 30;            // cannot be reassigned
var legacy = "avoid var";  // function scoped (old style)
console.log(name, age, legacy); // -> Alice 30 avoid var

name = "Bob";              // allowed
// age = 31;               // Uncomment -> TypeError: Assignment to constant variable.
console.log("after reassign:", name); // -> after reassign: Bob

console.log("\n--- 2. const protects the binding, not the value ---");
const user = { name: "Alice" };
user.name = "Ada";         // allowed: we MUTATE the object
user.city = "London";      // adding a property is mutation too
console.log(JSON.stringify(user)); // -> {"name":"Ada","city":"London"}

const numbers = [1, 2];
numbers.push(3);           // allowed: mutation of the array
console.log(numbers);      // -> [ 1, 2, 3 ]
// user = {};              // Uncomment -> TypeError: reassignment is blocked
// Use Object.freeze(user) if you really need an immutable object.

console.log("\n--- 3. block scope: let/const vs var ---");
{
  let blockOnly = "inside";
  const alsoBlockOnly = "and here";
  var leaksOut = "escaped the block";
  console.log(blockOnly, alsoBlockOnly); // -> inside and here
}
// console.log(blockOnly); // ReferenceError: blockOnly is not defined
console.log("var leaked ->", leaksOut);  // -> var leaked -> escaped the block

console.log("\n--- 4. the Temporal Dead Zone (TDZ) ---");
// console.log(pending);   // ReferenceError: Cannot access 'pending' before initialization
let pending = "ready now";
console.log(pending);      // -> ready now

console.log("\n--- 5. naming rules and conventions ---");
const MAX_RETRIES = 3;     // UPPER_SNAKE_CASE -> module level constants
let firstName = "Ada";     // camelCase        -> variables and functions
let _private = 1;          // leading _        -> "internal use" by convention
let $el = "div";           // $ is legal       -> used by jQuery style code
console.log(MAX_RETRIES, firstName, _private, $el); // -> 3 Ada 1 div

console.log("\n--- 6. swapping two values without a temp variable ---");
let a = 1;
let b = 2;
[a, b] = [b, a];
console.log(a, b);         // -> 2 1

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// STEP 01 · VARIABLES  (Phase 1 · JavaScript Basics)
// ==============================================================
//
// --- 1. the three keywords ---
// Alice 30 avoid var
// after reassign: Bob
//
// --- 2. const protects the binding, not the value ---
// {"name":"Ada","city":"London"}
// [ 1, 2, 3 ]
//
// --- 3. block scope: let/const vs var ---
// inside and here
// var leaked -> escaped the block
//
// --- 4. the Temporal Dead Zone (TDZ) ---
// ready now
//
// --- 5. naming rules and conventions ---
// 3 Ada 1 div
//
// --- 6. swapping two values without a temp variable ---
// 2 1

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using var instead of let/const and then wondering why a loop variable leaked.
// Assuming const makes the VALUE immutable - it only locks the binding.
// Accessing a let/const before its declaration line (TDZ ReferenceError).
// Implicit globals: "x = 5" with no keyword (always declare your variables).
// Meaningless names (data, temp, x) - except throwaway loop indexes.
// Declaring a value inside a loop when it should be computed once.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Difference between let and var?
// A: let (and const) are block scoped and unusable before declaration (TDZ);
//    var is function scoped and hoisted with the value undefined.
// Q: Is const immutable?
// A: No. It only prevents reassignment of the binding; objects/arrays can still
//    be mutated. Object.freeze() adds shallow value immutability.
// Q: What is the TDZ?
// A: The window between entering a scope and the let/const declaration line,
//    where any access throws a ReferenceError.
// Q: Why prefer const by default?
// A: Intent is clearer, accidental reassignment becomes an error, and it helps
//    the engine optimise.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Declare a constant PI = 3.14159 and compute the area of a circle r = 3.
// 2. Create "let status = 'idle'" and change it to 'loading' then 'done'.
// 3. Predict the output before running:
//      const config = { theme: "dark" };  config.theme = "light";  console.log(config.theme);
// 4. Prove that var leaks out of an if-block while let does not.

// ------------------------------ ANSWERS ------------------------------------
const pi = 3.14159;                            // 1
const radius = 3;
console.log(`\npractice 1 -> area = ${(pi * radius ** 2).toFixed(2)}`); // -> 28.27

let status = "idle";                           // 2
status = "loading";
status = "done";
console.log("practice 2 ->", status);          // -> done

const config = { theme: "dark" };              // 3
config.theme = "light";
console.log("practice 3 ->", config.theme);    // -> light (binding locked, value mutable)

console.log("practice 4 -> see examples section 3 above.\n"); // 4

console.log("✓ STEP 01 complete — next: node 2_data_types.js");

