/**
 * ============================================================================
 * STEP 17 / 28  ·  ASYNC / AWAIT            Phase 4 · Asynchronous JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. `async` functions always return a promise
 *   2. `await` unwraps a promise, and turns a rejection into a throw
 *   3. try/catch/finally for async errors, and "return" vs "return await"
 *   4. Sequential vs parallel awaits - the most common performance mistake
 *   5. Loops with await, and how to fix "await inside forEach"
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value".
 *   ASYNC CAUTION: the callbacks fire after all synchronous lines, so read
 *   section 3 for the real printing order.
 *
 * RUN IT      node 17_async_await.js
 * PREV STEP   <-  16_promises.js
 * NEXT STEP   ->  18_event_loop_and_call_stack.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// ASYNC/AWAIT is syntax over promises, not a replacement for them.
//
//   async function f() {}     -> always returns a promise: a returned value
//                                fulfils it, a thrown error rejects it.
//   const value = await p     -> pauses THIS function (the rest of the program
//                                keeps running) until p settles: gives the value,
//                                or THROWS the reason so try/catch can handle it.
//
// IMPORTANT
//   `await` works only inside an async function (or at the top level of an ES
//   module). It never freezes the whole program - just this function.
//
// SEQUENTIAL vs PARALLEL - the classic performance bug
//   await a(); await b();            -> about time(a) + time(b)     (sequential)
//   await Promise.all([a(), b()]);   -> about max(time(a), time(b)) (parallel)
//   Do it sequentially only when b really needs a's result.
//
// LOOSE ENDS
//   forEach(async () => {}) does NOT wait. Use for..of (sequential) or
//   Promise.all(items.map(async (item) => ...)) (parallel).
//   Never leave a promise floating (no await, no catch) - modern Node exits.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 17 · ASYNC / AWAIT  (Phase 4 · Asynchronous JavaScript)");
console.log("=".repeat(62));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchUser = async (id) => {
  await wait(10);
  if (id <= 0) throw new Error(`invalid id: ${id}`);
  return { id, name: id === 1 ? "Ada" : "Bob" };
};

console.log("\n--- 1. an async function returns a promise ---");
const pending = fetchUser(1);                   // NOT the user object - a promise
console.log("returned ->", pending);            // -> Promise { <pending> }
pending.then((user) => console.log("then ->", user.name));      // async: then -> Ada

console.log("\n--- 2. await unwraps the value ---");
async function describeUser(id) {
  const user = await fetchUser(id);             // waits here, then gives the object
  return `user ${user.id} is ${user.name}`;
}
describeUser(2).then((text) => console.log("describe ->", text)); // -> user 2 is Bob

console.log("\n--- 3. try/catch/finally around await ---");
async function safeUser(id) {
  try {
    const user = await fetchUser(id);
    return `ok: ${user.name}`;
  } catch (error) {
    return `failed: ${error.message}`;
  } finally {
    // cleanup belongs here: stop a spinner, close a connection
  }
}
Promise.all([safeUser(1), safeUser(-5)]).then((results) =>
  console.log("safe ->", results.join(" | ")));      // -> ok: Ada | failed: invalid id: -5

console.log("\n--- 4. sequential vs parallel awaits ---");
async function sequentialLoads() {
  const startedAt = Date.now();
  await wait(30);
  await wait(30);                                    // the second call waits for the first
  return Date.now() - startedAt;                      // ~60 ms
}
async function parallelLoads() {
  const startedAt = Date.now();
  await Promise.all([wait(30), wait(30)]);            // both start together
  return Date.now() - startedAt;                      // ~30 ms
}
Promise.all([sequentialLoads(), parallelLoads()]).then(([sequentialMs, parallelMs]) =>
  console.log("timing -> parallel is faster:", parallelMs < sequentialMs, "|",
              sequentialMs, "ms vs", parallelMs, "ms"));

console.log("\n--- 5. loops: await inside vs map + Promise.all ---");
async function loadNamesOneByOne(ids) {
  const names = [];
  for (const id of ids) names.push((await fetchUser(id)).name);      // sequential
  return names.join(",");
}
async function loadNamesTogether(ids) {
  const users = await Promise.all(ids.map((id) => fetchUser(id)));   // parallel
  return users.map((user) => user.name).join(",");
}
Promise.all([loadNamesOneByOne([1, 2]), loadNamesTogether([1, 2])]).then(([oneByOne, together]) =>
  console.log("names -> one by one:", oneByOne, "| together:", together));

console.log("\n--- 6. return promise vs return await inside try/catch ---");
const settle = (promise) => promise.then((value) => value, (error) => `rejected: ${error.message}`);
async function withoutAwait() {
  try {
    return fetchUser(-1);         // hands out the raw promise: catch never runs here
  } catch (error) {
    return `caught: ${error.message}`;
  }
}
async function withAwait() {
  try {
    return await fetchUser(-1);   // await first, so the rejection is catchable here
  } catch (error) {
    return `caught: ${error.message}`;
  }
}
Promise.all([settle(withoutAwait()), settle(withAwait())]).then(([plain, awaited]) =>
  console.log("plain ->", plain, "| awaited ->", awaited));

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// The synchronous lines print in order; everything below runs as promise
// callbacks AFTER them (the internal order inside this group can vary slightly).
//
// STEP 17 · ASYNC / AWAIT  (Phase 4 · Asynchronous JavaScript)
// ==============================================================
//
// --- 1. an async function returns a promise ---
// returned -> Promise { <pending> }
//
// --- 2. await unwraps the value ---
//
// --- 3. try/catch/finally around await ---
//
// --- 4. sequential vs parallel awaits ---
//
// --- 5. loops: await inside vs map + Promise.all ---
//
// --- 6. return promise vs return await inside try/catch ---
// practice 3 -> forEach ignores the promises it starts:
//               the loop finishes before any await resumes, so nothing waits.
//
// ✓ STEP 17 complete — next: node 18_event_loop_and_call_stack.js
//
// ---- async group (order inside the group can vary) ----------------------------
// then -> Ada
// describe -> user 2 is Bob
// safe -> ok: Ada | failed: invalid id: -5
// timing -> parallel is faster: true | 6x ms vs 3x ms        (values vary)
// names -> one by one: Ada,Bob | together: Ada,Bob
// plain -> rejected: invalid id: -1 | awaited -> caught: invalid id: -1
// practice 1 -> 42
// practice 2 -> Ada, unavailable
// practice 3 -> Ada,Bob

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Forgetting await: you get a Promise object instead of the value ("[object Promise]"
//   in template strings) - the classic missing-await bug.
// Using await inside forEach (it does not wait) - use for..of or map + Promise.all.
// Awaiting independent calls one after another (slow) instead of Promise.all.
// Making a function async when it has nothing to await - it just wraps the value.
// `return promise` inside try/catch: the rejection escapes the catch (use return await).
// Leaving a promise floating (no await, no catch) -> unhandledRejection crash.
// try/catch around a function call that returns a promise you never await.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Is async/await faster than promises?   A: No - it is the same mechanism with
//    cleaner syntax and easier error handling (try/catch).
// Q: What does an async function return?   A: Always a promise: fulfilled with the
//    returned value, rejected when it throws.
// Q: When is sequential awaiting correct?   A: When each step needs the previous
//    result (paginated APIs, dependent writes) or when you must limit concurrency.
// Q: How do you run promises in parallel?   A: Promise.all(items.map(...)) or
//    Promise.allSettled when partial failures are acceptable.
// Q: How do errors propagate?   A: A rejection surfaces as a throw at the await
//    point, so normal try/catch/finally works - including in the caller's chain.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Rewrite this chain with async/await:  Promise.resolve(21).then((n) => n * 2)
// 2. Load users 1 and -1 in parallel and return "Ada, unavailable" for failures.
// 3. Explain the bug:  ids.forEach(async (id) => { await save(id); });

// ------------------------------ ANSWERS ------------------------------------
const doubleAsync = async (number) => {                        // 1
  const value = await Promise.resolve(number);
  return value * 2;
};
doubleAsync(21).then((value) => console.log("\npractice 1 ->", value));   // -> 42

const loadNames = async (ids) => {                             // 2
  const results = await Promise.allSettled(ids.map((id) => fetchUser(id)));
  return results.map((result) =>
    result.status === "fulfilled" ? result.value.name : "unavailable");
};
loadNames([1, -1]).then((names) => console.log("practice 2 ->", names.join(", ")));
// -> Ada, unavailable

const saveAll = async (ids) => {                               // 3 (fixed version)
  for (const id of ids) {
    await fetchUser(id);                                       // for..of waits properly
  }
};
saveAll([1, 2]).then(() => console.log("practice 3 -> Ada,Bob"));
console.log("practice 3 -> forEach ignores the promises it starts:");
console.log("              the loop finishes before any await resumes, so nothing waits.\n");

console.log("✓ STEP 17 complete — next: node 18_event_loop_and_call_stack.js");

