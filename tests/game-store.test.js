import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGameStore } from '../src/stores/game.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear()
  };
}

function allocateAllPoints(game) {
  Object.keys(game.attrs).forEach((key) => { game.attrs[key] = 6; });
  game.remainPoints = 2;
}

describe('game store flow', () => {
  beforeEach(() => {
    globalThis.localStorage = createStorage();
    setActivePinia(createPinia());
  });

  it('creates a new career and persists the first event', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const game = useGameStore();
    game.newGame();
    allocateAllPoints(game);
    game.playerName = '状态测试';

    expect(game.confirmCreate()).toBe(true);
    if (game.currentEvent?.choices) game.makeChoice(0);
    expect(game.screen).toBe('game');
    expect(game.state.playerName).toBe('状态测试');
    expect(game.state.age).toBe(12);
    expect(game.state.multiEventQueue.length).toBe(2);
    expect(game.state.activeEventResolved).toBe(true);
    expect(JSON.parse(localStorage.getItem('nba_career_save')).playerName).toBe('状态测试');
    random.mockRestore();
  });

  it('keeps the entered name while resetting or randomizing attributes', () => {
    const game = useGameStore();
    game.newGame();
    game.playerName = '保留姓名';
    game.randomAlloc();
    expect(game.playerName).toBe('保留姓名');
    expect(game.remainPoints).toBe(0);
    game.resetAllocation();
    expect(game.playerName).toBe('保留姓名');
    expect(game.remainPoints).toBe(50);
  });

  it('restores a resolved event without applying its effects twice', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const first = useGameStore();
    first.newGame();
    allocateAllPoints(first);
    first.confirmCreate();
    if (first.currentEvent?.choices) first.makeChoice(0);
    const historyLength = first.state.eventHistory.length;
    const offense = first.state.offense;

    setActivePinia(createPinia());
    const second = useGameStore();
    expect(second.loadGame()).toBe(true);
    expect(second.state.eventHistory.length).toBe(historyLength);
    expect(second.state.offense).toBe(offense);
    expect(second.eventResolved).toBe(true);
    expect(second.screen).toBe('game');
    random.mockRestore();
  });

  it('opens the ending screen when loading a retired save', () => {
    const game = useGameStore();
    const state = {
      playerName: '退役测试', age: 40, body: 5, athletics: 5, offense: 5, defense: 5,
      basketball_iq: 5, stamina: 5, mindset: 5, discipline: 5,
      initAttrs: { body: 5, athletics: 5, offense: 5, defense: 5, basketball_iq: 5, stamina: 5, mindset: 5, discipline: 5 },
      injury: 0, reputation: 0, team_trust: 0, popularity: 0, honor: 0, salary: 0, team: null,
      drafted: false, draftPick: 0, draftAge: 0, nbaYears: 0, careerYears: 28, championships: 0,
      allStar: 0, mvp: 0, dpoy: 0, allDefensive: 0, allNBA: 0, traded: 0, usedEvents: [], log: [],
      yearlyHistory: [], eventHistory: [], multiEventQueue: [], multiEventIndex: 0,
      isRetired: true, ending: 'end_default', draftDeclined: false, wentToNCAA: false
    };
    localStorage.setItem('nba_career_save', JSON.stringify(state));

    expect(game.loadGame()).toBe(true);
    expect(game.screen).toBe('ending');
    expect(game.ending).toBeTruthy();
    expect(game.state.playerName).toBe('退役测试');
  });
});
