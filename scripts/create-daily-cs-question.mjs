import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createGitHubClient } from "./github-client.mjs";
import {
  buildDiscordMessage,
  buildIssueBody,
  dateInfoInTimezone,
  validateQuestions,
} from "./study-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const timezone = "Asia/Seoul";
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
  throw new Error("Actions secret DISCORD_WEBHOOK_URL이 필요합니다.");
}
if (/\/github\/?(?:\?.*)?$/.test(webhookUrl)) {
  throw new Error("DISCORD_WEBHOOK_URL에는 /github를 붙이지 않은 원본 Discord 웹훅 URL을 사용하세요.");
}

const questions = JSON.parse(
  await readFile(path.join(root, "data", "cs-questions.json"), "utf8"),
);
validateQuestions(questions);

const { api, paginate, ensureLabel, repository } = createGitHubClient();
const dateInfo = dateInfoInTimezone(timezone);

await ensureLabel("daily-cs", "1D76DB", "매일 자동으로 출제되는 CS 질문");
await ensureLabel("discord-notified", "0E8A16", "Discord 커스텀 알림 전송 완료");

const issues = await paginate(
  `/repos/${repository}/issues?state=all&labels=daily-cs`,
);
const todayMarker = `<!-- daily-cs-date: ${dateInfo.key} -->`;
let issue = issues.find((candidate) => candidate.body?.includes(todayMarker));

if (!issue) {
  const askedIds = new Set(
    issues
      .map((candidate) =>
        candidate.body?.match(/<!-- cs-question-id: ([A-Z0-9-]+) -->/)?.[1],
      )
      .filter(Boolean),
  );
  const question = questions.find((candidate) => !askedIds.has(candidate.id));

  if (!question) {
    throw new Error("모든 CS 질문을 사용했습니다. data/cs-questions.json에 질문을 추가하세요.");
  }

  const categoryLabel = `분야:${question.category}`;
  await ensureLabel(categoryLabel, "D4C5F9", "CS 질문 분야");

  issue = await api(`/repos/${repository}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `[오늘의 CS][${question.category}] ${question.title}`,
      body: buildIssueBody(question, dateInfo),
      labels: ["daily-cs", categoryLabel],
    }),
  });
}

const labels = issue.labels.map((label) => label.name ?? label);
if (labels.includes("discord-notified")) {
  console.log(`오늘의 CS 질문이 이미 생성되고 알림도 전송됐습니다: ${issue.html_url}`);
  process.exit(0);
}

const questionId = issue.body.match(/<!-- cs-question-id: ([A-Z0-9-]+) -->/)?.[1];
const question = questions.find((candidate) => candidate.id === questionId);
if (!question) {
  throw new Error(`Issue #${issue.number}의 질문 ID를 질문 은행에서 찾지 못했습니다.`);
}

const discordResponse = await fetch(`${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}wait=true`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "구미 5반 CS 스터디",
    content: buildDiscordMessage(question, issue.html_url),
    allowed_mentions: { parse: [] },
  }),
});

if (!discordResponse.ok) {
  throw new Error(`Discord 웹훅 ${discordResponse.status}: ${await discordResponse.text()}`);
}

await api(`/repos/${repository}/issues/${issue.number}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ labels: [...labels, "discord-notified"] }),
});

console.log(`오늘의 CS 질문과 Discord 알림을 생성했습니다: ${issue.html_url}`);
