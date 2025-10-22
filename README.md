# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

**❓ Q. How can you ensure that an element's width and height are scaled proportionally when the aspect ratio is maintained, while also ensuring it fits within a specified container?**

_Difficulty: intermediate | Tags: CSS, aspect ratio, responsive design | Date: 20251022_

<details>
<summary>Show Answer 👀</summary>

To maintain an element’s width and height in proportion, you can use CSS properties like `object-fit: contain;` or `width: 100%; height: auto;`. This ensures that the image scales without distorting its aspect ratio. Additionally, to ensure it fits within a specified container, set both `max-width: 100%` and `max-height: 100%`, but using just `height: auto` and `width: 100%` can also achieve this when used in combination with the parent container's defined size or flexbox properties. Here’s an example:

```css
.element {
  width: 100%;
  height: auto;
  max-width: 500px;
  max-height: 300px;
}
```

This will scale the element to fit within a 500x300px container without distorting its aspect ratio.

</details>
<!--END_SECTION:quiz-->
