/**
 * ============================================================================
 * STEP 11 / 28  ·  THE this KEYWORD        Phase 3 · Intermediate JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. `this` is decided by HOW a function is CALLED, not where it is defined
 *   2. The four regular binding rules: default, implicit, explicit, new
 *   3. Arrow functions have no own `this` - they capture it lexically
 *   4. Losing `this` when a method is detached or passed as a callback
 *   5. The fixes: bind, wrapper functions and class fields
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 11_this_keyword.js
 * PREV STEP   <-  10_closures.js         NEXT STEP  ->  12_prototypes_and_inheritance.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// `this` is a keyword that points at a value chosen at CALL TIME. The call site
// decides it - not the place where the function was written.
//
// THE FOUR BINDING RULES (checked in this order)
//   1. new Fn()          -> `this` is the brand new object
//   2. fn.call/apply/bind -> `this` is what you passed explicitly
//   3. obj.method()      -> `this` is obj (the thing before the dot)
//   4. plain fn()        -> `this` is undefined in strict/module code, or
//                           globalThis in non-strict (sloppy) code
//
// ARROW FUNCTIONS ARE THE EXCEPTION
//   They have NO own `this`. They use the `this` of the scope where they were
//   written (lexical). That is why arrows are perfect for callbacks inside
//   methods, and wrong for methods that need their own object.
//
// LOSING `this`
//   const fn = obj.method;  fn();   -> the call site is plain, so `this` is gone.
//   setTimeout(obj.method, 1000);   -> same problem (this = globalThis/undefined).
//
// FIXES: obj.method.bind(obj), an arrow wrapper (() => obj.method()),
//   a class field arrow (handleClick = () => {...}), or call/apply at the call site.
//
// NOTE: this file runs as a CommonJS module WITHOUT "use strict", so a plain
// call gives globalThis. Inside a class body or an ES module it would be undefined.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 11 · THIS  (Phase 3 · Intermediate JavaScript)");
console.log("=".repeat(62));

console.log("\n--- 1. implicit binding: the object before the dot wins ---");
const user1 = {
  name: "Ada",
  greet() { return `Hi, I'm ${this.name}`; },
};
console.log("method call ->", user1.greet());              // -> method call -> Hi, I'm Ada

const detachedGreet = user1.greet;                          // the call site changes
console.log("detached    ->", detachedGreet());             // -> detached    -> Hi, I'm undefined

console.log("\n--- 2. explicit binding: call, apply and bind ---");
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}
const user2 = { name: "Bob" };
console.log("call  ->", introduce.call(user2, "Hello", "!"));   // -> call  -> Hello, I'm Bob!
console.log("apply ->", introduce.apply(user2, ["Hey", "."]));  // -> apply -> Hey, I'm Bob.
const boundIntroduce = introduce.bind(user2, "Yo");             // bind = permanent + partial
console.log("bind  ->", boundIntroduce("~"));                   // -> bind  -> Yo, I'm Bob~

console.log("\n--- 3. new binding: this = the fresh object ---");
function Person(name) {
  this.name = name;                      // `this` is the object being created
}
Person.prototype.greet = function () { return `Hello ${this.name}`; };
const person = new Person("Cy");
console.log("new ->", person.greet(), "| instanceof Person:", person instanceof Person);
// -> new -> Hello Cy | instanceof Person: true

console.log("\n--- 4. arrow functions capture `this` lexically ---");
const team = {
  name: "Core",
  members: ["Ada", "Bob"],
  listWithRegularCallback() {
    return this.members.map(function (member) {
      return `${this.name}:${member}`;   // NOT the team object
    });
  },
  listWithArrowCallback() {
    return this.members.map((member) => `${this.name}:${member}`);  // this = team
  },
  delayedWithArrow() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(`${this.name} done`), 0);   // arrow keeps team
    });
  },
};
console.log("regular callback ->", team.listWithRegularCallback().join(" "));
// -> regular callback -> undefined:Ada undefined:Bob
console.log("arrow callback   ->", team.listWithArrowCallback().join(" "));
// -> arrow callback   -> Core:Ada Core:Bob

console.log("\n--- 5. the modern fix: class field arrow methods ---");
class Button {
  constructor(label) { this.label = label; }
  handleClick = () => `clicked ${this.label}`;   // always bound to the instance
}
const button = new Button("Save");
const clickHandler = button.handleClick;         // deliberately detached
console.log("detached arrow method ->", clickHandler());   // -> detached arrow method -> clicked Save

console.log("\n--- 6. async check of the timer above ---");
team.delayedWithArrow().then((message) => console.log("timer ->", message));
// -> timer -> Core done     (printed after the synchronous lines)

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- method call -> Hi, I'm Ada
//           detached    -> Hi, I'm undefined
// --- 2 --- call  -> Hello, I'm Bob!     apply -> Hey, I'm Bob.     bind  -> Yo, I'm Bob~
// --- 3 --- new -> Hello Cy | instanceof Person: true
// --- 4 --- regular callback -> undefined:Ada undefined:Bob
//           arrow callback   -> Core:Ada Core:Bob
// --- 5 --- detached arrow method -> clicked Save
// --- 6 --- timer -> Core done

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Passing obj.method as a callback and losing `this` (bind it or wrap it).
// Using an arrow function as an object method or prototype method - no own `this`.
// Using arguments/this tricks instead of a plain parameter (clearer and safer).
// Expecting `this` inside a normal function callback of forEach/map/setTimeout
//   to be the surrounding object - it is not.
// Returning a method that uses `this` from a class field when you wanted a shared
//   prototype method (arrow fields cost one function per instance).
// Mixing strict and sloppy mode assumptions: plain calls give undefined in strict
//   mode but globalThis in sloppy mode.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: How is `this` determined?   A: By the call site: new > explicit bind >
//    object method > default (undefined in strict mode, globalThis otherwise).
// Q: call vs apply vs bind?   A: call/apply invoke immediately (args listed vs
//    args array); bind returns a new permanently bound function.
// Q: Do arrow functions have their own `this`?   A: No - they use the enclosing
//    lexical `this`, which is why they are great for callbacks and bad for methods.
// Q: Why is `this` undefined in a detached method?   A: The call site is a plain
//    call, so rule 4 applies (undefined in strict/module code).
// Q: How do you safely pass a method as a callback?   A: fn.bind(obj), () => obj.fn(),
//    or define the method as a class field arrow.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Create a counter object whose increment() uses `this`, then call it after
//    detaching it - and fix the detached version.
// 2. Explain: obj.method() vs const m = obj.method; m()
// 3. Borrow a method: use Array.prototype.join on an arguments-like object.

// ------------------------------ ANSWERS ------------------------------------
const counterObj = {                                          // 1
  value: 0,
  increment() { this.value += 1; return this.value; },
};
console.log("\npractice 1 ->", counterObj.increment(), counterObj.increment()); // -> 1 2
const detachedIncrement = counterObj.increment.bind(counterObj);   // explicit binding
detachedIncrement();
console.log("practice 1 -> after the bound detached call:", counterObj.value); // -> 3

console.log("practice 2 -> obj.method() sets this = obj (implicit rule).");      // 2
console.log("              After const m = obj.method the call site is plain, so");
console.log("              this = undefined in strict mode / globalThis in sloppy mode.");

const joinArguments = function () {                            // 3
  return Array.prototype.join.call(arguments, "-");
};
console.log("practice 3 ->", joinArguments("a", "b", "c"));    // -> a-b-c

console.log("\n✓ STEP 11 complete — next: node 12_prototypes_and_inheritance.js");

