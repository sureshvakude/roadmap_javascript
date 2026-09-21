/**
 * ============================================================================
 * STEP 33 / 28+5 · COMMON DESIGN PATTERNS    Phase 9 · Extra Concepts You Use
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What a design pattern is, and which ones JavaScript code actually uses
 *   2. Factory: build objects with plain functions
 *   3. Singleton: one shared instance (logger, config, store)
 *   4. Observer / pub-sub: the event emitter behind DOM events and Node's EventEmitter
 *   5. Strategy: swap behaviour at runtime (comparators, validators)
 *   6. Pipeline / middleware: ordered transformations (Express, Redux)
 *   7. Decorator: wrap behaviour around an existing function (retry, logging)
 *
 * RUN IT      node 33_common_design_patterns.js
 * PREV STEP   <-  32_strings_and_numbers.js
 * NEXT        -> README.md (tick your boxes) - then build the projects
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// A design pattern is a named, reusable solution to a problem that keeps coming
// back. In JavaScript they are rarely "classes with UML diagrams" - they grow out
// of the language features you already know:
//
//   closures        -> module, singleton, memoization (steps 10, 29)
//   first-class fns -> strategy, decorator, pipeline, callbacks (steps 05, 13)
//   prototypes      -> shared behaviour without classes (step 12)
//   Map/Set         -> observer registries, caches (step 27)
//
// THE CATALOGUE IN THIS STEP
//   Module (revealing) : private state + public API            <- step 29
//   Singleton          : exactly one shared instance, created lazily
//   Factory            : a function that builds and returns objects
//   Observer / pub-sub : listeners subscribe, a source emits - DOM events,
//                        node:events EventEmitter, state stores, webhooks
//   Strategy           : pass the algorithm in as a value and swap it
//   Pipeline/middleware: value flows through ordered steps (app.use, Redux)
//   Decorator          : wrap a function to add behaviour (logging, retry, timing)
//
// WHEN NOT TO USE A PATTERN
//   Patterns add indirection. Start with the simplest code; introduce a pattern
//   when the problem actually repeats. A "singleton" can be a plain object; a
//   "strategy" can be one if statement - until it cannot.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 33 · COMMON DESIGN PATTERNS  (Phase 9 · Extra Concepts You Use)");
console.log("=".repeat(62));

console.log("\n--- 1. factory: functions that build objects ---");
let nextUserId = 1;
const createUser = (name, role = "user") => ({
  id: nextUserId++,
  name,
  role,
  describe() { return `#${this.id} ${this.name} (${this.role})`; },
});
const admin = createUser("Ada", "admin");
const viewer = createUser("Bob");
console.log("factory ->", admin.describe(), "|", viewer.describe());
// -> factory -> #1 Ada (admin) | #2 Bob (user)

console.log("\n--- 2. singleton: one shared instance (a logger) ---");
const logger = (() => {                       // IIFE + closure from step 29
  const entries = [];
  return {
    log(level, message) {
      entries.push({ level, message });
      return `[${level}] ${message}`;
    },
    history: () => [...entries],              // copies out, never the array
    count: () => entries.length,
  };
})();
console.log("singleton ->", logger.log("info", "boot"), "|", logger.log("warn", "slow query"));
// -> singleton -> [info] boot | [warn] slow query
console.log("entries   ->", logger.count(), "| levels ->", JSON.stringify(logger.history().map((entry) => entry.level)));
// -> entries   -> 2 | levels -> ["info","warn"]

console.log("\n--- 3. observer / pub-sub: the event emitter ---");
const createEventEmitter = () => {
  const listeners = new Map();                // event -> [handlers]
  return {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(handler);
      return this;                            // chainable
    },
    off(event, handler) {
      listeners.set(event, (listeners.get(event) ?? []).filter((h) => h !== handler));
      return this;
    },
    emit(event, payload) {
      for (const handler of listeners.get(event) ?? []) handler(payload);
      return this;
    },
  };
};
const bus = createEventEmitter();
bus.on("user:signup", (user) => console.log("  mailer    -> welcome", user.name));
const trackSignup = (user) => console.log("  analytics -> track", user.name);
bus.on("user:signup", trackSignup);
bus.emit("user:signup", { name: "Ada" });     // both listeners run
bus.off("user:signup", trackSignup);          // unsubscribe one listener
bus.emit("user:signup", { name: "Bob" });     // only the mailer runs now

console.log("\n--- 4. strategy: behaviour you can swap at runtime ---");
const sortStrategies = {
  asc: (a, b) => a - b,
  desc: (a, b) => b - a,
  byLength: (a, b) => a.length - b.length,
};
const sortWith = (items, strategy) => [...items].sort(strategy);
console.log("strategy ->", sortWith([3, 1, 2], sortStrategies.asc).join(","), "|",
            sortWith([3, 1, 2], sortStrategies.desc).join(","));
// -> strategy -> 1,2,3 | 3,2,1
console.log("strings  ->", sortWith(["kiwi", "fig", "apple"], sortStrategies.byLength).join(","));
// -> strings  -> fig,kiwi,apple

const shippingCost = {
  standard: (weightKg) => 5 + weightKg * 1,
  express: (weightKg) => 12 + weightKg * 2,
  pickup: () => 0,
};
const checkout = (weightKg, method) => shippingCost[method](weightKg);
console.log("shipping ->", checkout(2, "standard"), checkout(2, "express"), checkout(2, "pickup"));
// -> shipping -> 7 16 0

console.log("\n--- 5. pipeline / middleware: value flows through steps ---");
const createPipeline = (...steps) => (input) => steps.reduce((value, next) => next(value), input);
const cleanInput = createPipeline(
  (text) => text.trim(),
  (text) => text.toLowerCase(),
  (text) => text.replace(/\s+/g, "-"),
  (text) => `/${text}`,
);
console.log("pipeline ->", cleanInput("  Blog Post 2024  "));   // -> pipeline -> /blog-post-2024

console.log("\n--- 6. decorator: wrap behaviour around a function ---");
const withRetry = (fn, attempts = 3) => async (...args) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};
let flakyCalls = 0;
const flakyTask = withRetry(async () => {
  flakyCalls += 1;
  if (flakyCalls < 3) throw new Error(`flaky failure ${flakyCalls}`);
  return `ok on call ${flakyCalls}`;
});
flakyTask().then((result) => console.log("decorator ->", result));   // async: printed at the end

console.log("\n--- 7. choosing a pattern ---");
const patternGuide = [
  ["Module", "hide state, expose a small API (step 29)"],
  ["Singleton", "one shared resource: config, logger, store"],
  ["Factory", "create objects without classes / new"],
  ["Observer", "many listeners, one event source (DOM, node:events)"],
  ["Strategy", "swap algorithms or behaviour at runtime"],
  ["Decorator", "add behaviour without changing the function"],
  ["Pipeline", "ordered transformations (Express, Redux)"],
];
console.log(patternGuide.map(([name, use]) => `  ${name.padEnd(10)} ${use}`).join("\n"));

// ---------------------------------------------------------------------------
// 4 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. factory ---
// factory -> #1 Ada (admin) | #2 Bob (user)
//
// --- 2. singleton ---
// singleton -> [info] boot | [warn] slow query
// entries   -> 2 | levels -> ["info","warn"]
//
// --- 3. observer / pub-sub ---
//   mailer    -> welcome Ada
//   analytics -> track Ada
//   mailer    -> welcome Bob
//
// --- 4. strategy ---
// strategy -> 1,2,3 | 3,2,1
// strings  -> fig,kiwi,apple
// shipping -> 7 16 0
//
// --- 5. pipeline ---
// pipeline -> /blog-post-2024
//
// --- 6. decorator --- (async: printed at the end)
// decorator -> ok on call 3
//
// --- 7. the guide table ---
//   Module     hide state, expose a small API (step 29)
//   Singleton  one shared resource: config, logger, store
//   Factory    create objects without classes / new
//   Observer   many listeners, one event source (DOM, node:events)
//   Strategy   swap algorithms or behaviour at runtime
//   Decorator  add behaviour without changing the function
//   Pipeline   ordered transformations (Express, Redux)

// ---------------------------------------------------------------------------
// 5 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Applying patterns for their own sake - indirection without a problem is debt.
// Global singletons that make testing hard (inject them instead of importing).
// Event emitters with listeners that are never removed (memory leaks - step 10).
// Swallowing errors inside emit(): one throwing listener stops the others; wrap
//   handler calls in try/catch (or allSettled for async listeners).
// Factories returning half-initialised objects - always return a complete shape.
// Strategies that capture outside state (keep them pure so they stay swappable).
// Pipeline steps that mutate their input instead of returning a new value.
// Confusing observer (one subject knows its observers) with pub/sub through a
//   broker, where senders and receivers never meet.

// ---------------------------------------------------------------------------
// 6 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is the observer pattern?   A: A subject keeps a list of subscribers and
//    notifies them on change - DOM events, node:events EventEmitter, state stores.
// Q: Observer vs pub/sub?   A: In observer the subject knows its observers; in
//    pub/sub a broker sits in the middle so senders and receivers are decoupled.
// Q: What is the strategy pattern?   A: Pass the algorithm as a value (function or
//    object) so callers can swap it - sort comparators, validators, pricing rules.
// Q: Why use a factory instead of a class?   A: Simpler creation, no new/this
//    pitfalls, easy per-instance closures, and the object shape stays private.
// Q: What is middleware?   A: A pipeline of functions that each transform the
//    value (or call next) - Express handlers and Redux middleware work this way.
// Q: How does a decorator differ from inheritance?   A: It wraps an existing
//    function/object at runtime instead of building a subclass hierarchy.

// ---------------------------------------------------------------------------
// 7 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Add once(event, handler) to the emitter: it fires exactly one time.
// 2. Build a rate-limited API caller with the singleton pattern (1 call / 100 ms).
// 3. Add discount strategies: none | percent10 | bulk (>= 5 items -> 20% off).
// 4. What is the danger of emit() when one listener throws?

// ------------------------------ ANSWERS ------------------------------------
const emitter = createEventEmitter();                                  // 1
const once = (event, handler) => {
  const wrapper = (payload) => {
    emitter.off(event, wrapper);            // remove itself after the first run
    handler(payload);
  };
  return emitter.on(event, wrapper);
};
let signupCount = 0;
once("user:signup", () => { signupCount += 1; });
emitter.emit("user:signup", { name: "X" });
emitter.emit("user:signup", { name: "Y" });
console.log("\npractice 1 -> once fired", signupCount, "time(s)");     // -> once fired 1 time(s)

const api = (() => {                                                   // 2
  let lastCallAt = -Infinity;
  return {
    request(url, now = Date.now()) {
      if (now - lastCallAt < 100) return `blocked ${url}`;
      lastCallAt = now;
      return `called ${url}`;
    },
  };
})();
console.log("practice 2 ->", api.request("/a", 0), "|", api.request("/b", 50), "|", api.request("/c", 150));
// -> practice 2 -> called /a | blocked /b | called /c

const discounts = {                                                    // 3
  none: (total) => total,
  percent10: (total) => +(total * 0.9).toFixed(2),
  bulk: (total, count = 5) => (count >= 5 ? +(total * 0.8).toFixed(2) : total),
};
const priceWith = (strategy, total, count) => discounts[strategy](total, count);
console.log("practice 3 ->", priceWith("none", 100), priceWith("percent10", 100), priceWith("bulk", 100, 5));
// -> practice 3 -> 100 90 80

console.log("practice 4 -> one throwing listener stops the loop, so the listeners");  // 4
console.log("              registered after it never run - wrap each call in try/catch.\n");

setTimeout(() => {
  console.log("✓ STEP 33 complete — the roadmap is complete!");
  console.log("  Next: README.md -> tick your boxes, then build the checkpoint projects.\n");
}, 30);





