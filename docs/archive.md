# Quiz Archive

Past quizzes are stored here automatically by the daily update script.

## 20260421 - What is the purpose of the `window.history.pushState()` method in a web browser?

theme: **Browser APIs** • difficulty: **intermediate** • `javascript` `browser-apis` `web-development`

> The `window.history.pushState()` method is used to update the URL in the browser's address bar without loading a new page. It allows you to manipulate the browser's session history and push a new state onto the browser's history stack. This can be useful for creating a single-page application (SPA) where you want to update the URL without causing a full page reload. The method takes two arguments: the new state object and a title for the new state. The state object can contain any data you want to store, such as the current page's data or the current user's session information.

---

## 20260420 - What is the purpose of the `let` keyword in Rust, and how does it differ from declaring a variable in other languages?

theme: **Rust** • difficulty: **intermediate** • `Rust` `variables` `scope` `memory safety`

> The `let` keyword in Rust is used to declare immutable variables. Unlike other languages, Rust's `let` keyword does not declare a variable that can be reassigned. Instead, it creates a new scope for the variable, which is dropped at the end of the scope. This is in contrast to languages like C or Java, where a variable declared with a keyword like `let` or `var` can be reassigned. Rust's `let` keyword is used to ensure memory safety by preventing mutable state from being introduced accidentally.

---

## 20260419 - What is the main difference between a thread and a process in the context of concurrency?

theme: **Concurrency** • difficulty: **intermediate** • `concurrency` `multithreading` `processes` `memory management`

> A thread is a lightweight process that shares the same memory space with other threads in the same process.

> A process, on the other hand, is a separate entity with its own memory space.

> In a multithreaded program, threads can communicate with each other through shared memory or synchronization primitives.

> Processes, being separate entities, do not share memory and can only communicate through inter-process communication (IPC) mechanisms.

> This difference in memory management and communication makes threads more efficient for concurrent execution of tasks within a process, while processes are better suited for independent tasks that require separate resources.

---

## 20260418 - What is the time complexity of the Bubble Sort algorithm?

theme: **Algorithms** • difficulty: **intermediate** • `sorting` `time complexity` `bubble sort`

> The time complexity of the Bubble Sort algorithm is O(n^2), where n is the number of items being sorted.

> This is because in the worst case, the algorithm has to make n-1 passes through the array, and in each pass, it has to compare each pair of adjacent items.

> This results in a total of n*(n-1)/2 comparisons, which simplifies to O(n^2).

> Bubble Sort is not suitable for large data sets due to its high time complexity.
