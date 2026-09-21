/**
 * ============================================================================
 * STEP 19 / 28  ·  try / catch / finally     Phase 5 · Errors & Built-ins
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. throw, catch, finally - and what .message/.name/.stack give you
 *   2. You can throw ANY value, but Error objects carry the useful information
 *   3. Catching specific error types with instanceof
 *   4. Optional catch binding, rethrowing, and finally's job
 *   5. Which errors try/catch CANNOT catch (async callbacks, syntax errors)
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 19_try_catch_finally.js
 * PREV STEP   <-  18_event_loop_and_call_stack.js
 * NEXT STEP   ->  20_custom_error.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// throw  : raise an error, aborting the current function with that value.
// catch  : receives it and decides what to do (recover, wrap, log, rethrow).
// finally: ALWAYS runs - after the try, after a catch, or before a return/throw
//          leaves the function. Perfect for cleanup (unlock, close, stop timer).
//
// Error objects carry:
//   error.name     -> "TypeError", "RangeError", ...
//   error.message  -> the human readable reason
//   error.stack    -> call-site trace (log it, do not show it to users)
//   error.cause    -> the wrapped original error (ES2022, see step 20)
//
// BUILT-IN TYPES: Error, TypeError, RangeError, ReferenceError, SyntaxError,
//   URIError, EvalError, AggregateError (plus platform ones like DOMException).
//
// WHAT try/catch CANNOT CATCH
//   * errors thrown in an async callback (setTimeout, event handler, .then
//     without await) - they escape your try block
//   * unhandled promise rejections (handle with .catch or await + try/catch)
//   * syntax errors in code that is parsed before it runs
//   For .then chains use .catch; for async callbacks use try/catch INSIDE them.
//
// STYLE: catch only what you can handle, and rethrow or wrap what you cannot.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 19 · TRY / CATCH / FINALLY  (Phase 5)");
console.log("=".repeat(62));

console.log("\n--- 1. throw, catch and the error object ---");
try {
  throw new Error("something broke");
} catch (error) {
  console.log("caught ->", error.name, "|", error.message);   // -> Error | something broke
  console.log("has a stack ->", typeof error.stack === "string"); // -> has a stack -> true
}

console.log("\n--- 2. built-in error types ---");
const probes = [
  ["ReferenceError", () => notDeclaredAnywhere()],
  ["TypeError", () => null.property],
  ["RangeError", () => new Array(-1)],
  ["SyntaxError", () => JSON.parse("{bad json")],
  ["URIError", () => decodeURIComponent("%")],
];
for (const [expected, probe] of probes) {
  try {
    probe();
  } catch (error) {
    console.log(`   ${expected.padEnd(15)} -> caught ${error.name}`);   // names match
  }
}

console.log("\n--- 3. catch only what you can handle ---");
function parseAge(input) {
  const value = Number(input);
  if (Number.isNaN(value)) throw new TypeError(`"${input}" is not a number`);
  if (value < 0 || value > 150) throw new RangeError(`${value} is out of range`);
  return value;
}
for (const input of ["42", "abc", "-5"]) {
  try {
    console.log(`   parseAge("${input}") ->`, parseAge(input));
  } catch (error) {
    if (error instanceof RangeError) console.log(`   parseAge("${input}") -> range problem: ${error.message}`);
    else if (error instanceof TypeError) console.log(`   parseAge("${input}") -> type problem: ${error.message}`);
    else throw error;                       // never swallow what you do not understand
  }
}

console.log("\n--- 4. finally always runs ---");
function withCleanup(shouldFail) {
  try {
    if (shouldFail) throw new Error("failed inside try");
    return "try result";
  } catch (error) {
    return `catch result: ${error.message}`;
  } finally {
    console.log("   finally runs before the function actually returns");
  }
}
console.log("   ->", withCleanup(false));
console.log("   ->", withCleanup(true));

console.log("\n--- 5. what try/catch cannot catch ---");
try {
  setTimeout(() => { throw new Error("escapee"); }, 0);   // far away from this try block
} catch (error) {
  console.log("this line never runs");
}
process.once("uncaughtException", (error) =>
  console.log("process level ->", error.message));        // the error surfaces here instead

setTimeout(() => {                                        // the correct way
  try {
    throw new Error("caught inside the callback");
  } catch (error) {
    console.log("inside callback ->", error.message);
  }
}, 10);

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. throw, catch and the error object ---
// caught -> Error | something broke
// has a stack -> true
//
// --- 2. built-in error types ---
//    ReferenceError  -> caught ReferenceError
//    TypeError       -> caught TypeError
//    RangeError      -> caught RangeError
//    SyntaxError     -> caught SyntaxError
//    URIError        -> caught URIError
//
// --- 3. catch only what you can handle ---
//    parseAge("42") -> 42
//    parseAge("abc") -> type problem: "abc" is not a number
//    parseAge("-5") -> range problem: -5 is out of range
//
// --- 4. finally always runs ---
//    finally runs before the function actually returns
//    -> try result
//    finally runs before the function actually returns
//    -> catch result: failed inside try
//
// --- 5. what try/catch cannot catch ---
// process level -> escapee                           <- async: 0 ms timer fired first
// inside callback -> caught inside the callback      <- async: 10 ms timer

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Wrapping an async callback in try/catch and expecting it to catch (it cannot).
// Catching everything with a bare `catch {}` and hiding real bugs.
// Logging error.stack to users / sending it in an API response (information leak).
// Forgetting `finally` cleanup, so locks/handles/timers stay open on failures.
// Throwing strings ("something failed") instead of Error objects - no stack, no type.
// Returning from finally: it silently overrides the try/catch return value.
// Re-throwing a NEW error without the original (use { cause: error } - step 20).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Does finally always run?   A: Yes - after try, after catch, and even when
//    try/catch returns or throws (an explicit return inside finally overrides).
// Q: What can try/catch NOT catch?   A: Errors thrown in async callbacks (timers,
//    events, .then without await) and syntax errors from parsing.
// Q: Why prefer Error objects over strings?   A: name, message, stack, cause and
//    instanceof checks - strings give you none of that.
// Q: When should you rethrow?   A: When you cannot handle the error or you only
//    wanted to add context; rethrow (or wrap) instead of swallowing it.
// Q: What is the optional catch binding?   A: `catch { }` without a parameter,
//    for cases where you do not need the error object.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. safeJsonParse(text, fallback) - parse without throwing, return the fallback.
// 2. validatePort(port) - throw TypeError for a non-number, RangeError otherwise.
// 3. Explain why try/catch around setTimeout does not catch its callback error.

// ------------------------------ ANSWERS ------------------------------------
const safeJsonParse = (text, fallback = null) => {            // 1
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};
console.log("\npractice 1 ->", JSON.stringify(safeJsonParse('{"ok":true}')), "|",
            safeJsonParse("{oops}", "invalid"));              // -> {"ok":true} | invalid

const validatePort = (port) => {                              // 2
  if (typeof port !== "number") throw new TypeError("port must be a number");
  if (port < 1 || port > 65535) throw new RangeError("port out of range");
  return port;
};
try {
  validatePort("8080");
} catch (error) {
  console.log("practice 2 ->", error.name, "|", error.message);
  // -> TypeError | port must be a number
}

console.log("practice 3 -> the callback runs in a later turn of the event loop,");  // 3
console.log("              outside the try block's stack, so it surfaces at the");
console.log("              process level (uncaughtException / unhandledRejection).\n");

console.log("✓ STEP 19 complete — next: node 20_custom_error.js");

