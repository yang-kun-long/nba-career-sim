/* teams.js - 15支NBA球队（2025赛季交易截止日后）及真实球员数据 */

const NBA_TEAMS = {
  warriors: {
    name: '金州勇士', city: 'Golden State', abbr: 'GSW',
    style: '跑轰体系', conference: '西部',
    stars: ['Stephen Curry', 'Draymond Green'],
    roster: ['Stephen Curry','Draymond Green','Jonathan Kuminga','Andrew Wiggins','Brandin Podziemski','Buddy Hield','Kevon Looney','Moses Moody','Kyle Anderson','Gary Payton II'],
    coach: 'Steve Kerr',
    description: '王朝球队，以Curry为核心的小球跑轰体系，追求团队篮球。',
    draftWeight: 10,
    color: '#1D428A'
  },
  lakers: {
    name: '洛杉矶湖人', city: 'Los Angeles', abbr: 'LAL',
    style: '巨星驱动', conference: '西部',
    stars: ['LeBron James', 'Luka Doncic'],
    roster: ['LeBron James','Luka Doncic','Austin Reaves','Rui Hachimura','Jarred Vanderbilt','Gabe Vincent','Jaxson Hayes','Max Christie','Cam Reddish','Dorian Finney-Smith'],
    coach: 'JJ Redick',
    description: '豪门球队，Luka加盟后与LeBron组成超级双核。',
    draftWeight: 8,
    color: '#552583'
  },
  clippers: {
    name: '洛杉矶快船', city: 'Los Angeles', abbr: 'LAC',
    style: '攻守均衡', conference: '西部',
    stars: ['Kawhi Leonard', 'James Harden'],
    roster: ['Kawhi Leonard','James Harden','Norman Powell','Ivica Zubac','Terance Mann','Amir Coffey','Derrick Jones Jr.','Nicolas Batum','Bogdan Bogdanovic','Ben Simmons'],
    coach: 'Tyronn Lue',
    description: '双核驱动的均衡球队，防守端极具压迫性。',
    draftWeight: 8,
    color: '#C8102E'
  },
  spurs: {
    name: '圣安东尼奥马刺', city: 'San Antonio', abbr: 'SAS',
    style: '传统体系', conference: '西部',
    stars: ['Victor Wembanyama'],
    roster: ['Victor Wembanyama','Devin Vassell','Jeremy Sochan','Keldon Johnson','Tre Jones','Zach Collins','Chris Paul','Harrison Barnes','Stephon Castle','Julian Champagnie'],
    coach: 'Gregg Popovich',
    description: '以Wembanyama为基石重建的传统强队，CP3加盟指导新人。',
    draftWeight: 12,
    color: '#C4CED4'
  },
  thunder: {
    name: '俄克拉荷马雷霆', city: 'Oklahoma City', abbr: 'OKC',
    style: '青年军', conference: '西部',
    stars: ['Shai Gilgeous-Alexander', 'Jalen Williams', 'Chet Holmgren'],
    roster: ['Shai Gilgeous-Alexander','Jalen Williams','Chet Holmgren','Lu Dort','Isaiah Hartenstein','Alex Caruso','Aaron Wiggins','Cason Wallace','Kenrich Williams','Ajay Mitchell'],
    coach: 'Mark Daigneault',
    description: '联盟最强青年军，天赋爆棚的超级新星组合。',
    draftWeight: 6,
    color: '#007AC1'
  },
  celtics: {
    name: '波士顿凯尔特人', city: 'Boston', abbr: 'BOS',
    style: '团队篮球', conference: '东部',
    stars: ['Jayson Tatum', 'Jaylen Brown'],
    roster: ['Jayson Tatum','Jaylen Brown','Derrick White','Jrue Holiday','Kristaps Porzingis','Al Horford','Payton Pritchard','Sam Hauser','Luke Kornet','Xavier Tillman'],
    coach: 'Joe Mazzulla',
    description: '卫冕冠军，双探花领衔的完美团队体系。',
    draftWeight: 5,
    color: '#007A33'
  },
  bucks: {
    name: '密尔沃基雄鹿', city: 'Milwaukee', abbr: 'MIL',
    style: '巨星体系', conference: '东部',
    stars: ['Giannis Antetokounmpo', 'Damian Lillard'],
    roster: ['Giannis Antetokounmpo','Damian Lillard','Khris Middleton','Bobby Portis','Brook Lopez','Pat Connaughton','Gary Trent Jr.','Taurean Prince','AJ Green','Andre Jackson Jr.'],
    coach: 'Doc Rivers',
    description: '字母哥统治攻防两端的超级球队。',
    draftWeight: 7,
    color: '#00471B'
  },
  nuggets: {
    name: '丹佛掘金', city: 'Denver', abbr: 'DEN',
    style: '中锋策应', conference: '西部',
    stars: ['Nikola Jokic', 'Jamal Murray'],
    roster: ['Nikola Jokic','Jamal Murray','Michael Porter Jr.','Aaron Gordon','Russell Westbrook','Christian Braun','Peyton Watson','Dario Saric','DeAndre Jordan','Julian Strawther'],
    coach: 'Michael Malone',
    description: '约基奇统领的冠军球队，中锋策应体系独步联盟。',
    draftWeight: 6,
    color: '#0E2240'
  },
  knicks: {
    name: '纽约尼克斯', city: 'New York', abbr: 'NYK',
    style: '铁血防守', conference: '东部',
    stars: ['Jalen Brunson', 'Karl-Anthony Towns'],
    roster: ['Jalen Brunson','Karl-Anthony Towns','OG Anunoby','Mikal Bridges','Josh Hart','Donte DiVincenzo','Mitchell Robinson','Miles McBride','Precious Achiuwa','Cameron Payne'],
    coach: 'Tom Thibodeau',
    description: '重返豪门行列的纽约之师，铁血防守著称。',
    draftWeight: 8,
    color: '#F58426'
  },
  mavericks: {
    name: '达拉斯独行侠', city: 'Dallas', abbr: 'DAL',
    style: '双核驱动', conference: '西部',
    stars: ['Kyrie Irving', 'Klay Thompson'],
    roster: ['Kyrie Irving','Klay Thompson','P.J. Washington','Daniel Gafford','Dereck Lively II','Dante Exum','Spencer Dinwiddie','Naji Marshall','Quentin Grimes','Jaden Hardy'],
    coach: 'Jason Kidd',
    description: '失去Luka后围绕Kyrie重建的坚韧之师。',
    draftWeight: 9,
    color: '#00538C'
  },
  heat: {
    name: '迈阿密热火', city: 'Miami', abbr: 'MIA',
    style: '铁血文化', conference: '东部',
    stars: ['Jimmy Butler', 'Bam Adebayo', 'Tyler Herro'],
    roster: ['Jimmy Butler','Bam Adebayo','Tyler Herro','Terry Rozier','Duncan Robinson','Kevin Love','Haywood Highsmith','Jaime Jaquez Jr.','Nikola Jovic','Thomas Bryant'],
    coach: 'Erik Spoelstra',
    description: '以铁血文化著称的东部劲旅，Spoelstra是联盟最好的教练之一。',
    draftWeight: 7,
    color: '#98002E'
  },
  sixers: {
    name: '费城76人', city: 'Philadelphia', abbr: 'PHI',
    style: '巨星体系', conference: '东部',
    stars: ['Joel Embiid', 'Paul George', 'Tyrese Maxey'],
    roster: ['Joel Embiid','Paul George','Tyrese Maxey','Caleb Martin','Kelly Oubre Jr.','Andre Drummond','Eric Gordon','Kyle Lowry','KJ Martin','Reggie Jackson'],
    coach: 'Nick Nurse',
    description: '三巨头联手冲击总冠军，Embiid的健康是关键。',
    draftWeight: 7,
    color: '#006BB6'
  },
  suns: {
    name: '菲尼克斯太阳', city: 'Phoenix', abbr: 'PHX',
    style: '进攻火力', conference: '西部',
    stars: ['Kevin Durant', 'Devin Booker', 'Bradley Beal'],
    roster: ['Kevin Durant','Devin Booker','Bradley Beal','Jusuf Nurkic','Grayson Allen','Royce O\'Neale','Bol Bol','Ryan Dunn','Monte Morris','Mason Plumlee'],
    coach: 'Mike Budenholzer',
    description: '三巨头组合火力全开，进攻端无死角的超级球队。',
    draftWeight: 6,
    color: '#E56020'
  },
  cavaliers: {
    name: '克利夫兰骑士', city: 'Cleveland', abbr: 'CLE',
    style: '青年崛起', conference: '东部',
    stars: ['Donovan Mitchell', 'Darius Garland', 'Evan Mobley'],
    roster: ['Donovan Mitchell','Darius Garland','Evan Mobley','Jarrett Allen','Max Strus','Caris LeVert','Isaac Okoro','Sam Merrill','Dean Wade','Georges Niang'],
    coach: 'Kenny Atkinson',
    description: '东部最强青年军，Mitchell率领的崛起之师。',
    draftWeight: 6,
    color: '#860038'
  },
  timberwolves: {
    name: '明尼苏达森林狼', city: 'Minnesota', abbr: 'MIN',
    style: '防守至上', conference: '西部',
    stars: ['Anthony Edwards', 'Rudy Gobert', 'Julius Randle'],
    roster: ['Anthony Edwards','Rudy Gobert','Julius Randle','Jaden McDaniels','Mike Conley','Naz Reid','Nickeil Alexander-Walker','Donte DiVincenzo','Monte Morris','Leonard Miller'],
    coach: 'Chris Finch',
    description: '防守铁军，Anthony Edwards正在成为联盟新的门面。',
    draftWeight: 6,
    color: '#0C2340'
  }
};

