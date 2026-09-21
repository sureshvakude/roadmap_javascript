/**
 * ============================================================================
 * STEP 23 / 28  ·  BROWSER APIS                Phase 5 · Browser & APIs
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Web Storage: localStorage vs sessionStorage, JSON in/out, limits
 *   2. fetch: URLs, HTTP status codes, JSON, and how errors really work
 *   3. AbortController: timeouts and cancelling requests
 *   4. Timers: setTimeout / setInterval / clearInterval, and measuring time
 *   5. Other APIs worth knowing: navigator, Clipboard, Notification, History
 *
 * HOW THIS FILE RUNS IN NODE
 *   Node has fetch, AbortController and timers, but no localStorage/document.
 *   The lesson uses a tiny in-memory storage shim with the SAME API, so every
 *   line below runs and prints under Node - swap it for the real thing in a
 *   browser (the shim only exists to keep the lesson runnable).
 *
 * RUN IT      node 23_browser_apis.js
 * PREV STEP   <-  22_dom_manipulation.js
 * NEXT STEP   ->  24_es6_features.js   (Phase 6)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// WEB STORAGE (browser only, ~5 MB per origin, synchronous strings)
//   localStorage    : survives a reload/close (per origin, never sent to server)
//   sessionStorage  : cleared when the tab closes
//   API: setItem(key, string) | getItem(key) | removeItem(key) | clear()
//   -> values must be STRINGS: JSON.stringify on write, JSON.parse on read.
//   NEVER store tokens, passwords or personal data; do not use it as a database.
//
// FETCH (browser + Node 18+)
//   const response = await fetch(url, { method, headers, body, signal });
//   response.ok              -> true for 200-299
//   response.status / statusText
//   await response.json()    -> parse the body (only once; also .text(), .blob())
//   IMPORTANT: fetch only REJECTS on network failure/abort - a 404 or 500 is a
//   fulfilled promise, so you must check response.ok yourself.
//
// ABORTCONTROLLER - the standard way to cancel/timeout
//   const controller = new AbortController();
//   fetch(url, { signal: controller.signal });
//   controller.abort(new Error("timeout"));
//
// TIMERS
//   setTimeout(fn, ms) -> id      | clearTimeout(id)
//   setInterval(fn, ms) -> id     | clearInterval(id)    <- always clear it
//   performance.now() / Date.now() for measuring durations
//
// OTHER USEFUL APIs: navigator (userAgent, onLine, language, clipboard),
//   URL / URLSearchParams, History (pushState), Notification, IntersectionObserver,
//   Service Worker (offline/caching), Geolocation.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 23 · BROWSER APIS  (Phase 5 · Browser & APIs)");
console.log("=".repeat(62));

const HAS_LOCAL_STORAGE = typeof localStorage !== "undefined";

// The shim below mirrors the real Web Storage API so this file runs under Node.
const createMemoryStorage = () => {
  const store = new Map();
  return {
    get length() { return store.size; },
    key: (index) => [...store.keys()][index] ?? null,
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
  };
};
const storage = HAS_LOCAL_STORAGE ? localStorage : createMemoryStorage();
console.log("\n--- 1. storage: strings only, so JSON in / JSON out ---");
console.log("using real localStorage ->", HAS_LOCAL_STORAGE);
console.log("using the Node shim     ->", !HAS_LOCAL_STORAGE);

console.log("\n--- 2. store and read back an object ---");
const settings = { theme: "dark", fontSize: 14 };
storage.setItem("settings", JSON.stringify(settings));
const rawValue = storage.getItem("settings");
console.log("raw (a string) ->", rawValue);                 // -> {"theme":"dark","fontSize":14}
console.log("parsed ->", JSON.parse(rawValue).theme);       // -> dark
console.log("length ->", storage.length, "| key(0) ->", storage.key(0)); // -> 1 | settings
storage.removeItem("settings");
console.log("after remove ->", storage.getItem("settings")); // -> null

const readSettings = (store, fallback = {}) => {
  try {
    return { ...fallback, ...JSON.parse(store.getItem("settings") ?? "{}") };
  } catch {
    return fallback;                       // corrupted JSON must not crash the app
  }
};
storage.setItem("settings", "{corrupted");
console.log("safe read    ->", JSON.stringify(readSettings(storage, { theme: "light" })));
// -> {"theme":"light"}
storage.setItem("settings", JSON.stringify(settings));
console.log("working read ->", JSON.stringify(readSettings(storage, { theme: "light" })));
// -> {"theme":"dark","fontSize":14}
storage.clear();

console.log("\n--- 3. fetch: check response.ok, then read the body ---");
// In a browser you would write:  const response = await fetch("https://api.example.com/users/1");
// Node 18+ also has fetch, but this file stays offline-safe with a tiny fake API:
const fakeApi = async (url) => {
  const id = Number(url.split("/").pop());
  if (id === 1) return { ok: true, status: 200, json: async () => ({ id, name: "Ada" }) };
  return { ok: false, status: 404, json: async () => ({ error: "not found" }) };
};

async function getUser(id) {
  const response = await fakeApi(`/users/${id}`);
  if (!response.ok) throw new Error(`request failed with status ${response.status}`);
  return response.json();
}
getUser(1).then((user) => console.log("GET ok   ->", user.name));         // -> Ada
getUser(2).catch((error) => console.log("GET fail ->", error.message));   // -> request failed with status 404

const params = new URLSearchParams({ q: "javascript", page: "2" });
console.log("query string ->", `/search?${params.toString()}`);           // -> /search?q=javascript&page=2
// A POST with a JSON body (browser / Node 18+):
//   await fetch("/api/todos", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ title: "learn fetch" }),
//   });

console.log("\n--- 4. AbortController: timeouts and cancellation ---");
const slowApi = (signal, ms = 100) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => resolve("server answered"), ms);
  signal.addEventListener("abort", () => {
    clearTimeout(timer);
    reject(signal.reason ?? new Error("aborted"));
  }, { once: true });
});

const timeoutController = new AbortController();
const timeoutId = setTimeout(() => timeoutController.abort(new Error("timeout after 30 ms")), 30);
slowApi(timeoutController.signal).then(
  (value) => { clearTimeout(timeoutId); console.log("slow call  ->", value); },
  (error) => { clearTimeout(timeoutId); console.log("slow call  ->", error.message); },
);
slowApi(new AbortController().signal, 10).then((value) => console.log("quick call ->", value));
// The same pattern with a real request:
//   const controller = new AbortController();
//   setTimeout(() => controller.abort(new Error("timeout")), 5_000);
//   const response = await fetch(url, { signal: controller.signal });

console.log("\n--- 5. timers: an interval that cleans itself up ---");
let ticks = 0;
const intervalId = setInterval(() => {
  ticks += 1;
  console.log("tick", ticks);
  if (ticks === 3) {
    clearInterval(intervalId);              // ALWAYS clear intervals
    console.log("interval cleared after 3 ticks");
  }
}, 10);

console.log("\n--- 6. measuring duration ---");
const startedAt = performance.now();
for (let i = 0; i < 100_000; i += 1) { /* busy work */ }
console.log("loop took more than 0 ms ->", performance.now() - startedAt >= 0);   // -> true

