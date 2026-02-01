# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

<div align="center">

### ❓ What is the difference between let and var in JavaScript?$var is function-scoped,
while $let is block-scoped.

</div>

<div align="center">

🟡 **intermediate** • 🏷️ `javascript` `variables` `scoping` • 📅 20260201

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> To determine the scope of a variable,

> you must look at its declared location,

> not its declared keyword.

> This is important for managing

> variable hoisting and variable

> shadowing in JavaScript.

> Note that let and const are block-scoped,

> meaning they only exist within

> the block they are declared in.

> This is in contrast to var,

> which is function-scoped.

> For example:

> var x = 10;

> if (true) {

> let y = 20;

> }

> console.log(x);

> console.log(y);

> // Output: x = 10,

> //         y = 20

> let x = 10;

> if (true) {

> let y = 20;

> }

> console.log(x);

> console.log(y);

> // Output: x = 10,

> //         ReferenceError: y is not defined

> const x = 10;

> if (true) {

> const y = 20;

> }

> console.log(x);

> console.log(y);

> // Output: x = 10,

> //         y is defined and has value 20

<br>

</details>

<!--END_SECTION:quiz-->