const TEAM_KEYS = Object.keys(NBA_TEAMS);

// 知名球星（事件中引用）
const NBA_PLAYERS = {
  superstars: ['LeBron James','Stephen Curry','Kevin Durant','Giannis Antetokounmpo','Nikola Jokic','Luka Doncic','Jayson Tatum','Shai Gilgeous-Alexander','Victor Wembanyama','Anthony Edwards'],
  young_guns: ['Victor Wembanyama','Chet Holmgren','Jalen Williams','Brandon Miller','Amen Thompson','Paolo Banchero','Scottie Barnes','Stephon Castle','Zaccharie Risacher','Reed Sheppard'],
  veterans: ['LeBron James','Chris Paul','Stephen Curry','Kevin Durant','James Harden','Russell Westbrook','Kyle Lowry','Al Horford','Mike Conley','Andre Iguodala'],
  international: ['Victor Wembanyama','Luka Doncic','Nikola Jokic','Giannis Antetokounmpo','Shai Gilgeous-Alexander','Alperen Sengun','Lauri Markkanen','Evan Mobley']
};

// 知名经纪人
const AGENTS = [
  {name: 'Rich Paul', company: 'Klutch Sports', desc: 'LeBron的经纪人，联盟最有权势的经纪人之一'},
  {name: 'Jeff Schwartz', company: 'Excel Sports', desc: '代理多位全明星球员的顶级经纪人'},
  {name: 'Mark Bartelstein', company: 'Priority Sports', desc: '以谈判能力著称的资深经纪人'},
  {name: 'Aaron Mintz', company: 'CAA Sports', desc: '代理多位年轻球星的新锐经纪人'},
  {name: 'Bill Duffy', company: 'BDA Sports', desc: '国际球员经纪领域的专家'},
  {name: 'Rob Pelinka', company: 'Former Agent', desc: '前经纪人，现湖人总经理'}
];

