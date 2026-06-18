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

### ❓ What is one technique to improve frontend performance, and how can it be implemented?

</div>

<div align="center">

🗓️ **Frontend Performance** • 🟡 **intermediate** • 🏷️ `Frontend Performance` `Lazy Loading` `HTML` `JavaScript` • 📅 20260618

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> To improve frontend performance, you can use lazy loading to load images and other resources only when they are needed. This can be achieved using the 'loading' attribute in HTML. For example:

> <img src='image.jpg' loading='lazy'>

> This attribute tells the browser to load the image only when it comes into view. Additionally, you can also use the 'IntersectionObserver' API to lazy load elements as they come into view.

> const observer = new IntersectionObserver((entries) => {

> entries.forEach((entry) => {

> if (entry.isIntersecting) {

> observer.unobserve(entry.target);

> // Load the element here

> }

> });

> }, {

> rootMargin: '50px',

> });

> observer.observe(document.querySelector('#element'));

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
