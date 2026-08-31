import { ATTR_KEYS } from '../core/engine.js';

export const SAVE_VERSION = 2;

export function emptyAttrs() {
  return Object.fromEntries(ATTR_KEYS.map((key) => [key, 0]));
}

export function normalizeSave(save) {
  if (!save) return null;
  return {
    ...save,
    yearlyHistory: save.yearlyHistory || [],
    eventHistory: save.eventHistory || [],
    multiEventQueue: save.multiEventQueue || [],
    multiEventIndex: save.multiEventIndex || 0,
    activeEventId: save.activeEventId ?? null,
    activeEventResolved: save.activeEventResolved ?? false,
    activeEventResult: save.activeEventResult ?? null,
    wentToNCAA: save.wentToNCAA ?? false,
    startPoints: save.startPoints ?? 50,
    saveVersion: save.saveVersion || 1
  };
}