// 知名记者/媒体人
const REPORTERS = [
  {name: 'Shams Charania', outlet: 'ESPN', desc: 'NBA新闻爆料王，消息最灵通的记者'},
  {name: 'Adrian Wojnarowski', outlet: 'ESPN', desc: 'Woj Bomb！NBA最具影响力的记者'},
  {name: 'Stephen A. Smith', outlet: 'ESPN', desc: '最具争议性的NBA评论员'},
  {name: 'Skip Bayless', outlet: 'Fox Sports', desc: '以大胆言论著称的评论员'},
  {name: 'Zach Lowe', outlet: 'ESPN', desc: '最专业的NBA战术分析师'},
  {name: 'Brian Windhorst', outlet: 'ESPN', desc: 'LeBron御用记者，联盟内幕专家'}
];

// 球星互动事件池
const STAR_ENCOUNTERS = [
  { player: 'LeBron James', text: 'LeBron James在赛后找到你，拍了拍你的肩膀说："年轻人，保持饥饿感，联盟会奖励那些最努力的人。"', effect: { mindset: 1, discipline: 1 } },
  { player: 'Stephen Curry', text: 'Stephen Curry邀请你一起加练三分球，你被他变态的投篮手感深深震撼。', effect: { offense: 1 } },
  { player: 'Victor Wembanyama', text: '你和Victor Wembanyama在训练馆偶遇，他用2米26的身高展示后卫般的运球，你深受启发。', effect: { basketball_iq: 1 } },
  { player: 'Giannis Antetokounmpo', text: 'Giannis Antetokounmpo分享了他从希腊底层奋斗到NBA巨星的经历，你被深深打动。', effect: { mindset: 2 } },
  { player: 'Kevin Durant', text: 'Kevin Durant在训练后和你聊了很久，告诉你"别管外界噪音，专注于变强"。', effect: { mindset: 1, offense: 1 } },
  { player: 'Nikola Jokic', text: '你观看了Nikola Jokic的比赛录像，被他不可思议的传球视野所折服。', effect: { basketball_iq: 1 } },
  { player: 'Shai Gilgeous-Alexander', text: 'Shai Gilgeous-Alexander在场上用无解中投教训了你，让你意识到技术打磨永无止境。', effect: { offense: 1, discipline: 1 } },
  { player: 'Jayson Tatum', text: 'Jayson Tatum和你分享了季后赛经验："到了关键时刻，比的不是技术，是心态。"', effect: { mindset: 1 } },
  { player: 'Luka Doncic', text: 'Luka Doncic和你聊到从欧洲到NBA的适应过程："打好自己的篮球，其他都不重要。"', effect: { basketball_iq: 1 } },
  { player: 'Damian Lillard', text: 'Damian Lillard在更衣室里和你聊到忠诚与选择："每个人都有自己的路。"', effect: { mindset: 1 } },
  { player: 'Anthony Edwards', text: 'Anthony Edwards在训练中展示了他的暴力扣篮，告诉你"打球要有态度"。', effect: { mindset: 1, athletics: 1 } },
  { player: 'Chris Paul', text: 'Chris Paul教你如何阅读防守，他的比赛智商让你叹为观止。', effect: { basketball_iq: 2 } },
  { player: 'Jimmy Butler', text: 'Jimmy Butler凌晨四点在训练馆加练，你被他的职业态度震撼。他说："天赋决定上限，努力决定下限。"', effect: { discipline: 2 } },
  { player: 'Joel Embiid', text: 'Joel Embiid在赛后和你聊天，分享了他从喀麦隆到NBA的传奇经历。他说每一次伤病都让他更强大。', effect: { mindset: 1, body: 1 } },
  { player: 'Tyrese Maxey', text: 'Tyrese Maxey和你分享了他如何在休赛期疯狂提升投篮，他说"夏天的汗水决定赛季的荣耀"。', effect: { discipline: 1, offense: 1 } },
  { player: 'Devin Booker', text: 'Devin Booker在训练中展示了无解的中距离跳投，告诉你"把一件事练到极致，就是你的武器"。', effect: { offense: 2 } },
  { player: 'Donovan Mitchell', text: 'Donovan Mitchell在训练后和你聊到季后赛心态："常规赛和季后赛是完全不同的运动。"', effect: { mindset: 1, basketball_iq: 1 } },
  { player: 'Evan Mobley', text: 'Evan Mobley和你一起练习防守脚步，他2米11的身高却有着后卫般的灵活性，你受益匪浅。', effect: { defense: 2 } },
  { player: 'Rudy Gobert', text: 'Rudy Gobert教你如何用身体和站位控制禁区，他说"防守是一种艺术，不只是盖帽"。', effect: { defense: 2 } },
  { player: 'Bam Adebayo', text: 'Bam Adebayo和你分享了小球时代中锋的生存之道："能换防五个位置，你就永远不会被淘汰。"', effect: { defense: 1, basketball_iq: 1 } },
  { player: 'Paul George', text: 'Paul George和你聊到伤病后的复出经历："最难的不是身体恢复，是重新相信自己。"', effect: { mindset: 2 } },
  { player: 'Bradley Beal', text: 'Bradley Beal在更衣室里分享了他在弱队当核心的孤独感："赢球才是最好的解药。"', effect: { mindset: 1 } }
];

