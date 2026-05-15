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

### ❓ What is the difference between a clustered and non-clustered index in a database?

</div>

<div align="center">

🗓️ **Databases** • 🟡 **intermediate** • 🏷️ `databases` `sql` `database-design` `indexing` • 📅 20260515

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> What is the difference between a clustered and non-clustered index in a database?

> A clustered index rearranges the physical order of the data in a table, whereas a non-clustered index creates a separate data structure that contains the index keys and their corresponding row locators.

> Clustered indexes can improve query performance by allowing the database to quickly locate specific data, but they can also slow down insert, update, and delete operations.

> Non-clustered indexes, on the other hand, can improve query performance without slowing down insert, update, and delete operations, but they require additional storage space.

> In general, clustered indexes are used for columns that are frequently used in WHERE and JOIN clauses, while non-clustered indexes are used for columns that are frequently used in WHERE and ORDER BY clauses.

> Choosing the right type of index depends on the specific database schema and query patterns.

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
