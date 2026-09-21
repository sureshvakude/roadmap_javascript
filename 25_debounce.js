/**
 * ============================================================================
 * STEP 25 / 28  ·  DEBOUNCE & THROTTLE          Phase 7 · Advanced Patterns
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Debounce: "run only after the calls stop" (search boxes, autosave)
 *   2. Throttle: "run at most once per interval" (scroll, mousemove, resize)
 *   3. Leading/trailing edges, and preserving arguments + `this`
 *   4. cancel() and flush() - the parts people forget
 *   5. How to test timing code deterministically (inject the clock/timers)
 *
 * HOW TO READ THIS FILE
 *   The debounce demo uses real timers and prints call COUNTS (stable). The
 *   throttle demo injects a fake clock, so its output is fully deterministic.
 *   Expected output is in section 5.
 *
 * RUN IT      node 25_debounce.js
 * PREV STEP   <-  24_es6_features.js
 * NEXT STEP   ->  26_currying.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// Both patterns answer "this event fires hundreds of times - how do I react
// only sometimes?" They use exactly two tools: a timer and a closure (step 10).
//
// DEBOUNCE - wait for silence
//   Every call resets the timer. The function runs only after `delay` ms pass
//   without a new call. Perfect for: search-as-you-type, form validation,
//   autosave, resize/mouse events when you only care about the FINAL state.
//
// THROTTLE - at most one run per window
//   The first call runs (leading edge) or the last one does (trailing edge),
//   depending on the implementation, and further calls inside the interval are
//   ignored. Perfect for: scroll position, mousemove, drag, progress reporting,
//   rate-limited API calls.
//
// VARIATIONS YOU WILL MEET
//   debounce(fn, wait, { leading: true })  -> run immediately, then lock out
//   debounce(...).cancel()                 -> discard the pending call (unmount)
//   debounce(...).flush()                  -> run it right now (form submit)
//   throttle(fn, ms, { trailing: false })  -> leading edge only
//
// ALWAYS
//   * forward `this` and the arguments to the original function
//   * clear the timer when a component unmounts / listener is removed
//   * prefer requestAnimationFrame for visual updates (throttled to ~60 fps)
//   * keep the debounce delay short enough to feel responsive: 150-300 ms

// ---------------------------------------------------------------------------
// 2 · DEBOUNCE  (implementation + demos)
// ---------------------------------------------------------------------------
console.log("STEP 25 · DEBOUNCE & THROTTLE  (Phase 7 · Advanced Patterns)");
console.log("=".repeat(62));

function debounce(fn, waitMs = 200, { leading = false } = {}) {
  let timer = null;
  let pending = null;                    // { args, thisArg } of the latest call

  const run = () => {
    const saved = pending;
    timer = null;
    pending = null;
    if (saved) fn.apply(saved.thisArg, saved.args);   // preserve this + arguments
  };

  const debounced = function (...args) {
    const isFree = timer === null;
    if (timer !== null) clearTimeout(timer);          // every call resets the timer
    pending = { args, thisArg: this };
    timer = setTimeout(run, waitMs);
    if (leading && isFree) run();                     // optional leading edge
  };

  debounced.cancel = () => { clearTimeout(timer); timer = null; pending = null; };
  debounced.flush = () => { if (timer !== null) { clearTimeout(timer); run(); } };
  return debounced;
}

console.log("\n--- 1. debounce: a search box typing fast ---");
const searchCalls = [];
const onSearch = debounce((query) => searchCalls.push(query), 20);
for (const query of ["j", "ja", "jav", "java", "javas"]) onSearch(query);   // 5 keystrokes
console.log("immediately ->", searchCalls.length, "calls");        // -> immediately -> 0 calls
setTimeout(() => console.log("after the pause ->", searchCalls.length, "call:", searchCalls[0]), 60);
// -> after the pause -> 1 call: javas

console.log("\n--- 2. cancel() and flush() ---");
const saves = [];
const save = debounce((id) => saves.push(`saved ${id}`), 30);
save(1);
save(2);
save.flush();                                  // run the pending call NOW
console.log("after flush ->", JSON.stringify(saves));               // -> ["saved 2"]
save(3);
save.cancel();                                 // discard it (e.g. component unmounted)
console.log("immediately after cancel ->", JSON.stringify(saves));  // -> ["saved 2"]
setTimeout(() => console.log("later after cancel ->", JSON.stringify(saves)), 50);
// -> later after cancel -> ["saved 2"]

console.log("\n--- 3. `this` and the arguments survive ---");
const service = {
  name: "api",
  lastEndpoint: null,
  request: debounce(function (endpoint) {
    this.lastEndpoint = `${this.name}:${endpoint}`;
  }, 10),
};
service.request("/users");
setTimeout(() => console.log("this preserved ->", service.lastEndpoint), 40);
// -> this preserved -> api:/users

// ---------------------------------------------------------------------------
// 3 · THROTTLE  (testable version, injected clock)
// ---------------------------------------------------------------------------
console.log("\n--- 4. throttle with an injected clock (deterministic test) ---");
const createThrottle = (fn, intervalMs, now = Date.now) => {
  let lastRunAt = -Infinity;
  const throttled = (...args) => {
    const currentTime = now();
    if (currentTime - lastRunAt < intervalMs) return undefined;   // inside the window
    lastRunAt = currentTime;
    return fn(...args);
  };
  throttled.reset = () => { lastRunAt = -Infinity; };
  return throttled;
};

let fakeTime = 0;
const clock = () => fakeTime;
const visits = [];
const logVisit = createThrottle((page) => visits.push(page), 100, clock);
for (let i = 0; i < 5; i += 1) {           // "scroll" events every 30 ms
  logVisit(`page-${i}`);
  fakeTime += 30;
}
console.log("100 ms window, events every 30 ms ->", visits.join(","));
// -> page-0,page-4        (one run per window: at 0 ms and 120 ms)

console.log("\n--- 5. a trailing-edge throttle with real timers ---");
const createTrailingThrottle = (fn, intervalMs) => {
  let waiting = false;
  let lastArgs = null;
  return (...args) => {
    if (!waiting) {
      waiting = true;
      fn(...args);                          // leading run
      setTimeout(() => {
        waiting = false;
        if (lastArgs) { fn(...lastArgs); lastArgs = null; }   // trailing run, if any
      }, intervalMs);
    } else {
      lastArgs = args;                      // remember the latest call for the trailing run
    }
  };
};
const positions = [];
const onScroll = createTrailingThrottle((y) => positions.push(y), 20);
for (const y of [10, 20, 30, 40]) onScroll(y);      // four scroll events in a burst
console.log("during the burst ->", JSON.stringify(positions));      // -> [10]
setTimeout(() => console.log("after the window ->", JSON.stringify(positions)), 50);
// -> after the window -> [10,40]        (leading run + trailing run)
setTimeout(() => {
  console.log("\n--- 6. the same real-timer check for debounce() ---");
  const debouncedLog = debounce((value) => console.log("debounced call ->", value), 20);
  debouncedLog("a");
  debouncedLog("b");
  setTimeout(() => debouncedLog("c"), 5);   // still inside the window -> resets the timer
  setTimeout(() => console.log("no call before the window ends ->", true), 15);
}, 80);

// ---------------------------------------------------------------------------
// 4 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// Synchronous part:
// STEP 25 · DEBOUNCE & THROTTLE  (Phase 7 · Advanced Patterns)
// ==============================================================
//
// --- 1. debounce: a search box typing fast ---
// immediately -> 0 calls
//
// --- 2. cancel() and flush() ---
// after flush -> ["saved 2"]
// immediately after cancel -> ["saved 2"]
//
// --- 3. `this` and the arguments survive ---
//
// --- 4. throttle with an injected clock (deterministic test) ---
// 100 ms window, events every 30 ms -> page-0,page-4
//
// --- 5. a trailing-edge throttle with real timers ---
// during the burst -> [10]
//
// Asynchronous part (timers: order inside this group can vary slightly):
// this preserved -> api:/users
// later after cancel -> ["saved 2"]
// after the window -> [10,40]
// after the pause -> 1 call: javas
// practice 2 -> after the window: ["a"]
// ✓ STEP 25 complete — next: node 26_currying.js
//
// --- 6. the same real-timer check for debounce() ---
// no call before the window ends -> true
// debounced call -> c

// ---------------------------------------------------------------------------
// 5 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Forgetting to cancel the debounce when the component unmounts (set state on
//   an unmounted component, or late API responses overwriting fresh data).
// Re-creating the debounced function on every render (new closure = no debounce);
//   keep it in a ref/useMemo.
// Debouncing when throttle is needed (scroll progress) or vice versa.
// Not forwarding this/arguments, so the wrapped method loses its context.
// Using a huge wait (600 ms) for search - it feels broken instead of smooth.
// Timer ids leaking because clearTimeout is never called.
// Treating these as "performance magic" - first fix what fires the events
//   (e.g. passive listeners, CSS, virtualisation).
// Testing timing behaviour with real sleeps only: inject a clock instead.

// ---------------------------------------------------------------------------
// 6 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Debounce vs throttle?   A: debounce = run after the calls STOP (1 call per
//    burst); throttle = run at most once per interval while calls continue.
// Q: When do you use which?   A: debounce for search/validation/autosave;
//    throttle for scroll/mousemove/resize/progress and API rate limits.
// Q: What are the leading and trailing edges?   A: leading = run at the start of
//    the burst, trailing = run at the end (the classic debounce is trailing).
// Q: How do you cancel a pending debounce?   A: Expose cancel()/flush() that
//    clearTimeout or run the pending call immediately.
// Q: How do you test timing code?   A: Inject the clock/timers (as in section 3)
//    or use fake timers (Jest/Vitest) so tests are deterministic and fast.
// Q: What is the requestAnimationFrame alternative?   A: For visual updates use
//    rAF (or IntersectionObserver) - it aligns work with the browser's paint.

// ---------------------------------------------------------------------------
// 7 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write a search handler debounced by 250 ms that also cancels on unmount.
// 2. Write throttle(fn, ms) with LEADING edge disabled (trailing only).
// 3. How would you rate-limit an API call to at most one request per second?

// ------------------------------ ANSWERS ------------------------------------
const setupSearch = () => {                                        // 1
  const results = [];
  const runSearch = debounce((term) => results.push(`searching ${term}`), 250);
  return { runSearch, results, unmount: () => runSearch.cancel() };
};
const search = setupSearch();
search.runSearch("re");
search.runSearch("react");
search.unmount();                         // component unmounted -> nothing runs
console.log("\npractice 1 -> after unmount:", JSON.stringify(search.results));   // -> []

const throttleTrailingOnly = (fn, intervalMs) => {                 // 2
  let timer = null;
  let lastArgs = null;
  return (...args) => {
    lastArgs = args;
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      fn(...lastArgs);
      lastArgs = null;
    }, intervalMs);
  };
};
const trailCalls = [];
const trailThrottled = throttleTrailingOnly((value) => trailCalls.push(value), 10);
trailThrottled("a");
console.log("practice 2 -> during the window:", JSON.stringify(trailCalls));  // -> []

const rateLimiter = throttleTrailingOnly((url) => console.log("practice 3 -> request", url), 1000);
console.log("practice 3 -> the trailing-only throttle above is exactly a rate");  // 3
console.log("              limiter: at most one call per interval, using the last");
console.log("              arguments (combine with a queue if every call must run).\n");

setTimeout(() => {
  console.log("practice 2 -> after the window:", JSON.stringify(trailCalls));   // -> ["a"]
  console.log("✓ STEP 25 complete — next: node 26_currying.js");
}, 60);



