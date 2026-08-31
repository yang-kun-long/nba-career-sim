/* ui.js - UI渲染模块 */

const UI = {
  // 属性分配界面（支持文本输入）
  renderAttrAlloc() {
    const container = document.getElementById('attr-alloc');
    let html = '';
    for (const key of ATTR_KEYS) {
      html += `
        <div class="attr-row" data-key="${key}">
          <span class="attr-icon">${ATTR_ICONS[key]}</span>
          <span class="attr-name">${ATTR_NAMES[key]}</span>
          <div class="attr-bar">
            <button onclick="App.adjustAttr('${key}',-1)">-</button>
            <input type="number" class="attr-input" id="ai-${key}" min="0" max="10" value="0"
              onchange="App.inputAttr('${key}',this.value)"
              onkeyup="App.inputAttr('${key}',this.value)">
            <button onclick="App.adjustAttr('${key}',1)">+</button>
          </div>
        </div>`;
    }
    container.innerHTML = html;
  },

  // 更新属性显示
  updateAttrDisplay(attrs, remain) {
    for (const key of ATTR_KEYS) {
      const el = document.getElementById(`av-${key}`);
      if (el) el.textContent = attrs[key];
      const input = document.getElementById(`ai-${key}`);
      if (input) input.value = attrs[key];
    }
    const remainEl = document.getElementById('remain-points');
    if (remainEl) remainEl.textContent = remain;
    const startBtn = document.getElementById('btn-start');
    if (startBtn) startBtn.disabled = remain < 0 || remain > 25;
  },

  // 游戏HUD
  updateHUD(state) {
    const teamName = state.team ? NBA_TEAMS[state.team].name : '自由球员';
    const salaryText = state.salary > 0 ? `$${(state.salary * 500 + 100).toFixed(0)}万` : '-';
    document.getElementById('hud-name').innerHTML = `<b>${state.playerName}</b>`;
    document.getElementById('hud-age').innerHTML = `年龄：<span class="hud-val">${state.age}岁</span>`;
    document.getElementById('hud-team').innerHTML = `球队：<span class="hud-val">${teamName}</span>`;
    document.getElementById('hud-salary').innerHTML = state.drafted ? `薪资：<span class="hud-val">${salaryText}</span>` : '';
    const retireBtn = document.getElementById('btn-retire');
    if (retireBtn) retireBtn.style.display = state.age >= 35 ? 'inline-block' : 'none';
  },

  // 显示事件（支持多事件进度显示）
  showEvent(event, isChoice, currentNum, totalEvents, hasNextEvent) {
    let titleText = event.title;
    if (totalEvents > 1) {
      titleText = `[${currentNum}/${totalEvents}] ${event.title}`;
    }
    document.getElementById('event-title').textContent = titleText;
    document.getElementById('event-text').textContent = event.text;
    document.getElementById('event-result').style.display = 'none';
    document.getElementById('event-next').style.display = 'none';

    // 动态按钮文字
    const nextBtn = document.querySelector('#event-next button');
    if (nextBtn) {
      nextBtn.textContent = hasNextEvent ? '下一步' : '继续下一年';
    }

    const choicesDiv = document.getElementById('event-choices');
    if (isChoice && event.choices) {
      choicesDiv.innerHTML = event.choices.map((c, i) =>
        `<button onclick="App.makeChoice(${i})">${c.text}</button>`
      ).join('');
      choicesDiv.style.display = 'flex';
    } else {
      choicesDiv.style.display = 'none';
      if (event.effects) {
        const results = Engine.applyEffects(App.state, event.effects);
        this.showEffects(results);
        Engine.recordEvent(App.state, event.title, null, results);
      }
      document.getElementById('event-next').style.display = 'block';
    }
  },

  // 显示选择结果
  showChoiceResult(choiceIndex) {
    const event = App.currentEvent;
    if (!event || !event.choices) return;
    const choice = event.choices[choiceIndex];
    const results = Engine.applyEffects(App.state, choice.effects);
    document.getElementById('event-choices').style.display = 'none';
    this.showEffects(results);
    document.getElementById('event-next').style.display = 'block';

    // 更新按钮文字
    const state = App.state;
    const hasNextEvent = state.multiEventIndex + 1 < state.multiEventQueue.length;
    const nextBtn = document.querySelector('#event-next button');
    if (nextBtn) nextBtn.textContent = hasNextEvent ? '下一步' : '继续下一年';

    Engine.recordEvent(App.state, event.title, choice.text, results);
  },

  // 显示交易事件
  showTradeEvent(tradeData) {
    const teamName = NBA_TEAMS[tradeData.newTeam].name;
    document.getElementById('event-title').textContent = '交易发生！';
    document.getElementById('event-text').textContent = tradeData.event.text + `\n\n你被交易到了${teamName}。`;
    document.getElementById('event-choices').style.display = 'none';
    const tradeInfo = Engine.executeTrade(App.state, tradeData.newTeam);
    const results = [
      { attr: '球队', change: `${tradeInfo.from} → ${tradeInfo.to}` },
      { attr: '球队信任', change: -2 }
    ];
    this.showEffects(results);
    document.getElementById('event-next').style.display = 'block';
    // 交易后继续当年事件
    const nextBtn = document.querySelector('#event-next button');
    if (nextBtn) nextBtn.textContent = '下一步';
    Engine.recordEvent(App.state, '交易发生', `被交易到${teamName}`, results);
  },

  // 显示属性变动
  showEffects(results) {
    const el = document.getElementById('event-result');
    if (!results || results.length === 0) {
      el.innerHTML = '<span class="effect-neutral">无明显变化</span>';
    } else {
      el.innerHTML = results.map(r => {
        if (typeof r.change === 'string') return `<span class="effect-neutral">${r.attr}：${r.change}</span>`;
        const cls = r.change > 0 ? 'effect-pos' : r.change < 0 ? 'effect-neg' : 'effect-neutral';
        const sign = r.change > 0 ? '+' : '';
        return `<span class="${cls}">${r.attr} ${sign}${r.change}</span>`;
      }).join('<br>');
    }
    el.style.display = 'block';
  },

  // 属性面板（含体测数据）
  renderAttrPanel(state) {
    let html = '<h3>能力属性</h3>';
    for (const key of ATTR_KEYS) {
      const val = Math.round(state[key] * 10) / 10;
      const pct = val * 10;
      html += `
        <div class="attr-bar-wrap">
          <span class="attr-name">${ATTR_ICONS[key]} ${ATTR_NAMES[key]}</span>
          <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span class="attr-val">${val}</span>
        </div>`;
    }
    document.getElementById('attr-display').innerHTML = html;

    const physical = Engine.calcPhysical(state);
    let physHtml = `
      <div class="physical-panel">
        <h3>📊 体测数据</h3>
        <div class="physical-grid">
          <div class="physical-item"><div class="pi-value">${physical.height}cm</div><div class="pi-label">身高</div></div>
          <div class="physical-item"><div class="pi-value">${physical.weight}kg</div><div class="pi-label">体重</div></div>
          <div class="physical-item"><div class="pi-value">${physical.wingspan}cm</div><div class="pi-label">臂展</div></div>
          <div class="physical-item"><div class="pi-value">${physical.vertical}cm</div><div class="pi-label">弹跳</div></div>
          <div class="physical-item"><div class="pi-value">${physical.sprint}s</div><div class="pi-label">冲刺</div></div>
          <div class="physical-item"><div class="pi-value">${physical.bench}次</div><div class="pi-label">卧推</div></div>
        </div>
      </div>
      <div class="hidden-display">
        <h3>隐藏数值</h3>
        <div class="hidden-row"><span>伤病累计</span><span>${state.injury}</span></div>
        <div class="hidden-row"><span>球队信任</span><span>${state.team_trust}</span></div>
        <div class="hidden-row"><span>人气</span><span>${state.popularity}</span></div>
        <div class="hidden-row"><span>荣誉值</span><span>${state.honor}</span></div>
        <div class="hidden-row"><span>薪资等级</span><span>${state.salary}</span></div>
      </div>`;
    document.getElementById('hidden-display').innerHTML = physHtml;
  },

  // 数据面板
  renderStats(state) {
    const teamName = state.team ? NBA_TEAMS[state.team].name : '无';
    const draftText = state.drafted ? `第${state.draftPick}顺位` : '未被选中';
    const physical = Engine.calcPhysical(state);
    const nbaStats = Engine.calcNBAStats(state);

    let html = '';

    // 基础信息
    html += '<div class="stat-section"><h3>📋 基础信息</h3>';
    const basicLines = [
      ['球员姓名', state.playerName],
      ['当前年龄', `${state.age}岁`],
      ['当前球队', teamName],
      ['选秀结果', draftText],
      ['NBA年数', `${state.nbaYears}年`],
      ['总生涯年数', `${state.careerYears}年`],
      ['总冠军', `${state.championships}次`],
      ['全明星', `${state.allStar}次`],
      ['MVP', `${state.mvp}次`],
      ['DPOY', `${state.dpoy}次`],
      ['最佳防守阵容', `${state.allDefensive}次`],
      ['最佳阵容', `${state.allNBA}次`]
    ];
    html += basicLines.map(([l, v]) => `<div class="stat-line"><span class="stat-label">${l}</span><span class="stat-value">${v}</span></div>`).join('');
    html += '</div>';

    // 当前NBA数据
    if (nbaStats) {
      html += `<div class="physical-panel"><h3>🏀 当前赛季场均数据</h3><div class="physical-grid">
        <div class="physical-item"><div class="pi-value">${nbaStats.points}</div><div class="pi-label">得分</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.rebounds}</div><div class="pi-label">篮板</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.assists}</div><div class="pi-label">助攻</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.steals}</div><div class="pi-label">抢断</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.blocks}</div><div class="pi-label">盖帽</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.fgPct}%</div><div class="pi-label">命中率</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.threePct}%</div><div class="pi-label">三分</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.ftPct}%</div><div class="pi-label">罚球</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.minutes}分钟</div><div class="pi-label">上场时间</div></div>
      </div></div>`;
    }

    // 体测数据
    html += `<div class="physical-panel"><h3>📊 体测数据</h3><div class="physical-grid">
      <div class="physical-item"><div class="pi-value">${physical.height}cm</div><div class="pi-label">身高</div></div>
      <div class="physical-item"><div class="pi-value">${physical.weight}kg</div><div class="pi-label">体重</div></div>
      <div class="physical-item"><div class="pi-value">${physical.wingspan}cm</div><div class="pi-label">臂展</div></div>
      <div class="physical-item"><div class="pi-value">${physical.vertical}cm</div><div class="pi-label">弹跳</div></div>
      <div class="physical-item"><div class="pi-value">${physical.sprint}s</div><div class="pi-label">冲刺</div></div>
      <div class="physical-item"><div class="pi-value">${physical.bench}次</div><div class="pi-label">卧推</div></div>
    </div></div>`;

    // 年度数据表格（含NBA数据）
    if (state.yearlyHistory.length > 0) {
      html += '<div class="stat-section"><h3>📅 年度数据记录</h3><div style="overflow-x:auto"><table class="yearly-table"><thead><tr>';
      html += '<th>年龄</th><th>球队</th><th>得分</th><th>篮板</th><th>助攻</th><th>抢断</th><th>盖帽</th><th>命中率</th><th>三分</th><th>罚球</th><th>进攻</th><th>防守</th><th>球商</th>';
      html += '</tr></thead><tbody>';
      state.yearlyHistory.forEach(h => {
        const stats = h.nbaStats;
        html += `<tr><td>${h.age}</td><td>${h.team === '无' ? '-' : h.team}</td>`;
        if (stats) {
          html += `<td>${stats.points}</td><td>${stats.rebounds}</td><td>${stats.assists}</td><td>${stats.steals}</td><td>${stats.blocks}</td><td>${stats.fgPct}%</td><td>${stats.threePct}%</td><td>${stats.ftPct}%</td>`;
        } else {
          html += '<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>';
        }
        html += `<td>${h.offense}</td><td>${h.defense}</td><td>${h.basketball_iq}</td></tr>`;
      });
      html += '</tbody></table></div></div>';
    }

    // 事件历史
    if (state.eventHistory.length > 0) {
      html += '<div class="stat-section"><h3>📜 事件记录</h3><div class="history-panel">';
      state.eventHistory.slice().reverse().forEach(e => {
        html += `<div class="history-item"><div class="hi-age">${e.age}岁 | ${e.team} | 事件${e.eventNum}/${e.totalEvents}</div>`;
        html += `<div class="hi-title">${e.title}</div>`;
        if (e.choice) html += `<div class="hi-choice">选择：${e.choice}</div>`;
        if (e.effects && e.effects.length > 0) {
          html += `<div class="hi-effects">${e.effects.map(r => typeof r.change === 'string' ? `${r.attr}: ${r.change}` : `${r.attr}${r.change > 0 ? '+' : ''}${r.change}`).join(' | ')}</div>`;
        }
        html += `</div>`;
      });
      html += '</div></div>';
    }

    document.getElementById('stats-content').innerHTML = html;
  },

  // 选秀画面
  renderDraft(state, draftResult) {
    let info = `<p>你今年${state.draftAge}岁，站在了NBA选秀大会的现场。</p><p>你的心跳加速，等待着命运的宣判...</p>`;
    document.getElementById('draft-info').innerHTML = info;
    setTimeout(() => {
      let result;
      if (draftResult.drafted) {
        const teamName = NBA_TEAMS[draftResult.team].name;
        const teamData = NBA_TEAMS[draftResult.team];
        let pickLabel = draftResult.pick <= 3 ? '乐透秀' : draftResult.pick <= 10 ? '前十顺位' : draftResult.pick <= 30 ? '首轮秀' : '二轮秀';
        result = `<p class="team-pick">第 ${draftResult.pick} 顺位</p><p class="team-pick">${teamName}</p><p class="draft-detail">${pickLabel}｜${teamData.conference}｜${teamData.style}</p><p class="draft-detail">教练：${teamData.coach}</p><p class="draft-detail">核心球员：${teamData.stars.join('、')}</p><p class="draft-detail">你的NBA生涯正式开始！</p>`;
      } else {
        result = `<p class="team-pick" style="color:#c0392b">落选</p><p class="draft-detail">你没有在选秀中被任何球队选中。</p><p class="draft-detail">但篮球之路不止一条，你可以选择继续追梦...</p>`;
      }
      document.getElementById('draft-result').innerHTML = result;
      document.getElementById('draft-next').style.display = 'block';
    }, 1500);
  },

  // 结局画面
  renderEnding(ending, state) {
    document.getElementById('ending-title').textContent = ending.name;
    const endingPanel = document.querySelector('.ending-panel');
    const existingDetails = endingPanel.querySelectorAll('.physical-panel, .stat-section');
    existingDetails.forEach(el => el.remove());
    const rarityClass = `rarity-${ending.rarity}`;
    document.getElementById('ending-text').innerHTML = `<span class="${rarityClass}">[${ending.rarity}]</span><br><br>${ending.text}`;

    const summary = Engine.generateSummary(state);
    const physical = summary.physical;
    const nbaStats = summary.nbaStats;

    let statsHtml = `
      <div class="es-line"><span class="es-label">球员</span><span class="es-val">${summary.name}</span></div>
      <div class="es-line"><span class="es-label">退役年龄</span><span class="es-val">${summary.age}岁</span></div>
      <div class="es-line"><span class="es-label">NBA年数</span><span class="es-val">${summary.nbaYears}年</span></div>
      <div class="es-line"><span class="es-label">总冠军</span><span class="es-val">${summary.championships}次</span></div>
      <div class="es-line"><span class="es-label">全明星</span><span class="es-val">${summary.allStar}次</span></div>
      <div class="es-line"><span class="es-label">MVP</span><span class="es-val">${summary.mvp}次</span></div>
      <div class="es-line"><span class="es-label">DPOY</span><span class="es-val">${summary.dpoy}次</span></div>
      <div class="es-line"><span class="es-label">最佳防守阵容</span><span class="es-val">${summary.allDefensive}次</span></div>
      <div class="es-line"><span class="es-label">最佳阵容</span><span class="es-val">${summary.allNBA}次</span></div>
      <div class="es-line"><span class="es-label">选秀顺位</span><span class="es-val">${summary.drafted ? '第'+summary.draftPick+'顺位' : '落选'}</span></div>`;
    document.getElementById('ending-stats').innerHTML = statsHtml;

    let detailHtml = '';

    // NBA场均数据
    if (nbaStats) {
      detailHtml += `<div class="physical-panel"><h3>🏀 生涯场均数据</h3><div class="physical-grid">
        <div class="physical-item"><div class="pi-value">${nbaStats.points}</div><div class="pi-label">得分</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.rebounds}</div><div class="pi-label">篮板</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.assists}</div><div class="pi-label">助攻</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.steals}</div><div class="pi-label">抢断</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.blocks}</div><div class="pi-label">盖帽</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.fgPct}%</div><div class="pi-label">命中率</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.threePct}%</div><div class="pi-label">三分</div></div>
        <div class="physical-item"><div class="pi-value">${nbaStats.ftPct}%</div><div class="pi-label">罚球</div></div>
      </div></div>`;
    }

    // 体测数据
    detailHtml += `<div class="physical-panel"><h3>📊 最终体测数据</h3><div class="physical-grid">
      <div class="physical-item"><div class="pi-value">${physical.height}cm</div><div class="pi-label">身高</div></div>
      <div class="physical-item"><div class="pi-value">${physical.weight}kg</div><div class="pi-label">体重</div></div>
      <div class="physical-item"><div class="pi-value">${physical.wingspan}cm</div><div class="pi-label">臂展</div></div>
      <div class="physical-item"><div class="pi-value">${physical.vertical}cm</div><div class="pi-label">弹跳</div></div>
      <div class="physical-item"><div class="pi-value">${physical.sprint}s</div><div class="pi-label">冲刺</div></div>
      <div class="physical-item"><div class="pi-value">${physical.bench}次</div><div class="pi-label">卧推</div></div>
    </div></div>`;

    // 年度数据表格
    if (state.yearlyHistory.length > 0) {
      detailHtml += '<div class="stat-section"><h3>📅 年度数据记录</h3><div style="overflow-x:auto"><table class="yearly-table"><thead><tr>';
      detailHtml += '<th>年龄</th><th>球队</th><th>得分</th><th>篮板</th><th>助攻</th><th>抢断</th><th>盖帽</th><th>命中率</th><th>三分</th><th>罚球</th>';
      detailHtml += '</tr></thead><tbody>';
      state.yearlyHistory.forEach(h => {
        const s = h.nbaStats;
        detailHtml += `<tr><td>${h.age}</td><td>${h.team === '无' ? '-' : h.team}</td>`;
        if (s) detailHtml += `<td>${s.points}</td><td>${s.rebounds}</td><td>${s.assists}</td><td>${s.steals}</td><td>${s.blocks}</td><td>${s.fgPct}%</td><td>${s.threePct}%</td><td>${s.ftPct}%</td>`;
        else detailHtml += '<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>';
        detailHtml += `</tr>`;
      });
      detailHtml += '</tbody></table></div></div>';
    }

    // 事件历史
    if (state.eventHistory.length > 0) {
      detailHtml += '<div class="stat-section"><h3>📜 完整生涯事件记录</h3><div class="history-panel">';
      state.eventHistory.forEach(e => {
        detailHtml += `<div class="history-item"><div class="hi-age">${e.age}岁 | ${e.team} | 事件${e.eventNum}/${e.totalEvents}</div>`;
        detailHtml += `<div class="hi-title">${e.title}</div>`;
        if (e.choice) detailHtml += `<div class="hi-choice">选择：${e.choice}</div>`;
        if (e.effects && e.effects.length > 0) {
          detailHtml += `<div class="hi-effects">${e.effects.map(r => typeof r.change === 'string' ? `${r.attr}: ${r.change}` : `${r.attr}${r.change > 0 ? '+' : ''}${r.change}`).join(' | ')}</div>`;
        }
        detailHtml += `</div>`;
      });
      detailHtml += '</div></div>';
    }

    document.getElementById('ending-stats').insertAdjacentHTML('afterend', detailHtml);
  },

  // 图鉴
  renderGallery(filter) {
    const all = getGalleryData();
    const unlocked = Engine.getUnlockedEndings();
    const filtered = filter === 'all' ? all : all.filter(e => e.category === filter);
    document.getElementById('gallery-list').innerHTML = filtered.map(e => {
      const isUnlocked = unlocked.includes(e.id);
      return `<div class="gallery-item ${isUnlocked ? '' : 'locked'}">
        <div class="gi-name">${isUnlocked ? e.name : '???'}</div>
        <div class="gi-cat"><span class="rarity-${e.rarity}">[${e.rarity}]</span> ${e.category === 'legend' ? '传奇' : e.category === 'quality' ? '优质' : e.category === 'tragedy' ? '遗憾' : e.category === 'retire' ? '转型' : '普通'}</div>
        <div class="gi-desc">${isUnlocked ? e.desc : '未解锁'}</div>
      </div>`;
    }).join('');
    document.querySelectorAll('.gallery-tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.cat === filter));
  },

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
};
