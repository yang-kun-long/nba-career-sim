import { Engine } from '../core/engine.js';
import { NBA_TEAMS } from '../core/teams.js';
import { ENDINGS, calculateEnding } from '../core/endings.js';
import { applyNCAAChoice, createDraftChoiceEvent, createUndraftedChoiceEvent } from './game-draft.js';

export function createGameFlow({
  state,
  screen,
  currentEvent,
  eventResult,
  eventResolved,
  pendingDraft,
  draftResultVisible,
  ending,
  save
}) {
  function processYear() {
    const current = state.value;
    if (!current || current.isRetired) return;

    if (current.age >= 35 && Engine.checkRetirement(current)) {
      triggerEnding();
      return;
    }

    if (current.multiEventQueue.length === 0 && current.age >= 18 && current.age <= 22 && !current.drafted && !current.draftDeclined) {
      showDraftChoice();
      return;
    }

    if (current.multiEventQueue.length === 0) {
      const trade = Engine.checkTrade(current);
      if (trade) {
        const tradeInfo = Engine.executeTrade(current, trade.newTeam);
        currentEvent.value = {
          id: `trade_${Date.now()}`,
          title: '交易发生！',
          text: `${trade.event.text}\n\n你被交易到了${NBA_TEAMS[trade.newTeam].name}。`,
          _isTrade: true
        };
        eventResult.value = [
          { attr: '球队', change: `${tradeInfo.from} → ${tradeInfo.to}` },
          { attr: '球队信任', change: -2 }
        ];
        eventResolved.value = true;
        current.activeEventId = currentEvent.value.id;
        current.activeEventResolved = true;
        current.activeEventResult = eventResult.value;
        Engine.recordEvent(current, '交易发生', `被交易到${NBA_TEAMS[trade.newTeam].name}`, eventResult.value);
        screen.value = 'game';
        save();
        return;
      }
      Engine.generateMultiEventQueue(current);
    }

    if (current.multiEventIndex >= current.multiEventQueue.length) {
      finishYear();
      return;
    }

    currentEvent.value = current.multiEventQueue[current.multiEventIndex];
    const hasResolvedEvent = current.activeEventId === currentEvent.value.id && current.activeEventResolved;
    eventResult.value = hasResolvedEvent ? current.activeEventResult || [] : null;
    eventResolved.value = hasResolvedEvent;
    screen.value = 'game';
    if (hasResolvedEvent) {
      save();
      return;
    }

    if (!currentEvent.value.choices) {
      eventResult.value = Engine.applyEffects(current, currentEvent.value.effects);
      Engine.recordEvent(current, currentEvent.value.title, null, eventResult.value);
      eventResolved.value = true;
      current.activeEventId = currentEvent.value.id;
      current.activeEventResolved = true;
      current.activeEventResult = eventResult.value;
    }
    save();
  }

  function showDraftChoice() {
    const current = state.value;
    currentEvent.value = createDraftChoiceEvent(current);
    eventResult.value = null;
    eventResolved.value = false;
    screen.value = 'game';
    save();
  }

  function makeChoice(index) {
    const current = state.value;
    const event = currentEvent.value;
    if (!current || !event || eventResolved.value) return;

    if (event._isDraftChoice) {
      const hasNCAAOption = current.age === 18 && !current.wentToNCAA;
      if (index === 0) {
        pendingDraft.value = Engine.processDraft(current, current.age);
        draftResultVisible.value = false;
        screen.value = 'draft';
        save();
        window.setTimeout(() => { draftResultVisible.value = true; }, 500);
      } else if (index === 1 && hasNCAAOption) {
        applyNCAAChoice(current);
        finishYear();
      } else if (current.age >= 22) {
        current.draftDeclined = true;
        current.log.push({ age: current.age, text: '放弃参加选秀' });
        processYear();
      } else {
        current.log.push({ age: current.age, text: '放弃今年选秀，继续磨练' });
        finishYear();
      }
      return;
    }

    const choice = event.choices?.[index];
    if (!choice) return;
    eventResult.value = Engine.applyEffects(current, choice.effects);
    Engine.recordEvent(current, event.title, choice.text, eventResult.value);
    eventResolved.value = true;
    current.activeEventId = event.id;
    current.activeEventResolved = true;
    current.activeEventResult = eventResult.value;
    save();
  }

  function afterDraft() {
    const current = state.value;
    const result = pendingDraft.value;
    if (!current) return;
    if (result?.drafted) {
      current.log.push({ age: current.age, text: `第${result.pick}顺位被${NBA_TEAMS[result.team].name}选中` });
    } else {
      current.draftDeclined = true;
      current.log.push({ age: current.age, text: '选秀落选' });
      if (current.age >= 22) {
        currentEvent.value = createUndraftedChoiceEvent(current);
        eventResult.value = null;
        eventResolved.value = false;
        current.activeEventId = currentEvent.value.id;
        current.activeEventResolved = false;
        current.activeEventResult = null;
        screen.value = 'game';
        save();
        return;
      }
    }
    pendingDraft.value = null;
    currentEvent.value = null;
    current.activeEventId = null;
    current.activeEventResolved = false;
    current.activeEventResult = null;
    screen.value = 'game';
    processYear();
  }

  function nextYear() {
    const current = state.value;
    if (!current || current.isRetired || !eventResolved.value) return;
    if (currentEvent.value?._isTrade) {
      currentEvent.value = null;
      eventResult.value = null;
      eventResolved.value = false;
      current.activeEventId = null;
      current.activeEventResolved = false;
      current.activeEventResult = null;
      Engine.generateMultiEventQueue(current);
      processYear();
      return;
    }
    current.multiEventIndex += 1;
    current.activeEventId = null;
    current.activeEventResolved = false;
    current.activeEventResult = null;
    if (current.multiEventIndex < current.multiEventQueue.length) processYear();
    else finishYear();
  }

  function finishYear() {
    const current = state.value;
    if (!current) return;
    currentEvent.value = null;
    current.activeEventId = null;
    current.activeEventResolved = false;
    current.activeEventResult = null;
    Engine.advanceYear(current);
    if (current.age > 40 || (current.age >= 22 && !current.drafted && current.draftDeclined)) triggerEnding();
    else processYear();
  }

  function triggerEnding() {
    const current = state.value;
    if (!current || current.isRetired) return;
    Engine.saveYearlySnapshot(current);
    ending.value = calculateEnding(current);
    current.ending = ending.value.id;
    current.isRetired = true;
    save();
    Engine.saveEnding(ending.value.id);
    screen.value = 'ending';
  }

  return { processYear, showDraftChoice, makeChoice, afterDraft, nextYear, finishYear, triggerEnding };
}
