# Quiz Archive

Past quizzes are stored here automatically by the daily update script.

## 20260420 - Write a SQL query to retrieve all employees who earn more than the average salary in their department.

theme: **SQL** • difficulty: **intermediate** • `sql` `query` `database` `average`

> SELECT * FROM employees

> WHERE salary > (SELECT AVG(salary) FROM employees GROUP BY department)

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
