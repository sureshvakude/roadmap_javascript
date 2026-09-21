/**
 * ============================================================================
 * STEP 03 / 28  ·  OPERATORS                        Phase 1 · JavaScript Basics
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Arithmetic, assignment, comparison and logical operators
 *   2. == vs === (and why you use === almost always)
 *   3. Short-circuit evaluation, ?? vs ||, optional chaining ?.
 *   4. Logical assignment (||=, &&=, ??=), ternary and unary operators
 *
 * RUN IT      node 3_operators.js
 * PREV STEP   <-  2_data_types.js
 * NEXT STEP   ->  4_control_flow.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// CATEGORIES
//   Arithmetic : + - * / % **            (also ++ --)
//   Assignment : = += -= *= /= %= **=  ||= &&= ??=
//   Comparison : == != === !== > < >= <=
//   Logical    : &&  ||  !               (short-circuiting)
//   Nullish    : ??  ?.                  (null/undefined aware)
//   Ternary    : condition ? a : b
//
// == vs ===
//   ==  compares AFTER type coercion  -> 1 == "1" is true, [] == 0 is true
//   === compares value AND type        -> 1 === "1" is false
//   Rule: always use === (and !==). Add eslint "eqeqeq" so you cannot forget.
//   The one accepted use of == is "x == null" to test null OR undefined.
//
// SHORT-CIRCUIT
//   a && b  -> returns b only when a is truthy, otherwise a (stops early)
//   a || b  -> returns a when it is truthy, otherwise b
//   a ?? b  -> returns b only when a is null or undefined (0 and "" survive)
//
// OPTIONAL CHAINING
//   obj?.prop, obj?.[key], fn?.() -> undefined instead of "Cannot read
//   properties of undefined". Great for API data and optional config.
//
// PRECEDENCE (high to low, useful subset)
//   ()  ->  **  ->  * / %  ->  + -  ->  < <= > >=  ->  == != === !==
//   ->  &&  ->  || / ??  ->  ?:  ->  = += ...

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 03 · OPERATORS  (Phase 1 · JavaScript Basics)");
console.log("=".repeat(62));

const age = 24;   // declared here - step 01 taught you that undefined names throw

console.log("\n--- 1. arithmetic ---");
console.log(10 + 5, 10 - 5, 10 * 5, 10 / 5, 10 % 3, 2 ** 10); // -> 15 5 50 2 1 1024

let counter = 0;
console.log(counter++, counter, ++counter, counter); // -> 0 1 2 2  (post vs pre increment)

console.log("5" + 5, "5" - 5, "5" * "2");  // -> 55 0 10   (+ concatenates, others coerce)
console.log(Number("5") + 5, +"5" + 5);    // -> 10 10     (explicit vs unary plus)

console.log("\n--- 2. assignment operators ---");
let score = 10;
score += 5;   // 15
score -= 3;   // 12
score *= 2;   // 24
score /= 4;   // 6
score **= 2;  // 36
score %= 10;  // 6
console.log(score); // -> 6

console.log("\n--- 3. comparison: == vs === ---");
console.log(1 == "1", 1 === "1");                   // -> true false
console.log(null == undefined, null === undefined); // -> true false
console.log(0 == false, "" == 0, [] == 0);          // -> true true true (coercion traps)
console.log(NaN === NaN, Object.is(NaN, NaN));      // -> false true
console.log("10" > "9", 10 > 9);                    // -> false true (string vs number compare)

console.log("\n--- 4. logical operators and short-circuiting ---");
console.log(true && "yes", false && "yes");              // -> yes false
console.log(null || "fallback", "" || "fallback");       // -> fallback fallback
console.log(0 ?? "null/undefined only", null ?? "fallback"); // -> 0 fallback
const user = { name: "Ada", address: null };
console.log(user.address?.city, user.missing?.city);     // -> undefined undefined
console.log(age >= 18 && "can vote");                    // -> can vote (guard pattern)

console.log("\n--- 5. logical assignment (ES2021) ---");
let a = null;   a ??= "default";                // only for null / undefined
let b = 0;      b ||= 42;                       // any falsy value
let c = "kept"; c &&= c.toUpperCase();          // only when truthy
console.log(a, b, c);                           // -> default 42 KEPT

console.log("\n--- 6. ternary and unary ---");
const label = age >= 18 ? "adult" : "minor";
console.log(label);                             // -> adult
console.log(typeof age, -age, !age, void 0);    // -> number -24 false undefined

console.log("\n--- 7. precedence ---");
console.log(2 + 3 * 4, (2 + 3) * 4, 2 ** 3 ** 2); // -> 14 20 512 (right-associative)

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// STEP 03 · OPERATORS  (Phase 1 · JavaScript Basics)
// ==============================================================
//
// --- 1. arithmetic ---
// 15 5 50 2 1 1024
// 0 1 2 2
// 55 0 10
// 10 10
//
// --- 2. assignment operators ---
// 6
//
// --- 3. comparison: == vs === ---
// true false
// true false
// true true true
// false true
// false true
//
// --- 4. logical operators and short-circuiting ---
// yes false
// fallback fallback
// 0 fallback
// undefined undefined
// can vote
//
// --- 5. logical assignment (ES2021) ---
// default 42 KEPT
//
// --- 6. ternary and unary ---
// adult
// number -24 false undefined
//
// --- 7. precedence ---
// 14 20 512

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using == and getting surprises: [] == 0, "" == 0, null == 0 are all true/false traps.
// Using || to supply a default when 0 or "" are valid values -> use ??.
// Forgetting that + on a string concatenates: "5" + 5 === "55".
// Confusing post/pre increment in one expression (counter++ + ++counter).
// Reading a property of undefined: user.address.city -> use user.address?.city.
// Longer-than-50-character nested ternaries - use if/else or a lookup object.
// Comparing NaN with === (always false) or using the coercing global isNaN().

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Difference between == and ===?
// A: == coerces types before comparing (1 == "1" is true), === compares value
//    and type without coercion. Prefer ===; x == null is the classic exception.
// Q: Difference between || and ???
// A: || falls back on ANY falsy value (0, "", false, NaN); ?? only falls back on
//    null or undefined. Use ?? for numeric/boolean defaults.
// Q: What does short-circuit evaluation mean?
// A: && stops at the first falsy operand, || stops at the first truthy one, so
//    the right side may never run (used for guards and default values).
// Q: Difference between ++i and i++?
// A: ++i increments then returns the new value; i++ returns the old value then
//    increments.
// Q: Why does 2 ** 3 ** 2 equal 512?
// A: Exponentiation is right-associative: 2 ** (3 ** 2) = 2 ** 9.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Predict the output of: 1 + 2 + "3"  and  "1" + 2 + 3
// 2. Safely read a deeply nested API value with ?. and a ?? fallback.
// 3. Use ??= to apply defaults WITHOUT overwriting 0.
// 4. When is "x == null" better than "x === undefined || x === null"?

// ------------------------------ ANSWERS ------------------------------------
console.log("\npractice 1 ->", 1 + 2 + "3", "|", "1" + 2 + 3);   // 1
// -> 33 | 123    (left to right: 1+2 = 3 then "3" concatenates; then strings all the way)

const api = { user: { profile: { nickname: "ada" } } };          // 2
const nickname = api?.user?.profile?.nickname ?? "anonymous";
const email = api?.account?.email ?? "no email";
console.log("practice 2 ->", nickname, "|", email);             // -> ada | no email

const config = { retries: 0, verbose: null };                    // 3
config.retries ??= 3;        // stays 0  (0 is not null/undefined)
config.verbose ??= false;
console.log("practice 3 ->", JSON.stringify(config));            // -> {"retries":0,"verbose":false}

console.log("practice 4 -> x == null is true for BOTH null and undefined,"); // 4
console.log("              so it replaces two === checks in one line.\n");

console.log("✓ STEP 03 complete — next: node 4_control_flow.js");

