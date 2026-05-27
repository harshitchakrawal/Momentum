const express = require('express');
const prisma = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, avatarUrl: true, githubId: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