// 经纪人互动事件
const AGENT_ENCOUNTERS = [
  { agent: 'Rich Paul', text: 'Rich Paul通过关系联系到你，他说你在联盟的前景很好，想和你聊聊商业规划。他的Klutch Sports已经帮无数球员拿到了顶薪合同。', effect: { popularity: 1 } },
  { agent: 'Rich Paul', text: 'Rich Paul在赛后派助理联系你，暗示如果换一个经纪人，你可能拿到更大的合同。你陷入思考。', effect: { mindset: 1 } },
  { agent: 'Jeff Schwartz', text: 'Jeff Schwartz的团队发来了合作意向书，他们代理过多位全明星球员。他的Excel Sports在谈判桌上从未输过。', effect: { basketball_iq: 1 } },
  { agent: 'Mark Bartelstein', text: 'Mark Bartelstein在赛后找到你，聊了聊你的合同前景和商业价值。他说你的市场潜力远超你自己的想象。', effect: { mindset: 1 } },
  { agent: 'Aaron Mintz', text: 'Aaron Mintz的CAA Sports团队对你很感兴趣，他们擅长帮年轻球员打造个人品牌。', effect: { popularity: 1 } },
  { agent: 'Bill Duffy', text: 'Bill Duffy分享了他代理国际球员的经验，他说全球化时代，每个球员都是一个品牌。', effect: { basketball_iq: 1 } }
];

