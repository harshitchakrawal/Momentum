const express = require('express');
const axios = require('axios');
const prisma = require('../db');
const requireAuth = require('../middleware/auth');
const { getStats } = require('../services/wakatime');

const router = express.Router();

// Step 1 — redirect user to WakaTime OAuth page
// token passed as query param since this is a browser redirect
router.get('/wakatime', (req, res) => {
  const { token } = req.query;
  const params = new URLSearchParams({
    client_id: process.env.WAKATIME_CLIENT_ID,
    response_type: 'code',
    redirect_uri: 'http://localhost:3001/auth/wakatime/callback',
    scope: 'email read_logged_time read_stats read_heartbeats',
    state: token, // pass JWT through OAuth state param
  });
  res.redirect(`https://wakatime.com/oauth/authorize?${params}`);
});

// Step 2 — WakaTime redirects back here with a code
router.get('/wakatime/callback', async (req, res) => {
  const { code, state: jwtToken } = req.query;

  if (!code) return res.status(400).json({ error: 'No code provided' });
  if (!jwtToken) return res.status(400).json({ error: 'No token provided' });

  let userId;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const tokenRes = await axios.post(
      'https://wakatime.com/oauth/token',
      new URLSearchParams({
        client_id: process.env.WAKATIME_CLIENT_ID,
        client_secret: process.env.WAKATIME_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3001/auth/wakatime/callback',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const parsed = new URLSearchParams(tokenRes.data);
    const wakatimeToken = parsed.get('access_token');
    console.log('wakatimeToken:', wakatimeToken);

    await prisma.user.update({
      where: { id: userId },
      data: { wakatimeToken },
    });

    res.redirect('http://localhost:3000/dashboard?wakatime=connected');
  } catch (err) {
    console.error('WakaTime token exchange failed:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Get coding stats
router.get('/wakatime/stats', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user.wakatimeToken) {
      return res.status(400).json({ error: 'WakaTime not connected' });
    }

    const stats = await getStats(user.wakatimeToken);
    res.json(stats);
  } catch (err) {
    console.error('WakaTime stats failed:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
