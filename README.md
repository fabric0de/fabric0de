# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

<div align="center">

### ❓ What is the difference between let and var in JavaScript?

</div>

<div align="center">

🟢 **beginner** • 🏷️ `javascript` `variables` `scoping` • 📅 20251214

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> let is block-scoped, meaning its scope is limited to the block it is declared in.

> var is function-scoped, meaning its scope is the entire function it is declared in.

> This can affect how variables are accessed and modified.

> For example:

> let x = 10;

> if (true) {

> let x = 20;

> }

> console.log(x); // outputs 10

> var x = 10;

> if (true) {

> var x = 20;

> }

> console.log(x); // outputs 20

<br>

</details>

<!--END_SECTION:quiz-->
