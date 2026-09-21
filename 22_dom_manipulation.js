/**
 * ============================================================================
 * STEP 22 / 28  ·  DOM MANIPULATION            Phase 5 · Browser & APIs
 * ============================================================================
 *
 * WHAT YOU WILL LEARN
 *   1. Selecting elements (getElementById, querySelector/All)
 *   2. Reading and writing text, attributes, classes and styles - SAFELY
 *   3. Creating, inserting and removing nodes
 *   4. Events: addEventListener, the event object, bubbling, delegation
 *   5. Performance rules (batch writes) and the XSS trap of innerHTML
 *
 * HOW THIS FILE RUNS IN NODE
 *   There is no `document` in Node, so the file detects the environment:
 *     * browser -> runs the real DOM demo (needs a #todo-list element)
 *     * Node    -> runs the pure helpers that make DOM work safe
 *   At the bottom of the file there is a ready-to-paste demo.html.
 *
 * RUN IT      node 22_dom_manipulation.js
 * PREV STEP   <-  21_date_and_time.js
 * NEXT STEP   ->  23_browser_apis.js
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1 · THEORY  (read this first)
// ---------------------------------------------------------------------------
// The DOM is the tree of nodes the browser builds from your HTML. JavaScript
// reaches it through `document` and element objects.
//
// SELECT (cache the result - selecting inside a loop is a classic perf bug)
//   document.getElementById("app")         -> one element by id
//   document.querySelector(".card")        -> first match of any CSS selector
//   document.querySelectorAll(".card")     -> static NodeList -> Array.from(...)
//   element.closest(".row") | element.matches(sel)
//
// READ / WRITE
//   element.textContent = "hi"      -> plain text, SAFE              <- default
//   element.innerHTML = "<b>hi</b>" -> parses HTML: XSS risk with user data
//   element.dataset.userId          -> reads the data-user-id attribute
//   element.classList.add/remove/toggle/contains("is-open")
//   input.value | checkbox.checked | element.style.width = "10px"
//
// CREATE / INSERT / REMOVE
//   document.createElement("li") | parent.append(child) | parent.prepend(child)
//   node.remove() | node.replaceWith(other)
//   Many rows? Build one escaped HTML string, or use a DocumentFragment.
//
// EVENTS
//   element.addEventListener("click", handler, { once: true, passive: true })
//   event.target        -> what was actually clicked
//   event.currentTarget -> the element the listener is attached to
//   event.preventDefault()    -> stop the browser default (link, form submit)
//   event.stopPropagation()   -> stop bubbling (use sparingly)
//   Events BUBBLE upwards, so ONE listener on a parent can serve every child:
//   that is EVENT DELEGATION - fewer listeners, and future rows work too.
//
// SAFETY & PERFORMANCE
//   Never interpolate untrusted data into innerHTML - escape it or use textContent.
//   Read first, then write (avoids layout thrashing) and prefer CSS classes.

const IS_BROWSER = typeof document !== "undefined";

// ---------------------------------------------------------------------------
// 2a · THE REAL DOM (executed only in a browser, with demo.html below)
// ---------------------------------------------------------------------------
function runBrowserDemo() {
  console.log("STEP 22 · DOM MANIPULATION - browser detected, running the DOM demo");

  const list = document.querySelector("#todo-list");
  if (!list) {
    console.log("add <ul id=\"todo-list\"></ul> to the page to see the demo");
    return;
  }

  const render = (items) => {
    list.textContent = "";                     // clear safely
    for (const todo of items) {
      const item = document.createElement("li");
      item.className = "todo";
      item.dataset.id = String(todo.id);

      const title = document.createElement("span");
      title.textContent = todo.title;          // SAFE: no HTML parsing

      const toggle = document.createElement("button");
      toggle.textContent = todo.done ? "done" : "todo";
      toggle.setAttribute("aria-pressed", String(todo.done));

      item.append(toggle, title);
      list.append(item);
    }
  };
  render([
    { id: 1, title: "Learn the DOM", done: true },
    { id: 2, title: "<script>alert(1)</script>", done: false },   // stays harmless text
  ]);

  // Delegation: ONE listener covers every row, now and in the future.
  list.addEventListener("click", (event) => {
    const row = event.target.closest("li[data-id]");
    if (!row) return;                          // clicked the gap between rows
    row.classList.toggle("is-done");
    console.log("toggled todo", row.dataset.id, "->", row.classList.contains("is-done"));
  });
}

// ---------------------------------------------------------------------------
// 2b · THE LOGIC THAT MAKES DOM WORK SAFE (runs anywhere, including Node)
// ---------------------------------------------------------------------------
function runNodeDemo() {
  console.log("STEP 22 · DOM MANIPULATION - no document here, running the pure helpers");
  console.log("   (open the demo.html at the bottom of this file for the real DOM)");

  console.log("\n--- 1. escaping user data (the guard for any generated HTML) ---");
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  console.log("escaped ->", escapeHtml('<img src=x onerror="alert(1)">'));
  // -> &lt;img src=x onerror=&quot;alert(1)&quot;&gt;

  console.log("\n--- 2. building markup from data (escape every value) ---");
  const todos = [
    { id: 1, title: "Learn DOM", done: true },
    { id: 2, title: "Ship <script>alert(1)</script>", done: false },
  ];
  const renderTodoList = (items) => [
    '<ul class="todo-list">',
    ...items.map((todo) =>
      `  <li class="todo${todo.done ? " is-done" : ""}" data-id="${todo.id}">` +
      `<button aria-pressed="${todo.done}">${todo.done ? "done" : "todo"}</button>` +
      `<span>${escapeHtml(todo.title)}</span></li>`),
    "</ul>",
  ].join("\n");
  console.log("markup:\n" + renderTodoList(todos));

  console.log("\n--- 3. the small pure pieces of delegation logic you can unit test ---");
  const todoIdFromDataset = (dataset) => Number(dataset?.id ?? 0);
  const classNames = (...names) => names.filter(Boolean).join(" ");
  console.log("delegation id ->", todoIdFromDataset({ id: "42" }), "| missing ->", todoIdFromDataset());
  // -> 42 | 0
  console.log("classNames    ->", classNames("btn", "", null, "btn--primary", undefined));
  // -> btn btn--primary
}

// ---------------------------------------------------------------------------
// 3 · RUN THE RIGHT BRANCH
// ---------------------------------------------------------------------------
if (IS_BROWSER) runBrowserDemo();
else runNodeDemo();

// ---------------------------------------------------------------------------
// 4 · EXPECTED OUTPUT (Node branch)
// ---------------------------------------------------------------------------
// STEP 22 · DOM MANIPULATION - no document here, running the pure helpers
//    (open the demo.html at the bottom of this file for the real DOM)
//
// --- 1. escaping user data (the guard for any generated HTML) ---
// escaped -> &lt;img src=x onerror=&quot;alert(1)&quot;&gt;
//
// --- 2. building markup from data (escape every value) ---
// markup:
// <ul class="todo-list">
//   <li class="todo is-done" data-id="1"><button aria-pressed="true">done</button><span>Learn DOM</span></li>
//   <li class="todo" data-id="2"><button aria-pressed="false">todo</button><span>Ship &lt;script&gt;alert(1)&lt;/script&gt;</span></li>
// </ul>
//
// --- 3. the small pure pieces of delegation logic you can unit test ---
// delegation id -> 42 | missing -> 0
// classNames    -> btn btn--primary

// ---------------------------------------------------------------------------
// 5 · COMMON MISTAKES
// ---------------------------------------------------------------------------
// Using innerHTML with user data -> XSS. Use textContent or escape first.
// Attaching a listener to every row (a list of 500 = 500 listeners) - delegate.
// Re-querying the DOM inside a loop instead of caching the element.
// Reading layout properties (offsetHeight) in a loop while writing -> thrashing.
// Relying on an inline style everywhere instead of toggling a CSS class.
// Forgetting event.preventDefault() on a form submit or link click.
// Reading input values before the DOMContentLoaded event (elements not there yet).
// Losing this inside the handler (attach an arrow function or bind it).

// ---------------------------------------------------------------------------
// 6 · INTERVIEW QUESTIONS
// ---------------------------------------------------------------------------
// Q: textContent vs innerHTML?   A: textContent writes/reads plain text (safe,
//    fast); innerHTML parses HTML markup and executes nothing but can execute
//    script via attributes -> XSS risk with untrusted data.
// Q: What is event delegation and why use it?   A: Attach one listener on a
//    common ancestor and use event.target/closest to find the real target -
//    fewer listeners, works for elements added later.
// Q: event.target vs currentTarget?   A: target is where the event started,
//    currentTarget is the element whose listener is running.
// Q: What does bubbling mean?   A: The event travels from the target up through
//    its ancestors, so parents can observe child events (unless stopPropagation).
// Q: How do you add many rows efficiently?   A: Build one HTML string (escaped) or
//    a DocumentFragment and insert it once, instead of appending one by one.
// Q: captute vs bubble?   A: capture listeners run on the way down
//    ({ capture: true }), bubble listeners on the way up (the default).

// ---------------------------------------------------------------------------
// 7 · PRACTICE  (solve first, answers below)
// ---------------------------------------------------------------------------
// 1. Write renderList(items) that returns escaped <li> markup.
// 2. Explain how to handle clicks on 1000 list rows with one listener.
// 3. Why is `list.innerHTML = userInput` dangerous, and what do you write instead?

// ------------------------------ ANSWERS ------------------------------------
const escapeHtmlAnswer = (value) => String(value)                    // 1
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const renderList = (items) =>
  items.map((item) => `<li data-id="${item.id}">${escapeHtmlAnswer(item.label)}</li>`).join("");
console.log("\npractice 1 ->", renderList([{ id: 7, label: "a < b" }]));
// -> <li data-id="7">a &lt; b</li>

console.log("practice 2 -> one listener on the parent <ul>, then read");        // 2
console.log("              event.target.closest('li[data-id]').dataset.id");
console.log("practice 3 -> innerHTML parses the string as HTML, so <img onerror>");  // 3
console.log("              or <script> style payloads can run. Write textContent = value");
console.log("              (or escape every value before building markup).\n");

// ---------------------------------------------------------------------------
// 8 · DEMO HTML - save this as demo.html next to this file, then open it in a
//     browser (or run `npx serve .`). The script tag loads this exact lesson file
//     and the browser branch of it (runBrowserDemo) will take over.
// ---------------------------------------------------------------------------
// <!doctype html>
// <html lang="en">
//   <head>
//     <meta charset="utf-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <title>Step 22 · DOM manipulation</title>
//     <style>
//       body { font-family: system-ui, sans-serif; margin: 2rem; }
//       .todo { display: flex; gap: .5rem; align-items: center; padding: .25rem 0; }
//       .todo.is-done span { text-decoration: line-through; opacity: .6; }
//       .todo-list { list-style: none; padding: 0; max-width: 24rem; }
//       li[data-id] { cursor: pointer; }
//     </style>
//   </head>
//   <body>
//     <h1>Todos</h1>
//     <ul id="todo-list"></ul>
//     <script>
//       // The lesson file detects the browser and runs runBrowserDemo().
//       // (Copy the relevant part of 22_dom_manipulation.js here if you prefer.)
//     </script>
//     <script src="22_dom_manipulation.js"></script>
//   </body>
// </html>

console.log("\n✓ STEP 22 complete — next: node 23_browser_apis.js");
console.log("  (copy the HTML block above into demo.html to see the DOM branch run)");


