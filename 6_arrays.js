/**
 * ============================================================================
 * STEP 06 / 28  ·  ARRAYS                     Phase 2 · Working with Data
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Create, read and update arrays (indexes, length, at)
 *   2. Mutating methods: push, pop, shift, unshift, splice
 *   3. Non-mutating methods: slice, concat, map, filter, reduce, toSorted-ish
 *   4. Search helpers: find, findIndex, some, every, includes, indexOf
 *   5. Sorting with comparators, copying with spread, flat/flatMap
 *
 * RUN IT      node 6_arrays.js
 * PREV STEP   <-  5_functions.js
 * NEXT STEP   ->  7_objects.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// WHAT IS AN ARRAY?
//   An ordered, zero-indexed list of values. Arrays are objects, so they are
//   copied by REFERENCE and can hold mixed types (but prefer one type per array).
//
// MUTATING vs NON-MUTATING  (know this before you debug a "shared state" bug)
//   Mutating     : push, pop, shift, unshift, splice, sort, reverse, fill
//   Non-mutating : slice, concat, map, filter, reduce, find, join, flat, flatMap
//   React/Vue/Redux state updates rely on the non-mutating ones.
//
// THE BIG FIVE YOU USE EVERY DAY
//   map(fn)      -> new array, same length, transformed items
//   filter(fn)   -> new array with the items that pass the test
//   reduce(fn, initial) -> a single accumulated value (number, object, array)
//   find(fn)     -> first matching item (or undefined)
//   includes(x)  -> boolean membership test
//
// SORT GOTCHA
//   arr.sort() converts items to strings, so [10, 9, 100] sorts to "10,100,9".
//   Always pass a comparator: arr.sort((a, b) => a - b).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 06 · ARRAYS  (Phase 2 · Working with Data)");
console.log("=".repeat(62));

console.log("\n--- 1. creating and reading ---");
const colors = ["red", "green", "blue"];
console.log(colors.length, colors[0], colors.at(-1), colors[99]); // -> 3 red blue undefined
console.log(Array.isArray(colors), typeof colors);                // -> true object

console.log("\n--- 2. mutating methods ---");
const stack = [];
stack.push("a", "b");        // add to the END
stack.unshift("start");      // add to the FRONT
console.log(stack.join(" "));                 // -> start a b
console.log(stack.pop(), stack.shift());      // -> b start  (remove end, then front)
console.log(stack.join(" "));                 // -> a

const week = ["mon", "tue", "wed", "thu"];
week.splice(1, 2, "TUE", "WED");   // at index 1, remove 2 items, insert these
console.log(week.join(" "));       // -> mon TUE WED thu

console.log("\n--- 3. non-mutating methods ---");
const original = [1, 2, 3];
const sliced = original.slice(1);       // from index 1 to the end
const combined = original.concat([4, 5]);
console.log(original.join(","), "|", sliced.join(","), "|", combined.join(","));
// -> 1,2,3 | 2,3 | 1,2,3,4,5

console.log("\n--- 4. map / filter / reduce (the trio) ---");
const prices = [10, 25, 40];
const withTax = prices.map((price) => +(price * 1.2).toFixed(2));
console.log("map    ->", withTax.join(", "));      // -> map    -> 12, 30, 48
const overTwenty = prices.filter((price) => price > 20);
console.log("filter ->", overTwenty.join(", "));   // -> filter -> 25, 40
const sum = prices.reduce((total, price) => total + price, 0);
console.log("reduce ->", sum);                     // -> reduce -> 75

const byParity = ["a", "b", "c"].reduce((acc, letter, index) => {
  acc[index % 2 === 0 ? "even" : "odd"].push(letter);
  return acc;
}, { even: [], odd: [] });
console.log("reduce to object ->", JSON.stringify(byParity)); // -> {"even":["a","c"],"odd":["b"]}

console.log("\n--- 5. search helpers ---");
const users = [
  { id: 1, name: "Ada", active: true },
  { id: 2, name: "Bob", active: false },
  { id: 3, name: "Cy", active: true },
];
console.log(users.find((user) => user.active).name);        // -> Ada
console.log(users.findIndex((user) => user.id === 3));      // -> 2
console.log(users.some((user) => !user.active), users.every((user) => user.id > 0));
// -> true true
console.log(users.filter((user) => user.active).map((user) => user.name).join(", "));
// -> Ada, Cy
console.log(["a", "b"].includes("b"), ["a"].indexOf("z"));  // -> true -1

console.log("\n--- 6. sort: always pass a comparator ---");
const nums = [10, 9, 100];
console.log([...nums].sort().join(","));                    // -> 10,100,9  (string sort!)
console.log([...nums].sort((a, b) => a - b).join(","));     // -> 9,10,100  ascending
console.log([...nums].sort((a, b) => b - a).join(","));     // -> 100,10,9  descending
console.log("by name ->", [...users].sort((a, b) => a.name.localeCompare(b.name))
  .map((user) => user.name).join(", "));                    // -> by name -> Ada, Bob, Cy

console.log("\n--- 7. copies, spread and flattening ---");
const copy = [...nums];
copy.push(999);
console.log(nums.join(","), "|", copy.join(","));           // -> 10,9,100 | 10,9,100,999
console.log([[1, [2]], [3]].flat().join(","));              // -> 1,2,3
console.log([1, 2].flatMap((n) => [n, n * 10]).join(","));  // -> 1,10,2,20
console.log(Array.from("abc").join("-"),
            Array.from({ length: 3 }, (_, i) => i + 1).join(",")); // -> a-b-c 1,2,3

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// STEP 06 · ARRAYS  (Phase 2 · Working with Data)
// ==============================================================
//
// --- 1. creating and reading ---
// 3 red blue undefined
// true object
//
// --- 2. mutating methods ---
// start a b
// b start
// a
// mon TUE WED thu
//
// --- 3. non-mutating methods ---
// 1,2,3 | 2,3 | 1,2,3,4,5
//
// --- 4. map / filter / reduce (the trio) ---
// map    -> 12, 30, 48
// filter -> 25, 40
// reduce -> 75
// reduce to object -> {"even":["a","c"],"odd":["b"]}
//
// --- 5. search helpers ---
// Ada
// 2
// true true
// Ada, Cy
// true -1
//
// --- 6. sort: always pass a comparator ---
// 10,100,9
// 9,10,100
// 100,10,9
// by name -> Ada, Bob, Cy
//
// --- 7. copies, spread and flattening ---
// 10,9,100 | 10,9,100,999
// 1,2,3
// 1,10,2,20
// a-b-c 1,2,3

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Forgetting that sort/splice/push MUTATE the original array.
// Sorting numbers without a comparator ("10" < "9" is true as strings).
// Copying an array with "=" -> both names point at the same array (use [...]).
// Spread copies are SHALLOW: nested objects/arrays are still shared.
// Using for..in on an array (indexes as strings + prototype keys) - use for..of.
// reduce() without an initial value on an empty array -> TypeError.
// filter(Boolean) on numbers, which silently drops valid 0 values.
// Mutating an array while iterating over it (skipped elements, odd results).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: map vs forEach?
// A: map returns a new array of the same length; forEach returns undefined and
//    is only used for side effects.
// Q: Which array methods mutate the original array?
// A: push, pop, shift, unshift, splice, sort, reverse, fill, copyWithin.
// Q: How do you remove duplicates?
// A: [...new Set(array)] for primitives; filter + indexOf or a Map for objects.
// Q: How do you copy an array safely?
// A: Spread [...] (shallow) or structuredClone(array) (deep, for cloneable data).
// Q: filter()+map() vs reduce()?
// A: Same result. filter+map is more readable; reduce does it in a single pass.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Remove duplicates from [1, 2, 2, 3, 3, 3] twice: with Set and with filter.
// 2. Find the maximum of [4, 19, 7] using reduce (no Math.max spread).
// 3. Group people by city -> { London: ["Ada", "Cy"], Paris: ["Bob"] }.
// 4. chunk([1,2,3,4,5,6,7], 3) -> [[1,2,3],[4,5,6],[7]]
// 5. Average of [10, 20, 30] using reduce.

// ------------------------------ ANSWERS ------------------------------------
const duplicates = [1, 2, 2, 3, 3, 3];                          // 1
const uniqueWithSet = [...new Set(duplicates)];
const uniqueManual = duplicates.filter((value, index) => duplicates.indexOf(value) === index);
console.log("\npractice 1 ->", uniqueWithSet.join(","), "|", uniqueManual.join(",")); // -> 1,2,3 | 1,2,3

const max = [4, 19, 7].reduce((best, value) => (value > best ? value : best), -Infinity);
console.log("practice 2 ->", max);                              // -> 19

const people = [                                                // 3
  { name: "Ada", city: "London" },
  { name: "Bob", city: "Paris" },
  { name: "Cy", city: "London" },
];
const groupedByCity = people.reduce((acc, person) => {
  (acc[person.city] ??= []).push(person.name);
  return acc;
}, {});
console.log("practice 3 ->", JSON.stringify(groupedByCity));
// -> {"London":["Ada","Cy"],"Paris":["Bob"]}

const chunk = (items, size) =>                                  // 4
  items.reduce((acc, item, index) => {
    if (index % size === 0) acc.push([]);
    acc.at(-1).push(item);
    return acc;
  }, []);
console.log("practice 4 ->", JSON.stringify(chunk([1, 2, 3, 4, 5, 6, 7], 3)));
// -> [[1,2,3],[4,5,6],[7]]

const scores = [10, 20, 30];                                    // 5
const average = scores.reduce((total, score) => total + score, 0) / scores.length;
console.log("practice 5 ->", average);                          // -> 20

console.log("\n✓ STEP 06 complete — next: node 7_objects.js");


