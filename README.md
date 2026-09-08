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

### ❓ What is the Geolocation API and how can it be used to get the user's location?

</div>

<div align="center">

🗓️ **Browser APIs** • 🟡 **intermediate** • 🏷️ `Geolocation API` `Browser APIs` `JavaScript` `Web Development` • 📅 20260908

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> The Geolocation API is used to determine the user's location, and it can be accessed using the `navigator.geolocation` object. The `getCurrentPosition()` method is used to get the user's current location, and the `watchPosition()` method is used to get updates to the user's location.

> Example usage:

> const geolocation = navigator.geolocation;

> geolocation.getCurrentPosition(position => {

> console.log(position.coords.latitude, position.coords.longitude);

> });

> geolocation.watchPosition(position => {

> console.log(position.coords.latitude, position.coords.longitude);

> });

> Tags: [Geolocation API, Browser APIs, JavaScript, Web Development]

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
