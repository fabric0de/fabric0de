<div align="center">

# JungHyeon

<sub>Reading code, understanding systems, and staying close to the work.</sub>

</div>

> Even if AI writes more code, I still want to stay close to code by reading it, understanding it, and solving the problems hidden inside it.
> If AI helps me see code more clearly, then I still want development to remain part of my everyday life.

<div align="center">

`daily quiz` • `weekday themes` • `archive`

</div>

## 🧩 Daily Development Quiz

One question a day, generated automatically and added to a growing archive.

<!--START_SECTION:quiz-->

<div align="center">

### ❓ What is a sorting algorithm, and how does it work?

</div>

<div align="center">

🗓️ **Algorithms** • 🟡 **intermediate** • 🏷️ `algorithms` `sorting` `data structures` `python` • 📅 20260816

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> A sorting algorithm is a type of algorithm that takes an array of elements as input and rearranges them in a specific order, such as ascending or descending order.

> For example, the bubble sort algorithm works by repeatedly swapping the adjacent elements if they are in the wrong order.

> Here is a simple implementation of the bubble sort algorithm in Python:

> ``

> def bubble_sort(arr):

> n = len(arr)

> for i in range(n):

> for j in range(0, n - i - 1):

> if arr[j] > arr[j + 1]:

> arr[j], arr[j + 1] = arr[j + 1], arr[j]

> return arr

> arr = [64, 34, 25, 12, 22, 11, 90]

> print(bubble_sort(arr))

> ``

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
