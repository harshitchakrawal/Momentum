const axios = require('axios');

const githubApi = (token) =>
  axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

async function getRepos(token) {
  const api = githubApi(token);
  const res = await api.get('/user/repos?sort=updated&per_page=10');
  return res.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    language: repo.language,
    updatedAt: repo.updated_at,
    url: repo.html_url,
  }));
}

async function getRecentCommits(token, username) {
  const api = githubApi(token);
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const res = await api.get(
    `/search/commits?q=author:${username}+author-date:>=${since.toISOString().split('T')[0]}&sort=author-date&per_page=20`,
    { headers: { Accept: 'application/vnd.github.cloak-preview+json' } }
  );

  return res.data.items.map((item) => ({
    sha: item.sha,
    message: item.commit.message.split('\n')[0],
    repo: item.repository.name,
    date: item.commit.author.date,
    url: item.html_url,
  }));
}

async function getGithubUsername(token) {
  const api = githubApi(token);
  const res = await api.get('/user');
  return res.data.login;
}

module.exports = { getRepos, getRecentCommits, getGithubUsername };
