import fs from "fs";
import path from "path";

const readmePath = path.join(process.cwd(), "README.md");
const quizFile = path.join(process.cwd(), "quiz_master.json");
const usedFile = path.join(process.cwd(), "usedQuiz.json");

const quizzes = JSON.parse(fs.readFileSync(quizFile, "utf-8"));

let used = [];
if (fs.existsSync(usedFile)) {
  used = JSON.parse(fs.readFileSync(usedFile, "utf-8"));
}

const available = quizzes.filter((q) => !used.includes(q.id));

const quiz = available[Math.floor(Math.random() * available.length)];

let readme = fs.readFileSync(readmePath, "utf-8");

const newQuizSection = `<!--START_SECTION:quiz-->

**❓ Q. ${quiz.question}**

<details>
<summary>Show Answer 👀</summary>
<p>${quiz.answer}</p>
</details>
<!--END_SECTION:quiz-->`;

readme = readme.replace(
  /<!--START_SECTION:quiz-->[\s\S]*<!--END_SECTION:quiz-->/,
  newQuizSection,
);

fs.writeFileSync(readmePath, readme);

used.push(quiz.id);
if (used.length > 30) used.shift();
fs.writeFileSync(usedFile, JSON.stringify(used));

console.log(`Updated quiz: ${quiz.question}`);
