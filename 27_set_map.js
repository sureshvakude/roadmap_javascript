/**
 * ============================================================================
 * STEP 27 / 28  ·  SET, MAP & WEAK COLLECTIONS   Phase 7 · Advanced Patterns
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Set: unique values, membership, and the classic "remove duplicates"
 *   2. Set operations: union, intersection, difference, subset checks
 *   3. Map: any key type, insertion order, size, iteration
 *   4. Map vs plain object - the key coercion trap and when to pick which
 *   5. WeakMap / WeakSet: metadata and caches that do not leak memory
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 4 so you can verify your run. Everything here is
 *   synchronous, so the output order is exactly the order of the code.
 *
 * RUN IT      node 27_set_map.js
 * PREV STEP   <-  26_currying.js
 * NEXT STEP   ->  28_testing_and_debugging.js   (Phase 8)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// SET = a collection of UNIQUE values.
//   new Set(iterable) | add(v) | has(v) | delete(v) | clear() | size
//   Iterable in insertion order: for..of, spread [...set], Array.from(set)
//   * duplicates are ignored, NaN is considered equal to NaN, and objects are
//     compared by REFERENCE (two {id:1} objects are different values)
//   * no indexing - use arrays when you need order by position or duplicate values
//   Use for: deduplication, "have I seen this?", tag/permission lists, visited sets.
//
// MAP = a collection of key -> value pairs where the KEY can be anything.
//   new Map(entries) | set(k, v) | get(k) | has(k) | delete(k) | clear() | size
//   Iteration: for (const [key, value] of map) - insertion order is preserved.
//   * object keys are strings/symbols only (numbers get coerced to strings!)
//   * Map keys keep their type: 1 and "1" are different keys
//   * Map does not inherit Object.prototype, so a key named "__proto__" is safe
//   Use for: caches, counters, lookup tables with object keys, ordered dictionaries.
//
// PLAIN OBJECT vs MAP
//   Static, known keys + JSON serialisation      -> object literal
//   Dynamic keys, non-string keys, frequent add/delete, need .size -> Map
//
// WEAKMAP / WEAKSET
//   Keys must be OBJECTS, entries are not iterable and have no size - but they do
//   NOT prevent garbage collection. Perfect for attaching private data or caching
//   results per object without leaking memory (the entry disappears with the key).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 27 · SET, MAP & WEAK COLLECTIONS  (Phase 7 · Advanced Patterns)");
console.log("=".repeat(62));

console.log("\n--- 1. Set: unique values, membership, dedup ---");
const tags = new Set(["js", "css", "js", "html", "css"]);
console.log("size ->", tags.size, "| content ->", [...tags].join(","));  // -> 3 | js,css,html
tags.add("js");                                     // already there -> no change
tags.add("react");
console.log("has js ->", tags.has("js"), "| has vue ->", tags.has("vue")); // -> true | false
tags.delete("css");
console.log("after delete ->", [...tags].join(","));  // -> js,html,react

const numbers = [1, 2, 2, 3, 3, 3, NaN, NaN];
console.log("dedupe ->", [...new Set(numbers)].join(","));  // -> 1,2,3,NaN
const userA = { id: 1 };
const userB = { id: 1 };
console.log("objects compare by reference ->", new Set([userA, userB]).size);  // -> 2

console.log("\n--- 2. Set operations (union, intersection, difference) ---");
const frontend = new Set(["js", "css", "html"]);
const backend = new Set(["node", "js", "sql"]);
const union = new Set([...frontend, ...backend]);
const intersection = new Set([...frontend].filter((skill) => backend.has(skill)));
const difference = new Set([...frontend].filter((skill) => !backend.has(skill)));
const symmetricDifference = new Set([
  ...[...frontend].filter((skill) => !backend.has(skill)),
  ...[...backend].filter((skill) => !frontend.has(skill)),
]);
const isSubset = (a, b) => [...a].every((value) => b.has(value));
console.log("union        ->", [...union].join(","));                 // -> js,css,html,node,sql
console.log("intersection ->", [...intersection].join(","));           // -> js
console.log("difference   ->", [...difference].join(","));             // -> css,html
console.log("symmetric    ->", [...symmetricDifference].join(","));    // -> css,html,node,sql
console.log("subset ->", isSubset(new Set(["js"]), frontend), isSubset(new Set(["js", "go"]), frontend));
// -> subset -> true false

console.log("\n--- 3. Map: any key type, ordered, sized ---");
const cache = new Map();
cache.set("user:1", { name: "Ada" });
cache.set(42, "a number key");
cache.set(true, "a boolean key");
const objectKey = { id: 7 };
cache.set(objectKey, "an object key");
console.log("size ->", cache.size, "| get ->", cache.get("user:1").name, cache.get(objectKey));
// -> size -> 4 | get -> Ada an object key
console.log("has 42 ->", cache.has(42), "| has \"42\" ->", cache.has("42"));  // -> true | false
cache.delete(42);
console.log("after delete ->", cache.size);                            // -> 3
console.log("keys ->", [...cache.keys()].map(String).join(" | "));
// -> user:1 | true | [object Object]

console.log("\n--- 4. Map vs object: the key coercion trap ---");
const asObject = {};
asObject[1] = "number 1";
asObject["1"] = "string 1";                     // SAME key -> overwrites
console.log("object keys ->", JSON.stringify(asObject), "| count:", Object.keys(asObject).length);
// -> object keys -> {"1":"string 1"} | count: 1

const asMap = new Map();
asMap.set(1, "number 1");
asMap.set("1", "string 1");                     // different keys
console.log("map keys ->", asMap.size, "|", asMap.get(1), "/", asMap.get("1"));
// -> map keys -> 2 | number 1 / string 1

console.log("\n--- 5. counting and grouping with Map ---");
const words = ["apple", "banana", "apple", "cherry", "banana", "apple"];
const counts = new Map();
for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
console.log("counts ->", [...counts.entries()].map(([word, count]) => `${word}:${count}`).join(", "));
// -> counts -> apple:3, banana:2, cherry:1
const mostFrequent = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
console.log("most frequent ->", mostFrequent.join(" x"));            // -> apple x3

const people = [
  { name: "Ada", team: "core" },
  { name: "Bob", team: "web" },
  { name: "Cy", team: "core" },
];
const byTeam = new Map();
for (const person of people) {
  byTeam.set(person.team, [...(byTeam.get(person.team) ?? []), person.name]);
}
console.log("grouped ->", JSON.stringify(Object.fromEntries(byTeam)));
// -> grouped -> {"core":["Ada","Cy"],"web":["Bob"]}

console.log("\n--- 6. WeakMap: private data that does not leak ---");
const privateData = new WeakMap();
class Wallet {
  constructor(balance) { privateData.set(this, { balance }); }
  deposit(amount) { privateData.get(this).balance += amount; return this; }
  get balance() { return privateData.get(this).balance; }
}
const wallet = new Wallet(100);
wallet.deposit(50);
console.log("weakmap balance ->", wallet.balance, "| not iterable ->", typeof privateData.size);
// -> weakmap balance -> 150 | not iterable -> undefined
const seenObjects = new WeakSet();
const element = { id: "row-1" };
seenObjects.add(element);
console.log("weakset has ->", seenObjects.has(element));              // -> true

console.log("\n--- 7. choosing the right collection ---");
const report = [
  ["array", "ordered, duplicates allowed, index access"],
  ["Set", "unique values, fast has(), no index"],
  ["Map", "any key type, ordered, .size, frequent add/delete"],
  ["object", "fixed keys, JSON friendly, prototype keys"],
  ["WeakMap/WeakSet", "per-object metadata that can be garbage collected"],
];
console.log(report.map(([name, use]) => `  ${name.padEnd(15)} ${use}`).join("\n"));

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. Set ---
// size -> 3 | content -> js,css,html
// has js -> true | has vue -> false
// after delete -> js,html,react
// dedupe -> 1,2,3,NaN
// objects compare by reference -> 2
//
// --- 2. Set operations ---
// union        -> js,css,html,node,sql
// intersection -> js
// difference   -> css,html
// symmetric    -> css,html,node,sql
// subset -> true false
//
// --- 3. Map ---
// size -> 4 | get -> Ada an object key
// has 42 -> true | has "42" -> false
// after delete -> 3
// keys -> user:1 | true | [object Object]
//
// --- 4. Map vs object ---
// object keys -> {"1":"string 1"} | count: 1
// map keys -> 2 | number 1 / string 1
//
// --- 5. counting and grouping ---
// counts -> apple:3, banana:2, cherry:1
// most frequent -> apple x3
// grouped -> {"core":["Ada","Cy"],"web":["Bob"]}
//
// --- 6. WeakMap / WeakSet ---
// weakmap balance -> 150 | not iterable -> undefined
// weakset has -> true
//
// --- 7. choosing the right collection ---
//   array           ordered, duplicates allowed, index access
//   Set             unique values, fast has(), no index
//   Map             any key type, ordered, .size, frequent add/delete
//   object          fixed keys, JSON friendly, prototype keys
//   WeakMap/WeakSet per-object metadata that can be garbage collected

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using a Set and expecting index access (set[0] is undefined - spread it first).
// Expecting Set/Map to deduplicate OBJECTS by value - they use references.
// Using an object as a Map key and creating a new equivalent object for lookups.
// Thinking object keys keep their type: obj[1] and obj["1"] are the same key.
// Reading obj.size / map.length (Map uses .size, objects need Object.keys().length).
// Iterating a Map with for..in (use for..of - it yields [key, value]).
// Trying to JSON.stringify a Map/Set (they serialise to {} - convert first).
// Using WeakMap keys that are primitives (TypeError) or expecting .size/iteration.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: When do you use a Set?   A: Unique values and fast membership tests -
//    deduplication, visited tracking, tags/permissions, set algebra.
// Q: Set vs array?   A: Set has O(1) has/add/delete and no duplicates but no
//    indexes; arrays keep order by position and allow duplicates.
// Q: Map vs object?   A: Map accepts any key type, keeps insertion order, has
//    .size and no prototype pitfalls; objects are simpler for static keys and
//    JSON serialisation.
// Q: How do you count items?   A: A Map with (map.get(key) ?? 0) + 1, or
//    reduce into an object for JSON output.
// Q: What is a WeakMap for?   A: Per-object data that should disappear with the
//    object (caches, private state) - keys are held weakly so no memory leaks.
// Q: How do you convert between them?   A: [...set], [...map], Object.fromEntries(map),
//    new Map(Object.entries(obj)), new Set(array).

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Deduplicate [{id:1},{id:2},{id:1}] by id, keeping the first occurrence.
// 2. Count the characters of "banana" with a Map and print them sorted by count.
// 3. Check whether two arrays share any value using a Set.

// ------------------------------ ANSWERS ------------------------------------
const uniqueById = (items) => {                                    // 1
  const byId = new Map();
  for (const item of items) if (!byId.has(item.id)) byId.set(item.id, item);
  return [...byId.values()];
};
console.log("\npractice 1 ->", JSON.stringify(uniqueById([{ id: 1 }, { id: 2 }, { id: 1 }])));
// -> [{"id":1},{"id":2}]

const characterCounts = new Map();                                 // 2
for (const character of "banana") {
  characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
}
const sorted = [...characterCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
console.log("practice 2 ->", sorted.map(([character, count]) => `${character}:${count}`).join(", "));
// -> a:3, n:2, b:1

const sharesAny = (a, b) => {                                      // 3
  const setA = new Set(a);
  return b.some((value) => setA.has(value));
};
console.log("practice 3 ->", sharesAny([1, 2, 3], [5, 3, 9]), "|", sharesAny([1, 2], [3, 4]));
// -> true | false

console.log("\n✓ STEP 27 complete — next: node 28_testing_and_debugging.js  (Phase 8)");



