/**
 * ============================================================================
 * STEP 16 / 28  ·  PROMISES                Phase 4 · Asynchronous JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. The three promise states: pending, fulfilled, rejected
 *   2. then / catch / finally, and how values flow down a chain
 *   3. Creating promises (executor, resolve, reject) and converting callbacks
 *   4. Running things together: Promise.all, allSettled, race, any
 *   5. Error propagation: where the rejection stops, and how to recover
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value".
 *   ASYNC CAUTION: .then() bodies run as microtasks, after the synchronous code,
 *   so those lines appear near the end of the run (see section 3 for the order).
 *
 * RUN IT      node 16_promises.js
 * PREV STEP   <-  15_callbacks.js         NEXT STEP  ->  17_async_await.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// A PROMISE is a placeholder for a future value. It starts as PENDING and then
// becomes either FULFILLED (with a value) or REJECTED (with a reason). Once
// settled it NEVER changes again - that is what makes it safe to pass around.
//
//   promise.then(onFulfilled)     -> returns a NEW promise with the callback result
//   promise.catch(onRejected)     -> handles rejections (and thrown errors)
//   promise.finally(fn)           -> always runs, does not change the value
//
// CHAINING: return a value -> the next then gets it. Return a promise -> the next
//   then waits for it (this is how you avoid nesting).
//
// COMBINATORS
//   Promise.all([...])       -> all values, or rejects on the FIRST failure (fail fast)
//   Promise.allSettled([...])-> always fulfils with {status, value|reason} list
//   Promise.race([...])      -> first SETTLED promise (value or rejection)
//   Promise.any([...])       -> first FULFILLED promise; rejects only if all fail
//
// ADVICE: always return or await promises, and always handle rejections
//   (unhandled rejections crash modern Node).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 16 · PROMISES  (Phase 4 · Asynchronous JavaScript)");
console.log("=".repeat(62));

// A tiny fake API so the file needs no network.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchPrice = async (item, ms = 10) => {
  await wait(ms);
  if (item === "unknown") throw new Error(`no price for ${item}`);
  return { item, price: item === "pen" ? 2 : 5 };
};

console.log("\n--- 1. creating a promise and then/both outcomes ---");
const immediate = new Promise((resolve) => resolve("resolved value"));
console.log("state before microtask ->", immediate);   // -> Promise { 'resolved value' }
immediate.then((value) => console.log("then ->", value));       // async: prints later
Promise.reject(new Error("boom")).catch((error) => console.log("catch ->", error.message));

console.log("\n--- 2. chaining: values flow down the chain ---");
fetchPrice("pen")
  .then((result) => result.price * 100)          // arrow returns a number
  .then((cents) => `price in cents: ${cents}`)   // gets the previous return value
  .then((text) => console.log("chain ->", text)) // async: price in cents: 200
  .catch((error) => console.log("chain error ->", error.message))
  .finally(() => console.log("finally -> chain finished"));

console.log("\n--- 3. error handling: recover, or let it propagate ---");
fetchPrice("unknown")
  .then(() => console.log("never runs"))                        // skipped: rejected already
  .catch((error) => `recovered from: ${error.message}`)         // returning = recovery
  .then((text) => console.log("recovered ->", text));           // -> recovered from: no price for unknown

fetchPrice("pen")
  .then(() => { throw new Error("failed inside then"); })       // a throw rejects the chain
  .catch((error) => console.log("thrown ->", error.message));   // -> failed inside then

console.log("\n--- 4. combinators: all, allSettled, race, any ---");
Promise.all([fetchPrice("pen", 5), fetchPrice("book", 15)])
  .then((results) => console.log("all ->", results.map((r) => `${r.item}:${r.price}`).join(", ")));
// -> all -> pen:2, book:5

Promise.all([fetchPrice("pen", 5), fetchPrice("unknown", 5)])
  .catch((error) => console.log("all fails fast ->", error.message));
// -> all fails fast -> no price for unknown

Promise.allSettled([fetchPrice("pen", 5), fetchPrice("unknown", 5)])
  .then((results) => console.log("allSettled ->", results.map((r) => r.status).join(", ")));
// -> allSettled -> fulfilled, rejected

Promise.race([fetchPrice("book", 5), fetchPrice("pen", 50)])
  .then((winner) => console.log("race ->", winner.item));      // -> race -> book (first to settle)

Promise.any([fetchPrice("unknown", 5), fetchPrice("pen", 15)])
  .then((first) => console.log("any ->", first.item));         // -> any -> pen (first to fulfil)

console.log("\n--- 5. sequential vs parallel timing ---");
const measure = (work) => { const startedAt = Date.now(); return work().then(() => Date.now() - startedAt); };
Promise.all([
  measure(() => wait(30).then(() => wait(30))),                // sequential: 30 + 30 ms
  measure(() => Promise.all([wait(30), wait(30)])),            // parallel:   max(30, 30) ms
]).then(([sequential, parallel]) =>
  console.log("timing -> sequential is slower:", sequential > parallel, "|", sequential, "ms vs", parallel, "ms"));
// -> timing -> sequential is slower: true | ~70 ms vs ~40 ms   (exact numbers vary)

console.log("\n--- 6. an unhandled rejection is a bug, not silence ---");
process.once("unhandledRejection", (reason) => console.log("unhandled ->", reason.message));
Promise.reject(new Error("forgotten handling"));               // never .catch()ed

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// The synchronous part prints first, then the microtasks/timer callbacks appear
// in a group at the end. Exact millisecond values and the order inside the async
// tail vary slightly between runs.
//
// STEP 16 · PROMISES  (Phase 4 · Asynchronous JavaScript)
// ==============================================================
//
// --- 1. creating a promise and then/both outcomes ---
// state before microtask -> Promise { 'resolved value' }
//
// --- 2. chaining: values flow down the chain ---
//
// --- 3. error handling: recover, or let it propagate ---
//
// --- 4. combinators: all, allSettled, race, any ---
//
// --- 5. sequential vs parallel timing ---
//
// --- 6. an unhandled rejection is a bug, not silence ---
// practice 3 -> then(v => { v * 2 }) returns undefined, so the next then
//               receives undefined. Use return or the implicit arrow return.
//
// ✓ STEP 16 complete — next: node 17_async_await.js
//
// ---- async group (prints after the synchronous output; internal order varies) ---
// then -> resolved value                    | catch -> boom
// chain -> price in cents: 200              | finally -> chain finished
// recovered -> recovered from: no price for unknown
// thrown -> failed inside then
// all -> pen:2, book:5                      | all fails fast -> no price for unknown
// allSettled -> fulfilled, rejected         | race -> book        | any -> pen
// timing -> sequential is slower: true | 6x ms vs 3x ms            (values vary)
// unhandled -> forgotten handling
// practice 1 -> succeeded on attempt 3      | practice 2 -> pen | failed:no price for unknown

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Forgetting to RETURN inside then - the next then receives undefined.
// Wrapping an existing promise in new Promise(...) for no reason (the manual
//   promise anti-pattern) instead of returning/awaiting it.
// Creating a promise and never handling the rejection -> unhandledRejection crash.
// Using Promise.all when one failure should not cancel the rest (use allSettled).
// Expecting Promise.all to run things faster - it starts them together but still
//   waits for all of them.
// Using await inside forEach (it does not wait) - use for..of or Promise.all+map.
// Assuming catch() catches errors thrown in a DIFFERENT chain you forgot to return.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What are the promise states?   A: pending, fulfilled, rejected - and once
//    settled the state never changes.
// Q: then vs catch vs finally?   A: then handles fulfilment (and returned values),
//    catch handles rejection, finally always runs and passes the value through.
// Q: Promise.all vs allSettled vs race vs any?   A: all = fail fast, all values;
//    allSettled = never rejects, gives statuses; race = first settled;
//    any = first fulfilled (rejects only when all fail).
// Q: Why are promise callbacks microtasks?   A: They must run before timers so
//    that chains complete consistently; the microtask queue drains after each
//    task, before the next macrotask.
// Q: How do you convert a callback API to a promise?   A: Wrap it:
//    new Promise((resolve, reject) => fn(args, (err, data) => err ? reject(err) : resolve(data))).

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write retry(fn, attempts) that retries a rejected promise and resolves with
//    the first success.
// 2. Fetch three items and report partial failures with Promise.allSettled.
// 3. Explain why `.then((v) => { v * 2 })` loses the value.

// ------------------------------ ANSWERS ------------------------------------
const retry = async (fn, attempts = 3) => {                        // 1
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

let attemptsMade = 0;
retry(() => {
  attemptsMade += 1;
  if (attemptsMade < 3) return Promise.reject(new Error(`attempt ${attemptsMade} failed`));
  return Promise.resolve(`succeeded on attempt ${attemptsMade}`);
}).then((message) => console.log("\npractice 1 ->", message));

const settle = (promise) => promise.then(                          // 2
  (value) => ({ ok: true, value }),
  (error) => ({ ok: false, reason: error.message }),
);
Promise.all([settle(fetchPrice("pen")), settle(fetchPrice("unknown"))]).then((results) => {
  console.log("practice 2 ->", results
    .map((result) => (result.ok ? result.value.item : `failed:${result.reason}`))
    .join(" | "));
});

console.log("practice 3 -> then(v => { v * 2 }) returns undefined, so the next then");  // 3
console.log("              receives undefined. Use return or the implicit arrow return.\n");

console.log("✓ STEP 16 complete — next: node 17_async_await.js");


