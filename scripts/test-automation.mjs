import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildDiscordMessage,
  buildIssueBody,
  dateInfoInTimezone,
  validateQuestions,
} from "./study-utils.mjs";

const questions = (
  await Promise.all(
    ["cs-questions.json", "cs-questions-extra.json"].map(async (filename) =>
      JSON.parse(
        await readFile(new URL(`../data/${filename}`, import.meta.url), "utf8"),
      ),
    ),
  )
).flat();
assert.doesNotThrow(() => validateQuestions(questions));
assert.equal(questions.length, 100);

const dateInfo = dateInfoInTimezone(
  "Asia/Seoul",
  new Date("2026-07-26T22:00:00.000Z"),
);
assert.deepEqual(dateInfo, {
  key: "2026-07-27",
  display: "2026-07-27 (월)",
});

const question = questions[0];
const issueBody = buildIssueBody(question, dateInfo);
assert.match(issueBody, /2026-07-27 \(월\)/);
assert.match(issueBody, /answers\/<github-id>\/ANDROID-001\.md/);

const message = buildDiscordMessage(question, "https://github.com/example/issues/1");
assert.match(message, /📚 오늘의 CS 질문/);
assert.match(message, /마감: 오늘 23:59/);
assert.match(message, /https:\/\/github\.com\/example\/issues\/1/);

console.log(`CS 자동화 테스트 통과: 질문 ${questions.length}개`);
