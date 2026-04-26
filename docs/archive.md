# Quiz Archive

Past quizzes are stored here automatically by the daily update script.

## 20260426 - Write a function that takes a list of integers as input and returns the first pair of integers in the list that add up to a given target sum.

theme: **Problem Solving** • difficulty: **intermediate** • `algorithms` `data structures` `python`

> def two_sum(nums, target):

> for i in range(len(nums)):

> for j in range(i+1, len(nums)):

> if nums[i] + nums[j] == target:

> return [nums[i], nums[j]]

> return None

---

## 20260425 - What is the primary purpose of a test-driven development (TDD) cycle, and how does it improve the overall quality of the code?

theme: **Testing** • difficulty: **intermediate** • `test-driven development` `TDD` `software testing` `quality assurance`

> The primary purpose of a test-driven development (TDD) cycle is to write automated tests before writing the actual code. This approach ensures that the code is testable, maintainable, and meets the required functionality. By following the TDD cycle, developers can catch bugs early, reduce technical debt, and improve the overall quality of the code. TDD also helps to ensure that the code is modular, reusable, and easy to understand. Additionally, it promotes a culture of testing and continuous improvement within the development team.

> In a TDD cycle, the process typically involves the following steps:

> 1. Write a test for a specific piece of functionality.

> 2. Run the test and see it fail, as the code does not exist yet.

> 3. Write the minimum amount of code to pass the test.

> 4. Refactor the code to make it clean and efficient.

> 5. Repeat the process for the next piece of functionality.

---

## 20260424 - Design a system to handle a high volume of user registrations with unique usernames, while ensuring data consistency and scalability.

theme: **System Design** • difficulty: **intermediate** • `system design` `scalability` `database` `caching` `queue`

> To handle a high volume of user registrations with unique usernames, a suitable system design could be implemented as follows:

> 1. Use a distributed database such as Cassandra or MongoDB to store user data, allowing for horizontal scaling and high availability.

> 2. Implement a username validation mechanism using a Trie data structure to efficiently check for duplicate usernames.

> 3. Utilize a load balancer to distribute incoming registration requests across multiple application servers, ensuring no single point of failure.

> 4. Employ a caching layer, such as Redis, to store frequently accessed user data and reduce database queries.

> 5. Implement a queue-based system, like RabbitMQ, to handle registration requests asynchronously and decouple the registration process from the database.

---

## 20260423 - What are the key benefits of implementing a design system in a software development project?

theme: **Design Systems** • difficulty: **intermediate** • `design-systems` `software-development` `user-experience` `collaboration`

> A design system provides several key benefits, including:

> Improved consistency across the application

> Reduced design debt and maintenance costs

> Increased collaboration among designers and developers

> Faster time-to-market for new features

> Enhanced user experience through standardized design patterns

> Better scalability and maintainability of the application

---

## 20260422 - What is the main difference between a Cross-Site Scripting (XSS) attack and a Cross-Site Request Forgery (CSRF) attack?

theme: **Web Security** • difficulty: **intermediate** • `web-security` `xss` `csrf` `security-threats`

> XSS is an attack where an attacker injects malicious code into a website, which is then executed by the user's browser, whereas CSRF is an attack where an attacker tricks a user into performing an unintended action on a website they are authenticated with.

> In XSS, the attacker's code is executed on the client-side, whereas in CSRF, the attacker's code is executed on the server-side.

> XSS is often used to steal user data, while CSRF is often used to perform actions on behalf of the user without their knowledge.

---

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
