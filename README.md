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

### ❓ Write a SQL query to retrieve all orders from a database table where the order total is greater than $1000.

</div>

<div align="center">

🗓️ **SQL** • 🟡 **intermediate** • 🏷️ `sql` `database` `query` • 📅 20260504

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> SELECT * FROM orders WHERE total > 1000;

> This query will return all rows from the orders table where the total column value is greater than 1000.

> Note that this assumes that the total column is of a numeric data type.

> If the total column is of a string data type, you may need to modify the query to use a numeric comparison, such as:

> SELECT * FROM orders WHERE STR_TO_DATE(total, '%f') > 1000;

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
