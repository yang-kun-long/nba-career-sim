import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchJson, formatSnapshotDate, loadNbaSnapshot } from '../data/nba-data.js';

export const useNbaDataStore = defineStore('nba-data', () => {
  const snapshot = ref(null);
  const history = ref({});
  const loading = ref(false);
  const historyLoading = ref(false);
  const featuredPlayer = ref(null);
  const featuredLoading = ref(false);
  const featuredError = ref('');
  const error = ref('');
  const historyError = ref('');
  const view = ref('overview');
  const search = ref('');
  const playerListLimit = ref(80);
  const selectedSeason = ref('');
  const selectedPlayerId = ref('');
  const playerProfiles = ref({});
  const playerBases = ref({});
  const playerLoading = ref(false);
  const playerError = ref('');
  const playerLoadingIds = new Set();
  const selectedTeamId = ref('');
  const teamProfiles = ref({});
  const teamBases = ref({});
  const teamRosters = ref({});
  const teamLoading = ref(false);
  const teamError = ref('');
  const teamLoadingIds = new Set();

  const seasons = computed(() => snapshot.value?.manifest?.history?.seasons || []);
  const currentPlayers = computed(() => snapshot.value?.players || []);
  const currentTeams = computed(() => snapshot.value?.teams || []);
  const currentGames = computed(() => snapshot.value?.games?.games || []);
  const selectedPlayer = computed(() => {
    if (!selectedPlayerId.value) return null;
    if (selectedPlayerId.value === '2544' && featuredPlayer.value) return featuredPlayer.value;
    if (playerProfiles.value[selectedPlayerId.value]) return playerProfiles.value[selectedPlayerId.value];
    return currentPlayers.value.find((player) => String(player.id) === String(selectedPlayerId.value)) || playerBases.value[selectedPlayerId.value] || null;
  });
  const selectedTeam = computed(() => {
    if (!selectedTeamId.value) return null;
    if (teamProfiles.value[selectedTeamId.value]) return teamProfiles.value[selectedTeamId.value];
    return currentTeams.value.find((team) => String(team.id) === String(selectedTeamId.value))
      || teamBases.value[selectedTeamId.value]
      || activeHistory.value?.teams?.find((team) => String(team.id) === String(selectedTeamId.value))
      || null;
  });
  const selectedTeamRoster = computed(() => {
    if (!selectedTeamId.value) return [];
    return teamRosters.value[selectedTeamId.value]
      || currentPlayers.value.filter((player) => String(player.teamId) === String(selectedTeamId.value));
  });
  const activeHistory = computed(() => selectedSeason.value ? history.value[selectedSeason.value] : null);
  const players = computed(() => view.value === 'history' && activeHistory.value ? activeHistory.value.players : currentPlayers.value);
  const teams = computed(() => view.value === 'history' && activeHistory.value ? activeHistory.value.teams : currentTeams.value);
  const filteredPlayers = computed(() => {
    const query = search.value.trim().toLowerCase();
    if (!query) return players.value;
    return players.value.filter((player) => `${player.fullName} ${player.teamName} ${player.position}`.toLowerCase().includes(query));
  });
  const visiblePlayers = computed(() => filteredPlayers.value.slice(0, playerListLimit.value));
  const hasMorePlayers = computed(() => visiblePlayers.value.length < filteredPlayers.value.length);
  const sortedLeaders = computed(() => {
    const fields = [['points', '得分'], ['rebounds', '篮板'], ['assists', '助攻']];
    return fields.map(([field, label]) => ({
      field,
      label,
      rows: [...players.value].sort((a, b) => (b.stats?.[field] || 0) - (a.stats?.[field] || 0)).slice(0, 5)
    }));
  });
  const leaderCards = computed(() => {
    const official = Object.entries(snapshot.value?.leaders || {})
      .map(([label, rows]) => ({
        field: label,
        label,
        rows: (rows || []).slice(0, 5).map((row) => ({
          fullName: row.player,
          teamId: row.team,
          leaderValue: row.value
        }))
      }))
      .filter((leader) => leader.rows.length);
    return official.length ? official : sortedLeaders.value;
  });
  const overviewStats = computed(() => ({
    games: currentGames.value.length,
    teams: currentTeams.value.length,
    players: currentPlayers.value.length,
    seasons: seasons.value.length
  }));
  const dataStatus = computed(() => {
    const status = snapshot.value?.manifest?.sourceStatus;
    if (status === 'official') return '官方快照';
    if (status === 'partial') return '官方快照（部分）';
    return '本地种子';
  });
  const generatedAt = computed(() => formatSnapshotDate(snapshot.value?.manifest?.generatedAt));

  async function refresh() {
    if (loading.value) return;
    loading.value = true;
    error.value = '';
    featuredError.value = '';
    try {
      snapshot.value = await loadNbaSnapshot();
      playerProfiles.value = {};
      playerBases.value = {};
      teamProfiles.value = {};
      teamBases.value = {};
      teamRosters.value = {};
      featuredLoading.value = true;
      try {
        featuredPlayer.value = await fetchJson('players/2544.json');
      } catch (cause) {
        featuredError.value = cause instanceof Error ? cause.message : '精选球员档案加载失败';
      } finally {
        featuredLoading.value = false;
      }
      if (!selectedSeason.value) selectedSeason.value = snapshot.value.manifest.history?.toSeason || '';
      if (view.value === 'history' && selectedSeason.value) await loadHistorySeason(selectedSeason.value);
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : '官方数据加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function loadHistorySeason(season) {
    if (!season || history.value[season] || historyLoading.value) return;
    historyLoading.value = true;
    historyError.value = '';
    try {
      const [playerData, teamData] = await Promise.all([
        fetchJson(`history/players/${season}.json`),
        fetchJson(`history/teams/${season}.json`)
      ]);
      history.value = { ...history.value, [season]: { players: playerData.players || [], teams: teamData.teams || [] } };
    } catch (cause) {
      historyError.value = cause instanceof Error ? cause.message : '历史数据加载失败';
    } finally {
      historyLoading.value = false;
    }
  }

  function selectSeason(season) {
    selectedSeason.value = season;
    if (season) loadHistorySeason(season);
  }

  function showView(nextView) {
    view.value = nextView;
    search.value = '';
    playerListLimit.value = 80;
    if (nextView === 'history' && seasons.value.length) {
      if (!selectedSeason.value) selectedSeason.value = seasons.value.at(-1);
      loadHistorySeason(selectedSeason.value);
    }
  }

  function showMorePlayers() {
    playerListLimit.value += 80;
  }

  function openPlayer(playerId) {
    const id = String(playerId);
    const base = currentPlayers.value.find((player) => String(player.id) === id)
      || activeHistory.value?.players?.find((player) => String(player.id) === id);
    if (base && id !== '2544') playerBases.value = { ...playerBases.value, [id]: base };
    selectedPlayerId.value = id;
    view.value = 'player';
    search.value = '';
    playerError.value = '';
    if (selectedPlayerId.value !== '2544') loadPlayerHistory(selectedPlayerId.value);
  }

  function openTeam(teamId) {
    const id = String(teamId);
    const sourceTeams = view.value === 'history' && activeHistory.value ? activeHistory.value.teams : currentTeams.value;
    const sourcePlayers = view.value === 'history' && activeHistory.value ? activeHistory.value.players : currentPlayers.value;
    const base = sourceTeams.find((team) => String(team.id) === id) || currentTeams.value.find((team) => String(team.id) === id);
    const roster = sourcePlayers.filter((player) => String(player.teamId) === id);
    if (base) teamBases.value = { ...teamBases.value, [id]: base };
    if (roster.length) teamRosters.value = { ...teamRosters.value, [id]: roster };
    selectedTeamId.value = id;
    view.value = 'team';
    search.value = '';
    teamError.value = '';
    loadTeamHistory(id);
  }

  function closeTeam() {
    selectedTeamId.value = '';
    view.value = 'teams';
  }

  async function loadTeamHistory(teamId) {
    const id = String(teamId);
    if (teamProfiles.value[id] || teamLoadingIds.has(id) || !seasons.value.length) return;
    teamLoadingIds.add(id);
    teamLoading.value = true;
    teamError.value = '';
    try {
      const results = await Promise.allSettled(seasons.value.map(async (season) => {
        const cached = history.value[season]?.teams;
        const teamsForSeason = cached || (await fetchJson(`history/teams/${season}.json`)).teams || [];
        return { season, teams: teamsForSeason, row: teamsForSeason.find((team) => String(team.id) === id) };
      }));
      const base = currentTeams.value.find((team) => String(team.id) === id) || teamBases.value[id];
      if (!base) throw new Error('未找到该球队的当前资料');
      const failedSeasons = results.filter((result) => result.status === 'rejected').length;
      const loadedHistory = { ...history.value };
      results.filter((result) => result.status === 'fulfilled').forEach((result) => {
        loadedHistory[result.value.season] = {
          ...(loadedHistory[result.value.season] || {}),
          teams: result.value.teams
        };
      });
      history.value = loadedHistory;
      const rows = results
        .filter((result) => result.status === 'fulfilled' && result.value.row)
        .map((result) => ({
          season: result.value.season,
          wins: result.value.row.record?.wins,
          losses: result.value.row.record?.losses,
          winPct: result.value.row.record?.winPct,
          rank: result.value.row.rank ?? result.value.row.record?.rank
        }))
        .sort((a, b) => a.season.localeCompare(b.season));
      teamProfiles.value = {
        ...teamProfiles.value,
        [id]: { ...base, history: rows }
      };
      if (failedSeasons) {
        teamError.value = rows.length
          ? `${failedSeasons} 个赛季数据暂时无法读取，已显示其余历史记录`
          : '历史数据暂时无法读取，已显示当前赛季战绩';
      }
    } catch (cause) {
      teamError.value = cause instanceof Error ? cause.message : '球队历史数据加载失败';
    } finally {
      teamLoadingIds.delete(id);
      teamLoading.value = teamLoadingIds.size > 0;
    }
  }

  function closePlayer() {
    selectedPlayerId.value = '';
    view.value = 'players';
  }

  async function loadPlayerHistory(playerId) {
    const id = String(playerId);
    if (id === '2544' || playerProfiles.value[id] || playerLoadingIds.has(id) || !seasons.value.length) return;
    playerLoadingIds.add(id);
    playerLoading.value = true;
    playerError.value = '';
    try {
      const results = await Promise.allSettled(seasons.value.map(async (season) => {
        const cached = history.value[season]?.players;
        const playersForSeason = cached || (await fetchJson(`history/players/${season}.json`)).players || [];
        return {
          season,
          players: playersForSeason,
          rows: playersForSeason.filter((player) => String(player.id) === id)
        };
      }));
      const base = currentPlayers.value.find((player) => String(player.id) === id) || playerBases.value[id];
      if (!base) throw new Error('未找到该球员的当前资料');
      const failedSeasons = results.filter((result) => result.status === 'rejected').length;
      const seasonRows = results
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value.rows.map((player) => ({ season: result.value.season, player })));
      const grouped = new Map();
      seasonRows.forEach(({ season, player }) => {
        const stats = player.stats || {};
        const gp = Number(stats.gp) || 0;
        const existing = grouped.get(season);
        if (!existing) {
          grouped.set(season, {
            season,
            team: player.teamId?.toUpperCase() || '-',
            age: player.age,
            gp,
            minutes: Number(stats.minutes) || 0,
            points: Number(stats.points) || 0,
            rebounds: Number(stats.rebounds) || 0,
            assists: Number(stats.assists) || 0,
            steals: Number(stats.steals) || 0,
            blocks: Number(stats.blocks) || 0,
            fgPct: Number(stats.fgPct) || 0,
            threePct: Number(stats.threePct) || 0,
            ftPct: Number(stats.ftPct) || 0,
            _weight: gp || 1
          });
          return;
        }
        const previousWeight = existing._weight || 1;
        const nextWeight = previousWeight + (gp || 1);
        const weighted = ['minutes', 'points', 'rebounds', 'assists', 'steals', 'blocks', 'fgPct', 'threePct', 'ftPct'];
        weighted.forEach((key) => {
          existing[key] = (existing[key] * previousWeight + (Number(stats[key]) || 0) * (gp || 1)) / nextWeight;
        });
        existing.gp += gp;
        existing.team = existing.team === (player.teamId?.toUpperCase() || '-') ? existing.team : `${existing.team} / ${player.teamId?.toUpperCase() || '-'}`;
        existing.age = existing.age ?? player.age;
        existing._weight = nextWeight;
      });
      const rows = [...grouped.values()].map(({ _weight, ...row }) => row).sort((a, b) => a.season.localeCompare(b.season));
      if (!rows.length && base.stats) {
        rows.push({ season: snapshot.value?.manifest?.season || '当前赛季', team: base.teamId?.toUpperCase() || '-', age: base.age, ...base.stats });
      }
      playerProfiles.value = {
        ...playerProfiles.value,
        [id]: {
          id: base.id,
          fullName: base.fullName,
          teamId: base.teamId,
          teamName: base.teamName,
          position: base.position,
          age: base.age,
          career: { regularSeason: rows, playoffs: [], allStar: [] }
        }
      };
      if (failedSeasons) {
        playerError.value = rows.length
          ? `${failedSeasons} 个赛季数据暂时无法读取，已显示其余历史记录`
          : '历史数据暂时无法读取，已显示当前赛季快照';
      }
    } catch (cause) {
      playerError.value = cause instanceof Error ? cause.message : '球员历史数据加载失败';
    } finally {
      playerLoadingIds.delete(id);
      playerLoading.value = playerLoadingIds.size > 0;
    }
  }

  return {
    snapshot, loading, historyLoading, featuredPlayer, featuredLoading, featuredError, error, historyError, view, search, playerListLimit, selectedSeason, selectedPlayerId,
    playerLoading, playerError, selectedPlayer, selectedTeamId, selectedTeam, selectedTeamRoster, teamLoading, teamError, seasons, players, teams, currentTeams, currentGames, filteredPlayers, visiblePlayers, hasMorePlayers, sortedLeaders, leaderCards, overviewStats,
    dataStatus, generatedAt, refresh, loadHistorySeason, selectSeason, showView, showMorePlayers, openPlayer, closePlayer, loadPlayerHistory, openTeam, closeTeam, loadTeamHistory
  };
});
