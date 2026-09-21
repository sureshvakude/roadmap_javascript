/**
 * ============================================================================
 * STEP 26 / 28 · CURRYING & PARTIAL APPLICATION  Phase 7 · Advanced Patterns
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Currying: f(a, b, c) -> f(a)(b)(c), one argument at a time
 *   2. Partial application: fix some arguments now, get a function for the rest
 *   3. The generic curry helper, and arity (fn.length)
 *   4. Why functional code curries: reuse, configuration, composition, point-free
 *   5. bind() as partial application, and when NOT to curry
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 5 so you can verify your run.
 *
 * RUN IT      node 26_currying.js
 * PREV STEP   <-  25_debounce.js
 * NEXT STEP   ->  27_set_map.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// Currying (named after Haskell Curry) converts a function of N arguments into a
// chain of N single-argument functions:  add(1, 2)  ->  add(1)(2).
// Each call returns a new function that has "remembered" the previous arguments
// - closures again (step 10).
//
// PARTIAL APPLICATION is the more general idea: fix SOME arguments, pass the rest
// later. It does not have to be one at a time:
//   const addTen = add(10);        // curried
//   const log = logWithLevel("info") // partial application
//   const greetBob = greet.bind(null, "Bob");   // bind() = partial application
//
// WHY PEOPLE DO IT
//   Reuse without repeating configuration: a factory of functions.
//   Composition: pipe(trim, toLower, slug) works best with unary functions.
//   Readability at the call site; the data becomes the LAST argument (fp style).
//   Point-free style: define functions without naming their arguments.
//
// WHEN NOT TO CURRY
//   When plain default parameters read better: function request(url, { timeout = 1000 } = {})
//   When it hides the API (curried functions are harder to read in debuggers).
//   When the caller needs all arguments anyway - just pass them.
//
// fn.length gives the number of parameters BEFORE the first default/rest one -
// that is how generic curry helpers know when to stop collecting.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 26 · CURRYING & PARTIAL APPLICATION  (Phase 7 · Advanced Patterns)");
console.log("=".repeat(62));

console.log("\n--- 1. currying by hand ---");
const add = (a) => (b) => a + b;                 // add(1)(2)
const addTen = add(10);                          // 10 is remembered (partial application)
console.log("add(1)(2) ->", add(1)(2));          // -> 3
console.log("addTen(5) ->", addTen(5));          // -> 15
console.log("addTen(100) ->", addTen(100));      // -> 110   (reusable with one argument)
const multiply = (a) => (b) => (c) => a * b * c; // three steps
console.log("multiply(2)(3)(4) ->", multiply(2)(3)(4));     // -> 24

console.log("\n--- 2. a generic curry helper ---");
function curry(fn) {
  const arity = fn.length;                     // declared parameters = when to stop
  return function collect(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => collect(...args, ...more);
  };
}
const volume = curry((length, width, height) => length * width * height);
console.log("all at once    ->", volume(2, 3, 4));       // -> 24
console.log("one by one     ->", volume(2)(3)(4));        // -> 24
console.log("two then one   ->", volume(2, 3)(4));        // -> 24
const shelf = volume(2, 3);                              // pre-configured function
console.log("pre-configured ->", shelf(10), shelf(20));   // -> 60 120

console.log("\n--- 3. bind() is partial application (and also sets this) ---");
function greet(greeting, punctuation, name) {
  return `${greeting}, ${name}${punctuation}`;
}
const hello = greet.bind(null, "Hello", "!");            // fix the first two arguments
console.log("bind ->", hello("Ada"), "|", hello("Bob")); // -> Hello, Ada! | Hello, Bob!

const logger = (scope) => (level) => (message) => `[${scope}] ${level}: ${message}`;
const dbLog = logger("db");
console.log("factory ->", dbLog("error")("connection lost")); // -> [db] error: connection lost
console.log("reuse   ->", dbLog("info")("connected"));        // -> [db] info: connected

console.log("\n--- 4. the practical win: reusable, composable functions ---");
const split = (separator) => (text) => text.split(separator);   // note: DATA LAST
const map = (fn) => (items) => items.map(fn);
const filter = (predicate) => (items) => items.filter(predicate);
const join = (glue) => (items) => items.join(glue);

const parseTags = split(",");
const cleanTags = map((tag) => tag.trim().toLowerCase());
const withoutEmpty = filter((tag) => tag.length > 0);
const formatTags = join(" | ");

// Manually nested (right-to-left reading):
const processTagsNested = (raw) => formatTags(withoutEmpty(cleanTags(parseTags(raw))));
console.log("nested pipeline ->", processTagsNested("  JS , ,React,  Node "));
// -> js | react | node

// The same pipeline with pipe() from step 13 (left-to-right reading):
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const processTags = pipe(parseTags, cleanTags, withoutEmpty, formatTags);
console.log("pipe pipeline   ->", processTags("  JS , ,React,  Node "));
// -> js | react | node

console.log("\n--- 5. validators and formatters as factories ---");
const isLongerThan = (min) => (text) => text.length >= min;
const matches = (pattern) => (text) => pattern.test(text);
const isEmail = matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const hasDigit = matches(/\d/);
const isStrongPassword = (value) => isLongerThan(8)(value) && hasDigit(value);

console.log("email ok ->", isEmail("ada@example.com"), "| bad ->", isEmail("nope"));
// -> email ok -> true | bad -> false
console.log("password ->", isStrongPassword("Sup3rSecret"), "| weak ->", isStrongPassword("short"));
// -> password -> true | weak -> false

const formatPrice = curry((currency, decimals, amount) => `${currency}${amount.toFixed(decimals)}`);
const formatUsd = formatPrice("$", 2);
const formatBtc = formatPrice("₿", 8);
console.log("formatters ->", formatUsd(12.5), "|", formatBtc(0.5));
// -> formatters -> $12.50 | ₿0.50000000

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. currying by hand ---
// add(1)(2) -> 3
// addTen(5) -> 15
// addTen(100) -> 110
// multiply(2)(3)(4) -> 24
//
// --- 2. a generic curry helper ---
// all at once    -> 24
// one by one     -> 24
// two then one   -> 24
// pre-configured -> 60 120
//
// --- 3. bind() is partial application ---
// bind -> Hello, Ada! | Hello, Bob!
// factory -> [db] error: connection lost
// reuse   -> [db] info: connected
//
// --- 4. composable functions ---
// nested pipeline -> js | react | node
// pipe pipeline   -> js | react | node
//
// --- 5. factories ---
// email ok -> true | bad -> false
// password -> true | weak -> false
// formatters -> $12.50 | ₿0.50000000

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Currying everything "because functional" - readability comes first.
// Forgetting that curry helpers rely on fn.length, which breaks with default or
//   rest parameters (length counts only the parameters before them).
// Confusing currying (always one argument) with partial application (any number).
// Passing the data FIRST (fp style expects configuration first, data last).
// Forgetting bind's first argument is `this` - pass null when you only want args.
// Creating the same curried function inside a render loop (new closure each time).
// Debugging nightmares: curried functions show as anonymous in stack traces - name them.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is currying?   A: Turning f(a, b, c) into f(a)(b)(c) - a chain of
//    unary functions, each remembering the previous arguments via closures.
// Q: Currying vs partial application?   A: partial application fixes some arguments
//    in one step; currying is the stricter "one argument per call" form.
// Q: Why is it useful?   A: Reusable, configurable helpers (loggers, API clients,
//    formatters), clean composition with pipe/compose, and point-free style.
// Q: How does bind() relate?   A: fn.bind(thisArg, ...presetArgs) is partial
//    application and also locks `this`.
// Q: What is fn.length?   A: The number of declared parameters before the first
//    default/rest/destructuring parameter - used to detect arity.
// Q: Any downsides?   A: Readability and debuggability; also a new function object
//    per curry step (minor, but avoid creating them in hot loops).

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write discount(percent)(price) and use it to build a memberDiscount(10).
// 2. Write prop(key)(object) and use it with map to extract all names.
// 3. Write a manually curried add3(a)(b)(c) and reuse it with one argument fixed.

// ------------------------------ ANSWERS ------------------------------------
const applyDiscount = (percent) => (price) => +(price * (1 - percent / 100)).toFixed(2);  // 1
const memberDiscount = applyDiscount(10);
console.log("\npractice 1 ->", memberDiscount(100), "|", applyDiscount(50)(80));   // -> 90 | 40

const prop = (key) => (object) => object[key];                                    // 2
const names = [{ name: "Ada" }, { name: "Bob" }].map(prop("name"));
console.log("practice 2 ->", names.join(","));                                    // -> Ada,Bob

const add3 = (a) => (b) => (c) => a + b + c;                                      // 3
const addFive = add3(2)(3);                                                       // partial application
console.log("practice 3 ->", addFive(10), "|", add3(1)(2)(3));                    // -> 15 | 6

console.log("\n✓ STEP 26 complete — next: node 27_set_map.js");



