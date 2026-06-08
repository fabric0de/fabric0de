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

### ❓ What is the behavior of the 'this' keyword in JavaScript, and how can you control its context?

</div>

<div align="center">

🗓️ **JavaScript** • 🟡 **intermediate** • 🏷️ `javascript` `this keyword` `context` `bind method` • 📅 20260608

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> In JavaScript, the 'this' keyword refers to the context in which a function is being called. When a function is called as a method of an object, 'this' refers to that object.

> For example:

> var obj = { name: 'John', sayHello: function() { console.log(this.name); } };

> obj.sayHello(); // Outputs: John

> However, if a function is called as a standalone function, 'this' refers to the global object (usually the window object in a browser).

> For example:

> function sayHello() { console.log(this.name); }

> sayHello(); // Outputs: undefined

> To fix this, you can use the 'bind' method to bind the function to a specific context.

> For example:

> var boundSayHello = sayHello.bind({ name: 'Jane' });

> boundSayHello(); // Outputs: Jane

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
