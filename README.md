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

### ❓ What is a linked list, and how does it differ from other data structures?

</div>

<div align="center">

🗓️ **Data Structures** • 🟡 **intermediate** • 🏷️ `data structures` `linked lists` `dynamic memory allocation` `insertion/deletion` • 📅 20260510

</div>

<div align="center">

[Browse archive](./docs/archive.md)

</div>

---

<details>
<summary><b>💡 Show Answer</b></summary>

<br>

> A linked list is a data structure that consists of a sequence of nodes, where each node contains a value and a reference to the next node in the sequence. Linked lists are useful for implementing dynamic memory allocation and efficient insertion/deletion of elements. They can be implemented using a variety of techniques, including singly-linked lists, doubly-linked lists, and circularly-linked lists. Linked lists are particularly useful in scenarios where frequent insertion and deletion of elements are required, such as in database indexing and caching systems.

> Here's an example of a basic linked list implementation in Python:

> class Node:

> def __init__(self, value):

> self.value = value

> self.next = None

> class LinkedList:

> def __init__(self):

> self.head = None

> def append(self, value):

> new_node = Node(value)

> if not self.head:

> self.head = new_node

> else:

> current = self.head

> while current.next:

> current = current.next

> current.next = new_node

<br>

</details>

<!--END_SECTION:quiz-->

<sub>See every previous question in the [quiz archive](./docs/archive.md).</sub>
