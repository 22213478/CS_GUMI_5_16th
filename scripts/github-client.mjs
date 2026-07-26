const apiBase = "https://api.github.com";

export function createGitHubClient() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!repository || !token) {
    throw new Error("GITHUB_REPOSITORY와 GITHUB_TOKEN이 필요합니다.");
  }

  async function api(endpoint, options = {}) {
    const response = await fetch(`${apiBase}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "gumi-cs-study",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
    }
    return response.status === 204 ? null : response.json();
  }

  async function paginate(endpoint) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const items = [];
    for (let page = 1; ; page += 1) {
      const batch = await api(`${endpoint}${separator}per_page=100&page=${page}`);
      items.push(...batch);
      if (batch.length < 100) return items;
    }
  }

  async function ensureLabel(name, color, description) {
    try {
      await api(`/repos/${repository}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, description }),
      });
    } catch (error) {
      if (!String(error.message).includes("GitHub API 422")) throw error;
    }
  }

  return { api, paginate, ensureLabel, repository };
}
