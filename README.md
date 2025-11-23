# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

**❓ Q. What is the difference between var, let, and const in JavaScript?**

_Difficulty: intermediate | Tags: javascript, variables, scoping | Date: 20251123_

<details>
<summary>Show Answer 👀</summary>

In JavaScript, `var`, `let`, and `const` are used to declare variables. The main difference between them is when they are hoisted and whether they can be reassigned.

`var` is function-scoped and can be reassigned.

`let` is block-scoped and cannot be reassigned until the block is exited.

`const` is block-scoped and cannot be reassigned anywhere in the code.


Here is an example to demonstrate this:

```javascript
console.log(var x = 10); // no output
console.log(x); // outputs 10
x = 20; // outputs 20
c
console.log(let y = 10); // no output
console.log(y); // outputs 10
// y = 20; // ReferenceError: Assignment to constant variable.

console.log(const z = 10); // no output
console.log(z); // outputs 10
// z = 20; // TypeError: Assignment to constant variable.
```

</details>
<!--END_SECTION:quiz-->
