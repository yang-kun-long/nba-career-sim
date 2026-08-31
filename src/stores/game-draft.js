import { ATTR_KEYS } from '../core/engine.js';

export function getDraftEstimate(state) {
  const total = ATTR_KEYS.reduce((sum, key) => sum + state[key], 0) + state.honor * 3 + state.popularity * 2;
  if (total >= 65) return '极有可能在乐透区被选中';
  if (total >= 55) return '有望在首轮被选中';
  if (total >= 45) return '可能在首轮末或二轮被选中';
  if (total >= 35) return '有二轮被选中的可能';
  if (total >= 25) return '选秀前景不太乐观';
  return '选秀前景非常渺茫';
}

export function createDraftChoiceEvent(state) {
  let text;
  let choices;
  if (state.age === 18 && !state.wentToNCAA) {
    text = `你18岁了，高中毕业。你面前有三条路：直接参加NBA选秀、去NCAA大学联赛征战一年提升自己，或者再等一年。\n\nNBA选秀每年有60个名额。你的实力${getDraftEstimate(state)}。\n\n去NCAA可以让你在大学联赛中磨练一年，提升技术和球商，但也会推迟你的选秀时间。`;
    choices = [{ text: '直接参加今年的选秀' }, { text: '去NCAA大学联赛征战一年' }, { text: '再等一年 / 放弃选秀' }];
  } else if (state.wentToNCAA && state.age === 19) {
    text = `你在NCAA大学联赛征战了一年，技术和心态都有了显著提升。现在你考虑是否参加今年的NBA选秀。\n\nNBA选秀每年有60个名额。经过NCAA的磨练，你的实力${getDraftEstimate(state)}。`;
    choices = [{ text: '参加今年的选秀' }, { text: '继续磨练一年' }];
  } else {
    text = `你${state.age}岁了。${state.age === 22 ? '这是你参加选秀的最后机会了。' : '你考虑是否参加今年的NBA选秀。'}\n\nNBA选秀每年有60个名额。你的实力${getDraftEstimate(state)}。`;
    choices = [{ text: '参加今年的选秀' }, { text: state.wentToNCAA ? '继续磨练一年' : '再等一年 / 放弃选秀' }];
  }
  return {
    id: `draft_choice_${state.age}`,
    title: `${state.age}岁 · ${state.age === 18 && !state.wentToNCAA ? '人生抉择' : '选秀抉择'}`,
    text,
    choices,
    _isDraftChoice: true
  };
}

export function applyNCAAChoice(state) {
  state.wentToNCAA = true;
  state.log.push({ age: state.age, text: '选择去NCAA大学联赛征战一年' });
  state.offense = Math.min(10, state.offense + 0.5);
  state.basketball_iq = Math.min(10, state.basketball_iq + 0.5);
  state.mindset = Math.min(10, state.mindset + 0.5);
  state.popularity = Math.min(10, state.popularity + 1);
}

export function createUndraftedChoiceEvent(state) {
  return {
    id: `draft_undrafted_choice_${state.age}`,
    title: '选秀落选 · 人生抉择',
    text: '你没有在选秀中被任何球队选中。你的NBA梦碎了吗？\n\n但篮球之路不止一条。一支欧洲豪门联赛球队对你表示了兴趣，他们愿意给你一份合同。同时，你也可以选择继续在发展联盟等待机会，或者放弃篮球找一份普通工作。',
    choices: [
      { text: '去欧洲联赛打球，曲线救国', effects: { basketball_iq: 1, mindset: 1, salary: 1 } },
      { text: '留在美国打发展联盟，等待NBA机会', effects: { offense: 1, discipline: 1 } },
      { text: '接受现实，放弃篮球', effects: { mindset: -2 } }
    ],
    _isDraftChoice: false
  };
}
