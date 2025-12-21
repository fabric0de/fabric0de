# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

<div align="center">

### ❓ What is the difference between let and var in JavaScript?
let is block-scoped, while var is function-scoped.

</div>

<div align="center">

🟡 **intermediate** • 🏷️ `javascript` `variables` `scoping` • 📅 20251221

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> let is used with block-scoped variables, which means they are defined only within the block they are declared in.

> var is used with function-scoped variables, which are defined within the entire function they are declared in.

> This difference in scope can lead to unexpected behavior if not used correctly.

> For example:

> var x = 10;

> if (true) {

> var x = 20;

> }

> console.log(x); // outputs 20

> let y = 30;

> if (true) {

> let y = 40;

> }

> console.log(y); // outputs 40

<br>

</details>

<!--END_SECTION:quiz-->
