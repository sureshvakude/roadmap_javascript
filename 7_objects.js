/**
 * ============================================================================
 * STEP 07 / 28  ·  OBJECTS                        Phase 2 · Working with Data
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Create, read, update and delete properties
 *   2. Dot vs bracket access, computed keys, shorthand properties
 *   3. Iterating with Object.keys / values / entries
 *   4. Shallow copy vs deep copy (spread, structuredClone, JSON round trip)
 *   5. Optional chaining and JSON - the bridge to APIs and localStorage
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value".
 *   The full run output is collected in section 3 so you can verify your run.
 *
 * RUN IT      node 7_objects.js
 * PREV STEP   <-  6_arrays.js          NEXT STEP  ->  8_scope.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// An object is a collection of key -> value pairs. Keys are strings or symbols;
// values can be anything, including functions (then they are called methods).
//
//   Access  : obj.key (fixed name)  |  obj["key"] (dynamic / computed name)
//   Iterate : Object.keys(o) | Object.values(o) | Object.entries(o)
//   Copy    : { ...o } / Object.assign() are SHALLOW -> nested values are shared
//             structuredClone(o) is a true DEEP copy (Node 17+ / modern browsers)
//             JSON round trip copies plain data only (Dates become strings)
//   Remove  : delete obj.key
//
// JSON (JSON.stringify / JSON.parse) is how objects travel to APIs and
// localStorage. Objects are references: "const b = a" copies NOTHING.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 07 · OBJECTS  (Phase 2 · Working with Data)");
console.log("=".repeat(62));

console.log("\n--- 1. create, read, update, delete ---");
const car = {
  brand: "Toyota",
  year: 2021,
  start() { return `${this.brand} started`; },  // method (see step 24)
};
console.log(car.brand, car["year"], car.start()); // -> Toyota 2021 Toyota started
car.year = 2022;            // update
car.color = "red";          // add
delete car.color;           // remove
console.log(JSON.stringify(car));                 // -> {"brand":"Toyota","year":2022}

console.log("\n--- 2. computed keys and shorthand properties ---");
const nickname = "Ada";
const key = "level";
const player = { nickname, [key]: 7, [`${key}Label`]: "seven" };
console.log(JSON.stringify(player)); // -> {"nickname":"Ada","level":7,"levelLabel":"seven"}

console.log("\n--- 3. iterating ---");
const scores = { ada: 10, bob: 20 };
console.log(Object.keys(scores), Object.values(scores)); // -> [ 'ada', 'bob' ] [ 10, 20 ]
console.log(Object.entries(scores).map(([who, score]) => `${who}=${score}`).join(" "));
// -> ada=10 bob=20
for (const [who, score] of Object.entries(scores)) {
  if (score >= 20) console.log("top scorer:", who);      // -> top scorer: bob
}
console.log("property count ->", Object.keys(scores).length); // -> property count -> 2

console.log("\n--- 4. shallow vs deep copy ---");
const profile = { user: { name: "Ada" }, tags: ["js"] };
const shallow = { ...profile };
shallow.user.name = "Bob";                    // the nested object is SHARED
console.log("shallow ->", profile.user.name); // -> shallow -> Bob    (surprise!)
const deep = structuredClone(profile);        // truly independent copy
deep.user.name = "Cy";
console.log("deep    ->", profile.user.name, "|", deep.user.name); // -> deep    -> Bob | Cy

console.log("\n--- 5. optional chaining, defaults and JSON ---");
const api = { data: { items: [] } };
console.log(api.data?.items?.length ?? 0, api.meta?.page ?? 1);  // -> 0 1
console.log("data" in api, Object.hasOwn(api, "data"));          // -> true true

const order = { id: 1, items: ["pen"], placedAt: new Date("2024-01-01") };
const text = JSON.stringify(order);
console.log(text); // -> {"id":1,"items":["pen"],"placedAt":"2024-01-01T00:00:00.000Z"}
const parsed = JSON.parse(text);
console.log(parsed.items[0], typeof parsed.placedAt, parsed.placedAt instanceof Date);
// -> pen string false     (a Date became a string - convert it back yourself)

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- Toyota 2021 Toyota started        {"brand":"Toyota","year":2022}
// --- 2 --- {"nickname":"Ada","level":7,"levelLabel":"seven"}
// --- 3 --- [ 'ada', 'bob' ] [ 10, 20 ]       ada=10 bob=20       top scorer: bob
//           property count -> 2
// --- 4 --- shallow -> Bob                    deep    -> Bob | Cy
// --- 5 --- 0 1                               true true
//           {"id":1,"items":["pen"],"placedAt":"2024-01-01T00:00:00.000Z"}
//           pen string false

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Thinking const makes an object immutable - it does not (Object.freeze does, shallowly).
// "const b = a" then editing b, which also changes a (same reference).
// Believing { ...obj } is a deep copy - nested objects stay shared.
// Reading obj.a.b when a may be undefined -> use obj.a?.b with a ?? default.
// Sending Dates/functions/Map through JSON - they are converted or dropped.
// JSON.parse on untrusted input without try/catch (it throws on invalid JSON).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Dot vs bracket access?   A: brackets for dynamic/computed keys and keys with
//    spaces; dot for fixed keys you can type.
// Q: How do you check whether a property exists?   A: "key" in obj (walks the
//    prototype chain) or Object.hasOwn(obj, "key") for own properties only.
// Q: Shallow vs deep copy?   A: shallow shares nested references, deep clones
//    everything (structuredClone; the JSON round trip only for plain data).
// Q: Why does JSON.stringify drop functions?   A: JSON has no function type -
//    functions, undefined and symbols are omitted from the output.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Count word frequency in "a b a c b a"  ->  { a: 3, b: 2, c: 1 }
// 2. Merge defaults { retries: 3, verbose: false } with { retries: 0 }. Which wins?
// 3. Sort { ada: 10, bob: 20 } entries by score, highest first.

// ------------------------------ ANSWERS ------------------------------------
const wordCount = "a b a c b a".split(" ").reduce((acc, word) => {   // 1
  acc[word] = (acc[word] ?? 0) + 1;
  return acc;
}, {});
console.log("\npractice 1 ->", JSON.stringify(wordCount));          // -> {"a":3,"b":2,"c":1}

const defaults = { retries: 3, verbose: false };                   // 2
const provided = { retries: 0 };
console.log("practice 2 ->", JSON.stringify({ ...defaults, ...provided }));
// -> {"retries":0,"verbose":false}    (the later spread always wins)

console.log("practice 3 ->", JSON.stringify(                        // 3
  Object.entries({ ada: 10, bob: 20 }).sort(([, a], [, b]) => b - a)
));  // -> [["bob",20],["ada",10]]

console.log("\n✓ STEP 07 complete — next: node 8_scope.js");

