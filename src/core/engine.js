/* engine.js - 游戏核心引擎 */

import { NBA_TEAMS, getDraftTeam, getTradeTeam } from './teams.js';
import { getEventsByAge, getRandomTradeEvent } from './events.js';

const ATTR_NAMES = {
  body: '身体天赋',
  athletics: '运动能力',
  offense: '进攻技术',
  defense: '防守强度',
  basketball_iq: '球商视野',
  stamina: '耐力体能',
  mindset: '心态抗压',
  discipline: '自律态度'
};

const ATTR_ICONS = {
  body: '💪',
  athletics: '⚡',
  offense: '🏀',
  defense: '🛡️',
  basketball_iq: '🧠',
  stamina: '❤️',
  mindset: '🔥',
  discipline: '⏰'
};

const ATTR_KEYS = Object.keys(ATTR_NAMES);

const Engine = {
  // 计算体测数据（身高不会随年龄变矮）
  calcPhysical(state) {
    const age = state.age;
    const body = state.body;
    const athletics = state.athletics;

    // 身高：基础170cm + 身体天赋*3 + 年龄增长（12-22岁期间每年长1-2cm），之后不变
    let baseHeight = 170 + body * 3;
    if (age <= 22) {
      baseHeight += Math.min(age - 12, 10) * 1.5;
    } else {
      baseHeight += 15; // 22岁时的最大增长
    }
    let height = baseHeight; // 身高不会变矮

    // 臂展：身高 + 身体天赋*2，不会变
    let wingspan = height + body * 2;

    // 体重：基础60kg + 身体天赋*4 + 年龄增长（只增不减）
    let weight = 60 + body * 4;
    if (age >= 18) weight += (age - 18) * 0.5;

    // 弹跳：基础40cm + 运动能力*5 - 年龄衰减
    let vertical = 40 + athletics * 5;
    if (age >= 30) vertical -= (age - 30) * 1.5;
    vertical = Math.max(20, vertical);

    // 冲刺（秒）：基础5秒 - 运动能力*0.2 + 年龄衰减
    let sprint = 5 - athletics * 0.2;
    if (age >= 28) sprint += (age - 28) * 0.05;

    // 卧推次数：基础5次 + 身体天赋*3
    let bench = 5 + body * 3;

    return {
      height: Math.round(height),
      wingspan: Math.round(wingspan),
      weight: Math.round(weight * 10) / 10,
      vertical: Math.round(vertical),
      sprint: Math.round(sprint * 100) / 100,
      bench: Math.round(bench)
    };
  },

  // 计算NBA场均数据
  calcNBAStats(state) {
    if (!state.drafted) return null;

    // Cache stats within same year to prevent random fluctuation on repeated views
    if (state._cachedStatsYear === state.age && state._cachedStats) {
      return { ...state._cachedStats };
    }

    const age = state.age;
    const off = state.offense;
    const def = state.defense;
    const body = state.body;
    const ath = state.athletics;
    const iq = state.basketball_iq;
    const sta = state.stamina;
    const mindset = state.mindset;
    const discipline = state.discipline;
    const trust = state.team_trust;

    // 上场时间：基于球队信任和能力，20-38分钟
    let minutes = 20 + trust * 1.5 + (off + def) * 0.3;
    minutes = Math.min(38, Math.max(15, minutes));

    // 新秀年上场时间较少
    if (state.nbaYears <= 1) minutes = Math.min(25, minutes);
    // 老将上场时间减少
    if (age >= 35) minutes = Math.min(25, minutes - (age - 34) * 2);

    const minuteFactor = minutes / 36;

    // 得分：基于进攻能力，8-30分
    let points = (off * 2.5 + ath * 0.5) * minuteFactor;
    // 新秀加成/衰减
    if (state.nbaYears <= 1) points *= 0.7;
    if (age >= 35) points *= 0.8;

    // 篮板：基于身体+防守，1-12个
    let rebounds = (body * 0.8 + def * 0.5 + iq * 0.2) * minuteFactor;

    // 助攻：基于球商+进攻，1-10个
    let assists = (iq * 0.8 + off * 0.3) * minuteFactor;

    // 抢断：基于防守+运动能力，0.3-2.5个
    let steals = (def * 0.2 + ath * 0.1) * minuteFactor;

    // 盖帽：基于身体+防守，0.2-3个
    let blocks = (body * 0.25 + def * 0.15) * minuteFactor;

    // 失误：基于球商（反向），1-4个
    let turnovers = (3 - iq * 0.2) * minuteFactor;
    turnovers = Math.max(0.5, turnovers);

    // 投篮命中率：40%-60%
    let fgPct = 35 + off * 2 + discipline * 0.5;
    fgPct = Math.min(62, Math.max(38, fgPct));

    // 三分命中率：30%-45%
    let threePct = 28 + off * 1.5 + discipline * 0.3;
    threePct = Math.min(45, Math.max(28, threePct));

    // 罚球命中率：60%-90%
    let ftPct = 55 + off * 2 + mindset * 1;
    ftPct = Math.min(92, Math.max(55, ftPct));

    // 添加随机波动
    const rand = () => 0.9 + Math.random() * 0.2;

    const result = {
      minutes: Math.round(minutes * 10) / 10,
      points: Math.round(points * rand() * 10) / 10,
      rebounds: Math.round(rebounds * rand() * 10) / 10,
      assists: Math.round(assists * rand() * 10) / 10,
      steals: Math.round(steals * rand() * 100) / 100,
      blocks: Math.round(blocks * rand() * 100) / 100,
      turnovers: Math.round(turnovers * rand() * 10) / 10,
      fgPct: Math.round(fgPct * rand() * 10) / 10,
      threePct: Math.round(threePct * rand() * 10) / 10,
      ftPct: Math.round(ftPct * rand() * 10) / 10
    };
    state._cachedStatsYear = state.age;
    state._cachedStats = { ...result };
    return result;
  },

  // 创建新游戏状态
  createState(name, attrs) {
    return {
      playerName: name || '无名球员',
      age: 12,
      body: attrs.body || 0,
      athletics: attrs.athletics || 0,
      offense: attrs.offense || 0,
      defense: attrs.defense || 0,
      basketball_iq: attrs.basketball_iq || 0,
      stamina: attrs.stamina || 0,
      mindset: attrs.mindset || 0,
      discipline: attrs.discipline || 0,
      initAttrs: { ...attrs },
      injury: 0,
      reputation: 0,
      team_trust: 0,
      popularity: 0,
      honor: 0,
      salary: 0,
      team: null,
      drafted: false,
      draftPick: 0,
      draftAge: 0,
      nbaYears: 0,
      careerYears: 0,
      championships: 0,
      allStar: 0,
      mvp: 0,
      dpoy: 0,
      allDefensive: 0,
      allNBA: 0,
      traded: 0,
      usedEvents: [],
      log: [],
      yearlyHistory: [],
      eventHistory: [],
      multiEventQueue: [],
      multiEventIndex: 0,
      activeEventId: null,
      activeEventResolved: false,
      activeEventResult: null,
      isRetired: false,
      ending: null,
      draftDeclined: false,
      wentToNCAA: false,
      startPoints: 50,
      _cachedStatsYear: -1,
      _cachedStats: null
    };
  },

  // 保存年度快照（含NBA数据）
  saveYearlySnapshot(state) {
    const snapshot = {
      age: state.age,
      team: state.team ? NBA_TEAMS[state.team].name : '无',
      body: Math.round(state.body * 10) / 10,
      athletics: Math.round(state.athletics * 10) / 10,
      offense: Math.round(state.offense * 10) / 10,
      defense: Math.round(state.defense * 10) / 10,
      basketball_iq: Math.round(state.basketball_iq * 10) / 10,
      stamina: Math.round(state.stamina * 10) / 10,
      mindset: Math.round(state.mindset * 10) / 10,
      discipline: Math.round(state.discipline * 10) / 10,
      injury: state.injury,
      honor: state.honor,
      popularity: state.popularity,
      salary: state.salary,
      physical: this.calcPhysical(state),
      nbaStats: this.calcNBAStats(state)
    };
    state.yearlyHistory.push(snapshot);
  },

  // 记录事件历史
  recordEvent(state, eventTitle, choiceText, effectsSummary) {
    state.eventHistory.push({
      age: state.age,
      title: eventTitle,
      choice: choiceText || null,
      effects: effectsSummary || [],
      team: state.team ? NBA_TEAMS[state.team].name : '无',
      eventNum: state.multiEventIndex + 1,
      totalEvents: state.multiEventQueue.length || 1
    });
  },

  // 获取重要年份的事件数量
  getMultiEventCount(age) {
    const importantAges = {
      12: 2, 15: 2, 17: 2,
      18: 3, 19: 2, 20: 3, 21: 3,
      22: 3, 23: 2, 25: 2, 27: 2, 28: 3, 29: 2, 30: 3,
      33: 2, 35: 3, 37: 2, 39: 2, 40: 2
    };
    return importantAges[age] || 1;
  },

  // 生成多事件队列
  generateMultiEventQueue(state) {
    const count = this.getMultiEventCount(state.age);
    const queue = [];
    for (let i = 0; i < count; i++) {
      const event = this.getYearEvent(state);
      if (event) {
        queue.push(event);
      }
    }
    // 确保至少有一个事件
    if (queue.length === 0) {
      queue.push(this.getDefaultEvent(state));
    }
    state.multiEventQueue = queue;
    state.multiEventIndex = 0;
    return queue;
  },

  // 应用属性效果
  applyEffects(state, effects) {
    if (!effects) return [];
    const result = [];
    for (const [key, val] of Object.entries(effects)) {
      if (val === 0) continue;
      if (ATTR_KEYS.includes(key)) {
        const old = state[key];
        state[key] = Math.max(0, Math.min(10, state[key] + val));
        const actual = state[key] - old;
        if (actual !== 0) {
          result.push({ attr: ATTR_NAMES[key], change: actual });
        }
      } else if (key === 'injury') {
        state.injury = Math.max(0, state.injury + val);
        result.push({ attr: '伤病累计', change: val });
      } else if (key === 'team_trust') {
        state.team_trust = Math.max(0, Math.min(10, state.team_trust + val));
        result.push({ attr: '球队信任', change: val });
      } else if (key === 'popularity') {
        state.popularity = Math.max(0, Math.min(10, state.popularity + val));
        result.push({ attr: '人气', change: val });
      } else if (key === 'honor') {
        state.honor = Math.max(0, state.honor + val);
        result.push({ attr: '荣誉值', change: val });
      } else if (key === 'salary') {
        state.salary = Math.max(0, state.salary + val);
        result.push({ attr: '薪资等级', change: val });
      }
    }
    return result;
  },

  // 获取当年事件
  getYearEvent(state) {
    const age = state.age;
    const isChoice = Math.random() < 0.7;

    let pool;
    if (isChoice) {
      pool = getEventsByAge(age, 'choice').filter(e => !state.usedEvents.includes(e.id));
      if (pool.length === 0) {
        pool = getEventsByAge(age, 'narrative').filter(e => !state.usedEvents.includes(e.id));
      }
    } else {
      pool = getEventsByAge(age, 'narrative').filter(e => !state.usedEvents.includes(e.id));
      if (pool.length === 0) {
        pool = getEventsByAge(age, 'choice').filter(e => !state.usedEvents.includes(e.id));
      }
    }

    // 已被选中的球员过滤掉所有选秀/大学相关事件
    if (state.drafted) {
      pool = pool.filter(e => {
        const t = e.title + e.text;
        // 选秀流程
        if (t.includes('选秀') || t.includes('参选')) return false;
        if (t.includes('试训') && !t.includes('NBA')) return false;
        if (t.includes('球探报告') || t.includes('联合试训')) return false;
        if (t.includes('小绿屋') || t.includes('选秀预测')) return false;
        // NCAA/大学相关
        if (t.includes('NCAA') || t.includes('大学联赛') || t.includes('大学生活')) return false;
        if (t.includes('大学') && !t.includes('NBA')) return false;
        if (t.includes('校园') || t.includes('学业') || t.includes('教授') || t.includes('导师')) return false;
        if (t.includes('奖学金') || t.includes('室友')) return false;
        if (t.includes('疯狂三月')) return false;
        // 过滤大学/选秀相关的叙事事件
        if (e.id && (e.id.startsWith('d18_') || e.id.startsWith('d19_') || e.id.startsWith('d20_') || e.id.startsWith('d21_'))) {
          return false;
        }
        return true;
      });
      // 如果过滤后没有事件了，从prime池中获取
      if (pool.length === 0) {
        pool = getEventsByAge(Math.max(22, age), isChoice ? 'choice' : 'narrative').filter(e => !state.usedEvents.includes(e.id));
        if (pool.length === 0) {
          pool = getEventsByAge(Math.max(22, age), isChoice ? 'narrative' : 'choice').filter(e => !state.usedEvents.includes(e.id));
        }
      }
    }

    if (pool.length === 0) {
      return this.getDefaultEvent(state);
    }

    const event = pool[Math.floor(Math.random() * pool.length)];
    state.usedEvents.push(event.id);
    if (state.usedEvents.length > 150) state.usedEvents = state.usedEvents.slice(-100);
    return event;
  },

  // 默认事件
  getDefaultEvent(state) {
    const age = state.age;
    if (age <= 17) {
      return { id: `default_${age}_${Date.now()}`, title: '日复一日', text: `${age}岁的你继续着日复一日的训练。`, effects: { discipline: 1 } };
    } else if (age <= 21) {
      return { id: `default_${age}_${Date.now()}`, title: '平静的大学时光', text: `${age}岁的你过着平静的大学篮球生活。`, effects: { basketball_iq: 1 } };
    } else if (age <= 34) {
      return { id: `default_${age}_${Date.now()}`, title: '常规赛日常', text: `${age}岁的你继续在NBA赛场上拼搏。`, effects: { offense: 1, defense: 1 } };
    } else {
      return { id: `default_${age}_${Date.now()}`, title: '暮年时光', text: `${age}岁的你在联盟的最后时光里，每场比赛都格外珍惜。`, effects: { mindset: 1 } };
    }
  },

  // 检查交易
  checkTrade(state) {
    if (state.age < 22 || state.age > 34) return null;
    if (!state.drafted) return null;
    if (Math.random() > 0.15) return null;
    const tradeEvent = getRandomTradeEvent();
    const newTeam = getTradeTeam(state.team);
    return { event: tradeEvent, newTeam };
  },

  // 执行交易
  executeTrade(state, newTeam) {
    const oldTeam = state.team;
    state.team = newTeam;
    state.traded++;
    state.team_trust = Math.max(0, state.team_trust - 2);
    return { from: NBA_TEAMS[oldTeam].name, to: NBA_TEAMS[newTeam].name };
  },

  // 选秀流程
  processDraft(state, age) {
    const totalAttr = ATTR_KEYS.reduce((sum, k) => sum + state[k], 0);
    const base = totalAttr + state.honor * 3 + state.popularity * 2;

    let pick;
    if (base >= 65) pick = Math.floor(Math.random() * 5) + 1;
    else if (base >= 55) pick = Math.floor(Math.random() * 10) + 6;
    else if (base >= 45) pick = Math.floor(Math.random() * 15) + 16;
    else if (base >= 35) pick = Math.floor(Math.random() * 20) + 31;
    else if (base >= 25) pick = Math.floor(Math.random() * 10) + 51;
    else pick = -1;

    if (pick > 0) {
      const team = getDraftTeam(pick);
      state.drafted = true;
      state.draftPick = pick;
      state.draftAge = age;
      state.team = team;
      state.nbaYears = 0;
      state.salary = pick <= 10 ? 3 : pick <= 30 ? 2 : 1;
      state.team_trust = pick <= 10 ? 3 : pick <= 30 ? 2 : 1;
      return { pick, team, drafted: true };
    }
    return { pick: -1, team: null, drafted: false };
  },

  // 退役判定
  checkRetirement(state) {
    if (state.age < 35) return false;
    const baseChance = (state.age - 34) * 0.15;
    const injuryBonus = state.injury * 0.05;
    const staminaReduction = state.stamina >= 6 ? -0.1 : 0;
    const disciplineReduction = state.discipline >= 6 ? -0.05 : 0;
    const chance = Math.min(0.8, baseChance + injuryBonus + staminaReduction + disciplineReduction);
    return Math.random() < chance;
  },

  // 推进一年
  advanceYear(state) {
    this.saveYearlySnapshot(state);

    state.age++;
    state.careerYears++;
    if (state.drafted && state.age > state.draftAge) {
      state.nbaYears++;
    }

    // 属性衰减
    if (state.age >= 30) state.athletics = Math.max(0, state.athletics - 0.5);
    if (state.age >= 33) {
      state.stamina = Math.max(0, state.stamina - 0.5);
      state.athletics = Math.max(0, state.athletics - 0.5);
    }
    if (state.age >= 36) state.body = Math.max(0, state.body - 0.5);

    // 自律涨球
    if (state.discipline >= 7 && state.age <= 28) {
      if (Math.random() < 0.3) {
        const attr = ATTR_KEYS[Math.floor(Math.random() * ATTR_KEYS.length)];
        state[attr] = Math.min(10, state[attr] + 1);
      }
    }

    // 伤病影响
    if (state.injury >= 5 && Math.random() < 0.2) {
      state.stamina = Math.max(0, state.stamina - 1);
    }

    // 随机荣誉
    if (state.drafted && state.nbaYears >= 2) {
      if (state.offense >= 7 && state.popularity >= 4 && Math.random() < 0.3) {
        state.allStar++;
        state.honor++;
      }
      if (state.offense >= 9 && state.honor >= 5 && state.allStar >= 2 && Math.random() < 0.1) {
        state.mvp++;
        state.honor += 2;
      }
      if (state.defense >= 8 && state.body >= 5 && Math.random() < 0.15) {
        state.dpoy++;
        state.honor += 2;
      }
      if (state.defense >= 6 && Math.random() < 0.25) {
        state.allDefensive++;
        state.honor++;
      }
      if (state.offense >= 7 && state.basketball_iq >= 5 && Math.random() < 0.2) {
        state.allNBA++;
        state.honor += 1;
      }
      {
        const teamData = state.team ? NBA_TEAMS[state.team] : null;
        const teamBonus = teamData ? (teamData.draftWeight >= 8 ? 0.06 : teamData.draftWeight >= 6 ? 0.03 : 0.01) : 0;
        const playerRating = (state.offense + state.defense + state.basketball_iq + state.team_trust) / 40;
        if (state.team_trust >= 3 && Math.random() < (0.02 + teamBonus + playerRating)) {
          state.championships++;
          state.honor += 2;
        }
      }
    }

    // 重置多事件队列
    state.multiEventQueue = [];
    state.multiEventIndex = 0;
  },

  // 生成生涯摘要
  generateSummary(state) {
    return {
      name: state.playerName,
      age: state.age,
      team: state.team ? NBA_TEAMS[state.team].name : '无',
      drafted: state.drafted,
      draftPick: state.draftPick,
      nbaYears: state.nbaYears,
      careerYears: state.careerYears,
      championships: state.championships,
      allStar: state.allStar,
      mvp: state.mvp,
      dpoy: state.dpoy,
      allDefensive: state.allDefensive,
      allNBA: state.allNBA,
      honor: state.honor,
      popularity: state.popularity,
      salary: state.salary,
      injury: state.injury,
      traded: state.traded,
      physical: this.calcPhysical(state),
      nbaStats: this.calcNBAStats(state),
      attrs: { body: state.body, athletics: state.athletics, offense: state.offense, defense: state.defense, basketball_iq: state.basketball_iq, stamina: state.stamina, mindset: state.mindset, discipline: state.discipline }
    };
  },

  save(state) {
    try { localStorage.setItem('nba_career_save', JSON.stringify(state)); return true; } catch (e) { return false; }
  },
  load() {
    try { const d = localStorage.getItem('nba_career_save'); return d ? JSON.parse(d) : null; } catch (e) { return null; }
  },
  saveEnding(id) {
    try { let u = JSON.parse(localStorage.getItem('nba_career_endings') || '[]'); if (!u.includes(id)) { u.push(id); localStorage.setItem('nba_career_endings', JSON.stringify(u)); } return true; } catch (e) { return false; }
  },
  getUnlockedEndings() {
    try { return JSON.parse(localStorage.getItem('nba_career_endings') || '[]'); } catch (e) { return []; }
  }
};

export { ATTR_NAMES, ATTR_ICONS, ATTR_KEYS, Engine };
