# 👋 Hello! I'm JungHyeon

Welcome! Every day you'll see a **new development quiz** here to challenge your skills.
Check back daily to test yourself and learn something new!

## 🧩 Today's Development Quiz

This quiz is generated daily by AI

<!--START_SECTION:quiz-->

**❓ Q. What is the difference between a shallow copy and a deep copy in Python?**

_Difficulty: intermediate | Tags: Python, Data Structures | Date: 20251024_

<details>
<summary>Show Answer 👀</summary>

In Python, a shallow copy of an object creates a new composite object but inserts references to the objects found in the original. A deep copy, on the other hand, recursively constructs a new compound object and then, for each contained object, inserts a copy rather than a reference. For example:

```python
copy.copy(source)  # Performs shallow copy
copy.deepcopy(source)  # Performs deep copy```
When dealing with mutable objects like lists or dictionaries, using `deepcopy` is necessary to ensure that changes in the copied object do not affect the original.

</details>
<!--END_SECTION:quiz-->