console.log("\n--- 7. the navigator object ---");
console.log("navigator available ->", typeof navigator);
// Browser extras: navigator.onLine, navigator.language, navigator.clipboard,
// navigator.geolocation, navigator.serviceWorker.

// ---------------------------------------------------------------------------
// 8 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// Synchronous part (in order):
// STEP 23 · BROWSER APIS  (Phase 5 · Browser & APIs)
// ==============================================================
//
// --- 1. storage: strings only, so JSON in / JSON out ---
// using real localStorage -> false        (true in a browser)
// using the Node shim     -> true
//
// --- 2. store and read back an object ---
// raw (a string) -> {"theme":"dark","fontSize":14}
// parsed -> dark
// length -> 1 | key(0) -> settings
// after remove -> null
// safe read    -> {"theme":"light"}
// working read -> {"theme":"dark","fontSize":14}
//
// --- 3. fetch ---
// query string -> /search?q=javascript&page=2
//
// --- 5. timers ---
//
// --- 6. measuring duration ---
// loop took more than 0 ms -> true
//
// --- 7. the navigator object ---
// navigator available -> object            (Node 21+ also defines it)
//
// Asynchronous part (order can vary between runs):
// GET fail -> request failed with status 404
// GET ok   -> Ada
// quick call -> server answered
// tick 1
// tick 2
// slow call  -> timeout after 30 ms
// tick 3
// interval cleared after 3 ticks

