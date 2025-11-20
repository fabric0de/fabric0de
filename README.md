# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

**❓ Q. What is the primary function of the `process.stdin` object in Node.js?**

_Difficulty: beginner | Tags: nodejs, javascript, functional-programming | Date: 20251120_

<details>
<summary>Show Answer 👀</summary>

The `process.stdin` object represents the standard input stream for a Node.js process, allowing you to read input from the user or a file.

You can use the `.read()` method to read a chunk of data from the input stream, or the `.pipe()` method to pipe data to another stream.

Here is an example of reading from `process.stdin`:

```javascript
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.question('What is the value of pi?', (answer) => {
  console.log(`You answered: ${answer}`);
});
```

What is the type of the `process.stdin` object?


</details>
<!--END_SECTION:quiz-->
