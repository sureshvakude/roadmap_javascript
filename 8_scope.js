/**
 * ============================================================================
 * STEP 08 / 28  ·  SCOPE                   Phase 3 · Intermediate JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Global, module, function and block scope
 *   2. Lexical (static) scope and the scope chain
 *   3. Shadowing, and how var leaks out of blocks
 *   4. Scope + closures = private state
 *   5. Accidental globals, and why "use strict" exists
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 8_scope.js
 * PREV STEP   <-  7_objects.js          NEXT STEP  ->  9_hoisting.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// SCOPE = the region of code where a variable can be accessed. JavaScript scope
// is LEXICAL: it is decided by where the code is WRITTEN, not where it is called.
//
// THE FOUR KINDS
//   global  : globalThis (browser: window) - avoid storing app state here
//   module  : one scope per file (ES modules and Node CommonJS files alike)
//   function: everything declared inside a function body
//   block   : anything inside { } - let / const / class are block scoped
//
// THE SCOPE CHAIN
//   A lookup walks from the current scope outwards to the module/global scope.
//   Inner scopes can read outer variables; outer scopes cannot read inner ones.
//
// SHADOWING
//   Declaring the same name in a nested scope hides the outer one inside it.
//   Shadowing is legal, but confusing names are how bugs hide.
//
// CLOSURE (preview of step 10)
//   Functions keep a live link to the scope they were created in, so a returned
//   function can still read and update variables of its parent.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 08 · SCOPE  (Phase 3 · Intermediate JavaScript)");
console.log("=".repeat(62));

console.log("\n--- 1. the kinds of scope ---");
const moduleScoped = "visible everywhere in this file";  // module scope in Node

function showScopes() {
  const functionScoped = "function body";
  if (true) {
    const blockScoped = "inside the if block";
    var varScoped = "var ignores the block";             // leaks out of the { }
    console.log("inside block   :", blockScoped);        // -> inside block   : inside the if block
  }
  // console.log(blockScoped);   // ReferenceError: blockScoped is not defined
  console.log("inside function:", functionScoped, "|", varScoped);
  // -> inside function: function body | var ignores the block
}
showScopes();
console.log("module level   :", moduleScoped);            // -> module level   : visible everywhere in this file

console.log("\n--- 2. the scope chain and shadowing ---");
const level = "module";                 // outer declaration
function shadow() {
  const level = "function";             // shadows the module one inside here
  function readNearest() {
    return level;                       // walks up: finds the function one first
  }
  return readNearest();
}
function readOuter() {
  return level;                         // no local level -> walks up to module scope
}
console.log("shadowed ->", shadow(), "| outer ->", readOuter(), "| module ->", level);
// -> shadowed -> function | outer -> module | module -> module

console.log("\n--- 3. block scope in loops (why let is magic here) ---");
const letFns = [];
for (let i = 0; i < 3; i++) letFns.push(() => i);   // a NEW i per iteration
const varFns = [];
for (var j = 0; j < 3; j++) varFns.push(() => j);   // ONE j for the whole loop
console.log("let ->", letFns.map((fn) => fn()).join(",")); // -> let -> 0,1,2
console.log("var ->", varFns.map((fn) => fn()).join(",")); // -> var -> 3,3,3

console.log("\n--- 4. scope + closures = private state ---");
function createWallet(initialBalance) {
  let balance = initialBalance;                     // unreachable from outside
  return {
    deposit: (amount) => (balance += amount),
    getBalance: () => balance,
  };
}
const wallet = createWallet(100);
wallet.deposit(50);
console.log("balance ->", wallet.getBalance(), "| direct access ->", wallet.balance);
// -> balance -> 150 | direct access -> undefined

console.log("\n--- 5. accidental globals (why \"use strict\" exists) ---");
function sloppy() {
  accidentalGlobal = "I escaped the function";      // no keyword = global (non-strict)
}
sloppy();
console.log("on globalThis ->", globalThis.accidentalGlobal);
// -> on globalThis -> I escaped the function
delete globalThis.accidentalGlobal;
console.log("cleaned up    ->", "accidentalGlobal" in globalThis);
// -> cleaned up    -> false

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- inside block   : inside the if block
//           inside function: function body | var ignores the block
//           module level   : visible everywhere in this file
// --- 2 --- shadowed -> function | outer -> module | module -> module
// --- 3 --- let -> 0,1,2          var -> 3,3,3
// --- 4 --- balance -> 150 | direct access -> undefined
// --- 5 --- on globalThis -> I escaped the function
//           cleaned up    -> false

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using var inside a block and expecting the variable to disappear afterwards.
// Reusing one name at several levels (shadowing) and reading the wrong value.
// Creating accidental globals by forgetting let/const.
// Expecting a nested function to see variables declared in a sibling function.
// Storing app state in the global scope - name clashes and impossible testing.
// Being surprised by the let/var loop difference - remember: let creates a new
//   binding per iteration (this is why closures behave differently).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is scope?   A: The region where a variable is accessible; JavaScript
//    resolves it lexically (by where the code is written).
// Q: What is the scope chain?   A: The lookup path from the current scope to the
//    outer scopes and finally the module/global scope.
// Q: Difference between function scope and block scope?   A: var is function
//    scoped (visible in the whole function), let/const are block scoped ({}).
// Q: What is shadowing?   A: An inner declaration with the same name as an outer
//    one; inside the inner scope the outer variable is hidden.
// Q: How do closures relate to scope?   A: A closure is a function plus the live
//    scope it was created in, so it can still read/update those variables.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Predict the output of:
//      const name = "outer";
//      function run() { console.log(name); const name = "inner"; console.log(name); }
// 2. Fix the loop so this prints 0,1,2:  for (var i = 0; i < 3; i++) fns.push(() => i);
// 3. Print how many variables each scope can see (module, function, block).

// ------------------------------ ANSWERS ------------------------------------
// 1. Answer: it throws "ReferenceError: Cannot access 'name' before initialization".
//    The inner `const name` shadows the outer one for the WHOLE function, and the
//    first console.log runs before that declaration -> Temporal Dead Zone.

const fixedFns = [];                                  // 2
for (let i = 0; i < 3; i++) fixedFns.push(() => i);   // let = new binding per iteration
// (or keep var and capture the value: fns.push(((n) => () => n)(i)))
console.log("\npractice 2 ->", fixedFns.map((fn) => fn()).join(",")); // -> 0,1,2

console.log("practice 3 -> module scope sees: module + global (globalThis)"); // 3
console.log("              function scope sees: its params/locals + module + global");
console.log("              block scope sees: its block locals + enclosing scope(s)\n");

console.log("✓ STEP 08 complete — next: node 9_hoisting.js");

