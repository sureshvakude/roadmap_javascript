/**
 * ============================================================================
 * STEP 18 / 28 · EVENT LOOP & CALL STACK   Phase 4 · Asynchronous JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. The call stack, and what "single threaded" really means
 *   2. The task (macrotask) queue vs the microtask queue
 *   3. Why setTimeout(fn, 0) is never immediate, and why promises come first
 *   4. Blocking the event loop: what it looks like and how to avoid it
 *   5. Starvation: when microtasks keep the loop from ever reaching tasks
 *
 * HOW TO READ THIS FILE
 *   This lesson is mostly about ORDER, so the prints are numbered and the
 *   expected order is written at the end of each block and in section 3.
 *
 * RUN IT      node 18_event_loop_and_call_stack.js
 * PREV STEP   <-  17_async_await.js
 * NEXT STEP   ->  19_try_catch_finally.js   (Phase 5)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// JavaScript runs your code on ONE thread with ONE call stack:
//   call a function -> its frame is pushed; it returns -> popped.
// Slow work cannot run "in the background" inside the stack - instead the
// runtime (browser or Node) offers async APIs: timers, I/O, network, events.
//
// WHERE ASYNC WORK GOES
//   Web/Node APIs  : setTimeout, fs, network, events  -> they schedule completions
//   Microtask queue: promise .then/.catch/finally, await continuations,
//                    queueMicrotask, MutationObserver   -> HIGH priority
//   Task queue     : setTimeout/setInterval callbacks, DOM events, I/O callbacks
//                                                        -> normal priority
//
// THE LOOP (simplified)
//   1. run all synchronous code (until the stack is empty)
//   2. run EVERY microtask, including new microtasks they create
//   3. take ONE task from the task queue and run it
//   4. drain the microtasks again, then the next task, and so on
//
// CONSEQUENCES TO REMEMBER
//   setTimeout(fn, 0) waits for: sync code + all microtasks, and at least ~1 ms.
//   A long synchronous block freezes everything - timers, clicks, rendering.
//   An endless microtask chain starves the task queue (the page "hangs").

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 18 · EVENT LOOP & CALL STACK  (Phase 4)");
console.log("=".repeat(62));

console.log("\n--- 1. the classic order puzzle ---");
console.log("1 sync start");
setTimeout(() => console.log("5 setTimeout 0 ms (task queue)"), 0);
Promise.resolve().then(() => console.log("4 promise then (microtask)"));
queueMicrotask(() => console.log("4b queueMicrotask (also microtask)"));
console.log("2 sync middle");
for (let i = 0; i < 1000; i += 1) { /* 3 sync work blocks the loop */ }
console.log("3 sync end");

console.log("\n--- 2. microtasks always finish before the next task ---");
setTimeout(() => console.log("task  -> timer (last)"), 0);
Promise.resolve()
  .then(() => console.log("micro -> then 1"))
  .then(() => console.log("micro -> then 2 (chained)"))
  .then(() => console.log("micro -> then 3 (chained)"));

console.log("\n--- 3. await suspends the function, not the program ---");
async function demo() {
  console.log("   a inside the async function, before the first await");
  await null;                                  // even a plain value yields to the loop
  console.log("   d after await (this is a microtask)");
}
demo();
console.log("   b synchronous line after calling demo()");
Promise.resolve().then(() => console.log("   c microtask queued after the await"));

console.log("\n--- 4. blocking the event loop ---");
setTimeout(() => console.log("timer -> delayed because the loop was blocked"), 0);
const blockUntil = Date.now() + 60;
while (Date.now() < blockUntil) { /* busy wait: no callbacks can run */ }
console.log("sync  -> finished blocking after ~60 ms");

