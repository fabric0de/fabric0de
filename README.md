# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

**❓ Q. What is the primary purpose of the `async` keyword in JavaScript?**

_Difficulty: intermediate | Tags: javascript, async/await, promises | Date: 20251110_

<details>
<summary>Show Answer 👀</summary>

The `async` keyword in JavaScript is used to declare an asynchronous function, which allows the function to pause its execution until the awaited promises are resolved or rejected. This enables non-blocking I/O operations and improves responsiveness in single-threaded environments.

Example:

```javascript
async function example() {
  console.log('Starting');
  const result = await new Promise((resolve, reject) => setTimeout(() => resolve('Done'), 2000));
  console.log(result);
  console.log('Finished');
}
```

In this example, the `async` function `example` pauses execution until the promise is resolved, then continues with the next line of code, which logs 'Finished' to the console.

Is the primary purpose of `async` to:
- Allow for synchronous code structure
- Enable non-blocking I/O operations
- Improve code readability
- Enhance code performance
- Other (please specify)

</details>
<!--END_SECTION:quiz-->