// ---------------------------------------------------------------------------
// 9 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Storing objects in localStorage without JSON.stringify (you get "[object Object]").
// Parsing stored JSON without try/catch - one corrupted value breaks the page.
// Storing secrets/tokens in localStorage (readable by any script = XSS target).
// Assuming fetch rejects on 404/500 - it does not; check response.ok.
// Reading response.json() twice (the body can be consumed only once).
// Forgetting to clear intervals / remove listeners -> leaks and ghost updates.
// No timeout on requests: a hanging request keeps the UI waiting forever.
// Using synchronous storage in hot paths or with large data (it blocks the thread).

// ---------------------------------------------------------------------------
// 10 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: localStorage vs sessionStorage vs cookies?   A: both storages are browser
//    side, string-only, ~5 MB; localStorage persists, sessionStorage is per tab;
//    cookies are small, sent with every request and can be HttpOnly.
// Q: Does fetch reject on HTTP errors?   A: No - only on network errors or abort.
//    Check response.ok/status yourself.
// Q: How do you add a timeout to fetch?   A: AbortController + controller.abort()
//    and pass controller.signal to fetch.
// Q: setTimeout vs setInterval?   A: one shot vs repeated; both return ids you
//    should clear, and neither is precise for scheduling.
// Q: How do you cache API data?   A: In memory (Map) for the session, IndexedDB
//    or the Cache API for offline/large data, HTTP headers for shared caching.
// Q: What is the difference between localStorage and IndexedDB?   A: IndexedDB is
//    asynchronous, transactional and can store large structured data/blobs.

// ---------------------------------------------------------------------------
// 11 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write saveSettings(obj) / loadSettings(fallback) on top of Web Storage.
// 2. Write fetchJson(url, { timeoutMs }) using AbortController.
// 3. Explain why "response.ok" matters for a 404 response with a JSON body.

// ------------------------------ ANSWERS ------------------------------------
const saveSettings = (store, value) => {                       // 1
  store.setItem("settings", JSON.stringify(value));
  return true;
};
const loadSettings = (store, fallback = {}) => {
  try {
    return { ...fallback, ...JSON.parse(store.getItem("settings") ?? "{}") };
  } catch {
    return fallback;
  }
};
saveSettings(storage, { theme: "dark", compact: true });
console.log("\npractice 1 ->", JSON.stringify(loadSettings(storage, { theme: "light" })));
storage.clear();

const fetchWithTimeout = async (url, { timeoutMs = 1000 } = {}) => {   // 2
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error(`timeout after ${timeoutMs} ms`)), timeoutMs);
  try {
    const response = await fakeApi(url);                  // real code: fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`request failed with status ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);                              // always clean up the timer
  }
};
fetchWithTimeout("/users/1").then((user) => console.log("practice 2 ->", user.name)); // -> Ada

console.log("practice 3 -> a 404 is a FULFILLED response object, so the .then chain");  // 3
console.log("              continues unless you check response.ok and throw yourself.\n");

console.log("✓ STEP 23 complete — next: node 24_es6_features.js  (Phase 6)");


