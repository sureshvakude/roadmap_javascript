/**
 * ============================================================================
 * STEP 04 / 28  ·  CONTROL FLOW                     Phase 1 · JavaScript Basics
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. if / else if / else and the ternary operator
 *   2. switch with case grouping, fall-through and default
 *   3. Loops: for, while, do..while, for..of, for..in
 *   4. break, continue and labelled loops
 *   5. The guard-clause / early-return style used in real code
 *
 * RUN IT      node 4_control_flow.js
 * PREV STEP   <-  3_operators.js
 * NEXT STEP   ->  5_functions.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// if / else if / else
//   Runs the first branch whose condition is truthy. Order matters: put the
//   most specific condition first.
//
// switch
//   Compares with === and falls through until a break. Use it for many fixed
//   values (status strings, commands). Always finish with default.
//
// LOOPS - WHICH ONE?
//   for        : you know how many times, or you need the index.
//   while      : repeat until a condition becomes false (unknown count).
//   do..while  : same as while, but runs the body at least once.
//   for..of    : iterate VALUES of an array, string, Map, Set  <- prefer this.
//   for..in    : iterate KEYS of an object (avoid it on arrays).
//
// break / continue
//   break    -> leave the loop entirely
//   continue -> skip to the next iteration
//   labelled break (outer: for ...) -> leave a nested loop from the inside.
//
// GUARD CLAUSES
//   Instead of deeply nested if/else, handle the bad cases first and return
//   early. It keeps the "happy path" of a function readable.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 04 · CONTROL FLOW  (Phase 1 · JavaScript Basics)");
console.log("=".repeat(62));

const age = 20;

console.log("\n--- 1. if / else if / else ---");
if (age >= 65) {
  console.log("senior");
} else if (age >= 18) {
  console.log("adult");          // -> adult
} else {
  console.log("minor");
}
if ("") console.log("never runs");   // "" is falsy
if ([]) console.log("[] is truthy -> this runs");

console.log("\n--- 2. switch ---");
const status = "error";
switch (status) {
  case "loading":
    console.log("show spinner");
    break;
  case "success":
    console.log("show data");
    break;
  case "error":
  case "failed":                 // grouped cases share one body
    console.log("show retry button"); // -> show retry button
    break;
  default:
    console.log("unknown status");
}

console.log("\n--- 3. for loop with break / continue ---");
const digits = [];
for (let i = 1; i <= 5; i++) {
  if (i === 3) continue;          // skip 3
  if (i === 5) break;             // stop before 5
  digits.push(i);
}
console.log("with break/continue ->", digits.join("")); // -> with break/continue -> 124

let total = 0;
for (let i = 1; i <= 4; i++) total += i;
console.log("sum 1..4 =", total); // -> sum 1..4 = 10

console.log("\n--- 4. while and do..while ---");
let attempts = 0;
while (attempts < 3) {
  attempts++;
}
console.log("while attempts:", attempts);  // -> while attempts: 3

let runsOnce = 0;
do {
  runsOnce++;
} while (false);
console.log("do..while ran:", runsOnce);   // -> do..while ran: 1

console.log("\n--- 5. for..of (values) vs for..in (keys) ---");
const fruits = ["apple", "banana"];
const fruitValues = [];
for (const fruit of fruits) fruitValues.push(fruit);   // for..of -> values
console.log("for..of ->", fruitValues.join(" "));      // -> for..of -> apple banana

const fruitKeys = [];
for (const index in fruits) fruitKeys.push(index);     // for..in -> keys (as strings)
console.log("for..in ->", fruitKeys.join(" "));        // -> for..in -> 0 1

const chars = [];
for (const char of "JS") chars.push(char);             // strings are iterable too
console.log("string  ->", chars.join("-"));            // -> string  -> J-S

const person = { name: "Ada", role: "dev" };
const pairs = [];
for (const key in person) pairs.push(`${key}=${person[key]}`);
console.log("object  ->", pairs.join(" "));            // -> object  -> name=Ada role=dev

console.log("\n--- 6. labelled break (leaving nested loops) ---");
const visited = [];
outer: for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    if (row === 1 && col === 1) break outer;   // leaves BOTH loops at once
    visited.push(`(${row},${col})`);
  }
}
console.log("visited ->", visited.join(" "));
// -> visited -> (0,0) (0,1) (0,2) (1,0)

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// STEP 04 · CONTROL FLOW  (Phase 1 · JavaScript Basics)
// ==============================================================
//
// --- 1. if / else if / else ---
// adult
// [] is truthy -> this runs
//
// --- 2. switch ---
// show retry button
//
// --- 3. for loop with break / continue ---
// with break/continue -> 124
// sum 1..4 = 10
//
// --- 4. while and do..while ---
// while attempts: 3
// do..while ran: 1
//
// --- 5. for..of (values) vs for..in (keys) ---
// for..of -> apple banana
// for..in -> 0 1
// string  -> J-S
// object  -> name=Ada role=dev
//
// --- 6. labelled break (leaving nested loops) ---
// visited -> (0,0) (0,1) (0,2) (1,0)

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using = (assignment) instead of === (comparison) inside a condition.
// Forgetting break in a switch -> silent fall-through into the next case.
// Using for..in on an array (it gives string indexes and also inherited keys);
//   use for..of or forEach/map for arrays.
// Off-by-one errors: i <= arr.length reads one element past the end.
// Infinite loops: forgetting to change the condition variable.
// Iterating an object with for..of (objects are not iterable) -> Object.entries.
// Nesting if/else five levels deep instead of using guard clauses / early return.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: switch vs if/else?
// A: switch compares one value with === against many cases and reads better for
//    fixed sets (status, command); if/else handles ranges and complex conditions.
// Q: while vs do..while?
// A: while checks first (body may never run), do..while runs the body at least
//    once, then checks.
// Q: for..of vs for..in?
// A: for..of iterates VALUES of iterables (arrays, strings, Map, Set);
//    for..in iterates enumerable KEYS (string indexes for arrays).
// Q: How do you break out of two nested loops?
// A: Use a label: outer: for (...) { for (...) { break outer; } }.
// Q: What is a guard clause?
// A: An early return for invalid input that keeps the main logic un-nested.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. FizzBuzz from 1 to 15: "Fizz" for multiples of 3, "Buzz" for 5,
//    "FizzBuzz" for both, otherwise the number.
// 2. Sum only the even numbers of [3, 8, 12, 5, 7, 20] with a loop.
// 3. Convert a numeric grade to a letter with switch (A/B/C/F, default "?").
// 4. Print a triangle of stars 5 rows high using nested loops.

// ------------------------------ ANSWERS ------------------------------------
const fizz = [];                                             // 1
for (let i = 1; i <= 15; i++) {
  if (i % 15 === 0) fizz.push("FizzBuzz");
  else if (i % 3 === 0) fizz.push("Fizz");
  else if (i % 5 === 0) fizz.push("Buzz");
  else fizz.push(i);
}
console.log("\npractice 1 ->", fizz.join(" "));
// -> 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz

const values = [3, 8, 12, 5, 7, 20];                         // 2
let evenSum = 0;
for (const value of values) {
  if (value % 2 === 0) evenSum += value;
}
console.log("practice 2 ->", evenSum);                       // -> 40

const gradeFor = (score) => {                                // 3
  switch (true) {
    case score >= 90: return "A";
    case score >= 80: return "B";
    case score >= 70: return "C";
    default: return "F";
  }
};
console.log("practice 3 ->", gradeFor(85), gradeFor(95), gradeFor(50)); // -> B A F

let triangle = "";                                           // 4
for (let row = 1; row <= 5; row++) {
  triangle += "*".repeat(row) + "\n";
}
console.log("practice 4 ->\n" + triangle);

console.log("✓ STEP 04 complete — next: node 5_functions.js");

