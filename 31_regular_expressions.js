/**
 * ============================================================================
 * STEP 31 / 28+5 · REGULAR EXPRESSIONS       Phase 9 · Extra Concepts You Use
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Creating regexes: /pattern/flags vs new RegExp (dynamic patterns)
 *   2. The flags: g, i, m, s, u - and the stateful trap of /g with .test()
 *   3. The core syntax: classes \d \w \s, quantifiers, anchors, groups
 *   4. The methods: test, match, matchAll, replace/replaceAll, search, split
 *   5. Practical patterns: validation, slugs, extracting data, escaping input
 *   6. Performance and safety pitfalls (greedy matching, user-supplied patterns)
 *
 * RUN IT      node 31_regular_expressions.js
 * PREV STEP   <-  30_recursion_and_memoization.js
 * NEXT STEP   ->  32_strings_and_numbers.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// A regular expression (regex) is a small pattern language for matching text.
//
// CREATING
//   /pattern/flags              -> literal, best when the pattern is fixed
//   new RegExp("pattern", "g")  -> when the pattern comes from a variable/string
//   Escaping: characters like . ( ) [ ] { } + * ? ^ $ | \ have special meaning;
//   to match them literally you must escape them with a backslash.
//
// FLAGS
//   g global (find all, not just the first)   i ignore case
//   m multiline (^ $ match line breaks)       s dot matches newlines
//   u unicode                                 y sticky (advanced)
//
// SYNTAX CHEAT SHEET
//   \d digit   \w letter/digit/_   \s whitespace      (upper case = negation)
//   .  any char (except newline)   [abc] any of a,b,c  [a-z0-9] ranges  [^a] not a
//   * 0+   + 1+   ? 0 or 1   {3} exactly   {2,4} two to four
//   ^ start   $ end   \b word boundary   | alternation (or)
//   ( ) capturing group   (?: ) non-capturing   (?<name> ) named group
//   (?= ) lookahead   (?! ) negative lookahead
//
// METHODS (choose by what you need)
//   re.test(str)      -> boolean (fastest check)
//   str.match(re)     -> array of matches (needs g for all) or match details
//   str.matchAll(re)  -> iterator of matches with groups (re must have g)
//   str.replace(re, replacement) / replaceAll
//   str.search(re)    -> index of first match (-1 if none)
//   str.split(re)     -> split by pattern
//   re.exec(str)      -> manual iteration with lastIndex
//
// THE /g TRAP: a regex with the g flag remembers lastIndex between .test() calls,
//   so repeated .test() on the same string can flip true/false. Reset lastIndex,
//   drop the g flag for test(), or create a new regex each time.
//
// SAFETY: never build a RegExp directly from user input without escaping it -
//   unescaped ( ) * + can throw or match far more than intended.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 31 · REGULAR EXPRESSIONS  (Phase 9 · Extra Concepts You Use)");
console.log("=".repeat(62));

console.log("\n--- 1. test(): does this string match? ---");
const isJsMention = /\bjs\b/i;                          // i = case-insensitive, \b = word boundary
console.log("test ->", isJsMention.test("I love JS"), isJsMention.test("I love PHP"));
// -> test -> true false
console.log("whole word only ->", /\bjava\b/i.test("javascript java"));   // -> false true

console.log("\n--- 2. match() with the g flag: find every occurrence ---");
const logLine = "Order 42 shipped on 2024-01-31, box 7 of 12";
console.log("numbers ->", JSON.stringify(logLine.match(/\d+/g)));
// -> numbers -> ["42","2024","01","31","7","12"]
console.log("words   ->", JSON.stringify(logLine.match(/\b[a-z]+\b/gi).slice(0, 4)));
// -> words   -> ["Order","shipped","on","box"]
console.log("first position ->", logLine.search(/\d/));   // -> 6

console.log("\n--- 3. replace / replaceAll / split ---");
const dirty = "  too    many    spaces  ";
console.log("collapse ->", `[${dirty.replace(/\s+/g, " ").trim()}]`);   // -> [too many spaces]
console.log("censor  ->", "damn this damn thing".replace(/damn/g, "d***"));
// -> censor  -> d*** this d*** thing
console.log("split   ->", "a1b22c333d".split(/\d+/).join(" | "));        // -> a | b | c | d
const slugifyWithRegex = (title) =>
  title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
console.log("slug    ->", slugifyWithRegex("Learn JS (2024 Edition)!"));
// -> slug    -> learn-js-2024-edition

console.log("\n--- 4. groups: capture the parts you care about ---");
const dateMatch = "released on 2024-01-31".match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
console.log("named groups ->", dateMatch.groups.day, dateMatch.groups.month, dateMatch.groups.year);
// -> named groups -> 31 01 2024
console.log("swap     ->", "Lovelace, Ada".replace(/(\w+), (\w+)/, "$2 $1"));
// -> swap     -> Ada Lovelace

for (const match of "a=1,b=2".matchAll(/(\w)=(\d)/g)) {
  console.log("matchAll ->", match[1], "=", match[2]);        // -> a = 1 / b = 2
}

console.log("\n--- 5. greedy vs lazy quantifiers ---");
const html = "<b>bold</b> and <i>italic</i>";
console.log("greedy ->", JSON.stringify(html.match(/<.+>/g)));
// -> greedy -> ["<b>bold</b> and <i>italic</i>"]     (stops at the LAST >)
console.log("lazy   ->", JSON.stringify(html.match(/<.+?>/g)));
// -> lazy   -> ["<b>","</b>","<i>","</i>"]           (stops at the FIRST >)

console.log("\n--- 6. dynamic patterns: escape user input first ---");
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const searchTerm = "c++ (v1)";
const searchRegex = new RegExp(escapeRegExp(searchTerm), "gi");
console.log("escaped pattern ->", searchRegex.source);
// -> escaped pattern -> c\+\+ \(v1\)
console.log("found ->", JSON.stringify("C++ (v1) rocks, so does c++ (v1)".match(searchRegex)));
// -> found -> ["C++ (v1)","c++ (v1)"]

console.log("\n--- 7. the /g + test() state trap ---");
const globalRegex = /a/g;                     // g remembers where it stopped
console.log("first test  ->", globalRegex.test("abc"));   // -> true  (lastIndex = 1)
console.log("second test ->", globalRegex.test("abc"));   // -> false (resumes at index 1!)
globalRegex.lastIndex = 0;                                // reset manually
console.log("after reset ->", globalRegex.test("abc"));   // -> true
const plainRegex = /a/;                                   // no g flag -> stateless
console.log("stateless   ->", plainRegex.test("abc"), plainRegex.test("abc"));  // -> true true

console.log("\n--- 8. validation helpers you will reuse ---");
const validationCases = [
  ["email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, ["ada@mail.dev", "nope@"]],
  ["digitsOnly", /^\d+$/, ["12345", "12a45"]],
  ["hexColor", /^#[0-9a-f]{6}$/i, ["#A1B2C3", "#GGHHII"]],
  ["strongPassword", /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, ["Sup3rSecret", "weak"]],
];
for (const [name, regex, cases] of validationCases) {
  const [valid, invalid] = cases.map((value) => regex.test(value));
  console.log(`  ${name.padEnd(15)} -> valid: ${valid} | invalid: ${invalid}`);
}
//   email           -> valid: true | invalid: false
//   digitsOnly      -> valid: true | invalid: false
//   hexColor        -> valid: true | invalid: false
//   strongPassword  -> valid: true | invalid: false

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1. test() ---
// test -> true false
// whole word only -> false true
//
// --- 2. match / search ---
// numbers -> ["42","2024","01","31","7","12"]
// words   -> ["Order","shipped","on","box"]
// first position -> 6
//
// --- 3. replace / split ---
// collapse -> [too many spaces]
// censor  -> d*** this d*** thing
// split   -> a | b | c | d
// slug    -> learn-js-2024-edition
//
// --- 4. groups ---
// named groups -> 31 01 2024
// swap     -> Ada Lovelace
// matchAll -> a = 1
// matchAll -> b = 2
//
// --- 5. greedy vs lazy ---
// greedy -> ["<b>bold</b> and <i>italic</i>"]
// lazy   -> ["<b>","</b>","<i>","</i>"]
//
// --- 6. dynamic patterns ---
// escaped pattern -> c\+\+ \(v1\)
// found -> ["C++ (v1)","c++ (v1)"]
//
// --- 7. the /g trap ---
// first test  -> true
// second test -> false
// after reset -> true
// stateless   -> true true
//
// --- 8. validators ---
//   email           -> valid: true | invalid: false
//   digitsOnly      -> valid: true | invalid: false
//   hexColor        -> valid: true | invalid: false
//   strongPassword  -> valid: true | invalid: false

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Forgetting the g flag when you want ALL matches (match stops at the first).
// Using the g flag with .test() in a loop - the regex keeps lastIndex, so results
//   alternate true/false. Use a non-global regex for test().
// Not escaping user input before new RegExp(...) - ( ) * + throw or over-match.
// Greedy quantifiers matching far more than intended - add ? for lazy matching.
// Nested quantifiers like (a+)+ on long input -> catastrophic backtracking (hang).
// Trusting regex for parsing HTML/JSON - use the DOM or JSON.parse instead.
// Testing validity with .match instead of .test (match returns null/array, truthy
//   even for an empty match).
// Writing a huge one-line regex with no comments - use named groups and break it up.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: Literal vs constructor regex?   A: /re/flags is compiled once (fixed pattern);
//    new RegExp(string, flags) builds at runtime for dynamic patterns.
// Q: What do the g and i flags do?   A: g = find all matches and remember
//    lastIndex; i = case-insensitive.
// Q: Capturing vs non-capturing vs named groups?   A: ( ) captures for $1/groups,
//    (?: ) groups without capturing, (?<name> ) names the capture for readability.
// Q: What is a lookahead?   A: (?=x) matches a position followed by x without
//    consuming it - great for "digits that are followed by 4 digits".
// Q: How do you safely search for user-typed text?   A: Escape every regex
//    metacharacter first (the escapeRegExp helper above), then new RegExp.
// Q: Why can regexes be slow?   A: Backtracking - the engine retries paths on
//    failure; nested quantifiers can explode exponentially on long input.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Extract all hashtags from "Learning #JavaScript and #regex today".
// 2. Mask a card number so only the last 4 digits stay visible.
// 3. Validate the FORMAT of "2024-01-31" (YYYY-MM-DD).
// 4. Explain why /a/g.test("abc") alternates between true and false.

// ------------------------------ ANSWERS ------------------------------------
const hashtags = "Learning #JavaScript and #regex today".match(/#\w+/g);   // 1
console.log("\npractice 1 ->", JSON.stringify(hashtags));
// -> practice 1 -> ["#JavaScript","#regex"]

const maskCard = (number) => number.replace(/\d(?=\d{4})/g, "*");          // 2
console.log("practice 2 ->", maskCard("4242424242424242"));
// -> practice 2 -> ************4242

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);            // 3
console.log("practice 3 ->", isIsoDate("2024-01-31"), "|", isIsoDate("31-01-2024"));
// -> practice 3 -> true | false    (format only - for real dates use new Date + checks)

console.log("practice 4 -> with /g the regex object keeps lastIndex between calls,"); // 4
console.log("              so the next .test() resumes where the last match ended.\n");

console.log("✓ STEP 31 complete — next: node 32_strings_and_numbers.js");



