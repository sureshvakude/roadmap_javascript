/**
 * ============================================================================
 * STEP 05 / 28  ·  FUNCTIONS                       Phase 1 · JavaScript Basics
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. What a function is and why we use them
 *   2. Function declaration / expression / arrow / anonymous / IIFE
 *   3. Parameters vs arguments, return values, default parameters, rest params
 *   4. Closures and higher-order functions in practice
 *   5. The `this` rules inside functions, plus interview classics and mistakes
 *
 * HOW THIS FILE IS ORGANISED
 *   This is the deep-dive step: 13 numbered sections, each following
 *   Definition -> Example -> Output. The expected results are written inline as
 *   "// Output: ..." comments right next to the code that produces them.
 *
 * RUN IT      node 5_functions.js
 * PREV STEP   <-  4_control_flow.js
 * NEXT STEP   ->  6_arrays.js
 * ============================================================================
 */

// # JavaScript Functions: A Deep Dive

// ## ✅ 1. **What is a Function?**
// A block of reusable code that performs a specific task.

// ## ✅ 2. **Types of Functions**
// ### a. **Function Declaration (Statement)**
// Hoisted, can be called before definition.
// Example:
function greet(name) {
  console.log(`Hello, ${name}!`);
}
greet("Alice");

// ### b. **Function Expression**
// Not hoisted, assigned to a variable.
// Example:
const farewell = function(name) {
  console.log(`Goodbye, ${name}!`);
};
farewell("Bob");

// ### c. **Arrow Function (ES6+)**
// Concise syntax, lexical `this` binding.
// Example:
const add = (a, b) => a + b;
console.log(add(5, 3)); // Output: 8

const complexArrowFunction = (x) => {
  const y = x * 2;
  return y + 5;
};
console.log(complexArrowFunction(3)); // Output: 11

// ### d. **Anonymous Function**
// Used as arguments or callbacks.
// Example:
setTimeout(function() {
  console.log("This runs after 1 second.");
}, 1000);

const numbers = [1, 2, 3];
const doubledNumbers = numbers.map(function(num) {
  return num * 2;
});
console.log(doubledNumbers); // Output: [2, 4, 6]

// ### e. **Immediately Invoked Function Expression (IIFE)**
// Executed right after definition, creates a private scope.
// (Full IIFE lesson with the module/singleton patterns: 29_iife_and_module_patterns.js)
// Example:
(function() {
  const secret = "IIFE secret";
  console.log("IIFE executed!", secret);
})();

(function(message) {
  console.log(message);
})("Hello from IIFE with params!");

// ---

// ## ✅ 3. **Basic Syntax**
// // function functionName(parameter1, parameter2) {
// //   // code to be executed
// //   return result; // optional
// // }
// Example:
function createGreeting(name) {
  return `Hello, ${name}!`;
}
const myGreeting = createGreeting("World");
console.log(myGreeting); // Output: Hello, World!

// ---

// ## ✅ 4. **Parameters vs Arguments**
// * **Parameters**: Named variables in the function definition.
// * **Arguments**: Values passed when calling the function.
// Example:
function printDetails(name, age) { // name, age are parameters
  console.log(`Name: ${name}, Age: ${age}`);
}
printDetails("Charlie", 30); // "Charlie", 30 are arguments

// ---

// ## ✅ 5. **Return Keyword**
// * Ends function execution and optionally returns a value.
// * If no `return` statement, or `return` without a value, the function returns `undefined`.
// Example:
function multiply(a, b) {
  return a * b; // returns the product
}
const product = multiply(4, 5);
console.log(product); // Output: 20

function logMessage(message) {
  console.log(message);
  // No explicit return, so it returns undefined
}
const resultOfLog = logMessage("Test message");
console.log(resultOfLog); // Output: undefined (after "Test message" is logged)

// ---

// ## ✅ 6. **Default Parameters (ES6+)**
// Allows parameters to have default values if no argument is passed.
// Example:
function sayHello(name = "Guest") { // "Guest" is the default value for name
  return `Hello, ${name}`;
}
console.log(sayHello("Dave"));   // Output: Hello, Dave
console.log(sayHello());       // Output: Hello, Guest

// ---

// ## ✅ 7. **Rest Parameters (ES6+)**
// Allows an indefinite number of arguments as an array.
// Must be the last parameter.
// Example:
function sum(...numbersRest) { // 'numbersRest' will be an array of all passed arguments
  let total = 0;
  for (const num of numbersRest) {
    total += num;
  }
  return total;
}
console.log(sum(1, 2, 3));       // Output: 6
console.log(sum(10, 20, 30, 40)); // Output: 100
console.log(sum());              // Output: 0

function printUser(id, ...details) { // id is a regular param, details is a rest param
    console.log(`User ID: ${id}`);
    console.log("Details:", details.join(", "));
}
printUser(101, "Admin", "Active", "New York"); // User ID: 101, Details: Admin, Active, New York

// ---

