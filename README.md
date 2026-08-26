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

### ❓ What is a Content Security Policy (CSP), and how can it be used to prevent cross-site scripting (XSS) attacks?

</div>

<div align="center">

🗓️ **Web Security** • 🟡 **intermediate** • 🏷️ `Web Security` `CSP` `XSS` `Security` • 📅 20260826

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> A Content Security Policy (CSP) is a security feature that helps prevent cross-site scripting (XSS) attacks by specifying which sources of content are allowed to be executed by a web page.

> For example, a CSP might be implemented as follows:

> Content-Security-Policy: default-src 'self';

> This policy specifies that all content should be loaded from the same origin as the web page itself.

> However, this policy can be too restrictive for some web applications, and a more permissive policy might be needed.

> For example:

> Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com;

> This policy allows scripts to be loaded from the same origin as the web page itself, as well as from the specified CDN.

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
