import { describe, expect, it } from 'vitest';
import { Engine } from '../src/core/engine.js';
import {
  applyNCAAChoice,
  createDraftChoiceEvent,
  createUndraftedChoiceEvent,
  getDraftEstimate
} from '../src/stores/game-draft.js';

describe('draft domain helpers', () => {
  it('maps draft strength to the expected estimate', () => {
    const state = Engine.createState('测试', { body: 8, athletics: 8, offense: 8, defense: 8, basketball_iq: 8, stamina: 8, mindset: 8, discipline: 8 });
    state.honor = 1;
    expect(getDraftEstimate(state)).toBe('极有可能在乐透区被选中');
  });

  it('builds the age-18 choice with the NCAA option', () => {
    const state = Engine.createState('测试', {});
    state.age = 18;
    const event = createDraftChoiceEvent(state);
    expect(event.id).toBe('draft_choice_18');
    expect(event.choices).toHaveLength(3);
    expect(event.choices[1].text).toContain('NCAA');
  });

  it('applies the NCAA development season within attribute limits', () => {
    const state = Engine.createState('测试', { offense: 10, basketball_iq: 9.5, mindset: 9.5, popularity: 10 });
    state.popularity = 10;
    applyNCAAChoice(state);
    expect(state.wentToNCAA).toBe(true);
    expect(state.offense).toBe(10);
    expect(state.basketball_iq).toBe(10);
    expect(state.mindset).toBe(10);
    expect(state.popularity).toBe(10);
    expect(state.log.at(-1).text).toContain('NCAA');
  });

  it('gives the undrafted follow-up event a stable id', () => {
    const state = Engine.createState('测试', {});
    state.age = 22;
    const event = createUndraftedChoiceEvent(state);
    expect(event.id).toBe('draft_undrafted_choice_22');
    expect(event.choices).toHaveLength(3);
  });
});
