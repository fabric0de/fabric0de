# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

<div align="center">

### ❓ What is the main difference between async and await in JavaScript?

</div>

<div align="center">

🟡 **intermediate** • 🏷️ `javascript` `async/await` • 📅 20260122

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> async/await allows for non-blocking I/O operations,

> by suspending the execution of the function until the operation is complete.

> This makes the code easier to read and maintain.

> Example:

> async function example() {

> console.log('Starting');

> await new Promise(resolve => setTimeout(resolve, 2000));

> console.log('Finished');

> }

> In contrast, callbacks would require a callback function to be passed to the I/O operation,

> which can make the code harder to read and maintain.

> In summary, async/await is a more modern and efficient way to manage I/O operations in JavaScript.

> It allows for easier error handling and better code organization.

<br>

</details>

<!--END_SECTION:quiz-->
