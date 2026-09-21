/**
 * ============================================================================
 * STEP 12 / 28  ·  PROTOTYPES & INHERITANCE  Phase 3 · Intermediate JavaScript
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What a prototype is and how property lookup walks the prototype chain
 *   2. __proto__ (the link) vs .prototype (the template on functions)
 *   3. Inheritance with constructor functions, then with ES6 classes
 *   4. extends / super, method overriding, instanceof
 *   5. Sharing methods instead of copying them into every object
 *
 * HOW TO READ THIS FILE
 *   Expected output is written INLINE after each statement as "// -> value",
 *   and collected in section 3 so you can verify your run.
 *
 * RUN IT      node 12_prototypes_and_inheritance.js
 * PREV STEP   <-  11_this_keyword.js     NEXT STEP  ->  13_higher_order_functions.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// Every object has a hidden link to another object: its PROTOTYPE. When you read
// a property, JavaScript looks on the object first, then on its prototype, then
// on that prototype's prototype, until it reaches Object.prototype (then null).
// That path is the PROTOTYPE CHAIN.
//
//   obj.__proto__                 -> the link of an instance (also Object.getPrototypeOf)
//   Fn.prototype                  -> the object that `new Fn()` will link instances to
//   obj.hasOwnProperty("key")     -> true only for the object's own properties
//   "key" in obj                  -> true for own AND inherited properties
//
// WHY IT MATTERS
//   Methods live once on the prototype and are shared by every instance (memory),
//   while data lives on the instance. Classes are the friendly syntax for exactly
//   this mechanism - there is no separate class system in JavaScript.
//
// CLASSES (ES6)
//   class A { constructor(){} method(){} }
//   class B extends A { constructor(){ super(args); } method(){ super.method(); } }
//   super() must run before you touch `this` in a subclass constructor.

// ---------------------------------------------------------------------------
// 2 · EXAMPLES  (runnable)
// ---------------------------------------------------------------------------
console.log("STEP 12 · PROTOTYPES & INHERITANCE  (Phase 3)");
console.log("=".repeat(62));

console.log("\n--- 1. the prototype chain, step by step ---");
const animal = { eats: true };
const rabbit = { jumps: true, __proto__: animal };   // link rabbit -> animal
console.log(rabbit.jumps, rabbit.eats, rabbit.missing);  // -> true true undefined
console.log("own keys ->", Object.keys(rabbit).join(","));       // -> own keys -> jumps
console.log("in operator ->", "eats" in rabbit, "| hasOwn ->", Object.hasOwn(rabbit, "eats"));
// -> in operator -> true | hasOwn -> false
console.log("chain end ->", Object.getPrototypeOf(Object.getPrototypeOf(rabbit))); // -> [Object: null prototype] {}

console.log("\n--- 2. shared methods on a prototype (constructor functions) ---");
function Dog(name) {
  this.name = name;                        // per instance data
}
Dog.prototype.speak = function () {         // ONE shared function for all dogs
  return `${this.name} says woof`;
};
const rex = new Dog("Rex");
const milo = new Dog("Milo");
console.log(rex.speak(), "|", milo.speak());        // -> Rex says woof | Milo says woof
console.log("same function ->", rex.speak === milo.speak);   // -> same function -> true
console.log("own vs inherited ->", Object.hasOwn(rex, "name"), Object.hasOwn(rex, "speak"));
// -> own vs inherited -> true false

console.log("\n--- 3. ES6 classes: the same mechanism with nicer syntax ---");
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
  get label() { return `Animal(${this.name})`; }        // getter
  static create(name) { return new Animal(name); }      // static lives on the class
}
class Cat extends Animal {
  constructor(name, lives = 9) {
    super(name);                    // must run BEFORE using `this` in a subclass
    this.lives = lives;
  }
  speak() { return `${super.speak()} - meow`; }          // super = parent method
}
const cat = new Cat("Felix");
console.log("override ->", cat.speak());                 // -> override -> Felix makes a sound - meow
console.log("getter + field ->", cat.label, "| lives:", cat.lives);
// -> getter + field -> Animal(Felix) | lives: 9
console.log("instanceof chain ->", cat instanceof Cat, cat instanceof Animal, cat instanceof Object);
// -> instanceof chain -> true true true
console.log("static method ->", Animal.create("Generic").speak());
// -> static method -> Generic makes a sound

console.log("\n--- 4. methods are shared, the chain is real ---");
console.log("shared method ->", cat.speak === new Cat("Other").speak);        // -> shared method -> true
console.log("prototype link ->", Object.getPrototypeOf(Cat.prototype) === Animal.prototype);
// -> prototype link -> true

console.log("\n--- 5. truly private fields with # (ES2022) ---");
class ClickCounter {
  #count = 0;                       // private field, invisible outside the class
  increment() { this.#count += 1; return this.#count; }
  get count() { return this.#count; }
}
const clicks = new ClickCounter();
clicks.increment();
console.log("private field ->", clicks.count, "| direct access ->", clicks["#count"]);
// -> private field -> 1 | direct access -> undefined

// ---------------------------------------------------------------------------
// 3 · EXPECTED OUTPUT
// ---------------------------------------------------------------------------
// --- 1 --- true true undefined        own keys -> jumps
//           in operator -> true | hasOwn -> false
//           chain end -> [Object: null prototype] {}
// --- 2 --- Rex says woof | Milo says woof      same function -> true
//           own vs inherited -> true false
// --- 3 --- override -> Felix makes a sound - meow
//           getter + field -> Animal(Felix) | lives: 9
//           instanceof chain -> true true true
//           static method -> Generic makes a sound
// --- 4 --- shared method -> true       prototype link -> true
// --- 5 --- private field -> 1 | direct access -> undefined

// ---------------------------------------------------------------------------
// 4 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Adding methods to Object.prototype / Array.prototype (breaks every object).
// Putting data on the prototype instead of the instance (instances share it).
// Using `in` when you meant Object.hasOwn (in walks the whole chain).
// Forgetting super() in a subclass constructor -> ReferenceError on `this`.
// Expecting classes to be hoisted like function declarations (they sit in the TDZ).
// Trying to `new` an arrow function or a method shorthand (only normal functions build).
// Choosing inheritance where composition / plain functions would be simpler.

// ---------------------------------------------------------------------------
// 5 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: What is the prototype chain?   A: The linked list of objects JavaScript walks
//    to find a property: instance -> Class.prototype -> parent prototype ->
//    Object.prototype -> null.
// Q: __proto__ vs prototype?   A: __proto__ is the link of an INSTANCE (or of an
//    object literal); Fn.prototype is the object that `new Fn()` links instances to.
// Q: Are ES6 classes different from prototypes?   A: No - class is syntax sugar
//    over constructor functions + prototypes, plus strictness, no hoisting and
//    private fields.
// Q: How does instanceof work?   A: It walks the object's prototype chain looking
//    for Class.prototype.
// Q: Inheritance vs composition?   A: Inherit for "is-a" with shared behaviour;
//    compose ("has-a") when you want behaviour you can mix and change freely.

// ---------------------------------------------------------------------------
// 6 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Shape -> Circle and Rectangle with area(); Shape gets describe().
// 2. A class with a private #balance and a public deposit()/get balance().
// 3. Write chainDepth(obj) that counts the prototype links up to null.

// ------------------------------ ANSWERS ------------------------------------
class Shape {                                                  // 1
  constructor(name) { this.name = name; }
  area() { throw new Error("area() must be implemented"); }
  describe() { return `${this.name} with area ${this.area().toFixed(2)}`; }
}
class Circle extends Shape {
  constructor(radius) { super("Circle"); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}
class Rectangle extends Shape {
  constructor(width, height) { super("Rectangle"); this.width = width; this.height = height; }
  area() { return this.width * this.height; }
}
console.log("\npractice 1 ->", new Circle(1).describe(), "|", new Rectangle(2, 3).describe());
// -> Circle with area 3.14 | Rectangle with area 6.00

class Account {                                                // 2
  #balance = 0;
  deposit(amount) {
    if (amount <= 0) throw new RangeError("amount must be positive");
    this.#balance += amount;
    return this.#balance;
  }
  get balance() { return this.#balance; }
}
console.log("practice 2 ->", new Account().deposit(25));       // -> 25

const chainDepth = (value) => {                                 // 3
  let depth = 0;
  let current = Object.getPrototypeOf(value);
  while (current) { depth += 1; current = Object.getPrototypeOf(current); }
  return depth;
};
console.log("practice 3 ->", chainDepth(new Circle(1)), chainDepth({}), chainDepth([]));
// -> 3 1 2   (Circle -> Shape -> Object | plain object | Array -> Object)

console.log("\n✓ STEP 12 complete — next: node 13_higher_order_functions.js");


