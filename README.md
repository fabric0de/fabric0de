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

### ❓ Write a function that takes a list of integers as input and returns the first pair of integers in the list that add up to a given target sum.

</div>

<div align="center">

🗓️ **Problem Solving** • 🟡 **intermediate** • 🏷️ `algorithms` `data structures` `python` • 📅 20260426

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> def two_sum(nums, target):

> for i in range(len(nums)):

> for j in range(i+1, len(nums)):

> if nums[i] + nums[j] == target:

> return [nums[i], nums[j]]

> return None

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
