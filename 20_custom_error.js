/**
 * ============================================================================
 * STEP 20 / 28  ·  CUSTOM ERRORS              Phase 5 · Errors & Built-ins
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Why domain-specific error classes beat generic Error
 *   2. How to extend Error correctly (name, extra fields, instanceof)
 *   3. Wrapping a low-level failure with `cause` (ES2022)
 *   4. Error hierarchies + one central handler that maps them to responses
 *   5. AggregateError, and practical retry-with-backoff
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 20_custom_error.js
 * PREV STEP   <-  19_try_catch_finally.js
 * NEXT STEP   ->  21_date_and_time.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// WHY CUSTOM ERRORS
//   "catch (e) { if (e.message.includes('not found')) }" is fragile. With classes
//   you can catch by TYPE and attach the data the handler needs (status code,
//   field name, id, retry-after, ...).
//
// THE PATTERN
//   class AppError extends Error {
//     constructor(message, options = {}) {
//       super(message, options);       // options.cause is supported since ES2022
//       this.name = new.target.name;   // the real subclass name (not "Error")
//       this.status = options.status ?? 500;
//     }
//   }
//   class NotFoundError extends AppError { }
//   `new.target.name` always resolves to the class actually used with `new`.
//
// RULES THAT MATTER
//   * Always call super(message) first, before touching `this`.
//   * Set this.name, otherwise logs say "Error" for every subclass.
//   * Extending Error keeps instanceof working through the whole chain
//     (instanceof works across the class hierarchy, not across bundles/realms -
//     for those, prefer a `code` field and duck typing).
//   * Use `cause` to preserve the original error instead of hiding it.
//   * One central handler (middleware / try-catch at the top of a request)
//     maps error types to status codes and user-safe messages.
//   AggregateError collects several failures into one (e.g. Promise.any).

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 20 · CUSTOM ERRORS  (Phase 5 · Errors & Built-ins)");
console.log("=".repeat(62));

console.log("\n--- 1. a first custom error class ---");
class ValidationError extends Error {
  constructor(message, { field } = {}) {
    super(message);                  // message + stack, required first
    this.name = "ValidationError";
    this.field = field;              // extra context travels with the error
  }
}
try {
  throw new ValidationError("email is not valid", { field: "email" });
} catch (error) {
  console.log("name ->", error.name);                       // -> ValidationError
  console.log("message ->", error.message);                 // -> email is not valid
  console.log("field ->", error.field);                     // -> email
  console.log("instanceof Error ->", error instanceof Error);                      // -> true
  console.log("instanceof ValidationError ->", error instanceof ValidationError);  // -> true
}

console.log("\n--- 2. an error hierarchy with status codes ---");
class AppError extends Error {
  constructor(message, { status = 500, cause } = {}) {
    super(message, { cause });        // ES2022: keeps the original error as .cause
    this.name = new.target.name;      // "NotFoundError", "PaymentError", ...
    this.status = status;
  }
}
class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} ${id} not found`, { status: 404 });
    this.resource = resource;
  }
}
class PaymentError extends AppError {
  constructor(message, cause) { super(message, { status: 402, cause }); }
}
const toResponse = (error) => ({
  status: error instanceof AppError ? error.status : 500,
  body: { error: error.message, name: error.name },
});
console.log("not found ->", JSON.stringify(toResponse(new NotFoundError("user", 42))));
console.log("payment   ->", JSON.stringify(toResponse(new PaymentError("card declined"))));
console.log("unknown   ->", JSON.stringify(toResponse(new Error("boom"))));

console.log("\n--- 3. wrapping a low-level error with cause ---");
function readConfig(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new AppError("config is invalid", { status: 500, cause: error });
  }
}
try {
  readConfig("{not json}");
} catch (error) {
  console.log("outer ->", error.message, "| status:", error.status);  // -> config is invalid | status: 500
  console.log("inner ->", error.cause.name);                          // -> SyntaxError
}

console.log("\n--- 4. AggregateError: many failures in one error ---");
try {
  throw new AggregateError([new Error("first failed"), new Error("second failed")], "two things failed");
} catch (error) {
  console.log("aggregate ->", error.name, "|", error.message, "|", error.errors.length, "errors");
  // -> AggregateError | two things failed | 2 errors
}

console.log("\n--- 5. practical pattern: retry with exponential backoff ---");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const createFlakyService = () => {
  let calls = 0;
  return async () => {
    calls += 1;
    if (calls < 3) throw new AppError(`temporary failure ${calls}`, { status: 503 });
    return `succeeded on call ${calls}`;
  };
};
async function withRetry(fn, { attempts = 3, backoffMs = 5 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = error instanceof AppError && error.status >= 500;
      if (!retryable || attempt === attempts) throw error;   // 4xx: do not retry
      await sleep(backoffMs * attempt);                      // 5 ms, then 10 ms
    }
  }
  throw lastError;
}
withRetry(createFlakyService()).then((message) => console.log("retry ->", message));
// -> retry -> succeeded on call 3

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. a first custom error class ---
// name -> ValidationError
// message -> email is not valid
// field -> email
// instanceof Error -> true
// instanceof ValidationError -> true
//
// --- 2. an error hierarchy with status codes ---
// not found -> {"status":404,"body":{"error":"user 42 not found","name":"NotFoundError"}}
// payment   -> {"status":402,"body":{"error":"card declined","name":"PaymentError"}}
// unknown   -> {"status":500,"body":{"error":"boom","name":"Error"}}
//
// --- 3. wrapping a low-level error with cause ---
// outer -> config is invalid | status: 500
// inner -> SyntaxError
//
// --- 4. AggregateError ---
// aggregate -> AggregateError | two things failed | 2 errors
//
// --- 5. retry with backoff --- (async: printed at the end)
// retry -> succeeded on call 3

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Forgetting this.name = ... so every custom error logs as "Error".
// Touching `this` before super() in a subclass constructor -> ReferenceError.
// Throwing inside a getter/constructor and hiding the real cause (no `cause`).
// Catching by message text ("includes('not found')") instead of by type.
// Retrying every error, including 4xx/client mistakes that will never succeed.
// Setting `status`/`code` fields but never using them in the central handler.
// Relying on instanceof across bundles or realms - add a `code` field as a fallback.
// Logging the whole error object to users (stack traces leak file paths/queries).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: How do you create a custom error?   A: class MyError extends Error { constructor(msg, options){ super(msg, options); this.name = "MyError"; } }.
// Q: Why is instanceof still true for subclasses?   A: Object.setPrototypeOf links
//    the subclass prototype to Error.prototype; extending Error does that for you.
// Q: What is error.cause for?   A: Keeping the original low-level error while you
//    add a higher-level, user-friendly one - the chain stays inspectable.
// Q: How do you map errors to HTTP statuses?   A: Put `status` on your base AppError,
//    then have one handler that returns error.status (500 for unknown errors).
// Q: What is AggregateError?   A: An error that carries an .errors array, used when
//    several operations fail at once (Promise.any, batch operations).

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Create HttpError(message, { status, code }) and a handler that reacts by type.
// 2. Wrap a JSON parsing failure with cause and a friendly message.
// 3. Why can `error instanceof Error` be false even for real errors?

// ------------------------------ ANSWERS ------------------------------------
class HttpError extends Error {                                 // 1
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}
const handleHttp = (error) => {
  if (error instanceof HttpError && error.status >= 500) return `retry later (${error.code})`;
  if (error instanceof HttpError) return `request problem: ${error.message}`;
  return "unexpected error";
};
console.log("\npractice 1 ->", handleHttp(new HttpError("service down", { status: 503, code: "E_DOWN" })));
console.log("practice 1 ->", handleHttp(new HttpError("bad input", { status: 400, code: "E_INPUT" })));
console.log("practice 1 ->", handleHttp(new Error("boom")));

const loadProfile = (raw) => {                                  // 2
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new AppError("could not read the saved profile", { status: 500, cause: error });
  }
};
try {
  loadProfile("nope");
} catch (error) {
  console.log("practice 2 ->", error.message, "| caused by", error.cause.name);
  // -> could not read the saved profile | caused by SyntaxError
}

console.log("practice 3 -> different bundles/realms have their own Error constructor,");  // 3
console.log("              so instanceof can be false; check error.name, error.code");
console.log("              or typeof error.message instead (duck typing).\n");

console.log("✓ STEP 20 complete — next: node 21_date_and_time.js");