console.log("\n--- 5. starvation: microtasks that keep queueing more microtasks ---");
setTimeout(() => console.log("timer -> waited for the microtask chain to end"), 0);
let turns = 0;
const keepQueueing = () => {
  turns += 1;
  if (turns <= 3) Promise.resolve().then(keepQueueing);   // each turn adds another one
  else console.log("micro -> chain finished after", turns, "turns");
};
keepQueueing();

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// SYNCHRONOUS PART (in exact order):
// 1 sync start
// 2 sync middle
// 3 sync end
//    a inside the async function, before the first await
//    b synchronous line after calling demo()
// sync  -> finished blocking after ~60 ms
// practice 1 -> order is 1, 4, 3, 2
//               sync first, then microtasks, then tasks
// practice 3 -> the second setTimeout is a TASK, while the .then()
//               it creates is a MICROTASK, and microtasks drain first.
// ✓ STEP 18 complete — next: node 19_try_catch_finally.js  (Phase 5)
//
// ASYNC PART (observed full order - run the file to see it on your machine):
// 4 promise then (microtask)
// 4b queueMicrotask (also microtask)
// micro -> then 1
//    d after await (this is a microtask)
//    c microtask queued after the await
// micro -> then 2 (chained)
// micro -> then 3 (chained)
// micro -> chain finished after 4 turns      <- microtasks drain completely first
// 5 setTimeout 0 ms (task queue)             <- only now do tasks start
// task  -> timer (last)
// timer -> delayed because the loop was blocked
// timer -> waited for the microtask chain to end
// practice 2 -> 2,4,6,8,10,12
//
// Read that list twice: sync -> ALL microtasks -> one task at a time.

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Believing setTimeout(fn, 0) runs "right away" - it runs after sync code and
//   after every microtask, never before.
// Assuming promise callbacks and timer callbacks keep one mixed order.
// Long synchronous loops freezing the UI / blocking I/O - chunk it or use workers.
// Queueing microtasks recursively (each promise queues another) -> starvation:
//   timers and rendering never get a turn.
// Using sleep loops to "wait" instead of async primitives.
// Guessing the order of async code instead of logging it.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is the event loop?   A: The mechanism that keeps a single-threaded
//    runtime busy: run sync code, drain microtasks, take one task, repeat.
// Q: Microtasks vs macrotasks?   A: Microtasks (promise callbacks, await
//    continuations, queueMicrotask) always run to completion BEFORE the next
//    macrotask (timers, I/O callbacks, events).
// Q: Why is setTimeout(fn, 0) not immediate?   A: It joins the task queue; sync
//    code and every microtask must finish first (plus the ~1 ms clamp).
// Q: What is starvation?   A: Endless microtasks (or tasks that schedule tasks)
//    preventing other queues from ever being processed.
// Q: How do you avoid blocking the main thread?   A: Chunk work with awaits/
//    timers, move CPU-heavy jobs to Web Workers / worker_threads, or stream data.
// Q: Where does async I/O happen?   A: Outside the JS thread - libuv's thread pool
//    in Node, browser internals; JS only handles the callbacks.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Predict the order of:
//      console.log(1); setTimeout(() => console.log(2));
//      Promise.resolve().then(() => console.log(3)); console.log(4);
// 2. Process 6 items "in chunks" so the event loop can breathe between chunks.
// 3. Why does a .then() created inside a setTimeout callback run before another
//    setTimeout scheduled afterwards?

// ------------------------------ ANSWERS ------------------------------------
console.log("\npractice 1 -> order is 1, 4, 3, 2");                          // 1
console.log("              sync first, then microtasks, then tasks");

const processInChunks = (items, chunkSize) => new Promise((resolve) => {   // 2
  const queue = [...items];
  const results = [];
  const runChunk = () => {
    for (const item of queue.splice(0, chunkSize)) results.push(item * 2);
    if (queue.length) setTimeout(runChunk, 0);     // yield to the loop between chunks
    else resolve(results);
  };
  runChunk();
});
processInChunks([1, 2, 3, 4, 5, 6], 2).then((results) =>
  console.log("practice 2 ->", results.join(",")));   // -> 2,4,6,8,10,12

console.log("practice 3 -> the second setTimeout is a TASK, while the .then()");   // 3
console.log("              it creates is a MICROTASK, and microtasks drain first.\n");

console.log("✓ STEP 18 complete — next: node 19_try_catch_finally.js  (Phase 5)");


