#!/usr/bin/env node
/**
 * ============================================================================
 * STEP 00 / 28  ·  ROADMAP OVERVIEW            Phase 0 · Orientation
 * ============================================================================
 *
 * WHAT THIS FILE IS
 *   A runnable map of the whole roadmap. It does not teach syntax — it tells
 *   you *what* to learn, *in which order*, and which file teaches it.
 *
 * HOW TO RUN
 *   node 0_overview.js        (or: npm start)
 *
 * AFTER THIS FILE
 *   Open README.md, then start with step 01 -> node 1_variables.js
 * ============================================================================
 */
"use strict";

const ROADMAP = [
  {
    phase: "Phase 1 · JavaScript Basics",
    goal: "Values, types, logic, loops and functions.",
    steps: [
      ["01", "Variables", "1_variables.js", "let / const / var, block scope, TDZ"],
      ["02", "Data Types", "2_data_types.js", "7 primitives, typeof, truthy/falsy"],
      ["03", "Operators", "3_operators.js", "== vs ===, ?? , ?. , short-circuit"],
      ["04", "Control Flow", "4_control_flow.js", "if / switch / for / while / for..of"],
      ["05", "Functions", "5_functions.js", "declarations, arrows, IIFE, rest, closures"],
    ],
  },
  {
    phase: "Phase 2 · Working with Data",
    goal: "The two data structures every app is built from.",
    steps: [
      ["06", "Arrays", "6_arrays.js", "map / filter / reduce / sort / spread"],
      ["07", "Objects", "7_objects.js", "keys, copies, JSON, optional chaining"],
    ],
  },
  {
    phase: "Phase 3 · Intermediate JavaScript",
    goal: "How JavaScript really thinks. The confidence phase.",
    steps: [
      ["08", "Scope", "8_scope.js", "lexical scope, block scope, shadowing"],
      ["09", "Hoisting", "9_hoisting.js", "var vs let, TDZ, function hoisting"],
      ["10", "Closures", "10_closures.js", "private state, factories, loop pitfall"],
      ["11", "The this Keyword", "11_this_keyword.js", "binding rules, call/apply/bind, arrows"],
      ["12", "Prototypes & Inheritance", "12_prototypes_and_inheritance.js", "prototype chain, class, extends"],
      ["13", "Higher-Order Functions", "13_higher_order_functions.js", "pure fns, compose, once, memoize"],
      ["14", "Destructuring & Spread", "14_destructuring_and_spread_rest.js", "patterns, defaults, copies"],
    ],
  },
  {
    phase: "Phase 4 · Asynchronous JavaScript",
    goal: "Non-blocking code: callbacks -> promises -> async/await.",
    steps: [
      ["15", "Callbacks", "15_callbacks.js", "callback style, error-first, nesting"],
      ["16", "Promises", "16_promises.js", "states, chaining, all / race / allSettled"],
      ["17", "async / await", "17_async_await.js", "try/catch, sequential vs parallel"],
      ["18", "Event Loop & Call Stack", "18_event_loop_and_call_stack.js", "microtasks vs macrotasks"],
    ],
  },
  {
    phase: "Phase 5 · Errors, Built-ins & Browser",
    goal: "Fail gracefully and talk to the browser.",
    steps: [
      ["19", "try / catch / finally", "19_try_catch_finally.js", "throwing, catching, cleanup"],
      ["20", "Custom Errors", "20_custom_error.js", "Error subclasses, instanceof, cause"],
      ["21", "Date & Time", "21_date_and_time.js", "timestamps, ISO, Intl formatting"],
      ["22", "DOM Manipulation", "22_dom_manipulation.js", "select, create, events, delegation"],
      ["23", "Browser APIs", "23_browser_apis.js", "localStorage, fetch, AbortController"],
    ],
  },
  {
    phase: "Phase 6 · Modern JavaScript (ES6+)",
    goal: "The syntax you will see in every modern codebase.",
    steps: [
      ["24", "ES6+ Features", "24_es6_features.js", "arrows, modules, iterators, generators"],
    ],
  },
  {
    phase: "Phase 7 · Advanced Patterns",
    goal: "Patterns that show up in interviews and real code.",
    steps: [
      ["25", "Debounce & Throttle", "25_debounce.js", "timers, cancel / flush, leading edge"],
      ["26", "Currying & Partial Application", "26_currying.js", "closures in action, bind vs curry"],
      ["27", "Set & Map", "27_set_map.js", "unique values, keyed collections, WeakMap"],
    ],
  },
  {
    phase: "Phase 8 · Testing, Tooling & Security",
    goal: "Ship code you trust.",
    steps: [
      ["28", "Testing & Debugging", "28_testing_and_debugging.js", "assertions, table tests, linting"],
    ],
  },
  {
    phase: "Phase 9 · Extra Concepts You Use Daily",
    goal: "The bits real code needs: IIFE, recursion, regex, strings/numbers, patterns.",
    steps: [
      ["29", "IIFE & Module Patterns", "29_iife_and_module_patterns.js", "private scope, revealing module, singleton"],
      ["30", "Recursion & Memoization", "30_recursion_and_memoization.js", "base cases, call stack, caches"],
      ["31", "Regular Expressions", "31_regular_expressions.js", "test/match/replace, groups, validation"],
      ["32", "Strings & Numbers", "32_strings_and_numbers.js", "string API, Math, money in cents, Intl"],
      ["33", "Common Design Patterns", "33_common_design_patterns.js", "factory, observer, strategy, pipeline"],
    ],
  },
];

function heading(text, width = 78) {
  const bar = "-".repeat(width);
  return `\n${bar}\n${text}\n${bar}`;
}

function renderRoadmap() {
  const totalSteps = ROADMAP.reduce((sum, phase) => sum + phase.steps.length, 0);

  console.log("=".repeat(78));
  console.log("  🗺️  JAVASCRIPT ROADMAP — STEP BY STEP");
  console.log(`  ${ROADMAP.length} phases · ${totalSteps} lessons · every lesson is a runnable .js file`);
  console.log("=".repeat(78));

  for (const phase of ROADMAP) {
    console.log(heading(phase.phase));
    console.log(`  Goal: ${phase.goal}\n`);
    for (const [step, title, file, topics] of phase.steps) {
      console.log(`   Step ${step}  ${title}`);
      console.log(`            file   : ${file}`);
      console.log(`            covers : ${topics}\n`);
    }
  }

  console.log("-".repeat(78));
  console.log("  HOW TO USE THIS REPO");
  console.log("-".repeat(78));
  console.log("   1. Read        README.md                  -> the full written roadmap");
  console.log("   2. Run one     node 3_operators.js        -> theory, examples, output");
  console.log("   3. Run all     npm run all                -> pass/fail report for every step");
  console.log("   4. Practice    edit the file, break it, fix it, then do the PRACTICE tasks");
  console.log("   5. Track       tick the checkbox for that step in README.md");
  console.log("");
  console.log("  NEXT ACTION  ->  node 1_variables.js   (Phase 1, step 01)\n");
}

renderRoadmap();
