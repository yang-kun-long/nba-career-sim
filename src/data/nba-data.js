const DATA_ROOT = '/data';

async function fetchJson(path) {
  const response = await fetch(`${DATA_ROOT}/${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`NBA data request failed: ${response.status}`);
  return response.json();
}

async function loadNbaSnapshot() {
  const manifest = await fetchJson('manifest.json');
  const [games, teams, players, leaders] = await Promise.all([
    fetchJson('games/today.json'),
    fetchJson('teams/index.json'),
    fetchJson('players/index.json'),
    fetchJson('leaders/index.json')
  ]);
  return { manifest, games, teams: teams.teams || [], players: players.players || [], leaders: leaders.leaders || {} };
}

function formatSnapshotDate(value) {
  if (!value) return '未知时间';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Shanghai' }).format(date);
}

export { DATA_ROOT, fetchJson, loadNbaSnapshot, formatSnapshotDate };
