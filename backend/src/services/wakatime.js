const axios = require('axios');

const wakatimeApi = (token) =>
  axios.create({
    baseURL: 'https://wakatime.com/api/v1',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

async function getSummary(token) {
  const api = wakatimeApi(token);
  const res = await api.get('/users/current/summaries?range=last_7_days');
  return res.data;
}

async function getStats(token) {
  const api = wakatimeApi(token);
  const res = await api.get('/users/current/stats/last_7_days');
  return {
    totalSeconds: res.data.data.total_seconds,
    dailyAverage: res.data.data.daily_average,
    languages: res.data.data.languages?.slice(0, 5).map((l) => ({
      name: l.name,
      hours: l.hours,
      minutes: l.minutes,
      percent: l.percent,
    })),
    editors: res.data.data.editors?.map((e) => ({
      name: e.name,
      hours: e.hours,
      minutes: e.minutes,
    })),
    projects: res.data.data.projects?.slice(0, 5).map((p) => ({
      name: p.name,
      hours: p.hours,
      minutes: p.minutes,
    })),
  };
}

module.exports = { getSummary, getStats };
