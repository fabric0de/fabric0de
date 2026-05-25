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

### ❓ What is the purpose of the 'this' keyword in JavaScript and how is it used in a function?

</div>

<div align="center">

🗓️ **JavaScript** • 🟡 **intermediate** • 🏷️ `javascript` `object-oriented-programming` `functions` • 📅 20260525

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> In JavaScript, the 'this' keyword refers to the current execution context of a function. It can be used to access the function's own properties and methods.

> For example:

> function Person(name) {

> this.name = name;

> this.sayHello = function() {

> console.log(`Hello, my name is ${this.name}`);

> }

> }

> const person = new Person('John');

> person.sayHello();

> In this example, 'this' refers to the 'person' object.

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
