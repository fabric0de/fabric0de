# Quiz Archive

Past quizzes are stored here automatically by the daily update script.

## 20260502 - What are some common techniques for optimizing database queries to improve application performance?

theme: **Performance Tuning** • difficulty: **intermediate** • `database` `performance` `optimization` `sql`

> Some common techniques for optimizing database queries include:

> 1. Indexing: Creating indexes on columns used in WHERE, JOIN, and ORDER BY clauses can significantly speed up query performance.

> 2. Query optimization: Analyzing and rewriting queries to reduce the number of joins, subqueries, and other operations that can slow down performance.

> 3. Caching: Storing frequently accessed data in memory or a cache layer to reduce the number of database queries.

> 4. Connection pooling: Reusing database connections to reduce the overhead of creating and closing connections.

> 5. Regular maintenance: Regularly updating statistics, rebuilding indexes, and running maintenance tasks to ensure optimal database performance.

> By applying these techniques, developers can significantly improve the performance of their applications and reduce the load on the database.

---

## 20260501 - When designing a RESTful API, what are the key principles that guide the creation of resource identifiers, and how do they impact the overall API's discoverability and usability?

theme: **API Design** • difficulty: **intermediate** • `API Design` `RESTful API` `Resource Identifiers`

> When designing a RESTful API, the key principles that guide the creation of resource identifiers are:

> 1. Use nouns to identify resources, rather than verbs.

> 2. Use a consistent naming convention throughout the API.

> 3. Use a hierarchical structure to organize resources.

> 4. Use a unique identifier for each resource.

> These principles help to improve the discoverability and usability of the API by making it easier for clients to understand the structure and relationships between resources.

---

## 20260430 - What is the primary difference between a mobile-first and a desktop-first approach in responsive design?

theme: **Responsive Design** • difficulty: **intermediate** • `Responsive Design` `Mobile-First` `Desktop-First` `Web Development`

> What is the primary difference between a mobile-first and a desktop-first approach in responsive design?

> In a mobile-first approach, the layout and design are created for smaller screens first, and then scaled up for larger screens.

> In a desktop-first approach, the layout and design are created for larger screens first, and then scaled down for smaller screens.

> Mobile-first is generally considered a more efficient and effective approach, as it allows for a more streamlined and intuitive user experience on smaller screens.

> This approach also helps to reduce the amount of code and complexity, making it easier to maintain and update the design.

> Desktop-first, on the other hand, can result in a more complex and bloated design, with more code and complexity.

---

## 20260429 - What is the main difference between a cache hit and a cache miss in the context of caching?

theme: **Caching** • difficulty: **intermediate** • `caching` `performance` `efficiency`

> What is the main difference between a cache hit and a cache miss in the context of caching?

> A cache hit occurs when the requested data is already present in the cache.

> A cache miss occurs when the requested data is not present in the cache.

> In a cache hit, the data is retrieved from the cache, whereas in a cache miss, the data is retrieved from the original source.

> This difference affects the performance and efficiency of the caching system.

---

## 20260428 - What is the difference between a static and dynamic website, and how does it affect the user experience?

theme: **Web** • difficulty: **intermediate** • `web development` `static vs dynamic` `user experience`

> A static website is a website that is built using pre-existing HTML files and does not change unless manually updated by the developer.

> A dynamic website, on the other hand, uses server-side scripting to generate content and can change in real-time.

> This difference affects the user experience in that static websites are typically faster and more secure, but dynamic websites offer more interactive and personalized experiences.

> For example, a static website might be a simple blog with pre-written posts, while a dynamic website might be an e-commerce platform that updates prices and inventory in real-time.

> In terms of development, static websites are often built using HTML, CSS, and JavaScript, while dynamic websites use server-side languages like PHP, Ruby, or Python, along with a database to store and retrieve data.

> Overall, the choice between a static and dynamic website depends on the specific needs and goals of the project.

---

## 20260427 - How do you create a dictionary in Python and then access its elements?

theme: **Python** • difficulty: **intermediate** • `python` `data-structures` `dictionary`

> You can create a dictionary in Python using the following syntax:

> `my_dict = {'key1': 'value1', 'key2': 'value2'}`

> To access the elements of a dictionary, you can use the following methods:

> * `my_dict['key1']` to access a specific key-value pair

> * `my_dict.get('key1')` to access a specific key-value pair and return `None` if the key does not exist

> * `for key, value in my_dict.items():` to iterate over the key-value pairs

> * `for key in my_dict.keys():` to iterate over the keys

> * `for value in my_dict.values():` to iterate over the values

> Note: Dictionary keys must be immutable types, such as strings or integers.

---

## 20260426 - What is the main advantage of using a linked list over an array in terms of memory usage?

theme: **Data Structures** • difficulty: **intermediate** • `linked lists` `arrays` `memory efficiency` `data structures`

> A linked list is more memory-efficient than an array because it only allocates memory for the nodes that are actually needed, whereas an array allocates a contiguous block of memory regardless of how much of it is used.

> This is particularly useful when dealing with large datasets where the amount of data is not known in advance.

> For example, in a database, a linked list can be used to store a large number of records, each with a variable amount of data, without wasting memory on unused space.

> In contrast, an array would require a fixed amount of memory to be allocated upfront, which can lead to memory waste if the data is not fully utilized.

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
