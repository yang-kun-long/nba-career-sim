/* app.js - 主控制器 */

const App = {
  state: null,
  currentEvent: null,
  pendingDraft: null,

  init() {
    UI.renderAttrAlloc();
    this.attrs = {};
    ATTR_KEYS.forEach(k => this.attrs[k] = 0);
    this.remainPoints = 50;

    const save = Engine.load();
    if (save) {
      document.getElementById('btn-continue').style.display = 'block';
      // 兼容旧存档
      if (!save.yearlyHistory) save.yearlyHistory = [];
      if (!save.eventHistory) save.eventHistory = [];
      if (!save.multiEventQueue) save.multiEventQueue = [];
      if (!save.multiEventIndex) save.multiEventIndex = 0;
      if (save.wentToNCAA === undefined) save.wentToNCAA = false;
      if (save.startPoints === undefined) save.startPoints = 50;
    }
  },

  newGame() {
    this.attrs = {};
    ATTR_KEYS.forEach(k => this.attrs[k] = 0);
    this.remainPoints = 50;
    UI.renderAttrAlloc();
    UI.updateAttrDisplay(this.attrs, this.remainPoints);
    document.getElementById('player-name').value = '';
    UI.showScreen('screen-create');
  },

  loadGame() {
    const save = Engine.load();
    if (save) {
      this.state = save;
      this.enterGame();
    }
  },

  adjustAttr(key, delta) {
    const newVal = this.attrs[key] + delta;
    if (newVal < 0 || newVal > 10) return;
    if (delta > 0 && this.remainPoints <= 0) return;
    this.attrs[key] = newVal;
    this.remainPoints -= delta;
    UI.updateAttrDisplay(this.attrs, this.remainPoints);
  },

  // 文本输入属性值
  inputAttr(key, value) {
    const val = parseInt(value);
    if (isNaN(val) || val < 0 || val > 10) return;
    const oldVal = this.attrs[key];
    const diff = val - oldVal;
    if (diff > this.remainPoints) {
      // 点数不够，设为最大可用值
      this.attrs[key] = oldVal + this.remainPoints;
      this.remainPoints = 0;
    } else {
      this.attrs[key] = val;
      this.remainPoints -= diff;
    }
    UI.updateAttrDisplay(this.attrs, this.remainPoints);
  },

  randomAlloc() {
    this.attrs = {};
    ATTR_KEYS.forEach(k => this.attrs[k] = 0);
    let points = 50;
    while (points > 0) {
      const key = ATTR_KEYS[Math.floor(Math.random() * ATTR_KEYS.length)];
      if (this.attrs[key] < 10) { this.attrs[key]++; points--; }
    }
    this.remainPoints = 0;
    UI.updateAttrDisplay(this.attrs, this.remainPoints);
  },

  resetAlloc() {
    this.attrs = {};
    ATTR_KEYS.forEach(k => this.attrs[k] = 0);
    this.remainPoints = 50;
    UI.updateAttrDisplay(this.attrs, this.remainPoints);
  },

  confirmCreate() {
    if (this.remainPoints < 0 || this.remainPoints > 25) return;
    const used = 50 - this.remainPoints;
    const name = document.getElementById('player-name').value.trim() || '无名球员';
    this.state = Engine.createState(name, this.attrs);
    this.state.startPoints = used;
    this.enterGame();
  },

  enterGame() {
    UI.showScreen('screen-game');
    this.processYear();
  },

  processYear() {
    const state = this.state;
    if (!state || state.isRetired) return;

    // 退役检查
    if (state.age >= 35 && Engine.checkRetirement(state)) {
      this.triggerEnding();
      return;
    }

    // 选秀检查（只在多事件队列为空时触发）
    if (state.multiEventQueue.length === 0 && state.age >= 18 && state.age <= 22 && !state.drafted && !state.draftDeclined) {
      this.showDraftChoice();
      return;
    }

    // 交易检查（只在多事件队列为空时触发）
    if (state.multiEventQueue.length === 0) {
      const tradeData = Engine.checkTrade(state);
      if (tradeData) {
        UI.updateHUD(state);
        UI.showTradeEvent(tradeData);
        state.log.push({ age: state.age, text: `被交易到${NBA_TEAMS[tradeData.newTeam].name}` });
        Engine.save(state);
        return;
      }
    }

    // 多事件处理
    if (state.multiEventQueue.length === 0) {
      Engine.generateMultiEventQueue(state);
    }

    // 安全检查：确保索引有效
    if (state.multiEventIndex >= state.multiEventQueue.length) {
      this.finishYear();
      return;
    }

    const event = state.multiEventQueue[state.multiEventIndex];
    if (!event) {
      this.finishYear();
      return;
    }

    this.currentEvent = event;
    const isChoice = !!event.choices;
    const totalEvents = state.multiEventQueue.length;
    const currentNum = state.multiEventIndex + 1;
    const hasNextEvent = currentNum < totalEvents;

    UI.updateHUD(state);
    UI.showEvent(event, isChoice, currentNum, totalEvents, hasNextEvent);
    Engine.save(state);
  },

  finishYear() {
    this.currentEvent = null;
    Engine.advanceYear(this.state);

    if (this.state.age > 40) {
      this.triggerEnding();
      return;
    }

    if (this.state.age >= 22 && !this.state.drafted && this.state.draftDeclined) {
      this.triggerEnding();
      return;
    }

    this.processYear();
  },

  showDraftChoice() {
    const state = this.state;
    UI.updateHUD(state);

    let choices;
    let text;

    if (state.age === 18 && !state.wentToNCAA) {
      text = `你18岁了，高中毕业。你面前有三条路：直接参加NBA选秀、去NCAA大学联赛征战一年提升自己，或者再等一年。\n\nNBA选秀每年有60个名额。你的实力${this.getDraftEstimate()}。\n\n去NCAA可以让你在大学联赛中磨练一年，提升技术和球商，但也会推迟你的选秀时间。`;
      choices = [
        { text: '直接参加今年的选秀', effects: {} },
        { text: '去NCAA大学联赛征战一年', effects: {} },
        { text: '再等一年 / 放弃选秀', effects: {} }
      ];
    } else if (state.wentToNCAA && state.age === 19) {
      text = `你在NCAA大学联赛征战了一年，技术和心态都有了显著提升。现在你考虑是否参加今年的NBA选秀。\n\nNBA选秀每年有60个名额。经过NCAA的磨练，你的实力${this.getDraftEstimate()}。`;
      choices = [
        { text: '参加今年的选秀', effects: {} },
        { text: '继续磨练一年', effects: {} }
      ];
    } else {
      text = `你${state.age}岁了。${state.age === 22 ? '这是你参加选秀的最后机会了。' : '你考虑是否参加今年的NBA选秀。'}\n\nNBA选秀每年有60个名额。你的实力${this.getDraftEstimate()}。`;
      choices = [
        { text: '参加今年的选秀', effects: {} },
        { text: state.wentToNCAA ? '继续磨练一年' : '再等一年 / 放弃选秀', effects: {} }
      ];
    }

    const event = {
      title: `${state.age}岁 · ${state.age === 18 && !state.wentToNCAA ? '人生抉择' : '选秀抉择'}`,
      text,
      choices
    };
    this.currentEvent = { ...event, _isDraftChoice: true };
    UI.showEvent(event, true);
  },

  getDraftEstimate() {
    const s = this.state;
    const total = ATTR_KEYS.reduce((sum, k) => sum + s[k], 0) + s.honor * 3 + s.popularity * 2;
    if (total >= 65) return '极有可能在乐透区被选中';
    if (total >= 55) return '有望在首轮被选中';
    if (total >= 45) return '可能在首轮末或二轮被选中';
    if (total >= 35) return '有二轮被选中的可能';
    if (total >= 25) return '选秀前景不太乐观';
    return '选秀前景非常渺茫';
  },

  makeChoice(index) {
    const event = this.currentEvent;
    if (!event) return;

    if (event._isDraftChoice) {
      const hasNCAAOption = this.state.age === 18 && !this.state.wentToNCAA;

      if (index === 0) {
        // 参加选秀
        const result = Engine.processDraft(this.state, this.state.age);
        this.pendingDraft = result;
        UI.showScreen('screen-draft');
        UI.renderDraft(this.state, result);
      } else if (index === 1 && hasNCAAOption) {
        // 去NCAA大学联赛征战一年
        this.state.wentToNCAA = true;
        this.state.log.push({ age: this.state.age, text: '选择去NCAA大学联赛征战一年' });
        this.currentEvent = null;
        // 给予NCAA加成：属性小幅度提升
        this.state.offense = Math.min(10, this.state.offense + 0.5);
        this.state.basketball_iq = Math.min(10, this.state.basketball_iq + 0.5);
        this.state.mindset = Math.min(10, this.state.mindset + 0.5);
        this.state.popularity = Math.min(10, this.state.popularity + 1);
        this.finishYear();
      } else {
        // 拒绝选秀：22岁为最终放弃，18-21岁为等待下一年
        if (this.state.age >= 22) {
          this.state.draftDeclined = true;
          this.state.log.push({ age: this.state.age, text: '放弃参加选秀' });
          this.currentEvent = null;
          this.processYear();
        } else {
          this.state.log.push({ age: this.state.age, text: '放弃今年选秀，继续磨练' });
          this.currentEvent = null;
          this.finishYear();
        }
      }
      return;
    }

    const choice = event.choices[index];
    if (choice.effects) {
      const results = Engine.applyEffects(this.state, choice.effects);
      UI.showChoiceResult(index);
      this.state.log.push({ age: this.state.age, text: event.title });
    }
  },

  afterDraft() {
    const result = this.pendingDraft;
    if (result && result.drafted) {
      this.state.log.push({ age: this.state.age, text: `第${result.draftPick}顺位被${NBA_TEAMS[result.team].name}选中` });
    } else {
      this.state.draftDeclined = true;
      this.state.log.push({ age: this.state.age, text: '选秀落选' });
      if (this.state.age >= 22) {
        // Show overseas option instead of immediate ending
        this.pendingDraft = null;
        UI.showScreen('screen-game');
        const overseasEvent = {
          title: '选秀落选 · 人生抉择',
          text: `你没有在选秀中被任何球队选中。你的NBA梦碎了吗？\n\n但篮球之路不止一条。一支欧洲豪门联赛球队对你表示了兴趣，他们愿意给你一份合同。同时，你也可以选择继续在发展联盟等待机会，或者放弃篮球找一份普通工作。`,
          choices: [
            { text: '去欧洲联赛打球，曲线救国', effects: { basketball_iq: 1, mindset: 1, salary: 1 } },
            { text: '留在美国打发展联盟，等待NBA机会', effects: { offense: 1, discipline: 1 } },
            { text: '接受现实，放弃篮球', effects: { mindset: -2 } }
          ]
        };
        this.currentEvent = overseasEvent;
        UI.updateHUD(this.state);
        UI.showEvent(overseasEvent, true);
        Engine.save(this.state);
        return;
      }
    }
    this.pendingDraft = null;
    UI.showScreen('screen-game');
    this.currentEvent = null;
    this.processYear();
  },

  nextYear() {
    this.currentEvent = null;
    const state = this.state;
    if (!state || state.isRetired) return;

    // 多事件：推进到下一个事件
    state.multiEventIndex++;
    if (state.multiEventIndex < state.multiEventQueue.length) {
      this.processYear();
    } else {
      this.finishYear();
    }
  },

  triggerEnding() {
    // 保存最后一年的快照
    Engine.saveYearlySnapshot(this.state);

    const ending = calculateEnding(this.state);
    this.state.ending = ending.id;
    this.state.isRetired = true;
    Engine.save(this.state);
    Engine.saveEnding(ending.id);
    UI.renderEnding(ending, this.state);
    UI.showScreen('screen-ending');
  },

  confirmRetire() {
    const state = this.state;
    let msg = `你确定要在${state.age}岁退役吗？`;
    if (state.age < 30) msg += '\n\n你还很年轻，现在退役可能太早了。';
    else if (state.age < 35) msg += '\n\n你的职业生涯还有几年可以打。';
    else msg += '\n\n你已经在联盟征战多年，是时候做出决定了。';
    document.getElementById('retire-msg').textContent = msg;
    UI.showScreen('screen-retire-confirm');
  },

  doRetire() {
    this.triggerEnding();
  },

  showStats() {
    UI.renderStats(this.state);
    UI.showScreen('screen-stats');
  },

  showAttrMini() {
    UI.renderAttrPanel(this.state);
    UI.showScreen('screen-attr');
  },

  saveGame() {
    if (Engine.save(this.state)) {
      alert('存档成功！');
    } else {
      alert('存档失败！');
    }
  },

  backToGame() {
    UI.showScreen('screen-game');
  },

  showGallery() {
    UI.renderGallery('all');
    UI.showScreen('screen-gallery');
  },

  filterGallery(cat) {
    UI.renderGallery(cat);
  },

  backToTitle() {
    const save = Engine.load();
    document.getElementById('btn-continue').style.display = save ? 'block' : 'none';
    UI.showScreen('screen-title');
  },

  showHistory() {
    const state = this.state;
    let html = '';
    if (state.eventHistory.length === 0) {
      html = '<p style="color:var(--fg3);text-align:center;padding:20px">暂无事件记录</p>';
    } else {
      state.eventHistory.slice().reverse().forEach(e => {
        html += `<div class="history-item">`;
        html += `<div class="hi-age">${e.age}岁 | ${e.team} | 事件${e.eventNum}/${e.totalEvents}</div>`;
        html += `<div class="hi-title">${e.title}</div>`;
        if (e.choice) html += `<div class="hi-choice">选择：${e.choice}</div>`;
        if (e.effects && e.effects.length > 0) {
          const effectTexts = e.effects.map(r => {
            if (typeof r.change === 'string') return `${r.attr}: ${r.change}`;
            const sign = r.change > 0 ? '+' : '';
            return `${r.attr}${sign}${r.change}`;
          });
          html += `<div class="hi-effects">${effectTexts.join(' | ')}</div>`;
        }
        html += `</div>`;
      });
    }
    document.getElementById('history-content').innerHTML = html;
    UI.showScreen('screen-history');
  },

  // 生成生涯简图
  generateCareerImage() {
    const state = this.state;
    const canvas = document.getElementById('career-canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布大小（适合手机分享）
    canvas.width = 800;
    canvas.height = 1200;

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 篮球装饰
    ctx.fillStyle = 'rgba(212, 160, 23, 0.1)';
    ctx.beginPath();
    ctx.arc(400, 200, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 160, 23, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 标题
    ctx.fillStyle = '#d4a017';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NBA 终身篮球生涯模拟器', 400, 80);

    // 球员名字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.fillText(state.playerName, 400, 160);

    // 结局
    const ending = ENDINGS.find(e => e.id === state.ending);
    ctx.fillStyle = ending && ending.rarity === 'SSR' ? '#ff6b6b' : ending && ending.rarity === 'SR' ? '#ffd93d' : '#6bcb77';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillText(ending ? ending.name : '篮球人生', 400, 220);

    // 分割线
    ctx.strokeStyle = 'rgba(212, 160, 23, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 260);
    ctx.lineTo(700, 260);
    ctx.stroke();

    // 生涯数据
    ctx.textAlign = 'left';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = '#999';

    const teamName = state.team ? NBA_TEAMS[state.team].name : '自由球员';
    const draftText = state.drafted ? `第${state.draftPick}顺位` : '落选';

    const lines = [
      ['球队', teamName],
      ['选秀', draftText],
      ['NBA年数', `${state.nbaYears}年`],
      ['总冠军', `${state.championships}次`],
      ['全明星', `${state.allStar}次`],
      ['MVP', `${state.mvp}次`],
      ['DPOY', `${state.dpoy}次`],
      ['最佳阵容', `${state.allNBA}次`],
      ['退役年龄', `${state.age}岁`]
    ];

    lines.forEach(([label, val], i) => {
      const y = 310 + i * 40;
      ctx.fillStyle = '#666';
      ctx.fillText(label, 150, y);
      ctx.fillStyle = '#d4a017';
      ctx.fillText(val, 350, y);
    });

    // NBA场均数据
    const nbaStats = Engine.calcNBAStats(state);
    if (nbaStats) {
      ctx.strokeStyle = 'rgba(212, 160, 23, 0.3)';
      ctx.beginPath();
      ctx.moveTo(100, 600);
      ctx.lineTo(700, 600);
      ctx.stroke();

      ctx.fillStyle = '#d4a017';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('生涯场均数据', 400, 640);

      ctx.font = '18px "Courier New", monospace';
      ctx.textAlign = 'left';

      const statsLines = [
        ['得分', nbaStats.points.toFixed(1)],
        ['篮板', nbaStats.rebounds.toFixed(1)],
        ['助攻', nbaStats.assists.toFixed(1)],
        ['抢断', nbaStats.steals.toFixed(1)],
        ['盖帽', nbaStats.blocks.toFixed(1)],
        ['命中率', nbaStats.fgPct.toFixed(1) + '%'],
        ['三分', nbaStats.threePct.toFixed(1) + '%'],
        ['罚球', nbaStats.ftPct.toFixed(1) + '%']
      ];

      statsLines.forEach(([label, val], i) => {
        const y = 690 + i * 35;
        ctx.fillStyle = '#666';
        ctx.fillText(label, 200, y);
        ctx.fillStyle = '#e8e8e8';
        ctx.fillText(val, 400, y);
      });
    }

    // 底部
    ctx.fillStyle = '#333';
    ctx.font = '14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NBA 终身篮球生涯模拟器 | 纯文字回合制', 400, 1160);

    // 显示图片
    const img = document.getElementById('career-image');
    img.src = canvas.toDataURL('image/png');
    document.getElementById('career-image-result').style.display = 'block';
  },

  // 下载生涯简图
  downloadCareerImage() {
    const canvas = document.getElementById('career-canvas');
    const link = document.createElement('a');
    link.download = `${this.state.playerName}_NBA生涯.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};

App.init();
