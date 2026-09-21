/**
 * ============================================================================
 * STEP 21 / 28  ·  DATE & TIME                 Phase 5 · Errors & Built-ins
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Creating dates: now, from a timestamp, from an ISO string, from parts
 *   2. Reading parts with local getters/setters vs UTC getters/setters
 *   3. Formatting for humans with Intl.DateTimeFormat, and ISO for storage
 *   4. Date maths: differences, adding days safely, comparisons
 *   5. The traps: month is zero-based, parsing is implementation-defined,
 *      mutation, time zones and DST
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value".
 *   Output depends on YOUR time zone - the file prints the zone it detected.
 *
 * RUN IT      node 21_date_and_time.js
 * PREV STEP   <-  20_custom_error.js
 * NEXT STEP   ->  22_dom_manipulation.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// A Date is a single number: milliseconds since 1970-01-01T00:00:00 UTC (the
// epoch). Everything else is formatting and time zone interpretation.
//
// CREATING
//   new Date()                 -> now
//   new Date(ms)               -> from a timestamp
//   new Date("2024-01-31")     -> parsed (ISO 8601 is reliable)
//   new Date(2024, 0, 31)      -> local time, MONTH IS 0-BASED (0 = January)
//   Date.now()                 -> current timestamp (fast, no object)
//
// READING (local)                       READING (UTC)
//   getFullYear() getMonth() getDate()    getUTCFullYear() getUTCMonth() ...
//   getDay() (0 = Sunday) getHours() ...  getUTCDay() getUTCHours() ...
//   getTime() / valueOf()                 -> the timestamp (same for both)
//
// FORMATTING
//   toISOString()                      -> "2024-01-31T10:00:00.000Z" (UTC, for storage)
//   toLocaleDateString(locale, opts)   -> human readable, respects the time zone
//   Intl.DateTimeFormat(locale, opts)  -> reusable, best for many formats
//
// TRAPS
//   Months are 0-based; getDay() is the weekday, getDate() is the day of month.
//   "2024-01-31" is parsed as UTC midnight, "2024/01/31" as local midnight.
//   Dates are MUTABLE - setDate() changes the original object (copy with new Date(d)).
//   Adding days by adding 86_400_000 ms breaks on DST changes.
//   Node runs in your local zone unless TZ is set; always store UTC + show local.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 21 · DATE & TIME  (Phase 5 · Errors & Built-ins)");
console.log("=".repeat(62));

const fixed = new Date("2024-01-31T10:30:00.000Z");   // a fixed instant for stable output
console.log("\n--- 1. the time zone this machine is using ---");
console.log("local zone ->", Intl.DateTimeFormat().resolvedOptions().timeZone); // e.g. Asia/Kolkata
console.log("utc offset (minutes) ->", fixed.getTimezoneOffset());              // e.g. -330

console.log("\n--- 2. creating and reading dates ---");
console.log("from ISO  ->", fixed.toISOString());          // -> 2024-01-31T10:30:00.000Z
console.log("timestamp ->", fixed.getTime());              // -> 1706697000000
console.log("Date.now() is a number ->", typeof Date.now() === "number");   // -> true
console.log("from parts (month 0-based) ->", new Date(2024, 0, 31).toDateString());
// -> Wed Jan 31 2024
console.log("UTC  month ->", fixed.getUTCMonth(), "| local month ->", fixed.getMonth());
console.log("UTC  day   ->", fixed.getUTCDate(), "| local day   ->", fixed.getDate());

console.log("\n--- 3. formatting: ISO for storage, Intl for humans ---");
const localNoon = new Date(2024, 0, 31, 12, 0, 0);   // 31 Jan 2024 12:00 LOCAL time
console.log("toISOString (storage) ->", localNoon.toISOString());   // UTC value, varies by zone
const fullFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short" });
console.log("Intl en-GB full ->", fullFormatter.format(localNoon));
console.log("en-US long      ->", localNoon.toLocaleDateString("en-US", { dateStyle: "long" }));
console.log("de-DE long      ->", localNoon.toLocaleDateString("de-DE", { dateStyle: "long" }));

console.log("\n--- 4. date maths ---");
const start = new Date("2024-01-01T00:00:00Z");
const end = new Date("2024-01-31T00:00:00Z");
const MS_PER_DAY = 86_400_000;
console.log("difference in days ->", (end - start) / MS_PER_DAY);        // -> 30
const addDays = (date, days) => {
  const copy = new Date(date);          // Dates are mutable - work on a copy
  copy.setDate(copy.getDate() + days);  // DST-safe, unlike adding 86_400_000 ms
  return copy;
};
console.log("add 10 days ->", addDays(start, 10).toISOString());         // -> 2024-01-11T00:00:00.000Z
console.log("comparisons ->", start < end, start.getTime() === start.valueOf()); // -> true true
console.log("same instant, new objects ->", new Date(0).getTime() === new Date(0).getTime()); // -> true
console.log("=== compares references ->", new Date(0) === new Date(0));  // -> false

console.log("\n--- 5. a reusable helper: relative time ---");
const formatRelative = (date, now = new Date()) => {
  const diffMinutes = Math.round((now - date) / 60_000);
  if (Math.abs(diffMinutes) < 1) return "just now";
  if (Math.abs(diffMinutes) < 60) return `${diffMinutes} minute(s) ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return `${diffHours} hour(s) ago`;
  return `${Math.round(diffHours / 24)} day(s) ago`;
};
const referenceNow = new Date("2024-02-01T12:00:00Z");
console.log(formatRelative(new Date("2024-02-01T11:58:00Z"), referenceNow)); // -> 2 minute(s) ago
console.log(formatRelative(new Date("2024-02-01T08:00:00Z"), referenceNow)); // -> 4 hour(s) ago
console.log(formatRelative(new Date("2024-01-25T12:00:00Z"), referenceNow)); // -> 7 day(s) ago
console.log("Intl.RelativeTimeFormat ->", new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-2, "day"));
// -> 2 days ago

console.log("\n--- 6. JSON turns Dates into strings ---");
const order = { placedAt: new Date("2024-01-31T10:30:00.000Z") };
const roundTripped = JSON.parse(JSON.stringify(order));
console.log("after JSON ->", typeof roundTripped.placedAt, roundTripped.placedAt instanceof Date);
// -> string false
console.log("revive it  ->", new Date(roundTripped.placedAt).toISOString());
// -> 2024-01-31T10:30:00.000Z

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// Time-zone dependent lines are marked (your machine may differ):
//
// --- 1. the time zone this machine is using ---
// local zone -> Asia/Calcutta            (your zone here)
// utc offset (minutes) -> -330           (your offset here; note the sign)
//
// --- 2. creating and reading dates ---
// from ISO  -> 2024-01-31T10:30:00.000Z
// timestamp -> 1706697000000
// Date.now() is a number -> true
// from parts (month 0-based) -> Wed Jan 31 2024
// UTC  month -> 0 | local month -> 0
// UTC  day   -> 31 | local day   -> 31
//
// --- 3. formatting ---
// toISOString (storage) -> 2024-01-31T06:30:00.000Z    (depend on your zone)
// Intl en-GB full -> Wednesday, 31 January 2024 at 12:00
// en-US long      -> January 31, 2024
// de-DE long      -> 31. Januar 2024
//
// --- 4. date maths ---
// difference in days -> 30
// add 10 days -> 2024-01-11T00:00:00.000Z
// comparisons -> true true
// same instant, new objects -> true
// === compares references -> false
//
// --- 5. relative time ---
// 2 minute(s) ago / 4 hour(s) ago / 7 day(s) ago / 2 days ago
//
// --- 6. JSON round trip ---
// string false
// 2024-01-31T10:30:00.000Z

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Month is 0-based (0 = January) but the day of month is not (getDate()).
// Confusing getDay() (weekday, 0 = Sunday) with getDate() (day of month).
// Comparing Date objects with === (always false) - compare getTime() or use < >.
// Mutating a Date that is shared (setDate changes the original) - copy first.
// Adding days by "+ 86_400_000" - wrong on DST change days.
// Assuming new Date("2024-01-31") is local midnight - it is UTC midnight.
// Building display strings by hand instead of using Intl.*.
// Storing local time strings; store ISO/UTC and convert for presentation.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: How do you get the current timestamp?   A: Date.now() (a number, no object).
// Q: How do you compare two dates?   A: Compare getTime() (or use < and >, which
//    coerce to numbers) - === compares object references.
// Q: Local vs UTC methods?   A: the plain get/set methods use the local zone,
//    use UTC; toISOString is always UTC.
// Q: How do you add days?   A: Copy the date and use setDate(getDate() + n).
// Q: How do you format for a locale?   A: Intl.DateTimeFormat(locale, options) or
//    date.toLocaleDateString(locale, options) - never hand-rolled strings.
// Q: Why is the Date API considered painful?   A: Mutable objects, 0-based months,
//    time zones/DST and weak parsing - libraries (date-fns/dayjs) or the upcoming
//    Temporal API exist for that reason.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. daysBetween(a, b) - whole days between two date strings.
// 2. formatDate(value, locale) - medium date format for any locale.
// 3. isValidDate(value) - true only for parseable dates (watch "Invalid Date").

// ------------------------------ ANSWERS ------------------------------------
const daysBetween = (from, to) =>                                   // 1
  Math.round((new Date(to) - new Date(from)) / 86_400_000);
console.log("\npractice 1 ->", daysBetween("2024-01-01", "2024-03-01"));   // -> 60

const formatDate = (value, locale = "en-GB") =>                     // 2
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
console.log("practice 2 ->", formatDate(new Date(2024, 0, 31), "en-GB"),
            "|", formatDate(new Date(2024, 0, 31), "en-US"));
// -> 31 Jan 2024 | Jan 31, 2024

const isValidDate = (value) => {                                    // 3
  const date = new Date(value);
  return !Number.isNaN(date.getTime());                             // "Invalid Date" -> NaN
};
console.log("practice 3 ->", isValidDate("2024-01-31"), "|", isValidDate("2024-13-01"));
// -> true | false

console.log("\n✓ STEP 21 complete — next: node 22_dom_manipulation.js");


