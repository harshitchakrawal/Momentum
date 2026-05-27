const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const router = express.Router();

// Step 1 — redirect user to GitHub login page
router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'read:user user:email repo',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// Step 2 — GitHub redirects back here with a code
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const githubToken = tokenRes.data.access_token;

    // Fetch GitHub user profile
    const profileRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const { id, name, avatar_url, email } = profileRes.data;
    const githubId = String(id);

    // Find or create user in DB
    let user = await prisma.user.findUnique({ where: { githubId } });

    if (user) {
      user = await prisma.user.update({
        where: { githubId },
        data: { githubToken, name, avatarUrl: avatar_url },
      });
    } else {
      user = await prisma.user.create({
        data: { githubId, githubToken, name, avatarUrl: avatar_url, email },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