// 记者互动事件
const REPORTER_ENCOUNTERS = [
  { reporter: 'Shams Charania', text: 'Shams Charania在球员通道拦住你做了简短采访，你的回答可能会被全联盟看到。他的推特有超过200万关注者。', effect: { popularity: 1 } },
  { reporter: 'Shams Charania', text: 'Shams Charania爆料你正在和球队讨论续约细节，消息一出各路媒体蜂拥而至。你学会了如何应对媒体。', effect: { mindset: 1 } },
  { reporter: 'Adrian Wojnarowski', text: 'Woj发推提到你正在和球队谈续约，消息一出你的手机被打爆了。Woj Bomb的威力你这次算是见识到了。', effect: { popularity: 1 } },
  { reporter: 'Adrian Wojnarowski', text: 'Woj在播客中提到你的名字，说你是"联盟最被低估的球员之一"。这段话迅速在社交媒体上疯传。', effect: { popularity: 1, mindset: 1 } },
  { reporter: 'Stephen A. Smith', text: 'Stephen A. Smith在节目上公开批评了你的表现，用了整整五分钟分析你的弱点。你该如何回应？', effect: { mindset: 1 } },
  { reporter: 'Stephen A. Smith', text: 'Stephen A. Smith在First Take上把你和同届新秀做对比，言辞犀利。你决定用球场表现说话。', effect: { discipline: 1 } },
  { reporter: 'Zach Lowe', text: 'Zach Lowe写了一篇深度分析文章，详细解读了你的比赛风格和进步空间。这篇文章让你重新审视了自己的打法。', effect: { basketball_iq: 1 } },
  { reporter: 'Zach Lowe', text: 'Zach Lowe在播客中用了二十分钟分析你的高级数据，指出你的PER值被严重低估。你第一次认真研究了高级数据。', effect: { basketball_iq: 1 } },
  { reporter: 'Skip Bayless', text: 'Skip Bayless在推特上嘲讽你的表现，拿你和历史巨星做不合理的比较。你学会了不被噪音干扰。', effect: { mindset: 1 } },
  { reporter: 'Brian Windhorst', text: 'Brian Windhorst在节目中暗示你的球队可能在交易截止日前有动作，你开始思考自己的未来。', effect: { mindset: 1 } }
];

function getRandomTeam() {
  return TEAM_KEYS[Math.floor(Math.random() * TEAM_KEYS.length)];
}

function getDraftTeam(pick) {
  if (pick <= 3) {
    const pool = TEAM_KEYS.filter(k => NBA_TEAMS[k].draftWeight >= 8);
    return pool[Math.floor(Math.random() * pool.length)];
  } else if (pick <= 10) {
    const pool = TEAM_KEYS.filter(k => NBA_TEAMS[k].draftWeight >= 6);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return TEAM_KEYS[Math.floor(Math.random() * TEAM_KEYS.length)];
}

function getTradeTeam(currentTeam) {
  const others = TEAM_KEYS.filter(k => k !== currentTeam);
  return others[Math.floor(Math.random() * others.length)];
}

function getRandomStarEncounter() {
  return STAR_ENCOUNTERS[Math.floor(Math.random() * STAR_ENCOUNTERS.length)];
}

function getRandomAgentEncounter() {
  return AGENT_ENCOUNTERS[Math.floor(Math.random() * AGENT_ENCOUNTERS.length)];
}

function getRandomReporterEncounter() {
  return REPORTER_ENCOUNTERS[Math.floor(Math.random() * REPORTER_ENCOUNTERS.length)];
}

export {
  NBA_TEAMS,
  TEAM_KEYS,
  NBA_PLAYERS,
  AGENTS,
  REPORTERS,
  STAR_ENCOUNTERS,
  AGENT_ENCOUNTERS,
  REPORTER_ENCOUNTERS,
  getRandomTeam,
  getDraftTeam,
  getTradeTeam,
  getRandomStarEncounter,
  getRandomAgentEncounter,
  getRandomReporterEncounter
};
