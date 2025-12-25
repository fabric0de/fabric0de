# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

<div align="center">

### ❓ What is the main difference between async/await and callback functions in Node.js?

</div>

<div align="center">

🟡 **intermediate** • 🏷️ `async/await` `javascript` `node.js` `promises` • 📅 20251225

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> Async/await is a syntax sugar on top of promises.

> It allows writing asynchronous code that looks and feels synchronous.

> Callback functions, on the other hand, are a way to pass a function as an argument to another function.

> They can be used to handle asynchronous operations but require more boilerplate code.

> Here's an example of a simple async function using async/await:

> async function example() {

> try {

> const result = await somePromise;

> } catch (error) {

> console.error(error);

> }

> }

> And here's an example of a simple callback function:

> function example(callback) {

> somePromise((error, result) => {

> if (error) {

> callback(error);

> } else {

> callback(null, result);

> }

> });

> }

<br>

</details>

<!--END_SECTION:quiz-->
