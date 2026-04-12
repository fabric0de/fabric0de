# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

<div align="center">

### ❓ What is the difference between var and let in JavaScript?

</div>

<div align="center">

🟡 **intermediate** • 🏷️ `javascript` `variables` • 📅 20260412

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> var is function-scoped,

> while let is block-scoped.

> This means that var can access variables outside its scope,

> nesting is not allowed for let.

> It's generally recommended to use let instead.

> For example:

> var x = 10;

> if (true) {

> let y = 20;

> }

> console.log(x); // outputs 10

> let x = 10;

> if (true) {

> let y = 20;

> }

> console.log(x); // outputs undefined

<br>

</details>

<!--END_SECTION:quiz-->
