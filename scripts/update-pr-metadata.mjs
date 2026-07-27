import { readFile } from "node:fs/promises";
import { createGitHubClient } from "./github-client.mjs";
import {
  buildBody,
  buildTitle,
  findAnswer,
} from "./pr-metadata-utils.mjs";

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) throw new Error("GITHUB_EVENT_PATH가 필요합니다.");

const event = JSON.parse(await readFile(eventPath, "utf8"));
const pullRequest = event.pull_request;
if (!pullRequest) throw new Error("Pull Request 이벤트가 아닙니다.");

const { api, paginate, repository } = createGitHubClient();
const files = await paginate(
  `/repos/${repository}/pulls/${pullRequest.number}/files`,
);
const answer = findAnswer(files);

const issues = await paginate(
  `/repos/${repository}/issues?state=all&labels=daily-cs`,
);
const issue = issues.find((candidate) =>
  candidate.body?.includes(`<!-- cs-question-id: ${answer.questionId} -->`),
);

const title = buildTitle(answer);
const body = buildBody({
  body: pullRequest.body ?? "",
  ...answer,
  issue,
});

await api(`/repos/${repository}/pulls/${pullRequest.number}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, body }),
});

console.log(`PR #${pullRequest.number}의 제목과 제출 정보를 자동 입력했습니다.`);