// ## ✅ 8. **Use Cases of Functions**
// * **Code reusability**: Write once, use multiple times.
// * **Modular programming**: Break down complex problems into smaller, manageable pieces.
// * **Abstraction**: Hide complex implementation details.
// * **Event handling**: (e.g., `element.onclick = function() { /* ... */ };`)
// * **Asynchronous operations**: (callbacks, promises, async/await).
// * **Higher-order functions**: Functions that operate on other functions (take them as arguments or return them).
// * **Closures**: Functions that remember their lexical scope.

// Example of a higher-order function:
function operateOnNumber(num, operation) {
    return operation(num);
}
function double(x) {
    return x * 2;
}
console.log(operateOnNumber(5, double)); // Output: 10

// ---

// ## ✅ 9. **Why Use Functions?**
// * **Avoid repetition (DRY - Don't Repeat Yourself principle)**: Reduces redundancy.
// * **Make code readable and maintainable**: Easier to understand and modify.
// * **Enable abstraction and encapsulation**: Group related logic.
// * **Facilitate testing and debugging**: Smaller units are easier to test.
// * **Improve code organization**: Structures the application logically.

// ---

// ## ✅ 10. **Closures (Advanced Use of Functions)**
// A function remembering the variables from its lexical scope even when called outside that scope.
// Example:
function outerFunction(outerVariable) {
  return function innerFunction(innerVariable) {
    console.log("Outer variable:", outerVariable);
    console.log("Inner variable:", innerVariable);
    return outerVariable + innerVariable;
  };
}

const newFunction = outerFunction(10); // newFunction is a closure
const closureResult = newFunction(5);        // It remembers outerVariable = 10
console.log("Closure result:", closureResult); // Output: Outer variable: 10, Inner variable: 5, Closure result: 15

// Another closure example for creating private variables:
function createCounter() {
  let count = 0; // This variable is private to the closure
  return {
    increment: function() { count++; },
    decrement: function() { count--; },
    getCount: function() { return count; }
  };
}
const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // Output: 2
// console.log(counter.count); // This would be undefined or error, count is not directly accessible

// ---
// ## ✅ 11. **Common Interview Topics**
// * **Difference between `function declaration` and `function expression`**: Hoisting, syntax.
// * **Difference between `regular function` and `arrow function`**: `this` binding, `arguments` object, `new` keyword.
// * **Explain closures with example**: Lexical scope, data privacy.
// * **What is hoisting in function declaration?**: Declarations moved to top.
// * **Callback vs Promise (functions as arguments)**: Asynchronous patterns.
// * **Pure vs impure functions**: Side effects, predictability.
// * **First-class functions**: Treating functions as values (assign to vars, pass as args, return from other functions).

// ---

// ## ✅ 12. **Common Mistakes**
// * **Forgetting `return` inside functions**: Leads to `undefined` return value when one is expected.
// * **Misunderstanding arrow function `this`**: Arrow functions inherit `this` from surrounding lexical scope.
// * **Overusing global scope**: Can lead to naming conflicts and harder-to-manage code.
// * **Calling a function expression before it's defined**: Function expressions are not hoisted like declarations.
// * **Modifying parameters directly (if they are objects/arrays)**: Can lead to unexpected side effects if not intended.
// * **Not handling edge cases or invalid inputs**.

// Example of `this` in arrow vs regular function:
const myObject = {
  value: 42,
  getValueRegular: function() {
    console.log("Regular function this.value:", this.value); // `this` refers to myObject
    setTimeout(function() {
      // In a traditional function callback for setTimeout, `this` is not myObject.
      // In non-strict mode, `this` is the global object (window in browsers).
      // In strict mode, `this` is undefined.
      console.log("Regular fn in setTimeout this.value:", this ? this.value : this);
    }, 100);
  },
  getValueArrow: function() {
    console.log("Arrow function outer this.value:", this.value); // `this` refers to myObject
    setTimeout(() => {
      // Arrow functions lexically bind `this`, so it's the same `this` as in getValueArrow.
      console.log("Arrow fn in setTimeout this.value:", this.value);
    }, 100);
  }
};

// myObject.getValueRegular(); // Uncomment to see behavior
// myObject.getValueArrow();   // Uncomment to see behavior

// ---


// ## ✅ 13. **Real-World Example: Event Handler**
// ```html
// <button id="myButton">Click Me</button>
// <script>
//   function handleButtonClick() {
//     alert("Button was clicked!");
//   }
//   const button = document.getElementById("myButton");
//   if (button) {                       // always check the element exists
//     button.addEventListener("click", handleButtonClick);
//   }
// </script>
// ```
// The shorter modern version (optional chaining + arrow function):
//   document.querySelector("#myButton")?.addEventListener("click", () => alert("Clicked"));

// ---------------------------------------------------------------------------
// ✅ STEP 05 COMPLETE
//    Practise: write add(), isEven(), formatName() as a declaration, an
//    expression and an arrow function - notice what changes (hoisting, `this`).
//    NEXT -> node 6_arrays.js   (Phase 2 · Working with Data)
// ---------------------------------------------------------------------------
