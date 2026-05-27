const express = require('express');
const prisma = require('../db');
const requireAuth = require('../middleware/auth');
const { getRepos, getRecentCommits, getGithubUsername } = require('../services/github');

const router = express.Router();

router.get('/repos', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const repos = await getRepos(user.githubToken);
    res.json(repos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/commits', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const username = await getGithubUsername(user.githubToken);
    const commits = await getRecentCommits(user.githubToken, username);
    res.json(commits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
