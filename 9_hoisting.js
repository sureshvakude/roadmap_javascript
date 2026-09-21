/**
 * ============================================================================
 * STEP 09 / 28  ·  HOISTING                Phase 3 · Intermediate JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What hoisting really is (and what it is not)
 *   2. var -> hoisted and initialized as undefined
 *   3. let / const / class -> hoisted but blocked by the Temporal Dead Zone
 *   4. Function declarations are fully hoisted, expressions and arrows are not
 *   5. Why "declare before you use" removes the whole topic
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 9_hoisting.js
 * PREV STEP   <-  8_scope.js            NEXT STEP  ->  10_closures.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// HOISTING is the behaviour where declarations are registered at the top of
// their scope during the compile step, BEFORE any of your code runs.
// Nothing is physically moved - that is just a useful mental model.
//
//   var x = 1;      ->  "var x" is registered immediately (value undefined);
//                       "x = 1" happens where you wrote it.
//   let y = 1;      ->  "y" is registered but NOT initialized: reading it before
//                       the declaration line throws (Temporal Dead Zone, TDZ).
//   const z = 1;    ->  same as let, plus it cannot be reassigned.
//   function f(){}  ->  the whole function value is available from the top of
//                       the scope, so calling f() earlier works.
//   class C {}      ->  like let: in the TDZ until the declaration line.
//
// NICE DETAIL: `typeof undeclaredName` returns "undefined", but
// `typeof tdzName` THROWS, because the name exists in the TDZ.
//
// PRACTICAL RULE: declare variables at the top of the scope, use const, and
// hoisting becomes invisible - which is exactly what you want.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 09 · HOISTING  (Phase 3 · Intermediate JavaScript)");
console.log("=".repeat(62));

console.log("\n--- 1. var is hoisted as undefined ---");
console.log("before declaration ->", hoistedVar);  // -> before declaration -> undefined
var hoistedVar = 5;                                 // registered above, assigned here
console.log("after declaration  ->", hoistedVar);  // -> after declaration  -> 5

console.log("\n--- 2. let / const sit in the Temporal Dead Zone ---");
let usable = "declared above its use";
console.log("usable ->", usable);                  // -> usable -> declared above its use
function readInsideTdz() {
  // console.log(tdzValue);   // ReferenceError: Cannot access 'tdzValue' before initialization
  const tdzValue = 1;                              // the TDZ ends on this line
  return tdzValue;
}
console.log("tdz inside function ->", readInsideTdz()); // -> tdz inside function -> 1

console.log("\n--- 3. function declarations are fully hoisted ---");
console.log("call before definition ->", add(2, 3)); // -> call before definition -> 5
function add(a, b) { return a + b; }

console.log("\n--- 4. function expressions and arrows are not ---");
console.log("typeof before assignment ->", typeof varExpression);
// -> typeof before assignment -> undefined   (the variable exists, the value does not)
var varExpression = function () { return "var expression"; };
console.log("typeof after assignment  ->", typeof varExpression); // -> typeof after assignment  -> function

const arrowDouble = (n) => n * 2;              // reading arrowDouble earlier = ReferenceError
console.log("arrow after definition   ->", arrowDouble(2)); // -> arrow after definition   -> 4

console.log("\n--- 5. the value is read at CALL time ---");
var counter = 1;
function showCounter() { return counter; }     // looks up `counter` when called
counter = 2;
console.log("called after counter = 2 ->", showCounter()); // -> called after counter = 2 -> 2

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- before declaration -> undefined
//           after declaration  -> 5
// --- 2 --- usable -> declared above its use
//           tdz inside function -> 1
// --- 3 --- call before definition -> 5
// --- 4 --- typeof before assignment -> undefined
//           typeof after assignment  -> function
//           arrow after definition   -> 4
// --- 5 --- called after counter = 2 -> 2

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Relying on hoisting instead of declaring variables before use.
// Assuming let/const are safe to read early - they throw (TDZ).
// Expecting a function EXPRESSION or arrow function to be callable before its line.
// Believing hoisting physically moves code to the top of the file.
// Using one name for a var and a function in the same scope (one overwrites the other).
// Reading `typeof tdzVar` to "test safely" - it throws, unlike typeof on an
//   undeclared name which returns "undefined".

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is hoisting?   A: Declarations are registered at the top of their scope
//    before execution: var as undefined, let/const/class uninitialized (TDZ),
//    function declarations with their full value.
// Q: What is the Temporal Dead Zone?   A: The region between entering a scope and
//    a let/const/class declaration line, where reading the name throws.
// Q: Are arrow functions hoisted?   A: No. The variable is hoisted by its keyword
//    (undefined for var, TDZ for let/const) but the function value is assigned
//    where you wrote it.
// Q: Does hoisting move code?   A: No. The engine collects declarations during
//    compilation; "moved to the top" is only a teaching metaphor.
// Q: Why does the value always seem to be "the last one" in loops?   A: Once
//    assignment finishes, hoisted variables hold the final value - see step 10.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Why is `typeof notDeclared` fine but `typeof tdzThing` an error?
// 2. Rewrite this so it does not depend on hoisting:
//      const total = calculate(2, 4);   function calculate(a, b) { return a + b; }
// 3. Predict: typeof hoistedFnName and typeof varName BEFORE their declarations.

// ------------------------------ ANSWERS ------------------------------------
console.log("\npractice 1 -> typeof notDeclared:", typeof notDeclared);
// -> "undefined" - a name that does not exist anywhere is not in any TDZ
try {
  console.log(tdzProbe);
} catch (error) {
  console.log("practice 1 -> tdzProbe:", error.name);   // -> ReferenceError
}
let tdzProbe = "initialized on this line";
console.log("practice 1 -> after the line:", tdzProbe); // -> initialized on this line

const calculate = (a, b) => a + b;                       // 2
const total = calculate(2, 4);                           // declare, then use
console.log("practice 2 ->", total);                     // -> 6

console.log("practice 3 ->", typeof hoistedFnName, "|", typeof varName); // 3
function hoistedFnName() { return 1; }
var varName = 1;
// -> function | undefined   (function declarations arrive complete; vars start empty)

console.log("\n✓ STEP 09 complete — next: node 10_closures.js");

