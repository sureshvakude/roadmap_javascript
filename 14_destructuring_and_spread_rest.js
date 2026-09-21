/**
 * ============================================================================
 * STEP 14 / 28 · DESTRUCTURING & SPREAD/REST  Phase 3 · Intermediate JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Object destructuring: keys, renaming, defaults, nested patterns
 *   2. Array destructuring: positions, skipping, rest element, swapping
 *   3. Destructuring in function parameters (the options-object pattern)
 *   4. Rest parameters vs rest elements - collecting leftovers
 *   5. Spread: expand arrays/objects, copy, merge, pass arguments
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 14_destructuring_and_spread_rest.js
 * PREV STEP   <-  13_higher_order_functions.js
 * NEXT STEP   ->  15_callbacks.js   (Phase 4 · Asynchronous JavaScript)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// DESTRUCTURING unpacks values in one statement:
//   objects match by KEY    const { name, id } = user
//   arrays  match by POSITION  const [first, second] = list
//
//   rename      : const { name: userName } = user
//   default     : const { role = "guest" } = user
//   nested      : const { address: { city } } = user
//   skip items  : const [, second] = list
//   rest        : const [head, ...tail] = list
//
// REST vs SPREAD - same three dots, opposite jobs:
//   REST   collects values into one array/object -> in function params,
//          in destructuring patterns (must be last)
//   SPREAD expands an iterable/object into places that expect values -> calls,
//          array literals, object literals
//
// IMPORTANT: {...obj} and [...arr] create SHALLOW copies. Nested objects/arrays
// are still shared with the original (unlike structuredClone).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 14 · DESTRUCTURING & SPREAD/REST  (Phase 3)");
console.log("=".repeat(62));

console.log("\n--- 1. object destructuring ---");
const user = { id: 7, name: "Ada", address: { city: "London", zip: "E1" } };
const { name, id } = user;
console.log("plain ->", name, id);                                // -> plain -> Ada 7
const { name: userName, role = "guest" } = user;                  // rename + default
console.log("rename + default ->", userName, role);               // -> rename + default -> Ada guest
const { address: { city, zip: postcode } } = user;                // nested + rename
console.log("nested ->", city, postcode);                         // -> nested -> London E1

console.log("\n--- 2. array destructuring ---");
const coords = [10, 20, 30, 40];
const [x, y] = coords;
console.log("first two ->", x, y);                                // -> first two -> 10 20
const [, second, ...tail] = coords;                               // skip, then rest element
console.log("skip + rest ->", second, JSON.stringify(tail));       // -> skip + rest -> 20 [30,40]
const [missing = "fallback"] = [];
console.log("default on empty ->", missing);                      // -> default on empty -> fallback
let first = 1;
let last = 2;
[first, last] = [last, first];                                    // swap without a temp variable
console.log("swapped ->", first, last);                           // -> swapped -> 2 1

console.log("\n--- 3. destructuring in parameters ---");
function createUser({ name, role = "user", active = true } = {}) {   // "= {}" guards createUser()
  return { name, role, active };
}
console.log("with options ->", JSON.stringify(createUser({ name: "Ada" })));
// -> with options -> {"name":"Ada","role":"user","active":true}
console.log("no argument  ->", JSON.stringify(createUser()));
// -> no argument  -> {"role":"user","active":true}

console.log("\n--- 4. rest parameters ---");
function sum(...numbers) { return numbers.reduce((total, value) => total + value, 0); }
console.log("sum ->", sum(1, 2, 3), sum(), sum(5, 5, 5, 5));       // -> sum -> 6 0 20
function logFirstAndCount(first, ...others) { return `${first} | ${others.length} more`; }
console.log("rest params ->", logFirstAndCount("start", 1, 2, 3)); // -> rest params -> start | 3 more

console.log("\n--- 5. spread: arrays, calls and objects ---");
const front = [1, 2];
const back = [3, 4];
console.log("concat  ->", JSON.stringify([...front, ...back]));     // -> concat  -> [1,2,3,4]
console.log("max     ->", Math.max(...front, 9, ...back));          // -> max     -> 9
const base = { theme: "dark", lang: "en" };
const custom = { lang: "de", debug: true };
console.log("merge   ->", JSON.stringify({ ...base, ...custom }));  // -> merge   -> {"theme":"dark","lang":"de","debug":true}
console.log("to array->", JSON.stringify([...new Set([1, 1, 2])]), [..."abc"].join("-"));
// -> to array-> [1,2] a-b-c

console.log("\n--- 6. spread copies are shallow ---");
const original = { list: [1], meta: { seen: false } };
const copy = { ...original };
copy.list.push(2);                       // the nested array is SHARED
copy.meta.seen = true;
console.log("original ->", JSON.stringify(original));
// -> original -> {"list":[1,2],"meta":{"seen":true}}   (the copy reached inside!)
const safeCopy = structuredClone(original);
safeCopy.list.push(3);
console.log("after deep clone ->", JSON.stringify(original.list));  // -> after deep clone -> [1,2]

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- plain -> Ada 7              rename + default -> Ada guest
//           nested -> London E1
// --- 2 --- first two -> 10 20          skip + rest -> 20 [30,40]
//           default on empty -> fallback            swapped -> 2 1
// --- 3 --- with options -> {"name":"Ada","role":"user","active":true}
//           no argument  -> {"role":"user","active":true}
// --- 4 --- sum -> 6 0 20               rest params -> start | 3 more
// --- 5 --- concat  -> [1,2,3,4]        max     -> 9
//           merge   -> {"theme":"dark","lang":"de","debug":true}
//           to array-> [1,2] a-b-c
// --- 6 --- original -> {"list":[1,2],"meta":{"seen":true}}
//           after deep clone -> [1,2]

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Destructuring a property that does not exist -> undefined (add a default).
// Destructuring null/undefined -> TypeError (guard with = {} or optional chaining).
// Forgetting that lines like `{ a } = obj` need parentheses: `({ a } = obj);`
// Putting rest anywhere except last -> SyntaxError.
// Expecting spread to deep copy - it copies references one level deep.
// Confusing array and object patterns: {} matches keys, [] matches positions.
// Overusing destructuring in parameters and losing readability of the signature.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Rest vs spread?   A: Same syntax, opposite direction: rest collects the
//    remaining values into an array/object, spread expands one into values/keys.
// Q: How do you give a default with destructuring?   A: { role = "guest" } for
//    objects, [value = 0] for arrays; the default applies only for undefined.
// Q: How do you swap two variables?   A: [a, b] = [b, a].
// Q: Is {...obj} a deep copy?   A: No - shallow. Use structuredClone for deep
//    copies of cloneable data.
// Q: How do you read from a nested optional API response safely?   A:
//    const { data: { items = [] } = {} } = response ?? {} - or optional chaining.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Pull city from { data: { user: { address: { city: "Paris" } } } } with fallbacks.
// 2. Write head(...) / tail(...) helpers using array destructuring.
// 3. Merge three objects where later keys win, without mutating any of them.
// 4. Turn "a,b,c" into ["a","b","c"] using spread and a method of your choice.

// ------------------------------ ANSWERS ------------------------------------
const response = { data: { user: { address: { city: "Paris" } } } };          // 1
const { data: { user: { address: { city: userCity } = {} } = {} } = {} } = response;
const { data: { user: { missingField = "n/a" } = {} } = {} } = response;     // default for a missing key
console.log("\npractice 1 ->", userCity, "|", missingField);                  // -> Paris | n/a

const splitHeadTail = ([head, ...tail]) => ({ head, tail });                  // 2
console.log("practice 2 ->", JSON.stringify(splitHeadTail([1, 2, 3, 4])));
// -> {"head":1,"tail":[2,3,4]}

const mergeAll = (...objects) => Object.assign({}, ...objects);                // 3
console.log("practice 3 ->", JSON.stringify(mergeAll({ a: 1 }, { b: 2 }, { a: 9 })));
// -> {"a":9,"b":2}

console.log("practice 4 ->", JSON.stringify([..."a,b,c".split(",")]));         // 4
// -> ["a","b","c"]

console.log("\n✓ STEP 14 complete — next: node 15_callbacks.js  (Phase 4 · Async)");

