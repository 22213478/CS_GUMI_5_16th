# 구미 5반 CS 스터디

Android·Web·기본 CS를 매일 한 문제씩 공부하고, 각자의 Fork에서 답변을 작성한 뒤 이 저장소로 Pull Request를 보내는 스터디입니다.

## 매일 진행 방식

1. 매일 오전 7시(KST)에 `오늘의 CS 질문` Issue가 자동 생성됩니다.
2. Discord `#cs_study` 채널에 질문, 마감 시간, Issue 링크가 전송됩니다.
3. 자신의 Fork를 최신 상태로 동기화하고 답변 브랜치를 만듭니다.
4. `templates/cs-answer.md`를 복사해 `answers/<github-id>/<질문-id>.md`에 작성합니다.
5. 자신의 Fork에 Commit·Push한 뒤 이 저장소의 `main` 브랜치로 Pull Request를 만듭니다.
6. 다른 참여자의 답변을 읽고 리뷰나 질문을 남깁니다.

마감은 매일 23:59입니다. 정답 암기보다 자신의 언어로 설명하고 서로의 관점을 비교하는 것을 목표로 합니다.

## Fork에서 제출하는 방법

최초 한 번:

```bash
git clone https://github.com/<내-github-id>/CS_GUMI_5_16th.git
cd CS_GUMI_5_16th
git remote add upstream https://github.com/YEOUL0520/CS_GUMI_5_16th.git
```

매일 제출할 때:

```bash
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main

git switch -c answer/<내-github-id>/<질문-id>
mkdir -p answers/<내-github-id>
cp templates/cs-answer.md answers/<내-github-id>/<질문-id>.md

git add answers/<내-github-id>/<질문-id>.md
git commit -m "answer: <질문-id> <내-github-id>"
git push -u origin answer/<내-github-id>/<질문-id>
```

GitHub에서 `base repository`는 `YEOUL0520/CS_GUMI_5_16th`, `base`는 `main`으로 선택합니다. PR 제목은 `[CS][질문-id] 이름` 형식을 권장합니다.

## 출제 범위

질문 은행은 다음 세 분야가 번갈아 나오도록 구성되어 있습니다.

- Android: 컴포넌트 생명주기, Coroutine, Room, WorkManager, Jetpack Compose, 성능과 안정성
- Web: HTTP, 인증, 캐시, CORS, 브라우저 렌더링, 웹 보안
- 기본 CS: 운영체제, 네트워크, 데이터베이스, 자료구조, 동시성

질문은 `data/cs-questions.json`에서 관리합니다. 관리자는 PR로 질문을 추가할 수 있습니다.

## Discord와 GitHub 설정

두 종류의 Discord 연동은 서로 다른 용도입니다.

### 1. 매일 질문 커스텀 메시지

저장소 `Settings → Secrets and variables → Actions`에 아래 Repository secret을 만듭니다.

- 이름: `DISCORD_WEBHOOK_URL`
- 값: Discord의 원본 웹훅 URL
- 주의: 이 값에는 `/github`를 붙이지 않습니다.

### 2. PR·리뷰 실시간 알림

저장소 `Settings → Webhooks`의 Discord GitHub 연동은 다음처럼 유지합니다.

- Payload URL: Discord 웹훅 URL 뒤에 `/github` 추가
- Content type: `application/json`
- Secret: 비워 두기
- Events: Pull requests, Issue comments, Pull request reviews, Pull request review comments
- Active: 체크

`Issues` 이벤트는 매일 질문의 기본 알림과 커스텀 알림이 중복될 수 있으므로 선택 해제를 권장합니다. GitHub Webhook의 `Secret` 입력란은 Discord 주소를 넣는 곳이 아닙니다.

## 관리자 운영

- 자동 출제: 매일 07:00 KST
- 수동 실행: `Actions → 오늘의 CS 질문 → Run workflow`
- 질문 검증: 질문 은행이나 자동화가 수정된 PR마다 자동 실행
- 질문을 모두 사용하면 워크플로가 실패해 관리자에게 질문 추가가 필요함을 알립니다.

웹훅 URL은 README, Issue, 코드에 직접 적지 않습니다.
