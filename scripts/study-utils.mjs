const koreanWeekdays = {
  Sun: "일",
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
};

export function dateInfoInTimezone(timezone, date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    key: `${parts.year}-${parts.month}-${parts.day}`,
    display: `${parts.year}-${parts.month}-${parts.day} (${koreanWeekdays[parts.weekday]})`,
  };
}

export function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("CS 질문 은행이 비어 있습니다.");
  }

  const ids = new Set();
  for (const question of questions) {
    if (
      typeof question.id !== "string" ||
      typeof question.category !== "string" ||
      typeof question.title !== "string" ||
      !Array.isArray(question.checkpoints) ||
      question.checkpoints.length === 0
    ) {
      throw new Error(`잘못된 CS 질문 형식: ${JSON.stringify(question)}`);
    }
    if (ids.has(question.id)) {
      throw new Error(`중복된 CS 질문 ID: ${question.id}`);
    }
    ids.add(question.id);
  }
}

export function buildIssueBody(question, dateInfo) {
  const checkpoints = question.checkpoints
    .map((checkpoint) => `- ${checkpoint}`)
    .join("\n");

  return `<!-- daily-cs-date: ${dateInfo.key} -->
<!-- cs-question-id: ${question.id} -->
# ${question.title}

${dateInfo.display}의 CS 질문입니다.

- 분야: **${question.category}**
- 마감: **오늘 23:59**

## 생각해 볼 내용

${checkpoints}

위 항목은 정답 목록이 아니라 생각의 출발점입니다. 필요한 관점을 자유롭게 추가하세요.

## 제출 방법

1. 자신의 Fork를 최신 상태로 동기화합니다.
2. \`templates/cs-answer.md\`를 복사합니다.
3. \`answers/<github-id>/${question.id}.md\`에 답변을 작성합니다.
4. 공용 저장소의 \`main\` 브랜치로 Pull Request를 만듭니다.
5. 다른 참여자의 답변을 읽고 리뷰나 질문을 남깁니다.
`;
}

export function buildDiscordMessage(question, issueUrl) {
  return `📚 오늘의 CS 질문이 등록되었습니다!
분야: ${question.category}
질문: ${question.title}
마감: 오늘 23:59
제출 방법: Fork 저장소에서 답변 작성 후 PR 생성
Issue: ${issueUrl}`;
}
