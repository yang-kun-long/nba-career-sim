import { describe, expect, it } from 'vitest';
import { ATTR_KEYS, Engine } from '../src/core/engine.js';

describe('game engine', () => {
  it('creates a complete initial state', () => {
    const state = Engine.createState('测试球员', { offense: 8, body: 4 });
    expect(state.playerName).toBe('测试球员');
    expect(state.age).toBe(12);
    expect(state.offense).toBe(8);
    expect(state.multiEventQueue).toEqual([]);
    expect(state.eventHistory).toEqual([]);
    expect(state.activeEventResolved).toBe(false);
    expect(state.activeEventResult).toBeNull();
  });

  it('clamps attribute effects and reports actual changes', () => {
    const state = Engine.createState('测试', { offense: 9 });
    const result = Engine.applyEffects(state, { offense: 4, mindset: 2, popularity: 1 });
    expect(state.offense).toBe(10);
    expect(result).toContainEqual({ attr: '进攻技术', change: 1 });
    expect(state.mindset).toBe(2);
    expect(state.popularity).toBe(1);
  });

  it('generates the expected number of events for an important age', () => {
    const state = Engine.createState('测试', Object.fromEntries(ATTR_KEYS.map((key) => [key, 2])));
    Engine.generateMultiEventQueue(state);
    expect(state.multiEventQueue).toHaveLength(2);
    expect(state.multiEventIndex).toBe(0);
  });

  it('calculates stable physical values for a state', () => {
    const state = Engine.createState('测试', { body: 5, athletics: 5 });
    const physical = Engine.calcPhysical(state);
    expect(physical.height).toBe(185);
    expect(physical.wingspan).toBe(195);
    expect(physical.vertical).toBe(65);
  });
});
