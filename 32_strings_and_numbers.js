/**
 * ============================================================================
 * STEP 32 / 28+5 · STRINGS & NUMBERS          Phase 9 · Extra Concepts You Use
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. The String API you use every day (immutable strings, methods that copy)
 *   2. Parsing: Number() vs parseInt/parseFloat, and when each is right
 *   3. Math: rounding (floor/ceil/round/trunc), clamping, random integers
 *   4. Money-safe arithmetic (work in cents, avoid float surprises)
 *   5. Formatting for humans with Intl.NumberFormat (currency, percent, compact)
 *
 * RUN IT      node 32_strings_and_numbers.js
 * PREV STEP   <-  31_regular_expressions.js
 * NEXT STEP   ->  33_common_design_patterns.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// STRINGS ARE IMMUTABLE: every method returns a NEW string. "s.toUpperCase()"
// never changes s. Chain methods freely - each step is a fresh value.
//
//   read     : length, at(i) / charAt(i), includes, indexOf, startsWith, endsWith
//   cut      : slice(start, end) (negatives allowed) | substring | split
//   change   : toUpperCase/LowerCase, trim/trimStart/trimEnd,
//              replace / replaceAll (regex or string), padStart / padEnd, repeat
//   compare  : localeCompare (alphabetical, locale aware) | === | < >
//
// NUMBERS
//   Number("42")   -> strict: the WHOLE string must be numeric ("42px" -> NaN)
//   parseInt("42px", 10) -> reads the numeric prefix ("42px" -> 42)
//   parseFloat("3.14abc") -> 3.14. ALWAYS pass the radix to parseInt.
//   Number.isInteger / isSafeInteger / Number.EPSILON
//
// MATH
//   Math.floor(2.9)=2  Math.ceil(2.1)=3  Math.round(2.5)=3  Math.trunc(-2.9)=-2
//   Math.abs, Math.min/max (spread for arrays), Math.pow / **, Math.sqrt
//   Math.random() -> [0, 1); randomInt(min, max) = floor(random * (max-min+1)) + min
//   clamp(value, lo, hi) = Math.min(hi, Math.max(lo, value))
//
// FLOAT GOTCHAS (recap of step 02)
//   0.1 + 0.2 !== 0.3 -> for money, store integer CENTS and divide for display,
//   or round explicitly with toFixed/Intl (never compare raw floats).
//
// FORMATTING
//   value.toFixed(2) -> a STRING, rounds half away from zero-ish
//   Intl.NumberFormat(locale, { style, currency, notation, unit }) -> locale aware

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 32 · STRINGS & NUMBERS  (Phase 9 · Extra Concepts You Use)");
console.log("=".repeat(62));

console.log("\n--- 1. the string toolkit ---");
const sentence = "  JavaScript is fun  ";
console.log("trim      ->", `[${sentence.trim()}]`);                 // -> [JavaScript is fun]
console.log("slice     ->", sentence.trim().slice(0, 10));           // -> JavaScript
console.log("at()      ->", sentence.trim().at(-1), "| first:", sentence.trim().at(0)); // -> n | first: J
console.log("includes  ->", sentence.includes("fun"));            // -> true
console.log("indexOf   ->", sentence.trim().indexOf("is"));       // -> 11
console.log("starts/ends->", "invoice-2024.pdf".startsWith("invoice-"), "invoice-2024.pdf".endsWith(".pdf")); // -> true true
console.log("case      ->", sentence.trim().toUpperCase(), "/", sentence.trim().toLowerCase().slice(0, 4)); // -> JAVASCRIPT IS FUN / java
console.log("replace   ->", "a-b-c".replace("-", "+"), "| all:", "a-b-c".replaceAll("-", "+"));
// -> replace   -> a+b-c | all: a+b+c
console.log("split     ->", "ada,bob,cy".split(",").reverse().join(">")); // -> cy>bob>ada
console.log("pad       ->", String(7).padStart(3, "0"), "|", "hi".padEnd(5, "."));    // -> 007 | hi...
console.log("repeat    ->", "ab".repeat(3));                    // -> ababab
console.log("compare   ->", "apple".localeCompare("banana") < 0);   // -> true (alphabetical)

console.log("\n--- 2. building strings from parts ---");
const user = { first: "Ada", last: "Lovelace", score: 87.5 };
const initials = `${user.first[0]}${user.last[0]}`.toUpperCase();
console.log("template  ->", `${initials} scored ${user.score}`);          // -> AL scored 87.5
console.log("joined   ->", [user.first, user.last].join(" "), "| padded:", String(user.score).padEnd(6, "0"));
// -> joined   -> Ada Lovelace | padded: 87.500

console.log("\n--- 3. parsing strings into numbers ---");
console.log("Number    ->", Number("42"), Number("42px"), Number(""));       // -> 42 NaN 0
console.log("parseInt  ->", parseInt("42px", 10), parseInt("0x1f", 16));   // -> 42 31
console.log("parseFloat->", parseFloat("3.14abc"));                          // -> 3.14
console.log("safe parse->", Number.isNaN(Number("abc")) ? "NaN detected" : "parsed"); // -> NaN detected
const toIntOr = (value, fallback = 0) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};
console.log("toIntOr   ->", toIntOr("12", 1), toIntOr("nope", 1));         // -> 12 1

console.log("\n--- 4. Math: rounding, clamping, ranges ---");
const diceValues = [3, 1, 4, 1, 5];
console.log("floor/ceil/round/trunc ->", Math.floor(2.7), Math.ceil(2.1), Math.round(2.5), Math.trunc(-2.7));
// -> floor/ceil/round/trunc -> 2 3 3 -2
console.log("abs/pow/sqrt   ->", Math.abs(-4), 2 ** 10, Math.sqrt(81));          // -> 4 1024 9
console.log("min/max        ->", Math.min(...diceValues), Math.max(...diceValues)); // -> 1 5
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
console.log("clamp          ->", clamp(150, 0, 100), clamp(-20, 0, 100), clamp(42, 0, 100));
// -> clamp          -> 100 0 42
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const dice = Array.from({ length: 6 }, () => randomInt(1, 6));
console.log("randomInt      -> always in 1..6:", dice.every((n) => n >= 1 && n <= 6));   // -> true

console.log("\n--- 5. money: do the maths in cents, not floats ---");
const price = 19.99;
const quantity = 3;
console.log("float surprise ->", price * quantity);
// -> 59.97 here, but 0.1 + 0.2 -> 0.30000000000000004: never trust float money
const centsTotal = Math.round(price * 100) * quantity;                 // 1999 * 3
console.log("in cents       ->", centsTotal);                          // -> 5997
console.log("display        ->", (centsTotal / 100).toFixed(2));       // -> "59.97"
console.log("compare safely ->", Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON * 10);  // -> true
console.log("integer checks ->", Number.isInteger(7), Number.isSafeInteger(2 ** 53));  // -> true false

console.log("\n--- 6. Intl.NumberFormat: display like a human ---");
const amount = 1234567.891;
console.log("currency ->", new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount));
// -> currency -> $1,234,567.89
console.log("compact  ->", new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(amount));
// -> compact  -> 1.2M
console.log("percent  ->", new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(0.875));
// -> percent  -> 87.5%
console.log("units    ->", new Intl.NumberFormat("en", { style: "unit", unit: "kilometer-per-hour", maximumFractionDigits: 0 }).format(90));
// -> units    -> 90 km/h
console.log("toFixed  ->", amount.toFixed(1), "| rounded:", Math.round(amount));
// -> toFixed  -> 1234567.9 | rounded: 1234568

console.log("\n--- 7. little helpers you will reuse ---");
const formatBytes = (bytes, decimals = 1) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / 1024 ** index).toFixed(decimals))} ${units[index]}`;
};
console.log("formatBytes  ->", formatBytes(1536), "|", formatBytes(1048576), "|", formatBytes(0));
// -> formatBytes  -> 1.5 KB | 1 MB | 0 B
const toTitleCase = (text) => text.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
console.log("toTitleCase  ->", toTitleCase("the quick brown fox"));   // -> The Quick Brown Fox

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. the string toolkit ---
// trim      -> [JavaScript is fun]
// slice     -> JavaScript
// at()      -> n | first: J
// includes  -> true
// indexOf   -> 11
// starts/ends-> true true
// case      -> JAVASCRIPT IS FUN / java
// replace   -> a+b-c | all: a+b+c
// split     -> cy>bob>ada
// pad       -> 007 | hi...
// repeat    -> ababab
// compare   -> true
//
// --- 2. building strings ---
// template  -> AL scored 87.5
// joined   -> Ada Lovelace | padded: 87.500
//
// --- 3. parsing ---
// Number    -> 42 NaN 0
// parseInt  -> 42 31
// parseFloat-> 3.14
// safe parse-> NaN detected
// toIntOr   -> 12 1
//
// --- 4. Math ---
// floor/ceil/round/trunc -> 2 3 3 -2
// abs/pow/sqrt   -> 4 1024 9
// min/max        -> 1 5
// clamp          -> 100 0 42
// randomInt      -> always in 1..6: true
//
// --- 5. money in cents ---
// float surprise -> 59.97   (but 0.1 + 0.2 -> 0.30000000000000004)
// in cents       -> 5997
// display        -> 59.97
// compare safely -> true
// integer checks -> true false
//
// --- 6. Intl formatting ---
// currency -> $1,234,567.89
// compact  -> 1.2M
// percent  -> 87.5%
// units    -> 90 km/h
// toFixed  -> 1234567.9 | rounded: 1234568
//
// --- 7. helpers ---
// formatBytes  -> 1.5 KB | 1 MB | 0 B
// toTitleCase  -> The Quick Brown Fox

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Thinking strings are mutable - every method returns a NEW string.
// slice vs substring: slice accepts negatives, substring clamps and swaps.
// Forgetting the radix: parseInt("08") without 10 is a legacy octal trap.
// Number("") === 0 and Number("  12 ") === 12 - empty/blank input slips through.
// Comparing floats directly or displaying raw float maths for money.
// toFixed returns a STRING: (0.1 + 0.2).toFixed(2) === "0.30", not a number.
// Using Math.random for security (tokens, passwords) - use crypto.randomUUID()
//   or crypto.getRandomValues instead.
// Hand-rolling number formatting instead of Intl (wrong separators everywhere).

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Are JavaScript strings mutable?   A: No - every "modification" creates a new
//    string; that is why you assign the result (s = s.trim()).
// Q: Number() vs parseInt()?   A: Number parses the whole string and handles
//    decimals/hex; parseInt reads the leading integer and needs a radix.
// Q: How do you avoid float errors for money?   A: Store integer cents, do maths
//    in integers, format for display at the edge (or use a decimal library).
// Q: How does Math.random work and is it secure?   A: Pseudo-random [0,1), NOT
//    cryptographically secure - use the crypto API for tokens.
// Q: slice vs substring vs substr?   A: slice takes (start, end) with negatives;
//    substring clamps and swaps arguments; substr is deprecated legacy.
// Q: Why Intl.NumberFormat over toFixed?   A: It is locale aware (separators,
//    currency symbols, units) and reusable - toFixed only fixes decimals.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. formatMoney(cents, currency) - integer cents in, localized currency out.
// 2. initials("ada   lovelace") -> "AL" (handle messy spacing).
// 3. randomId(8) - uppercase letters + digits, validated by a regex.
// 4. Why is 19.99 * 3 risky but 1999 * 3 safe?

// ------------------------------ ANSWERS ------------------------------------
const formatMoney = (cents, currency = "USD", locale = "en-US") =>            // 1
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
console.log("\npractice 1 ->", formatMoney(5997), "|", formatMoney(999, "EUR", "de-DE"));
// -> practice 1 -> $59.97 | 9,99 €    (locales format differently)

const nameInitials = (fullName) =>                                            // 2
  fullName.trim().split(/\s+/).map((part) => part[0].toUpperCase()).join("");
console.log("practice 2 ->", nameInitials("ada   lovelace"), "|", nameInitials("guido van rossum"));
// -> practice 2 -> AL | GVR

const ID_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // no lookalikes: 0/O, 1/I  // 3
const randomId = (length = 8) =>
  Array.from({ length }, () => ID_CHARACTERS[Math.floor(Math.random() * ID_CHARACTERS.length)]).join("");
console.log("practice 3 ->", randomId(), "| looks valid:", /^[A-Z2-9]{8}$/.test(randomId()));
// -> practice 3 -> X7KQ2M9A | looks valid: true     (random values)

console.log("practice 4 -> floats cannot store 0.1 exactly, but integers are exact:");  // 4
console.log("              1999 * 3 === 5997 always; 19.99 * 3 can drift.\n");

console.log("✓ STEP 32 complete — next: node 33_common_design_patterns.js");



