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
  const view = ref('games');
  const search = ref('');
  const selectedSeason = ref('');

  const seasons = computed(() => snapshot.value?.manifest?.history?.seasons || []);
  const currentPlayers = computed(() => snapshot.value?.players || []);
  const currentTeams = computed(() => snapshot.value?.teams || []);
  const currentGames = computed(() => snapshot.value?.games?.games || []);
  const activeHistory = computed(() => selectedSeason.value ? history.value[selectedSeason.value] : null);
  const players = computed(() => view.value === 'history' && activeHistory.value ? activeHistory.value.players : currentPlayers.value);
  const teams = computed(() => view.value === 'history' && activeHistory.value ? activeHistory.value.teams : currentTeams.value);
  const filteredPlayers = computed(() => {
    const query = search.value.trim().toLowerCase();
    if (!query) return players.value;
    return players.value.filter((player) => `${player.fullName} ${player.teamName} ${player.position}`.toLowerCase().includes(query));
  });
  const sortedLeaders = computed(() => {
    const fields = [['points', '得分'], ['rebounds', '篮板'], ['assists', '助攻']];
    return fields.map(([field, label]) => ({
      field,
      label,
      rows: [...players.value].sort((a, b) => (b.stats?.[field] || 0) - (a.stats?.[field] || 0)).slice(0, 5)
    }));
  });
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
    if (nextView === 'history' && seasons.value.length) {
      if (!selectedSeason.value) selectedSeason.value = seasons.value.at(-1);
      loadHistorySeason(selectedSeason.value);
    }
  }

  return {
    snapshot, loading, historyLoading, featuredPlayer, featuredLoading, featuredError, error, historyError, view, search, selectedSeason,
    seasons, players, teams, currentTeams, currentGames, filteredPlayers, sortedLeaders,
    dataStatus, generatedAt, refresh, loadHistorySeason, selectSeason, showView
  };
});
