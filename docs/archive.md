# Quiz Archive

Past quizzes are stored here automatically by the daily update script.

## 20260419 - What is the main difference between a thread and a process in the context of concurrency?

theme: **Concurrency** • difficulty: **intermediate** • `concurrency` `multithreading` `processes` `operating-systems`

> A thread is a lightweight process that shares the same memory space with other threads in the same process, whereas a process is a separate entity with its own memory space.

> A thread is typically created and managed by the operating system, whereas a process is created and managed by the operating system.

> Threads can communicate with each other through shared memory, whereas processes communicate through inter-process communication (IPC) mechanisms.

> This difference in memory management and communication leads to different use cases for threads and processes.

> Threads are suitable for I/O-bound tasks, whereas processes are suitable for CPU-bound tasks.

> In summary, threads are lighter-weight and more efficient for concurrent execution, while processes provide stronger isolation and are more suitable for parallel execution.

---

## 20260418 - What is the time complexity of the Bubble Sort algorithm?

theme: **Algorithms** • difficulty: **intermediate** • `sorting` `time complexity` `bubble sort`

> The time complexity of the Bubble Sort algorithm is O(n^2), where n is the number of items being sorted.

> This is because in the worst case, the algorithm has to make n-1 passes through the array, and in each pass, it has to compare each pair of adjacent items.

> This results in a total of n*(n-1)/2 comparisons, which simplifies to O(n^2).

> Bubble Sort is not suitable for large data sets due to its high time complexity.
