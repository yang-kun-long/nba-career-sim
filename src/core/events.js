/* events.js - 全部事件池：300+选择事件 + 120+叙事事件，按年龄段严格分层 */

// ============================================================
// 阶段1：少年发育期【12-17岁｜高中阶段】
// ============================================================

const YOUTH_CHOICE_EVENTS = [
  // 12岁
  {id:'y12_c01',age:12,title:'课后抉择',text:'放学后，同学们都跑去打游戏，但今天篮球队有训练。你犹豫了。',choices:[
    {text:'去篮球队训练',effects:{discipline:1,stamina:1}},
    {text:'和同学去打游戏',effects:{discipline:-1,popularity:1}},
    {text:'先打一小时游戏再去训练',effects:{offense:1,discipline:-1}}
  ]},
  {id:'y12_c02',age:12,title:'街头篮球邀请',text:'周末，街边球场一群大人在打球，有人招呼你上场试试。你有点紧张。',choices:[
    {text:'勇敢上场挑战',effects:{mindset:1,athletics:1}},
    {text:'在旁边观看学习',effects:{basketball_iq:1}},
    {text:'回家继续练习基本功',effects:{offense:1,discipline:1}}
  ]},
  {id:'y12_c03',age:12,title:'体育课比赛',text:'体育课上打班级对抗赛，你面对比你高一头的对手。',choices:[
    {text:'用速度突破他',effects:{athletics:1,offense:1}},
    {text:'用投篮解决战斗',effects:{offense:1}},
    {text:'传球给队友组织进攻',effects:{basketball_iq:1}}
  ]},
  {id:'y12_c04',age:12,title:'父亲的建议',text:'你父亲看你打球后说："你想打职业篮球？那得比别人付出十倍努力。"',choices:[
    {text:'从此每天早起练球',effects:{discipline:2,stamina:-1}},
    {text:'觉得父亲太严厉，有点抵触',effects:{mindset:-1}},
    {text:'默默记在心里，按自己节奏来',effects:{mindset:1}}
  ]},
  {id:'y12_c05',age:12,title:'新球鞋的诱惑',text:'你看到一双很酷的篮球鞋，但价格不便宜。',choices:[
    {text:'攒钱买下来激励自己',effects:{discipline:1,popularity:1}},
    {text:'把钱花在报篮球训练班上',effects:{offense:1,basketball_iq:1}},
    {text:'穿旧鞋继续打球',effects:{mindset:1}}
  ]},

  // 13岁
  {id:'y13_c01',age:13,title:'校队选拔',text:'学校篮球队开始选拔新人，名额有限，竞争激烈。',choices:[
    {text:'全力以赴展示自己',effects:{mindset:1,athletics:1}},
    {text:'重点展示团队配合能力',effects:{basketball_iq:1,defense:1}},
    {text:'赛前紧张到失眠',effects:{mindset:-1}}
  ]},
  {id:'y13_c02',age:13,title:'训练偷懒',text:'教练安排了高强度体能训练，你已经很累了。',choices:[
    {text:'咬牙坚持完成',effects:{stamina:2,discipline:1}},
    {text:'偷偷减少几组',effects:{stamina:-1,discipline:-1}},
    {text:'向教练说明身体不适',effects:{stamina:1}}
  ]},
  {id:'y13_c03',age:13,title:'早恋风波',text:'班上有个女生对你有好感，你也被吸引了。训练时总是分心。',choices:[
    {text:'专注于篮球，婉拒对方',effects:{discipline:2,popularity:-1}},
    {text:'开始谈恋爱',effects:{discipline:-1,mindset:1,popularity:1}},
    {text:'保持距离但不影响训练',effects:{discipline:1}}
  ]},
  {id:'y13_c04',age:13,title:'受伤的队友',text:'你的好朋友在训练中扭伤了脚踝，需要休养一个月。',choices:[
    {text:'每天去陪他，帮他做康复训练',effects:{mindset:1,defense:1}},
    {text:'利用这个机会争取更多上场时间',effects:{offense:1,discipline:1}},
    {text:'担心自己也会受伤，训练变得保守',effects:{mindset:-1,defense:1}}
  ]},
  {id:'y13_c05',age:13,title:'篮球视频学习',text:'你在YouTube上看到了NBA球星Victor Wembanyama的训练视频。',choices:[
    {text:'模仿他的训练方法',effects:{athletics:1,body:1}},
    {text:'研究他的比赛技巧',effects:{basketball_iq:1,offense:1}},
    {text:'看完就算了',effects:{}}
  ]},

  // 14岁
  {id:'y14_c01',age:14,title:'体能瓶颈',text:'你发现自己的体能跟不上训练强度了，总是练到一半就没力气。',choices:[
    {text:'开始系统健身训练',effects:{stamina:2,body:1,discipline:1}},
    {text:'减少训练量保存体力',effects:{stamina:-1,discipline:-1}},
    {text:'向教练请教体能训练方法',effects:{stamina:1,basketball_iq:1}}
  ]},
  {id:'y14_c02',age:14,title:'地区选拔赛',text:'地区青少年篮球选拔赛开始了，表现好可以进入市队。',choices:[
    {text:'积极报名参加',effects:{mindset:1,offense:1}},
    {text:'觉得自己还不够格，放弃',effects:{mindset:-1}},
    {text:'报名但压力很大，发挥失常',effects:{mindset:-1,stamina:1}}
  ]},
  {id:'y14_c03',age:14,title:'沉迷游戏',text:'你发现了一款超好玩的篮球游戏，每天晚上都玩到很晚。',choices:[
    {text:'卸载游戏，恢复规律作息',effects:{discipline:2,stamina:1}},
    {text:'控制每天只玩一小时',effects:{discipline:1}},
    {text:'继续沉迷',effects:{discipline:-2,stamina:-1}}
  ]},
  {id:'y14_c04',age:14,title:'教练的批评',text:'教练在全队面前批评你最近训练态度不端正。',choices:[
    {text:'虚心接受，加倍努力',effects:{discipline:2,mindset:1}},
    {text:'心里不服，和教练顶嘴',effects:{discipline:-1,mindset:-1,popularity:1}},
    {text:'默默承受，但内心很受伤',effects:{mindset:-1,discipline:1}}
  ]},
  {id:'y14_c05',age:14,title:'暑假计划',text:'暑假到了，你有一个月的自由时间。',choices:[
    {text:'参加篮球训练营',effects:{offense:2,athletics:1}},
    {text:'和家人出去旅游放松',effects:{stamina:1,mindset:1}},
    {text:'白天练球晚上学习',effects:{offense:1,discipline:1}}
  ]},
  {id:'y14_c06',age:14,title:'第一次扣篮',text:'你在训练中尝试扣篮，虽然勉强但成功了！',choices:[
    {text:'继续练习扣篮技术',effects:{athletics:2,body:1}},
    {text:'觉得投篮更实用，专注投篮',effects:{offense:2}},
    {text:'向朋友炫耀',effects:{popularity:1,mindset:1}}
  ]},

  // 15岁
  {id:'y15_c01',age:15,title:'位置选择',text:'教练问你以后想打什么位置。',choices:[
    {text:'后卫，练运球和投篮',effects:{offense:2,basketball_iq:1}},
    {text:'前锋，全面发展',effects:{athletics:1,defense:1,offense:1}},
    {text:'中锋，练身体和技术',effects:{body:2,defense:1}}
  ]},
  {id:'y15_c02',age:15,title:'受伤风险',text:'你膝盖有些酸痛，但下周有重要比赛。',choices:[
    {text:'带伤上阵',effects:{mindset:1,injury:2}},
    {text:'休息养伤',effects:{stamina:1,injury:-1}},
    {text:'打封闭上场',effects:{mindset:1,injury:3}}
  ]},
  {id:'y15_c03',age:15,title:'名师指点',text:'一位退役的职业球员来学校做指导，他特别看好你。',choices:[
    {text:'拜他为师，定期请教',effects:{offense:2,basketball_iq:2}},
    {text:'礼貌交流但保持距离',effects:{basketball_iq:1}},
    {text:'觉得自己不需要指导',effects:{mindset:-1}}
  ]},
  {id:'y15_c04',age:15,title:'学业压力',text:'期中考试临近，你成绩下滑了。父母要求你减少训练时间。',choices:[
    {text:'暂时减少训练，专注学业',effects:{discipline:1,offense:-1}},
    {text:'坚持训练和学习两不误',effects:{stamina:-1,discipline:1,mindset:1}},
    {text:'偷偷训练，应付学业',effects:{discipline:-1,offense:1}}
  ]},
  {id:'y15_c05',age:15,title:'队内竞争',text:'队里来了一个天赋很强的新人，直接威胁到你的首发位置。',choices:[
    {text:'把他当竞争对手，加倍训练',effects:{discipline:2,offense:1}},
    {text:'主动和他交朋友，互相学习',effects:{basketball_iq:1,mindset:1}},
    {text:'心态崩了，训练消极',effects:{mindset:-1,discipline:-1}}
  ]},
  {id:'y15_c06',age:15,title:'网络关注',text:'你的一段打球视频在网上火了，收到很多评论。',choices:[
    {text:'不理会，专注训练',effects:{discipline:2}},
    {text:'享受关注，开始经营社交媒体',effects:{popularity:2,discipline:-1}},
    {text:'被负面评论影响，心态波动',effects:{mindset:-1}}
  ]},

  // 16岁
  {id:'y16_c01',age:16,title:'全国高中联赛',text:'你的球队打入了全国高中联赛，这是展示自己的大舞台。',choices:[
    {text:'赛前疯狂加练',effects:{offense:1,stamina:-1,mindset:1}},
    {text:'按部就班正常备战',effects:{stamina:1,basketball_iq:1}},
    {text:'压力太大，赛前焦虑',effects:{mindset:-1}}
  ]},
  {id:'y16_c02',age:16,title:'增重计划',text:'你觉得身体太单薄了，想开始增重训练。',choices:[
    {text:'请专业体能师指导增重',effects:{body:2,athletics:1}},
    {text:'自己乱吃增重',effects:{body:1,stamina:-1}},
    {text:'保持现状，用技术弥补',effects:{offense:1,basketball_iq:1}}
  ]},
  {id:'y16_c03',age:16,title:'青年队邀请',text:'省青年队的教练来考察，对你很感兴趣。',choices:[
    {text:'加入青年队接受系统训练',effects:{offense:2,defense:1,basketball_iq:1}},
    {text:'留在学校队打全国联赛',effects:{mindset:1,popularity:1}},
    {text:'犹豫不决，错过机会',effects:{mindset:-1}}
  ]},
  {id:'y16_c04',age:16,title:'球探出现',text:'有大学球探来观看你的比赛，你注意到了看台上的记录员。',choices:[
    {text:'更加卖力表现',effects:{offense:1,mindset:1}},
    {text:'正常发挥不受影响',effects:{basketball_iq:1,discipline:1}},
    {text:'紧张到动作变形',effects:{mindset:-1}}
  ]},
  {id:'y16_c05',age:16,title:'夏天的抉择',text:'暑假你收到了两个邀请：NBA球星Stephen Curry的训练营和全国高中全明星赛。',choices:[
    {text:'去Curry训练营学习投篮',effects:{offense:2,mindset:1}},
    {text:'参加全明星赛展示自己',effects:{popularity:2,athletics:1}},
    {text:'在家自主训练',effects:{discipline:1,stamina:1}}
  ]},
  {id:'y16_c06',age:16,title:'伤病复发',text:'你去年的膝盖伤又隐隐作痛了。',choices:[
    {text:'去医院做全面检查',effects:{injury:-1,stamina:1}},
    {text:'忍着继续训练',effects:{injury:2,offense:1}},
    {text:'减少训练量自我恢复',effects:{injury:-1,discipline:1}}
  ]},

  // 17岁
  {id:'y17_c01',age:17,title:'高三压力',text:'高三了，学业和篮球的冲突达到顶峰。',choices:[
    {text:'以篮球为主，学业保底',effects:{offense:1,discipline:-1}},
    {text:'两头兼顾，睡眠严重不足',effects:{stamina:-1,mindset:1}},
    {text:'和老师沟通，争取特殊安排',effects:{basketball_iq:1,discipline:1}}
  ]},
  {id:'y17_c02',age:17,title:'全国高中MVP',text:'你被提名为全国高中篮球联赛MVP候选人。',choices:[
    {text:'全力以赴争夺MVP',effects:{mindset:1,offense:1,popularity:1}},
    {text:'保持平常心',effects:{discipline:1,mindset:1}},
    {text:'觉得荣誉不重要，专注未来',effects:{discipline:2}}
  ]},
  {id:'y17_c03',age:17,title:'NCAA招募',text:'多所NCAA大学向你发出招募邀请，包括篮球名校。',choices:[
    {text:'选择篮球传统强校',effects:{offense:1,basketball_iq:1}},
    {text:'选择学术与篮球兼顾的学校',effects:{discipline:1,basketball_iq:1}},
    {text:'选择承诺首发位置的学校',effects:{mindset:1,offense:1}}
  ]},
  {id:'y17_c04',age:17,title:'女朋友怀孕',text:'你的女朋友告诉你她怀孕了，你整个人都懵了。',choices:[
    {text:'承担责任，但继续追梦',effects:{mindset:2,discipline:-1}},
    {text:'放弃篮球，打工养家',effects:{mindset:-2}},
    {text:'逃避现实，心态崩溃',effects:{mindset:-2,discipline:-2}}
  ]},
  {id:'y17_c05',age:17,title:'毕业季告别',text:'高中最后一场比赛，全场为你欢呼。你站在球场中央，百感交集。',choices:[
    {text:'含泪告别，展望未来',effects:{mindset:1,popularity:1}},
    {text:'平静离开，告诉自己这只是开始',effects:{discipline:1,mindset:1}},
    {text:'在社交媒体发长文感言',effects:{popularity:2}}
  ]},
  {id:'y17_c06',age:17,title:'伤病考验',text:'训练中你严重扭伤了脚踝，医生说需要休养至少两个月。',choices:[
    {text:'严格遵医嘱，认真做康复',effects:{injury:-1,stamina:1,discipline:1}},
    {text:'提前复出训练',effects:{injury:2,offense:1}},
    {text:'利用养伤时间研究比赛录像',effects:{basketball_iq:2}}
  ]}
];

const YOUTH_NARRATIVE_EVENTS = [
  {id:'y12_n01',age:12,title:'天赋初现',text:'你在校运会的篮球比赛中表现出色，一个人打爆了对面所有人。体育老师惊叹你的运动天赋比同龄人强很多，他把你叫到办公室，问你有没有兴趣加入校队。\n\n你的心跳加速了。你知道，这是你篮球梦的起点。',effects:{athletics:1,mindset:1}},
  {id:'y12_n02',age:12,title:'第一次看NBA',text:'你第一次完整看完一场NBA比赛，Stephen Curry的三分球让你目瞪口呆。你看着他在三分线外两步出手，球在空中划出一道完美的弧线，应声入网。\n\n"我也想这样投篮，"你在心里说。从此你开始模仿他的投篮动作，每天放学后都在球场上练习。',effects:{offense:1}},
  {id:'y13_n01',age:13,title:'成长的烦恼',text:'你进入青春期，身高猛长了10厘米，但协调性下降了。你走路都会绊倒，投篮总是偏，运球总是失误。\n\n"这是正常的，"教练说，"你的身体在快速成长，需要时间适应。"你知道，这只是暂时的困难。',effects:{body:1,athletics:-1}},
  {id:'y13_n02',age:13,title:'每天的坚持',text:'你已经连续100天每天练习投篮500次，命中率稳步提升。你的手指磨出了茧，你的手臂酸得抬不起来，但你从未想过放弃。\n\n"你是我在这一带见过最努力的孩子，"邻居大叔说。你知道，天赋决定上限，努力决定下限。',effects:{offense:1,discipline:1}},
  {id:'y14_n01',age:14,title:'身体对抗',text:'和比你大两岁的对手打野球，你被撞得东倒西歪，但你没有退缩。每一次被撞倒，你都爬起来继续防守。\n\n"这小子有点意思，"对手说。你知道，身体对抗是篮球的一部分，你要学会在对抗中生存。',effects:{body:1,mindset:1}},
  {id:'y14_n02',age:14,title:'第一次绝杀',text:'比赛最后时刻，比分打平，你接到队友传球，在三分线外出手——球进了！全场沸腾，你被队友们压在身下。\n\n那种感觉让你上瘾。你知道，这就是你想要的生活——在关键时刻，成为英雄。',effects:{mindset:1,offense:1}},
  {id:'y15_n01',age:15,title:'雨中的训练',text:'暴雨天所有队友都走了，只有你一个人在雨中练投篮。雨水打在你的脸上，球变得滑溜溜的，但你没有停下来。\n\n保安从窗口看着你，摇了摇头说："这孩子以后肯定能成。"你知道，成功的人都是在别人休息的时候努力。',effects:{discipline:2}},
  {id:'y15_n02',age:15,title:'国家队选拔',text:'你被邀请参加U15国家队选拔营，见识到了全国最强的同龄球员。你发现，原来有这么多和你一样有天赋的人。\n\n"天外有天，"你在日记里写道，"我要更加努力。"这次经历让你变得更加谦虚，也更加坚定。',effects:{basketball_iq:1,mindset:1}},
  {id:'y16_n01',age:16,title:'深夜的球馆',text:'保安发现你半夜翻墙进球馆加练，不但没有赶你走，还帮你开灯。\n\n"我年轻的时候也像你一样，"保安说，"后来我没成功，但我希望你能。"你在球馆里练到凌晨两点，然后悄悄翻墙回家。你知道，你的努力终会有回报。',effects:{discipline:1,offense:1}},
  {id:'y16_n02',age:16,title:'偶像的签名',text:'你在一场比赛后得到了Giannis Antetokounmpo的签名，他拍着你的头说"未来是你的"。\n\n你把那个签名球衣挂在房间最显眼的位置。每天早上醒来，你都会看到它，然后告诉自己："我要成为像他一样的球员。"',effects:{mindset:2}},
  {id:'y17_n01',age:17,title:'最后的少年时光',text:'你回望过去六年的篮球路，从一个瘦弱的少年成长为备受瞩目的高中球星。你记得每一个清晨的训练，每一个深夜的加练，每一个汗水浸透球衣的日子。\n\n"时间过得真快，"你在心里说。你知道，你即将踏上新的征程。',effects:{mindset:1,discipline:1}},
  {id:'y17_n02',age:17,title:'体测数据',text:'你的体测数据出来了：身高、臂展、弹跳都远超同龄人平均值。球探们开始频繁出现在你的比赛看台上，他们的笔记本上写满了你的名字。\n\n"他的身体天赋是顶级的，"一位球探在报告中写道。你知道，NBA的梦想不再遥不可及。',effects:{body:1,athletics:1}},
  {id:'y12_n03',age:12,title:'邻居大叔',text:'隔壁的退休体育老师每天看你练球，主动教你基础运球和脚步。他曾经是大学校队的球员，虽然没有进入职业联赛，但他的经验对你来说是无价之宝。\n\n"篮球不是只有天赋，"他说，"更重要的是基本功。"你把他教的每一个动作都练了上千遍。',effects:{offense:1}},
  {id:'y13_n03',age:13,title:'篮球梦',text:'你做了一个梦，梦见自己站在NBA赛场上，全场球迷高呼你的名字。你投中了压哨绝杀，全场沸腾。\n\n醒来后你发现枕头湿了——你在梦里哭了。你知道，这不是梦，这是你的目标。你更加坚定了信念。',effects:{mindset:1}},
  {id:'y14_n03',age:14,title:'失误的教训',text:'关键比赛你连续失误导致球队输球，你哭了整整一个晚上。队友们安慰你，但你知道，这是你的责任。\n\n"失误不可怕，"教练说，"可怕的是不敢承担责任。"你知道，你要从失败中学习，而不是逃避。',effects:{mindset:1,basketball_iq:1}},
  {id:'y15_n03',age:15,title:'早起的鸟儿',text:'你开始每天5点起床晨跑，然后去球馆练投篮。日复一日，从未间断。\n\n"你是球馆最早的常客，"保安说，"比教练来得还早。"你知道，当别人还在睡觉的时候，你已经在变强了。',effects:{stamina:1,discipline:1}},
  {id:'y16_n03',age:16,title:'第一次被包夹',text:'对手开始对你使用双人包夹，你第一次感受到被针对的压力。你不知道该怎么办，你试图强行突破，但被抢断了。\n\n"被包夹是一种荣誉，"教练说，"他们害怕你。"你知道，你要学会在包夹中找到机会。',effects:{basketball_iq:1,mindset:1}},
  {id:'y17_n03',age:17,title:'高中告别赛',text:'高中最后一场比赛你砍下40分，全场高呼你的名字。你的队友们把你扛在肩上，绕场一周。\n\n你看着那些为你欢呼的球迷，看着这座陪伴了你三年的球馆，泪水模糊了视线。你知道，你要离开这里了，但你会永远记得这里。',effects:{popularity:2,mindset:1}}
];

// ============================================================
// 阶段2：选秀冲刺期【18-22岁｜大学/选秀阶段】
// ============================================================

const DRAFT_CHOICE_EVENTS = [
  // 18岁
  {id:'d18_c01',age:18,title:'NCAA首秀',text:'你的NCAA大学联赛首秀即将到来。教练告诉你首发位置不是保证的，需要竞争。',choices:[
    {text:'疯狂加练争取首发',effects:{offense:1,stamina:-1,mindset:1}},
    {text:'服从教练安排，从替补做起',effects:{discipline:1,basketball_iq:1}},
    {text:'对教练的决定不满，闹情绪',effects:{mindset:-1,popularity:-1}}
  ]},
  {id:'d18_c02',age:18,title:'大学生活诱惑',text:'大学里各种派对和社交活动，室友们都在玩。',choices:[
    {text:'偶尔参加，保持节制',effects:{popularity:1,discipline:1}},
    {text:'完全拒绝，专注篮球',effects:{discipline:2,popularity:-1}},
    {text:'频繁参加，享受大学生活',effects:{discipline:-2,popularity:2}}
  ]},
  {id:'d18_c03',age:18,title:'第一次大败',text:'你的球队在NCAA比赛中被打爆，你只得了4分。',choices:[
    {text:'赛后疯狂加练到凌晨',effects:{discipline:1,offense:1,mindset:1}},
    {text:'分析比赛录像找问题',effects:{basketball_iq:2}},
    {text:'怀疑自己是否适合打篮球',effects:{mindset:-1}}
  ]},
  {id:'d18_c04',age:18,title:'学业奖学金',text:'你的成绩不错，获得了一个学术奖学金的机会。',choices:[
    {text:'接受奖学金，兼顾学业',effects:{discipline:1,basketball_iq:1}},
    {text:'拒绝，全部精力给篮球',effects:{offense:1,discipline:-1}},
    {text:'犹豫了很久，最终接受',effects:{discipline:1}}
  ]},
  {id:'d18_c05',age:18,title:'经纪人接触',text:'一个经纪人通过朋友联系你，说你有NBA潜力，想提前签你。',choices:[
    {text:'婉拒，先专注大学篮球',effects:{discipline:2,basketball_iq:1}},
    {text:'认真了解但暂不签约',effects:{basketball_iq:1}},
    {text:'提前签约经纪人',effects:{popularity:1,discipline:-1}}
  ]},
  {id:'d18_c06',age:18,title:'伤病初现',text:'你的肩膀在比赛中脱臼了，医生说需要手术。',choices:[
    {text:'赛季报销，接受手术',effects:{injury:-1,stamina:1}},
    {text:'保守治疗带伤作战',effects:{injury:2,offense:1,mindset:1}},
    {text:'手术后认真康复',effects:{injury:-1,discipline:1}}
  ]},

  // 19岁
  {id:'d19_c01',age:19,title:'大二爆发',text:'你成为球队核心，场均数据飙升。',choices:[
    {text:'保持低调继续努力',effects:{discipline:2}},
    {text:'享受聚光灯，接受媒体采访',effects:{popularity:2,mindset:1}},
    {text:'压力增大，发挥开始不稳定',effects:{mindset:-1,stamina:1}}
  ]},
  {id:'d19_c02',age:19,title:'NCAA疯狂三月',text:'NCAA锦标赛开始了，你的球队打进了64强。',choices:[
    {text:'赛前研究对手到深夜',effects:{basketball_iq:2,stamina:-1}},
    {text:'保持正常作息，不过度紧张',effects:{stamina:1,mindset:1}},
    {text:'压力太大，赛前失眠',effects:{mindset:-1}}
  ]},
  {id:'d19_c03',age:19,title:'提前参选？',text:'有人建议你跳过大三大四，提前参加NBA选秀。',choices:[
    {text:'再打一年，提升自己',effects:{discipline:1,offense:1,basketball_iq:1}},
    {text:'宣布参加选秀',effects:{mindset:1}},
    {text:'留校冲NCAA冠军',effects:{mindset:1,basketball_iq:1}}
  ]},
  {id:'d19_c04',age:19,title:'社交媒体争议',text:'你的一条推特被人断章取义，网上开始攻击你。',choices:[
    {text:'删除推特，低调处理',effects:{discipline:1,mindset:1}},
    {text:'发长文澄清',effects:{mindset:-1,popularity:1}},
    {text:'不在意外界声音',effects:{mindset:2}}
  ]},
  {id:'d19_c05',age:19,title:'训练营邀请',text:'你收到了NBA官方训练营的邀请，可以和职业球员一起训练。',choices:[
    {text:'去训练营见识职业级别',effects:{offense:1,basketball_iq:1,athletics:1}},
    {text:'留在学校备战季后赛',effects:{stamina:1,discipline:1}},
    {text:'去训练营但受伤',effects:{offense:1,injury:1}}
  ]},
  {id:'d19_c06',age:19,title:'教授的忠告',text:'你的导师说："NBA选秀每年只有60个名额，你要做好两手准备。"',choices:[
    {text:'认真考虑学业Plan B',effects:{discipline:1,basketball_iq:1}},
    {text:'坚信自己能被选中',effects:{mindset:1}},
    {text:'和家人深谈未来规划',effects:{mindset:1,discipline:1}}
  ]},

  // 20岁
  {id:'d20_c01',age:20,title:'选秀前试训',text:'多支NBA球队邀请你去试训，包括金州勇士和波士顿凯尔特人。',choices:[
    {text:'全部参加，展示全面能力',effects:{offense:1,defense:1,stamina:-1}},
    {text:'选择性参加最有诚意的几支',effects:{basketball_iq:1,mindset:1}},
    {text:'只去勇士试训，一心想去湾区',effects:{mindset:1}}
  ]},
  {id:'d20_c02',age:20,title:'体测数据曝光',text:'你的联合试训体测数据被媒体曝光，引发热议。',choices:[
    {text:'不回应，用球场表现说话',effects:{discipline:2,mindset:1}},
    {text:'趁热度接受媒体采访',effects:{popularity:2}},
    {text:'数据不如预期，心态受影响',effects:{mindset:-1}}
  ]},
  {id:'d20_c03',age:20,title:'经纪人选择',text:'三个经纪人都想签你，各有优劣。',choices:[
    {text:'选人脉最广的大经纪人',effects:{popularity:1,basketball_iq:1}},
    {text:'选最懂球员发展的经纪人',effects:{offense:1,discipline:1}},
    {text:'选抽成最低的经纪人',effects:{discipline:1}}
  ]},
  {id:'d20_c04',age:20,title:'伤病警报',text:'试训中你的膝盖又开始疼痛，核磁共振显示半月板有轻微损伤。',choices:[
    {text:'隐瞒伤情继续试训',effects:{injury:2,mindset:1}},
    {text:'公开伤情，退出剩余试训',effects:{injury:-1,mindset:-1}},
    {text:'边治疗边评估选秀前景',effects:{injury:1,basketball_iq:1}}
  ]},
  {id:'d20_c05',age:20,title:'竞争对手',text:'和你同位置的另一个球员突然爆发，选秀顺位预测超过了你。',choices:[
    {text:'加倍训练超越他',effects:{offense:1,discipline:1,mindset:1}},
    {text:'关注自己的成长，不比较',effects:{discipline:1,mindset:1}},
    {text:'心态崩溃，训练状态下滑',effects:{mindset:-1,offense:-1}}
  ]},
  {id:'d20_c06',age:20,title:'家人反对',text:'你的父母希望你完成大学学业再考虑职业篮球。',choices:[
    {text:'说服家人支持你的梦想',effects:{mindset:1,basketball_iq:1}},
    {text:'听从家人意见再打一年',effects:{discipline:1,offense:1}},
    {text:'和家人产生矛盾',effects:{mindset:-1}}
  ]},

  // 21岁
  {id:'d21_c01',age:21,title:'最后的选秀机会',text:'这是你参加选秀的最后一年窗口期了。球探评估你可能是二轮秀。',choices:[
    {text:'破釜沉舟，全力冲刺选秀',effects:{offense:1,mindset:1,athletics:1}},
    {text:'接受现实，考虑海外联赛',effects:{mindset:1,discipline:1}},
    {text:'放弃选秀，找普通工作',effects:{mindset:-2}}
  ]},
  {id:'d21_c02',age:21,title:'选秀前大爆发',text:'在一场关键比赛中你砍下三双，选秀预测顺位大幅上升。',choices:[
    {text:'保持谦逊继续努力',effects:{discipline:2}},
    {text:'借势营销自己',effects:{popularity:2,mindset:1}},
    {text:'压力更大了，害怕关键时刻掉链子',effects:{mindset:-1}}
  ]},
  {id:'d21_c03',age:21,title:'选秀小绿屋邀请',text:'你收到了NBA选秀小绿屋的邀请，意味着你可能在首轮被选中。',choices:[
    {text:'激动地接受，精心准备',effects:{mindset:1,popularity:1}},
    {text:'保持冷静，不抱太大期望',effects:{discipline:1,mindset:1}},
    {text:'压力太大，整晚没睡',effects:{stamina:-1}}
  ]},
  {id:'d21_c04',age:21,title:'选秀前夜',text:'选秀前夜，你在酒店房间里辗转反侧，想着这几年的篮球路。',choices:[
    {text:'给父母打电话倾诉',effects:{mindset:1}},
    {text:'看比赛录像放松',effects:{basketball_iq:1}},
    {text:'失眠到天亮',effects:{stamina:-1,mindset:1}}
  ]},
  {id:'d21_c05',age:21,title:'海外球队报价',text:'一支欧洲豪门给你开出了丰厚的合同，但你还没放弃NBA梦想。',choices:[
    {text:'拒绝海外报价，押宝选秀',effects:{mindset:2}},
    {text:'接受海外报价作为后备',effects:{discipline:1,mindset:-1}},
    {text:'去欧洲打球，曲线救国',effects:{offense:1,basketball_iq:1}}
  ]},
  {id:'d21_c06',age:21,title:'训练伤病',text:'选秀前最后一次训练你拉伤了腿筋。',choices:[
    {text:'隐瞒伤情参加选秀',effects:{injury:1}},
    {text:'公开伤情，选秀顺位可能下跌',effects:{injury:-1,mindset:1}},
    {text:'带伤出席选秀大会',effects:{injury:1,mindset:1}}
  ]},

  // === NCAA大学路径事件（19岁触发）===
  {id:'ncaa_c01',age:19,title:'NCAA大二爆发',text:'经过一年的磨练，你在NCAA赛场上如鱼得水。场均数据全面提升，球探们开始频繁出现在你的比赛看台上。',choices:[
    {text:'保持低调继续努力',effects:{discipline:2,offense:1}},
    {text:'享受聚光灯，接受媒体采访',effects:{popularity:2,mindset:1}},
    {text:'压力增大，发挥开始不稳定',effects:{mindset:-1,stamina:1}}
  ]},
  {id:'ncaa_c02',age:19,title:'NCAA锦标赛',text:'NCAA疯狂三月开始了！你的球队一路杀进甜蜜十六强。全国直播的比赛让你感受到了聚光灯的热度。',choices:[
    {text:'赛前研究对手到深夜',effects:{basketball_iq:2,stamina:-1}},
    {text:'保持正常作息，不过度紧张',effects:{stamina:1,mindset:1}},
    {text:'压力太大，赛前失眠',effects:{mindset:-1}}
  ]},
  {id:'ncaa_c03',age:19,title:'大学教练的建议',text:'你的大学教练说："你的技术已经准备好了，但心态还需要磨练。NBA的强度是NCAA的十倍。"',choices:[
    {text:'再打一年NCAA磨练心态',effects:{mindset:2,basketball_iq:1}},
    {text:'觉得自己已经准备好了',effects:{mindset:1}},
    {text:'认真思考教练的话',effects:{basketball_iq:1,discipline:1}}
  ]}
];

const DRAFT_NARRATIVE_EVENTS = [
  {id:'d18_n01',age:18,title:'大学开学',text:'你踏入大学校园，一切都是新的。篮球馆比高中大了三倍，更衣室里挂着历届NBA校友的照片。队友们个个都是各地的天才，每个人都曾是自己高中里的王者。你意识到，这里是一个全新的战场。\n\n第一天训练结束后，你瘫坐在更衣室里，浑身酸痛。但你的眼中闪烁着光芒——这就是你想要的生活。',effects:{basketball_iq:1,mindset:1}},
  {id:'d18_n02',age:18,title:'第一次对抗职业级',text:'训练赛中你对位一个未来NBA球员，被完爆了。他的速度、力量、技术——每一个方面都碾压你。你拼尽全力，但连他的球衣都碰不到。\n\n赛后你一个人留在球馆加练到深夜。差距比你想象的大得多，但这也让你更加坚定了要变强的决心。你知道，这就是你要跨越的鸿沟。',effects:{mindset:1,defense:1}},
  {id:'d19_n01',age:19,title:'球探报告',text:'一份球探报告在网上流传开来，上面写着你的名字。报告写道："身体天赋出众，技术仍需打磨，心态坚韧，有成为NBA球员的潜力。"\n\n你第一次看到专业人士对你的评价，心中五味杂陈。骄傲、紧张、期待——各种情绪交织在一起。你知道，NBA的梦想不再遥不可及。',effects:{mindset:1}},
  {id:'d19_n02',age:19,title:'NCAA全国直播',text:'你的比赛第一次全国直播，ESPN的解说员在镜头前分析着你的每一个动作。你的家人坐在电视机前，紧张得手心出汗。\n\n比赛结束后，你的手机被打爆了——朋友、亲戚、甚至高中同学都发来消息。你第一次感受到了成为公众人物的压力和兴奋。',effects:{popularity:1,mindset:1}},
  {id:'d20_n01',age:20,title:'球探关注',text:'越来越多的NBA球探出现在你的比赛看台上，每次比赛你都能看到他们拿着笔记本认真记录。你知道他们在评估你的每一个动作——投篮、防守、传球、甚至你的肢体语言。\n\n这种被关注的感觉既兴奋又紧张。你知道每一个表现都可能影响你的选秀顺位。你学会了在压力下保持专注。',effects:{mindset:1}},
  {id:'d20_n02',age:20,title:'联合试训',text:'NBA联合试训上你见到了所有选秀热门球员。体测、对抗赛、面试——每一项都是考验。你和未来的NBA球星们同场竞技，感受到了最高水平的竞争。\n\n在体测中，你的弹跳和速度数据让球探们眼前一亮。你知道，你正在向NBA迈进一步。',effects:{athletics:1,basketball_iq:1}},
  {id:'d21_n01',age:21,title:'选秀前采访',text:'NBA官方对你做了选秀前专访，摄像机对着你的脸，灯光刺眼。主持人问你："你准备好进入NBA了吗？"\n\n你深吸一口气，微笑着说："我准备好了。"这段视频在网上获得百万播放，你的名字开始被更多人知道。你知道，你的人生即将发生巨大的变化。',effects:{popularity:2}},
  {id:'d21_n02',age:21,title:'最后一场大学比赛',text:'你打完了大学生涯最后一场比赛。终场哨响的那一刻，你站在球场中央，环顾四周——这座球馆见证了你四年的成长。\n\n队友们围上来拥抱你，教练拍着你的肩膀说："你准备好了。"你的眼眶湿润了。无论选秀结果如何，你已经准备好了迎接新的挑战。',effects:{mindset:1,discipline:1}},
  {id:'d18_n03',age:18,title:'大学教练的教导',text:'你的大学教练在第一次球队会议上说："在这里，天赋只是入场券，努力才是门票。你们每个人都是天才，但天才在这里遍地都是。"\n\n他的话让你深受触动。你开始明白，想要脱颖而出，光有天赋是不够的。你需要比所有人都更努力。',effects:{discipline:1}},
  {id:'d19_n03',age:19,title:'和室友的友谊',text:'你的室友虽然不打球，但他教会了你如何在压力下保持平衡。每当你因为比赛焦虑时，他会带你去看电影、打游戏、或者只是聊聊天。\n\n"篮球不是你的全部，"他说，"你首先是一个人，然后才是一个球员。"这句话让你学会了如何在高压环境下保持心理健康。',effects:{mindset:1}},
  {id:'d20_n03',age:20,title:'伤病康复',text:'你严格按照康复师的计划恢复，每天早上六点就开始康复训练。冰敷、拉伸、力量训练——每一项你都认真完成。\n\n三个月后，你的身体状态比受伤前更好了。你学会了如何科学地对待自己的身体，这将成为你职业生涯最宝贵的经验之一。',effects:{stamina:1,injury:-1}},
  {id:'d21_n03',age:21,title:'选秀前的平静',text:'选秀前一周你反而平静了下来。你不再焦虑，不再紧张，每天按部就班训练，仿佛一切已成定局。\n\n你知道自己已经尽了全力——四年的努力、无数次的训练、无数场的比赛——一切都为了这一刻。现在，你只需要等待命运的宣判。',effects:{mindset:1,discipline:1}},

  // === NCAA大学路径叙事事件（19岁触发）===
  {id:'ncaa_n01',age:19,title:'NCAA的成长',text:'经过一年NCAA的磨练，你明显感觉到自己变强了。每天和全美最强的大学生球员对抗，你的技术、心态、球商都有了质的飞跃。\n\n你开始理解为什么教练说"大学是最好的修炼场"。在这里，你学会了如何在高压环境下打球，如何研究对手，如何调整心态。',effects:{basketball_iq:1,mindset:1}},
  {id:'ncaa_n02',age:19,title:'球探关注',text:'越来越多的NBA球探出现在你的比赛看台上，每次比赛你都能看到他们拿着笔记本认真记录。你知道他们在评估你的每一个动作。\n\n经过NCAA一年的磨练，你的选秀预测顺位比去年提升了不少。你知道，你的选择是正确的。',effects:{mindset:1,popularity:1}},
  {id:'ncaa_n03',age:19,title:'大学教练的教导',text:'你的大学教练在赛季结束时对你说："你已经准备好了。去NBA吧，那里才是属于你的舞台。"\n\n他的话让你充满了信心。你知道，这一年的NCAA经历让你变得更强、更成熟。你准备好迎接NBA的挑战了。',effects:{discipline:1,mindset:1}},
  {id:'ncaa_n04',age:19,title:'NCAA全国直播',text:'你的比赛第一次全国直播，ESPN的解说员在镜头前分析着你的每一个动作。你的家人坐在电视机前，紧张得手心出汗。\n\n比赛结束后，你的手机被打爆了——朋友、亲戚、甚至高中同学都发来消息。你第一次感受到了成为公众人物的压力和兴奋。',effects:{popularity:1,mindset:1}}
];

// ============================================================
// 阶段3：职业巅峰期【22-34岁｜NBA核心生涯】
// ============================================================

const PRIME_CHOICE_EVENTS = [
  // 新秀年(22岁)
  {id:'p22_c01',age:22,title:'新秀合同',text:'你的新秀合同摆在面前。球队管理层想和你谈谈你的角色定位。',choices:[
    {text:'接受任何角色，从防守做起',effects:{defense:2,discipline:1,team_trust:1}},
    {text:'要求更多进攻机会',effects:{offense:1,mindset:1,team_trust:-1}},
    {text:'表示服从安排，暗自努力',effects:{discipline:1,offense:1}}
  ]},
  {id:'p22_c02',age:22,title:'更衣室文化',text:'球队老大在更衣室里发火了，对新秀们的态度很不满。',choices:[
    {text:'低头不语，默默承受',effects:{discipline:1}},
    {text:'主动道歉并表态会更努力',effects:{team_trust:1,mindset:1}},
    {text:'觉得被针对了，心生不满',effects:{mindset:-1,team_trust:-1}}
  ]},
  {id:'p22_c03',age:22,title:'第一次NBA比赛',text:'你终于站在了NBA赛场上。对面站着的是Jayson Tatum这样的超级巨星。',choices:[
    {text:'全力防守，做好本职工作',effects:{defense:1,mindset:1}},
    {text:'想找机会展示进攻能力',effects:{offense:1,team_trust:1}},
    {text:'紧张到腿软，发挥失常',effects:{mindset:-1}}
  ]},
  {id:'p22_c04',age:22,title:'媒体采访',text:'赛后记者问你："作为新秀，你觉得自己的优势是什么？"',choices:[
    {text:'"我的防守和拼劲"',effects:{defense:1,popularity:1}},
    {text:'"我什么都能做"',effects:{offense:1,popularity:1}},
    {text:'"我还需要学习很多"',effects:{discipline:1,basketball_iq:1}}
  ]},
  {id:'p22_c05',age:22,title:'训练中的对抗',text:'训练中你对位球队的全明星球员，被教训了。',choices:[
    {text:'虚心请教他的经验',effects:{basketball_iq:2,team_trust:1}},
    {text:'不服气，下次训练更加拼命',effects:{mindset:1,offense:1}},
    {text:'自信心受到打击',effects:{mindset:-1}}
  ]},
  {id:'p22_c06',age:22,title:'发展联盟下放',text:'球队把你下放到发展联盟锻炼。',choices:[
    {text:'在发展联盟疯狂刷数据',effects:{offense:2,popularity:1}},
    {text:'专注提升防守和团队意识',effects:{defense:2,basketball_iq:1}},
    {text:'觉得被侮辱了，消极对待',effects:{discipline:-1,mindset:-1}}
  ]},

  // 23-24岁
  {id:'p23_c01',age:23,title:'首发机会',text:'主力受伤了，教练给了你首发的机会。',choices:[
    {text:'抓住机会全力表现',effects:{offense:1,defense:1,mindset:1}},
    {text:'做好本职工作不犯错',effects:{discipline:1,team_trust:1}},
    {text:'压力太大，比赛发挥失常',effects:{mindset:-1}}
  ]},
  {id:'p23_c02',age:23,title:'队内矛盾',text:'队里两个老将闹矛盾，气氛很紧张。你被夹在中间。',choices:[
    {text:'保持中立不站队',effects:{discipline:1,team_trust:1}},
    {text:'支持对你更好的那个人',effects:{team_trust:1,mindset:1}},
    {text:'主动调解矛盾',effects:{basketball_iq:1,team_trust:1}}
  ]},
  {id:'p23_c03',age:23,title:'涨球期',text:'休赛期你花了一个月跟投篮教练苦练三分。',choices:[
    {text:'苦练三分球',effects:{offense:2}},
    {text:'全面提升各项技术',effects:{offense:1,defense:1,basketball_iq:1}},
    {text:'主要练身体和体能',effects:{body:1,stamina:2}}
  ]},
  {id:'p23_c04',age:23,title:'全明星周末',text:'你被邀请参加全明星新秀赛。',choices:[
    {text:'全力以赴展示自己',effects:{popularity:2,mindset:1}},
    {text:'享受氛围，和球星们交流',effects:{basketball_iq:1,popularity:1}},
    {text:'拒绝邀请，专注训练',effects:{discipline:1}}
  ]},
  {id:'p24_c01',age:24,title:'续约谈判',text:'你的新秀合同快到期了，球队想提前续约。',choices:[
    {text:'接受球队报价',effects:{team_trust:1,discipline:1}},
    {text:'要求更高的薪资',effects:{mindset:1,team_trust:-1}},
    {text:'试水自由市场',effects:{popularity:1,team_trust:-1}}
  ]},
  {id:'p24_c02',age:24,title:'受伤危机',text:'你在比赛中扭伤了脚踝，需要休息六周。',choices:[
    {text:'严格按计划康复',effects:{injury:-1,stamina:1,discipline:1}},
    {text:'提前复出帮助球队',effects:{injury:2,team_trust:1}},
    {text:'利用养伤时间研究战术',effects:{basketball_iq:2}}
  ]},
  {id:'p24_c03',age:24,title:'季后赛争夺',text:'你的球队正在争夺季后赛席位，每场比赛都很关键。',choices:[
    {text:'每场都全力以赴',effects:{stamina:-1,mindset:1,offense:1}},
    {text:'合理分配体力',effects:{stamina:1,basketball_iq:1}},
    {text:'关键时刻顶住压力',effects:{mindset:2}}
  ]},
  {id:'p24_c04',age:24,title:'场外诱惑',text:'有朋友邀请你去夜店玩，你明天还有比赛。',choices:[
    {text:'拒绝，回去休息',effects:{discipline:2}},
    {text:'去坐一会儿就走',effects:{discipline:-1,popularity:1}},
    {text:'玩到很晚',effects:{discipline:-2,stamina:-1}}
  ]},

  // 25-27岁（巅峰初期）
  {id:'p25_c01',age:25,title:'球队核心之争',text:'你和另一个球员都在争球队老大的位置。',choices:[
    {text:'用球场表现说话',effects:{offense:1,mindset:1,team_trust:1}},
    {text:'主动和他沟通角色分工',effects:{basketball_iq:1,team_trust:1}},
    {text:'公开表示不满，队内气氛紧张',effects:{team_trust:-1,mindset:1}}
  ]},
  {id:'p25_c02',age:25,title:'交易传闻',text:'媒体爆料球队正在考虑交易你。',choices:[
    {text:'专注比赛不受影响',effects:{discipline:2,mindset:1}},
    {text:'找管理层确认自己的位置',effects:{team_trust:1}},
    {text:'心态受影响，比赛表现下滑',effects:{mindset:-1,offense:-1}}
  ]},
  {id:'p25_c03',age:25,title:'国家队征召',text:'国家队征召你参加国际比赛。',choices:[
    {text:'响应号召为国效力',effects:{popularity:2,mindset:1,stamina:-1}},
    {text:'拒绝，专注NBA赛季',effects:{stamina:1,popularity:-1}},
    {text:'参加但心态放松',effects:{popularity:1,basketball_iq:1}}
  ]},
  {id:'p25_c04',age:25,title:'商业代言',text:'一个大品牌想签你做代言人，但需要你参加很多商业活动。',choices:[
    {text:'签代言，合理安排时间',effects:{popularity:2,discipline:1}},
    {text:'拒绝，全部精力给篮球',effects:{discipline:2}},
    {text:'签代言但被商业活动影响训练',effects:{popularity:2,discipline:-1,stamina:-1}}
  ]},
  {id:'p26_c01',age:26,title:'全明星边缘',text:'你距离全明星只差一步，教练说再努力一把就能入选。',choices:[
    {text:'疯狂提升表现',effects:{offense:1,mindset:1,stamina:-1}},
    {text:'稳定输出，听天命',effects:{discipline:1,mindset:1}},
    {text:'拉票宣传自己',effects:{popularity:2}}
  ]},
  {id:'p26_c02',age:26,title:'比赛冲突',text:'比赛中你和对手发生了冲突，被罚出场。',choices:[
    {text:'赛后道歉，控制情绪',effects:{discipline:1,mindset:1}},
    {text:'觉得对手先挑衅，不认错',effects:{mindset:1,popularity:-1}},
    {text:'媒体曝光后低调处理',effects:{discipline:1}}
  ]},
  {id:'p26_c03',age:26,title:'大合同谈判',text:'你打出了生涯最佳表现，球队想给你一份大合同。',choices:[
    {text:'接受顶薪续约',effects:{team_trust:1,salary:3}},
    {text:'要求更多但接受最终报价',effects:{salary:2,team_trust:1}},
    {text:'试水自由市场追求最大合同',effects:{salary:3,team_trust:-1}}
  ]},
  {id:'p26_c04',age:26,title:'球队交易',text:'球队做了一笔大交易，换来了一个超级巨星和你搭档。',choices:[
    {text:'主动配合新队友',effects:{team_trust:1,basketball_iq:1}},
    {text:'觉得自己地位受到威胁',effects:{mindset:-1}},
    {text:'和新队友建立默契',effects:{team_trust:1,offense:1}}
  ]},
  {id:'p27_c01',age:27,title:'季后赛生死战',text:'季后赛第七场，你面对Victor Wembanyama领衔的马刺。',choices:[
    {text:'主动请缨防守对方核心',effects:{defense:2,mindset:1}},
    {text:'专注进攻带队取胜',effects:{offense:2,mindset:1}},
    {text:'压力太大发挥失常',effects:{mindset:-1}}
  ]},
  {id:'p27_c02',age:27,title:'伤病复发',text:'你的老伤在高强度比赛中复发了。',choices:[
    {text:'坚持打完季后赛',effects:{injury:2,mindset:1,team_trust:1}},
    {text:'退出比赛接受治疗',effects:{injury:-1,stamina:1}},
    {text:'打封闭继续上场',effects:{injury:3,mindset:1}}
  ]},
  {id:'p27_c03',age:27,title:'夏天特训',text:'休赛期你找到了NBA传奇球星Kobe Bryant的训练师。',choices:[
    {text:'跟他进行魔鬼训练',effects:{offense:2,athletics:1,stamina:-1}},
    {text:'学习他的训练理念',effects:{basketball_iq:2}},
    {text:'训练太苦坚持不下来',effects:{discipline:-1}}
  ]},
  {id:'p27_c04',age:27,title:'场外绯闻',text:'媒体拍到你和一个名人约会，消息传遍网络。',choices:[
    {text:'低调处理不回应',effects:{discipline:1}},
    {text:'大方承认',effects:{popularity:2,mindset:1}},
    {text:'被绯闻影响训练状态',effects:{discipline:-1,stamina:-1}}
  ]},

  // 28-30岁（巅峰期）
  {id:'p28_c01',age:28,title:'交易截止日',text:'交易截止日前，球队把你交易到了雷霆。',choices:[
    {text:'接受新环境，迅速融入',effects:{mindset:1,team_trust:1}},
    {text:'对被交易感到愤怒',effects:{mindset:-1}},
    {text:'把愤怒化为动力',effects:{offense:1,mindset:1}}
  ]},
  {id:'p28_c02',age:28,title:'全明星首发',text:'你首次入选全明星首发阵容！',choices:[
    {text:'享受荣誉，全力以赴',effects:{popularity:2,mindset:1,honor:2}},
    {text:'保持谦逊，感谢队友',effects:{team_trust:1,discipline:1,honor:1}},
    {text:'压力增大，怕之后表现下滑',effects:{mindset:-1}}
  ]},
  {id:'p28_c03',age:28,title:'续约抉择',text:'你的合同到期了，多支球队报价。你现在的球队也想留你。',choices:[
    {text:'留队签顶薪',effects:{team_trust:2,salary:3}},
    {text:'去更有竞争力的球队',effects:{team_trust:-1,mindset:1}},
    {text:'选择最大的合同',effects:{salary:3,team_trust:-1}}
  ]},
  {id:'p28_c04',age:28,title:'训练方法革新',text:'你发现传统训练方法已经无法提升自己了。',choices:[
    {text:'请运动科学团队定制训练',effects:{athletics:1,stamina:2}},
    {text:'坚持老方法，相信积累',effects:{discipline:1}},
    {text:'参考Shai Gilgeous-Alexander的训练方式',effects:{offense:1,athletics:1}}
  ]},
  {id:'p29_c01',age:29,title:'MVP竞争',text:'你打出了MVP级别的表现，和Jokic、SGA竞争MVP。',choices:[
    {text:'全力冲击MVP',effects:{offense:1,mindset:1,honor:2}},
    {text:'专注球队战绩',effects:{team_trust:1,basketball_iq:1}},
    {text:'不在意个人荣誉',effects:{discipline:1}}
  ]},
  {id:'p29_c02',age:29,title:'伤病噩梦',text:'你的膝盖前交叉韧带撕裂了，赛季报销。',choices:[
    {text:'积极康复，发誓更强回归',effects:{injury:-1,mindset:2}},
    {text:'考虑退役',effects:{mindset:-2}},
    {text:'认真做手术和康复',effects:{injury:-1,stamina:1,discipline:1}}
  ]},
  {id:'p29_c03',age:29,title:'领导力考验',text:'球队年轻球员们遇到困难，你作为老大哥需要站出来。',choices:[
    {text:'主动指导年轻球员',effects:{basketball_iq:1,team_trust:2}},
    {text:'管好自己就行',effects:{discipline:1}},
    {text:'和教练一起制定培养计划',effects:{team_trust:1,basketball_iq:1}}
  ]},
  {id:'p29_c04',age:29,title:'社交媒体风波',text:'你的一条赛后发言被媒体断章取义，引发争议。',choices:[
    {text:'删除并道歉',effects:{discipline:1}},
    {text:'召开新闻发布会澄清',effects:{mindset:1,popularity:1}},
    {text:'不再接受媒体采访',effects:{discipline:1,popularity:-1}}
  ]},
  {id:'p30_c01',age:30,title:'三十而立',text:'你30岁了，在联盟已经打了8年。你开始思考职业生涯的后半段。',choices:[
    {text:'更加珍惜每一场比赛',effects:{mindset:1,discipline:1}},
    {text:'争取在退役前拿一枚冠军戒指',effects:{mindset:2,offense:1}},
    {text:'开始为退役后做打算',effects:{basketball_iq:1}}
  ]},
  {id:'p30_c02',age:30,title:'被交易',text:'球队重建，你被交易到了湖人。',choices:[
    {text:'和LeBron James搭档，抓住机会',effects:{offense:1,basketball_iq:1,team_trust:1}},
    {text:'对被交易感到心寒',effects:{mindset:-1}},
    {text:'把这当做新的开始',effects:{mindset:1,discipline:1}}
  ]},
  {id:'p30_c03',age:30,title:'冠军争夺',text:'你的球队打进了总决赛，对手是凯尔特人。',choices:[
    {text:'拼尽全力不留遗憾',effects:{stamina:-1,mindset:2,honor:2}},
    {text:'合理分配体力打好每一场',effects:{stamina:1,basketball_iq:1}},
    {text:'压力太大失眠多日',effects:{stamina:-1,mindset:-1}}
  ]},
  {id:'p30_c04',age:30,title:'商业投资',text:'有朋友邀请你投资一家科技公司。',choices:[
    {text:'谨慎投资一小部分',effects:{discipline:1}},
    {text:'大量投资，开始创业',effects:{popularity:1,discipline:-1}},
    {text:'拒绝，把钱存起来',effects:{discipline:2}}
  ]},

  // 31-34岁（巅峰后期）
  {id:'p31_c01',age:31,title:'身体下滑',text:'你明显感觉到自己的速度和爆发力不如从前了。',choices:[
    {text:'调整打法，更多依靠经验',effects:{basketball_iq:2,defense:1}},
    {text:'加大体能训练强度',effects:{stamina:1,injury:1}},
    {text:'接受现实，减少上场时间',effects:{discipline:1,mindset:1}}
  ]},
  {id:'p31_c02',age:31,title:'老将合同',text:'你签了一份老将底薪合同加入雄鹿，和Giannis Antetokounmpo搭档。',choices:[
    {text:'做好配角，帮助球队',effects:{team_trust:2,basketball_iq:1}},
    {text:'不服老，想证明自己',effects:{mindset:1,offense:1}},
    {text:'心态平和，享受篮球',effects:{mindset:1}}
  ]},
  {id:'p31_c03',age:31,title:'伤病增多',text:'这个赛季你已经受伤三次了，每次恢复都比以前慢。',choices:[
    {text:'减少训练量保护身体',effects:{stamina:1,injury:-1}},
    {text:'带伤坚持比赛',effects:{injury:2,team_trust:1}},
    {text:'认真对待每一次伤病',effects:{injury:-1,discipline:1}}
  ]},
  {id:'p31_c04',age:31,title:'更衣室领袖',text:'你成为了球队更衣室里最受尊敬的球员。',choices:[
    {text:'用言行带动年轻球员',effects:{team_trust:2,basketball_iq:1}},
    {text:'做好自己，不干涉别人',effects:{discipline:1}},
    {text:'和教练组紧密配合',effects:{team_trust:1,basketball_iq:1}}
  ]},
  {id:'p32_c01',age:32,title:'又一次交易',text:'你又被交易了，这次是去掘金和Jokic做队友。',choices:[
    {text:'迅速融入新体系',effects:{basketball_iq:1,team_trust:1}},
    {text:'对频繁交易感到疲惫',effects:{mindset:-1}},
    {text:'把每次交易当做新机会',effects:{mindset:1}}
  ]},
  {id:'p32_c02',age:32,title:'三分大赛',text:'你被邀请参加全明星三分球大赛。',choices:[
    {text:'参加并认真备战',effects:{offense:1,popularity:1}},
    {text:'婉拒，专注常规赛',effects:{discipline:1,stamina:1}},
    {text:'参加但只是享受过程',effects:{popularity:1}}
  ]},
  {id:'p32_c03',age:32,title:'家人需要你',text:'你的孩子出生了，你第一次感受到父亲的责任。',choices:[
    {text:'请假陪伴家人',effects:{mindset:1,popularity:1,stamina:1}},
    {text:'比赛结束后再陪伴',effects:{discipline:1,team_trust:1}},
    {text:'在家庭和篮球间找到平衡',effects:{discipline:1,mindset:1}}
  ]},
  {id:'p32_c04',age:32,title:'关键时刻',text:'季后赛最后一分钟，球传到你手里。全场都在看你。',choices:[
    {text:'果断出手',effects:{mindset:2,offense:1}},
    {text:'传给位置更好的队友',effects:{basketball_iq:1,team_trust:1}},
    {text:'犹豫了，被对手抢断',effects:{mindset:-1}}
  ]},
  {id:'p33_c01',age:33,title:'续约谈判',text:'你的合同到期了。你33岁了，市场对你的评价不如从前。',choices:[
    {text:'接受降薪留队',effects:{team_trust:2,discipline:1}},
    {text:'寻找更有竞争力的球队',effects:{mindset:1}},
    {text:'签一份短期合同证明自己',effects:{mindset:1,offense:1}}
  ]},
  {id:'p33_c02',age:33,title:'老将智慧',text:'你发现虽然身体不如从前，但你的比赛阅读能力达到了巅峰。',effects:{basketball_iq:2,defense:1}},
  {id:'p33_c03',age:33,title:'退役传闻',text:'媒体开始讨论你是否应该退役了。',choices:[
    {text:'用表现回击质疑',effects:{mindset:2,offense:1}},
    {text:'不回应，低调打球',effects:{discipline:1}},
    {text:'开始认真考虑退役',effects:{mindset:-1}}
  ]},
  {id:'p33_c04',age:33,title:'传承时刻',text:'一个新秀对你说："我从小就看你打球，你是我的偶像。"',choices:[
    {text:'主动指导他成长',effects:{team_trust:1,basketball_iq:1}},
    {text:'微笑鼓励，保持距离',effects:{mindset:1}},
    {text:'感慨时光飞逝',effects:{mindset:1}}
  ]},
  {id:'p34_c01',age:34,title:'最后的巅峰',text:'你知道自己的巅峰期快结束了，每一场比赛都格外珍惜。',choices:[
    {text:'每一球都全力以赴',effects:{mindset:2,stamina:-1}},
    {text:'合理分配体力，延长生涯',effects:{stamina:1,discipline:1}},
    {text:'开始规划退役生活',effects:{basketball_iq:1}}
  ]},
  {id:'p34_c02',age:34,title:'老东家对阵',text:'你对阵曾经交易走你的老东家。',choices:[
    {text:'用表现让他们后悔',effects:{mindset:1,offense:1}},
    {text:'心平气和，专注比赛',effects:{discipline:1}},
    {text:'赛后和老队友叙旧',effects:{popularity:1}}
  ]},
  {id:'p34_c03',age:34,title:'伤病累积',text:'你的身体已经千疮百孔，每次比赛后都需要很长时间恢复。',choices:[
    {text:'减少上场时间',effects:{stamina:1,injury:-1}},
    {text:'坚持打满全场',effects:{injury:2,team_trust:1}},
    {text:'接受轮休安排',effects:{stamina:1,discipline:1}}
  ]},
  {id:'p34_c04',age:34,title:'教练建议',text:'教练说："你的经验对球队很重要，但你的身体需要更多休息。"',choices:[
    {text:'接受角色转变',effects:{discipline:1,team_trust:1}},
    {text:'觉得自己还能打',effects:{mindset:1}},
    {text:'开始考虑退役',effects:{mindset:1}}
  ]},
  // === 补充22-34岁选择事件 ===
  {id:'p22_c07',age:22,title:'更衣室座位',text:'你发现更衣室里你的座位被老将占了。',choices:[
    {text:'默默换个位置',effects:{discipline:1}},
    {text:'据理力争',effects:{mindset:1,team_trust:-1}},
    {text:'和老将沟通',effects:{basketball_iq:1}}
  ]},
  {id:'p22_c08',age:22,title:'第一次客场之旅',text:'你第一次跟随球队进行客场之旅，长途飞行让你很不适应。',choices:[
    {text:'在飞机上研究对手录像',effects:{basketball_iq:1}},
    {text:'抓紧时间休息',effects:{stamina:1}},
    {text:'和队友聊天缓解紧张',effects:{team_trust:1}}
  ]},
  {id:'p23_c05',age:23,title:'训练中的冲突',text:'训练赛中你和队友发生了身体冲突。',choices:[
    {text:'主动道歉和解',effects:{team_trust:1,discipline:1}},
    {text:'觉得是正常对抗',effects:{mindset:1}},
    {text:'和队友冷战',effects:{team_trust:-1}}
  ]},
  {id:'p23_c06',age:23,title:'社交媒体风波',text:'你在社交媒体上点赞了一条批评球队的帖子，被截图传播了。',choices:[
    {text:'立刻取消点赞并道歉',effects:{discipline:1}},
    {text:'解释是手滑',effects:{}},
    {text:'不在乎外界看法',effects:{mindset:1,popularity:-1}}
  ]},
  {id:'p24_c05',age:24,title:'球迷互动',text:'比赛结束后一个小球迷在球员通道等你，想和你合影。',choices:[
    {text:'停下来合影签名',effects:{popularity:1}},
    {text:'匆匆走过',effects:{discipline:1}},
    {text:'送他一件球衣',effects:{popularity:2}}
  ]},
  {id:'p24_c06',age:24,title:'饮食管理',text:'队医建议你严格控制饮食，戒掉垃圾食品。',choices:[
    {text:'严格执行饮食计划',effects:{stamina:1,discipline:1}},
    {text:'偶尔放纵一下',effects:{discipline:-1,mindset:1}},
    {text:'完全不在意',effects:{stamina:-1}}
  ]},
  {id:'p25_c05',age:25,title:'赛前仪式',text:'你发现了一个赛前仪式能让你状态更好。',choices:[
    {text:'坚持这个仪式',effects:{mindset:1}},
    {text:'觉得是心理作用',effects:{basketball_iq:1}},
    {text:'和队友分享这个仪式',effects:{team_trust:1}}
  ]},
  {id:'p25_c06',age:25,title:'对手挑衅',text:'对手在比赛中不断用垃圾话挑衅你。',choices:[
    {text:'用表现回击',effects:{mindset:1,offense:1}},
    {text:'回喷垃圾话',effects:{mindset:1,popularity:-1}},
    {text:'保持沉默专注比赛',effects:{discipline:1}}
  ]},
  {id:'p26_c05',age:26,title:'赛后加练',text:'比赛结束后教练让全队加练，你已经很累了。',choices:[
    {text:'认真完成加练',effects:{discipline:1,stamina:-1}},
    {text:'偷懒减少训练量',effects:{discipline:-1}},
    {text:'主动加练更多',effects:{discipline:2,stamina:-1}}
  ]},
  {id:'p26_c06',age:26,title:'球迷批评',text:'球迷在社交媒体上批评你最近的表现。',choices:[
    {text:'不看社交媒体',effects:{discipline:1}},
    {text:'回应批评',effects:{mindset:-1,popularity:1}},
    {text:'用表现说话',effects:{mindset:1}}
  ]},
  {id:'p27_c05',age:27,title:'背靠背比赛',text:'连续两场比赛，你的身体已经到了极限。',choices:[
    {text:'向教练申请轮休',effects:{stamina:1,team_trust:-1}},
    {text:'坚持上场',effects:{stamina:-1,team_trust:1}},
    {text:'减少上场时间',effects:{stamina:1}}
  ]},
  {id:'p27_c06',age:27,title:'投篮手感冰冷',text:'你连续几场比赛投篮手感极差。',choices:[
    {text:'赛后疯狂加练投篮',effects:{offense:1}},
    {text:'调整出手选择',effects:{basketball_iq:1}},
    {text:'心态受影响',effects:{mindset:-1}}
  ]},
  {id:'p28_c05',age:28,title:'季后赛主场优势',text:'你的球队拿到了季后赛主场优势。',choices:[
    {text:'利用主场优势全力争胜',effects:{mindset:1,offense:1}},
    {text:'保持平常心',effects:{discipline:1}},
    {text:'研究对手主客场数据',effects:{basketball_iq:1}}
  ]},
  {id:'p28_c06',age:28,title:'队内训练赛',text:'队内训练赛的竞争异常激烈。',choices:[
    {text:'全力以赴',effects:{offense:1,defense:1}},
    {text:'保护自己避免受伤',effects:{stamina:1}},
    {text:'带动队友一起提升',effects:{team_trust:1}}
  ]},
  {id:'p29_c05',age:29,title:'背伤困扰',text:'你的背部开始出现疼痛。',choices:[
    {text:'接受治疗',effects:{injury:-1}},
    {text:'带伤比赛',effects:{injury:1,team_trust:1}},
    {text:'加强核心训练',effects:{stamina:1}}
  ]},
  {id:'p29_c06',age:29,title:'关键罚球',text:'比赛最后时刻你站上罚球线，全场安静。',choices:[
    {text:'稳稳两罚全中',effects:{mindset:1}},
    {text:'两罚一中',effects:{}},
    {text:'两罚不中',effects:{mindset:-1}}
  ]},
  {id:'p30_c05',age:30,title:'老将合同',text:'你30岁了，球队想和你签一份长期合同。',choices:[
    {text:'接受长期合同',effects:{team_trust:1,salary:1}},
    {text:'签短约保持灵活性',effects:{mindset:1}},
    {text:'要求球员选项',effects:{basketball_iq:1}}
  ]},
  {id:'p30_c06',age:30,title:'年轻球员请教',text:'一个新秀来向你请教如何适应NBA。',choices:[
    {text:'耐心指导',effects:{team_trust:1,basketball_iq:1}},
    {text:'简短回答',effects:{}},
    {text:'告诉他要靠自己摸索',effects:{discipline:1}}
  ]},
  {id:'p31_c05',age:31,title:'出场时间减少',text:'教练开始减少你的上场时间。',choices:[
    {text:'接受安排',effects:{discipline:1,team_trust:1}},
    {text:'和教练沟通',effects:{team_trust:1}},
    {text:'心里不满',effects:{mindset:-1}}
  ]},
  {id:'p31_c06',age:31,title:'老对手重逢',text:'你在场上遇到了和你同期进入联盟的老对手。',choices:[
    {text:'和他寒暄',effects:{popularity:1}},
    {text:'全力对抗',effects:{offense:1}},
    {text:'感慨时光飞逝',effects:{mindset:1}}
  ]},
  {id:'p32_c05',age:32,title:'背靠背轮休',text:'教练建议你在背靠背比赛中轮休。',choices:[
    {text:'接受轮休',effects:{stamina:1}},
    {text:'坚持上场',effects:{team_trust:1,stamina:-1}},
    {text:'和教练商量出场时间',effects:{basketball_iq:1}}
  ]},
  {id:'p32_c06',age:32,title:'年轻球员超越',text:'你看着年轻球员在场上飞奔，意识到他们已经超越了你。',choices:[
    {text:'为他们感到高兴',effects:{team_trust:1}},
    {text:'心里有些失落',effects:{mindset:-1}},
    {text:'用经验弥补身体',effects:{basketball_iq:1}}
  ]},
  {id:'p33_c05',age:33,title:'最后的全明星？',text:'你被选为全明星替补，可能是最后一次了。',choices:[
    {text:'享受全明星周末',effects:{popularity:1,mindset:1}},
    {text:'低调参加',effects:{discipline:1}},
    {text:'感慨万千',effects:{mindset:1}}
  ]},
  {id:'p33_c06',age:33,title:'退役球衣讨论',text:'球迷开始讨论你的球衣是否应该被退役。',choices:[
    {text:'不在意这些',effects:{discipline:1}},
    {text:'感到荣幸',effects:{mindset:1}},
    {text:'专注当下',effects:{discipline:1}}
  ]},
  {id:'p34_c05',age:34,title:'最后的绝杀',text:'比赛最后时刻球传到你手里，你投中了绝杀球。',choices:[
    {text:'庆祝',effects:{mindset:1,popularity:1}},
    {text:'平静地接受',effects:{discipline:1}},
    {text:'觉得这是命运',effects:{mindset:1}}
  ]},
  {id:'p34_c06',age:34,title:'年轻球员的尊重',text:'对手的年轻球星赛后对你说："你是我的偶像。"',choices:[
    {text:'微笑回应',effects:{popularity:1}},
    {text:'鼓励他继续努力',effects:{team_trust:1}},
    {text:'感慨自己真的老了',effects:{mindset:1}}
  ]},
  // === 补充35-40岁选择事件 ===
  {id:'t35_c05',age:35,title:'老将会议',text:'教练召开了老将会议，讨论球队方向。',choices:[
    {text:'提出建议',effects:{team_trust:1,basketball_iq:1}},
    {text:'沉默旁听',effects:{discipline:1}},
    {text:'支持教练决定',effects:{team_trust:1}}
  ]},
  {id:'t35_c06',age:35,title:'伤病复发',text:'你的旧伤在训练中复发了。',choices:[
    {text:'接受治疗',effects:{injury:-1}},
    {text:'带伤坚持',effects:{injury:2}},
    {text:'认真考虑退役',effects:{mindset:1}}
  ]},
  {id:'t36_c05',age:36,title:'球衣退役仪式',text:'你的老东家为你举办了球衣退役仪式。',choices:[
    {text:'出席并致辞',effects:{popularity:2,mindset:1}},
    {text:'婉拒',effects:{discipline:1}},
    {text:'低调出席',effects:{mindset:1}}
  ]},
  {id:'t36_c06',age:36,title:'家庭时间',text:'你开始花更多时间陪伴家人。',choices:[
    {text:'减少训练时间',effects:{stamina:1,discipline:-1}},
    {text:'平衡家庭和篮球',effects:{discipline:1}},
    {text:'完全投入家庭',effects:{mindset:1}}
  ]},
  {id:'t37_c04',age:37,title:'海外机会',text:'一支欧洲联赛球队邀请你加盟。',choices:[
    {text:'去欧洲打球',effects:{salary:1,popularity:-1}},
    {text:'留在美国',effects:{discipline:1}},
    {text:'考虑中',effects:{}}
  ]},
  {id:'t37_c05',age:37,title:'篮球训练营',text:'你开办了一个篮球训练营。',choices:[
    {text:'亲自执教',effects:{basketball_iq:1,popularity:1}},
    {text:'投资但不参与',effects:{}},
    {text:'婉拒邀请',effects:{discipline:1}}
  ]},
  {id:'t38_c03',age:38,title:'最后的季后赛',text:'你的球队打进了季后赛，你知道这可能是你最后一次。',choices:[
    {text:'全力以赴',effects:{mindset:2,stamina:-1}},
    {text:'享受比赛',effects:{mindset:1}},
    {text:'指导年轻球员',effects:{team_trust:1}}
  ]},
  {id:'t38_c04',age:38,title:'退役礼物',text:'队友们送给你一件签名球衣作为退役礼物。',choices:[
    {text:'感动落泪',effects:{mindset:1}},
    {text:'回赠礼物',effects:{team_trust:1}},
    {text:'合影留念',effects:{popularity:1}}
  ]},
  {id:'t39_c03',age:39,title:'最后的训练',text:'你参加了最后一次球队训练。',choices:[
    {text:'认真完成',effects:{discipline:1}},
    {text:'提前离开',effects:{mindset:1}},
    {text:'和每个人拥抱',effects:{team_trust:1}}
  ]},
  {id:'t39_c04',age:39,title:'球迷来信',text:'你收到了一封球迷的来信，说你的比赛陪伴了他整个青春。',choices:[
    {text:'回信感谢',effects:{popularity:1,mindset:1}},
    {text:'珍藏这封信',effects:{mindset:1}},
    {text:'分享到社交媒体',effects:{popularity:1}}
  ]},
  {id:'t40_c03',age:40,title:'最后的采访',text:'退役前的最后一次采访。',choices:[
    {text:'畅谈职业生涯',effects:{popularity:1}},
    {text:'简短告别',effects:{discipline:1}},
    {text:'感谢所有人',effects:{mindset:1}}
  ]}
];

const PRIME_NARRATIVE_EVENTS = [
  {id:'p22_n01',age:22,title:'新秀洗礼',text:'你正式踏上了NBA赛场。更衣室里挂着你的球衣，你的名字出现在了官方名单上。你站在球场中央，看着四周的观众席，心中充满了敬畏和期待。\n\n这是你梦寐以求的时刻。从12岁那个在街头球场打球的孩子，到如今站在NBA赛场上的职业球员——你走了整整十年。',effects:{mindset:1,popularity:1}},
  {id:'p22_n02',age:22,title:'第一次被隔扣',text:'训练赛中你被一个全明星球员隔扣了。他的身体在空中划出一道弧线，球狠狠地砸进篮筐，而你被撞倒在地。全队都在笑，对手甚至没有看你一眼。\n\n你握紧了拳头，从地上爬起来。你知道，这就是NBA——这里没有同情，只有实力。你要么变强，要么被淘汰。',effects:{mindset:1,defense:1}},
  {id:'p23_n01',age:23,title:'连续得分上双',text:'你连续10场比赛得分上双，教练开始信任你。你的名字开始出现在体育新闻的头条上，球迷们开始记住你的脸。\n\n"他正在成长为一名可靠的球员，"教练在新闻发布会上说。你知道，这只是开始。',effects:{team_trust:1,offense:1}},
  {id:'p23_n02',age:23,title:'赛后加练',text:'每次比赛结束后你都留下来加练投篮。球馆的灯总是为你亮着，清洁工都认识你了。\n\n"你是最后一个离开球馆的人，"保安说，"每天都这样。"你笑了笑，继续投篮。你知道，成功没有捷径，只有日复一日的重复。',effects:{offense:1,discipline:1}},
  {id:'p24_n01',age:24,title:'季后赛初体验',text:'你第一次参加季后赛，强度比常规赛大了不止一个级别。每一次对抗都像是打仗，每一个回合都至关重要。\n\n你在第一场比赛中被对手的防守强度吓到了。但随着比赛的进行，你逐渐适应了。你知道，季后赛才是真正的篮球。',effects:{basketball_iq:1,mindset:1}},
  {id:'p24_n02',age:24,title:'对手研究',text:'你开始系统研究对手的比赛录像，发现了自己很多不足。你在笔记本上记满了对手的习惯动作和弱点。\n\n"你是我见过最认真的球员，"你的录像分析师说，"很多老将都不像你这样研究比赛。"你知道，知识就是力量。',effects:{basketball_iq:2}},
  {id:'p25_n01',age:25,title:'技术成熟',text:'你的各项技术开始趋于成熟，比赛中的失误越来越少。你不再需要思考该做什么，你的身体会自动做出正确的选择。\n\n"他正在进入巅峰期，"一位NBA分析师说，"他的技术已经没有明显弱点了。"你知道，你正在成为联盟最好的球员之一。',effects:{basketball_iq:1,offense:1}},
  {id:'p25_n02',age:25,title:'球队化学反应',text:'你和队友们的默契越来越好，球队开始赢多输少。你们不需要言语就能理解彼此的意图，一个眼神、一个手势就够了。\n\n"这就是团队篮球，"教练说，"当球员们真正理解彼此，球队就会变得不可阻挡。"你知道，你正在成为这个团队不可或缺的一部分。',effects:{team_trust:1,basketball_iq:1}},
  {id:'p26_n01',age:26,title:'生涯新高',text:'你在这场比赛中砍下了生涯最高的45分。每一次出手都像是艺术——后撤步三分、急停中距离、暴力突破——你用所有武器摧毁了对手的防线。\n\n赛后，记者们围着你问感受。你微笑着说："我只是打出了自己的篮球。"但你知道，这是一个里程碑。你的名字被写进了当晚的比赛报告中。',effects:{offense:1,honor:1,popularity:1}},
  {id:'p26_n02',age:26,title:'防守进步',text:'你的防守能力有了质的飞跃，开始被对手重点研究。你的脚步、你的预判、你的意志——这一切构成了一道坚固的防线。\n\n"他是联盟最好的防守球员之一，"一位对手说，"和他对位是最痛苦的经历。"你知道，防守将成为你职业生涯的标志之一。',effects:{defense:2}},
  {id:'p27_n01',age:27,title:'绝杀之夜',text:'季后赛你投中了压哨绝杀。球在空中飞行的那一刻，整个球馆都安静了。然后——刷！球进了！全场沸腾，你被队友们压在身下。\n\n那一刻将永远被铭记。你的名字被写进了季后赛的经典时刻，你的绝杀集锦将在社交媒体上被反复播放。你知道，这就是你梦寐以求的时刻。',effects:{mindset:1,honor:1,popularity:1}},
  {id:'p27_n02',age:27,title:'对抗Wembanyama',text:'你对位Victor Wembanyama，被他的身高臂展完全罩住。你试图投篮，但他的手像一堵墙一样挡在你面前。你试图突破，但他的脚步比你还快。\n\n"他是我遇到过最难防守的球员，"赛后你说，"他的天赋是上帝给的。"你知道，天赋差距是真实存在的，但这不会阻止你继续努力。',effects:{basketball_iq:1,mindset:1}},
  {id:'p28_n01',age:28,title:'巅峰期到来',text:'你感觉自己正处于职业生涯的巅峰，身体和技术都达到了最佳状态。你的每一次训练都是高质量的，你的每一场比赛都是高水准的。\n\n"他正处于巅峰，"一位NBA分析师说，"这是他最好的年华。"你知道，你要抓住这段时光，创造属于你的传奇。',effects:{athletics:1,offense:1}},
  {id:'p28_n02',age:28,title:'关键比赛表现',text:'在一场全国直播的关键比赛中你表现出色，媒体开始把你列为全明星候选人。你的名字出现在了所有体育媒体的头条上。\n\n"他正在成为联盟最好的球员之一，"Stephen A. Smith在节目中说。你知道，你正在接近你梦想中的高度。',effects:{popularity:1,honor:1}},
  {id:'p29_n01',age:29,title:'被包夹的日子',text:'对手开始对你使用双人甚至三人包夹，你的每次得分都变得艰难。你被迫改变打法，更多地传球给空位的队友。\n\n"这是对你的一种尊重，"教练说，"他们害怕你。"你知道，被包夹是一种荣誉，也是一种挑战。你要学会在包夹中找到机会。',effects:{basketball_iq:1,defense:1}},
  {id:'p29_n02',age:29,title:'更衣室演讲',text:'球队遭遇三连败，士气低落。你在更衣室里站了起来，做了一次激励人心的演讲。\n\n"我们是一个团队，"你说，"输球不可怕，可怕的是失去信心。我相信我们能赢，因为我知道你们有多努力。"队友们都被你感染了，他们的眼中重新燃起了火焰。',effects:{team_trust:2,mindset:1}},
  {id:'p30_n01',age:30,title:'历史时刻',text:'你的生涯总得分突破了一万分大关。球馆的大屏幕上打出了祝贺信息，全场球迷起立鼓掌。\n\n你站在球场中央，环顾四周。从新秀年到如今，你经历了太多——伤病、交易、质疑、荣耀。但你知道，这一切都是值得的。你的名字被写进了历史。',effects:{honor:2,popularity:1}},
  {id:'p30_n02',age:30,title:'经验的积累',text:'打了这么多年球，你对比赛的理解达到了新的高度。你能在对手出手之前就知道球会不会进，你能在队友跑位之前就知道他要做什么。\n\n"他的篮球智商是顶级的，"你的教练说，"他就像一个在场上指挥的教练。"你知道，经验是无法用天赋替代的。',effects:{basketball_iq:2}},
  {id:'p31_n01',age:31,title:'速度的告别',text:'你发现自己再也跑不出年轻时的快攻了。你的第一步变慢了，你的弹跳变低了。但你学会了用节奏感弥补，用经验弥补，用智慧弥补。\n\n"他不再用身体打球了，"一位解说员说，"他用脑子打球。"你知道，这是每一个老将都要经历的转变。',effects:{basketball_iq:1,athletics:-1}},
  {id:'p31_n02',age:31,title:'老将的尊重',text:'年轻球员们开始主动向你请教经验。他们在训练后围坐在你身边，听你讲述职业生涯的故事。\n\n"你是我们的榜样，"一位年轻球员说，"我们想成为像你一样的球员。"你感受到了传承的力量。你知道，你的影响力已经超越了球场。',effects:{team_trust:1,mindset:1}},
  {id:'p32_n01',age:32,title:'数据下滑',text:'你的场均数据全面下滑了。教练减少了你的上场时间，媒体开始讨论你是否应该退役。\n\n"他的时代已经过去了，"一位评论员说。你听到这些话，心中五味杂陈。但你知道，你还没有结束。你要用行动证明，你还有价值。',effects:{mindset:1}},
  {id:'p32_n02',age:32,title:'替补席的思考',text:'坐在替补席上看着年轻球员们在场上飞奔，你想起了当年的自己。那个12岁在街头球场打球的孩子，那个18岁踏入大学校园的少年，那个22岁站在NBA赛场上的新秀。\n\n时间过得真快。但你没有遗憾，因为你已经尽了全力。',effects:{mindset:1,basketball_iq:1}},
  {id:'p33_n01',age:33,title:'韧带的代价',text:'多年的高强度比赛让你的膝盖和脚踝都积累了严重的伤病。每次比赛后，你都要花一个小时做冰敷和理疗。\n\n"你的身体已经磨损了，"队医说，"你需要学会保护自己。"你知道，这是职业球员的代价。你的身体为篮球付出了太多。',effects:{injury:1,stamina:-1}},
  {id:'p33_n02',age:33,title:'更衣室的笑声',text:'你在更衣室里讲了个笑话，全队都笑了。你在球队里扮演着越来越重要的精神角色——你不再是得分手，你是领袖，你是大哥。\n\n"他是球队的灵魂，"教练说，"有他在，球队就不会散。"你知道，你的价值不仅仅体现在数据上。',effects:{team_trust:1,mindset:1}},
  {id:'p34_n01',age:34,title:'回望职业生涯',text:'你坐在更衣室里，看着墙上挂着的这些年的球队照片。你的新秀年、你的第一次全明星、你的第一次季后赛——每一张照片都是一段回忆。\n\n时间过得真快。你不知道自己还能打多久，但你知道，你要珍惜剩下的每一场比赛。',effects:{mindset:1}},
  {id:'p34_n02',age:34,title:'球迷的支持',text:'比赛结束后一个老球迷走到你面前，眼眶湿润地说："我看了你整整12年的比赛，从你新秀年到现在。谢谢你带给我的所有美好回忆。"\n\n你感动得说不出话来。你知道，这就是你打球的意义——不仅仅是为了胜利，更是为了那些和你一起经历这一切的人。',effects:{mindset:2,popularity:1}},
  {id:'p22_n03',age:22,title:'第一次拿到薪水',text:'你收到了第一笔NBA薪水，数字大到让你不敢相信。',effects:{discipline:1}},
  {id:'p24_n03',age:24,title:'训练中的突破',text:'你终于掌握了后仰跳投的精髓，这将成为你的杀手锏。',effects:{offense:2}},
  {id:'p26_n03',age:26,title:'对手的尊重',text:'赛后对手的核心球员主动找你交换球衣。',effects:{popularity:1,mindset:1}},
  {id:'p28_n03',age:28,title:'全明星周末',text:'你参加了全明星周末，和联盟最好的球员们同场竞技。',effects:{popularity:1,honor:1}},
  {id:'p30_n03',age:30,title:'领袖的重量',text:'你成为了球队的队长，肩上的担子更重了。',effects:{team_trust:1,mindset:1}},
  {id:'p32_n03',age:32,title:'伤病恢复',text:'你花了一个夏天认真做康复，身体状态恢复得不错。',effects:{stamina:1,injury:-1}},
  {id:'p34_n03',age:34,title:'深夜的球馆',text:'深夜的球馆只有你一个人在练习罚球。你想起12岁时第一次摸到篮球的感觉。',effects:{mindset:1,discipline:1}},
  // === 补充22-34岁叙事事件 ===
  {id:'p22_n04',age:22,title:'第一次客场胜利',text:'你在客场拿下了NBA生涯第一场胜利。更衣室里队友们为你庆祝。',effects:{team_trust:1,mindset:1}},
  {id:'p22_n05',age:22,title:'球衣号码',text:'你选择了自己的球衣号码。这个号码将伴随你整个职业生涯。',effects:{mindset:1}},
  {id:'p23_n03',age:23,title:'第一次三双',text:'你拿下了NBA生涯第一个三双数据。媒体开始关注你。',effects:{popularity:1,honor:1}},
  {id:'p23_n04',age:23,title:'训练中的进步',text:'你发现自己的三分命中率有了显著提升。',effects:{offense:1}},
  {id:'p24_n04',age:24,title:'季后赛经验',text:'季后赛的高强度比赛让你成长了很多。',effects:{basketball_iq:1,mindset:1}},
  {id:'p24_n05',age:24,title:'赛后分析',text:'你养成了赛后分析比赛录像的习惯。',effects:{basketball_iq:1}},
  {id:'p25_n03',age:25,title:'身体巅峰',text:'你感觉自己的身体正处于巅峰状态。',effects:{athletics:1,stamina:1}},
  {id:'p25_n04',age:25,title:'技术全面',text:'你的技术越来越全面，对手越来越难防你。',effects:{offense:1,defense:1}},
  {id:'p26_n04',age:26,title:'领袖气质',text:'你在更衣室里越来越有话语权。',effects:{team_trust:1}},
  {id:'p26_n05',age:26,title:'比赛阅读',text:'你对比赛的阅读能力达到了新的高度。',effects:{basketball_iq:1}},
  {id:'p27_n03',age:27,title:'关键时刻表现',text:'你在关键时刻的表现越来越稳定。',effects:{mindset:1}},
  {id:'p27_n04',age:27,title:'球迷支持',text:'你的球迷越来越多，每场比赛都有人举着你的海报。',effects:{popularity:1}},
  {id:'p28_n04',age:28,title:'全明星首发',text:'你首次入选全明星首发阵容。',effects:{honor:1,popularity:1}},
  {id:'p28_n05',age:28,title:'技术统计',text:'你的场均数据达到了生涯新高。',effects:{offense:1}},
  {id:'p29_n03',age:29,title:'伤病恢复',text:'你从伤病中恢复，状态比以前更好了。',effects:{stamina:1,injury:-1}},
  {id:'p29_n04',age:29,title:'比赛经验',text:'你积累了大量的比赛经验。',effects:{basketball_iq:1}},
  {id:'p30_n04',age:30,title:'生涯里程碑',text:'你的生涯总得分突破了一万分。',effects:{honor:1}},
  {id:'p30_n05',age:30,title:'球队核心',text:'你成为了球队的绝对核心。',effects:{team_trust:1}},
  {id:'p31_n03',age:31,title:'经验的价值',text:'你发现经验在比赛中的价值越来越大。',effects:{basketball_iq:1}},
  {id:'p31_n04',age:31,title:'老将风范',text:'你在场上展现出了老将的风范。',effects:{team_trust:1}},
  {id:'p32_n04',age:32,title:'传承时刻',text:'你开始指导年轻球员。',effects:{team_trust:1,basketball_iq:1}},
  {id:'p32_n05',age:32,title:'比赛智慧',text:'你的比赛智慧让你在场上依然有影响力。',effects:{basketball_iq:1}},
  {id:'p33_n03',age:33,title:'最后的巅峰',text:'你知道自己的巅峰期快结束了。',effects:{mindset:1}},
  {id:'p33_n04',age:33,title:'球迷致敬',text:'球迷们为你送上了致敬。',effects:{popularity:1}},
  {id:'p34_n04',age:34,title:'职业生涯回顾',text:'你回顾了自己的职业生涯。',effects:{mindset:1}},
  {id:'p34_n05',age:34,title:'最后的准备',text:'你为可能的最后一场比赛做准备。',effects:{discipline:1}},
  // === 名人互动事件（高频） ===
  {id:'p22_star01',age:22,title:'LeBron的忠告',text:'LeBron James在赛后找到你，拍了拍你的肩膀说："年轻人，保持饥饿感，联盟会奖励那些最努力的人。"',effects:{mindset:1,discipline:1}},
  {id:'p22_star02',age:22,title:'Curry的投篮课',text:'Stephen Curry邀请你一起加练三分球，你被他变态的投篮手感深深震撼。',effects:{offense:1}},
  {id:'p23_star01',age:23,title:'Wembanyama的启示',text:'你和Victor Wembanyama在训练馆偶遇，他用2米26的身高展示后卫般的运球，你深受启发。',effects:{basketball_iq:1}},
  {id:'p23_star02',age:23,title:'Giannis的奋斗史',text:'Giannis Antetokounmpo分享了他从希腊底层奋斗到NBA巨星的经历，你被深深打动。',effects:{mindset:2}},
  {id:'p24_star01',age:24,title:'KD的建议',text:'Kevin Durant在训练后和你聊了很久，告诉你"别管外界噪音，专注于变强"。',effects:{mindset:1,offense:1}},
  {id:'p24_star02',age:24,title:'Jokic的传球课',text:'你观看了Nikola Jokic的比赛录像，被他不可思议的传球视野所折服。',effects:{basketball_iq:1}},
  {id:'p25_star01',age:25,title:'SGA的中投',text:'Shai Gilgeous-Alexander在场上用无解中投教训了你，让你意识到技术打磨永无止境。',effects:{offense:1,discipline:1}},
  {id:'p25_star02',age:25,title:'Tatum的季后赛经验',text:'Jayson Tatum和你分享了季后赛经验："到了关键时刻，比的不是技术，是心态。"',effects:{mindset:1}},
  {id:'p26_star01',age:26,title:'Luka的欧洲智慧',text:'Luka Doncic和你聊到从欧洲到NBA的适应过程："打好自己的篮球，其他都不重要。"',effects:{basketball_iq:1}},
  {id:'p26_star02',age:26,title:'Dame的忠诚',text:'Damian Lillard在更衣室里和你聊到忠诚与选择："每个人都有自己的路。"',effects:{mindset:1}},
  {id:'p27_star01',age:27,title:'Ant的态度',text:'Anthony Edwards在训练中展示了他的暴力扣篮，告诉你"打球要有态度"。',effects:{mindset:1,athletics:1}},
  {id:'p27_star02',age:27,title:'CP3的篮球智商',text:'Chris Paul教你如何阅读防守，他的比赛智商让你叹为观止。',effects:{basketball_iq:2}},
  {id:'p28_star01',age:28,title:'和KD一起训练',text:'Kevin Durant邀请你和他一起进行休赛期训练，你学到了很多。',effects:{offense:2}},
  {id:'p28_star02',age:28,title:'LeBron的领导力',text:'你观看了LeBron James如何领导一支球队，受益匪浅。',effects:{basketball_iq:1,team_trust:1}},
  {id:'p29_star01',age:29,title:'Curry的无球跑动',text:'Stephen Curry教你无球跑动的精髓，你终于理解了为什么他那么难防。',effects:{offense:1,basketball_iq:1}},
  {id:'p29_star02',age:29,title:'字母哥的训练',text:'你亲眼看到Giannis Antetokounmpo的训练强度，被他的自律深深震撼。',effects:{discipline:2}},
  {id:'p30_star01',age:30,title:'Wembanyama对位',text:'你对位Victor Wembanyama，被他的身高臂展完全罩住。天赋差距是真实存在的。',effects:{basketball_iq:1,mindset:1}},
  {id:'p30_star02',age:30,title:'SGA的训练方法',text:'Shai Gilgeous-Alexander分享了他的训练方法，你开始模仿他的中距离技术。',effects:{offense:1}},
  // === 经纪人事件 ===
  {id:'p22_agent01',age:22,title:'Rich Paul的电话',text:'Rich Paul通过关系联系到你，他说你在联盟的前景很好，想和你聊聊商业规划。',effects:{popularity:1}},
  {id:'p24_agent01',age:24,title:'经纪人的建议',text:'你的经纪人告诉你："你的商业价值正在上升，要开始注意公众形象了。"',effects:{popularity:1,discipline:1}},
  {id:'p26_agent01',age:26,title:'合同谈判',text:'你的经纪人在合同谈判中为你争取到了一份不错的合同。',effects:{salary:1,team_trust:1}},
  {id:'p28_agent01',age:28,title:'Rich Paul的商业课',text:'Rich Paul教你如何管理个人品牌和商业投资。',effects:{popularity:1}},
  {id:'p30_agent01',age:30,title:'经纪人换人？',text:'有新的经纪人想签你，承诺能帮你拿到更大的合同。',choices:[
    {text:'换经纪人',effects:{salary:1,popularity:1}},
    {text:'保持忠诚',effects:{discipline:1}}
  ]},
  // === 记者事件 ===
  {id:'p22_reporter01',age:22,title:'Shams的采访',text:'Shams Charania在球员通道拦住你做了简短采访，你的回答可能会被全联盟看到。',effects:{popularity:1}},
  {id:'p23_reporter01',age:23,title:'Woj的报道',text:'Woj发推提到你正在和球队谈续约，消息一出你的手机被打爆了。',effects:{popularity:1}},
  {id:'p25_reporter01',age:25,title:'Stephen A.的批评',text:'Stephen A. Smith在节目上公开批评了你的表现，你该如何回应？',choices:[
    {text:'用表现回击',effects:{mindset:1,offense:1}},
    {text:'在社交媒体回应',effects:{popularity:1,mindset:-1}},
    {text:'忽略，专注训练',effects:{discipline:1}}
  ]},
  {id:'p27_reporter01',age:27,title:'Zach Lowe的分析',text:'Zach Lowe写了一篇深度分析文章，详细解读了你的比赛风格和进步空间。',effects:{basketball_iq:1}},
  {id:'p29_reporter01',age:29,title:'媒体采访',text:'赛后你被大批记者包围，他们想听听你对比赛的看法。',effects:{popularity:1}},
  {id:'p31_reporter01',age:31,title:'Woj的交易传闻',text:'Woj爆料说球队正在考虑交易你，你的手机瞬间被打爆。',choices:[
    {text:'专注比赛不受影响',effects:{discipline:1,mindset:1}},
    {text:'找管理层确认',effects:{team_trust:1}},
    {text:'心态受影响',effects:{mindset:-1}}
  ]},
  {id:'p33_reporter01',age:33,title:'Shams的退役传闻',text:'Shams Charania报道说你可能会在赛季结束后退役。',choices:[
    {text:'否认传闻',effects:{mindset:1}},
    {text:'不置可否',effects:{}},
    {text:'承认在考虑',effects:{mindset:1}}
  ]}
];

// ============================================================
// 阶段4：暮年退役期【35-40岁｜生涯收尾】
// ============================================================

const TWILIGHT_CHOICE_EVENTS = [
  {id:'t35_c01',age:35,title:'退役考虑',text:'你35岁了，身体大不如前。球队给你开了一份老将底薪。',choices:[
    {text:'接受底薪继续打球',effects:{team_trust:1,discipline:1}},
    {text:'要求更多上场时间作为条件',effects:{mindset:1,team_trust:-1}},
    {text:'认真考虑退役',effects:{mindset:1}}
  ]},
  {id:'t35_c02',age:35,title:'年轻球员挑战',text:'一个新秀在训练中公开挑战你的位置。',choices:[
    {text:'用经验教训他',effects:{mindset:1,basketball_iq:1}},
    {text:'大方让位，指导他成长',effects:{team_trust:2,basketball_iq:1}},
    {text:'心里不舒服但保持沉默',effects:{mindset:-1}}
  ]},
  {id:'t35_c03',age:35,title:'海外捞金',text:'一支CBA球队给你开出了天价合同。',choices:[
    {text:'去CBA打一两年赚钱',effects:{salary:2,popularity:-1}},
    {text:'留在NBA打到退役',effects:{discipline:1,mindset:1}},
    {text:'犹豫后拒绝',effects:{mindset:1}}
  ]},
  {id:'t35_c04',age:35,title:'伤病困扰',text:'你的膝盖软骨已经磨损严重，医生建议你减少比赛。',choices:[
    {text:'减少上场时间做轮换球员',effects:{stamina:1,injury:-1}},
    {text:'打封闭坚持上场',effects:{injury:3,team_trust:1}},
    {text:'认真考虑退役',effects:{mindset:1}}
  ]},
  {id:'t36_c01',age:36,title:'退役宣言？',text:'媒体问你是否打算退役。你该怎么回答？',choices:[
    {text:'"我会打到身体不允许为止"',effects:{mindset:1,popularity:1}},
    {text:'"这可能是我最后一个赛季"',effects:{mindset:1}},
    {text:'"我还没想好"',effects:{}}
  ]},
  {id:'t36_c02',age:36,title:'告别赛安排',text:'你的老东家想为你安排一场告别赛。',choices:[
    {text:'欣然接受',effects:{popularity:2,mindset:1}},
    {text:'婉拒，想低调退役',effects:{discipline:1}},
    {text:'等确定退役再说',effects:{}}
  ]},
  {id:'t36_c03',age:36,title:'转型准备',text:'有电视台邀请你做解说嘉宾。',choices:[
    {text:'接受，开始为退役后做准备',effects:{basketball_iq:1,popularity:1}},
    {text:'拒绝，专注打球',effects:{discipline:1}},
    {text:'先试试看',effects:{popularity:1}}
  ]},
  {id:'t36_c04',age:36,title:'老队友退役',text:'你的老队友正式退役了。你们在更衣室里聊了很久。',choices:[
    {text:'感慨万千，更加珍惜比赛',effects:{mindset:1}},
    {text:'也开始考虑自己的未来',effects:{basketball_iq:1}},
    {text:'觉得是时候了',effects:{mindset:1}}
  ]},
  {id:'t37_c01',age:37,title:'合同危机',text:'没有球队愿意给你合同了。',choices:[
    {text:'主动联系球队争取机会',effects:{mindset:1}},
    {text:'考虑去海外联赛打球',effects:{mindset:1}},
    {text:'接受现实，准备退役',effects:{mindset:1}}
  ]},
  {id:'t37_c02',age:37,title:'教练组邀请',text:'一支球队邀请你加入教练组，以球员兼教练身份留队。',choices:[
    {text:'接受球员兼教练角色',effects:{basketball_iq:1,team_trust:1}},
    {text:'拒绝，想继续打球',effects:{mindset:1}},
    {text:'认真考虑转型',effects:{basketball_iq:1}}
  ]},
  {id:'t37_c03',age:37,title:'身体警告',text:'医生严肃地告诉你：再打下去可能会造成永久性损伤。',choices:[
    {text:'听从医生建议退役',effects:{discipline:1,stamina:1}},
    {text:'再打一年看看',effects:{injury:2,mindset:1}},
    {text:'减少比赛频率',effects:{stamina:1}}
  ]},
  {id:'t38_c01',age:38,title:'退役倒计时',text:'你告诉自己这可能是最后一个赛季了。每场比赛都格外珍惜。',choices:[
    {text:'全力以赴打好每一场比赛',effects:{mindset:2}},
    {text:'开始认真规划退役后的生活',effects:{basketball_iq:1}},
    {text:'突然不想退役了',effects:{mindset:1}}
  ]},
  {id:'t38_c02',age:38,title:'商业机会',text:'有人邀请你投资一家篮球训练营。',choices:[
    {text:'投资并亲自参与管理',effects:{basketball_iq:1,discipline:1}},
    {text:'投资但不参与日常管理',effects:{}},
    {text:'婉拒',effects:{discipline:1}}
  ]},
  {id:'t39_c01',age:39,title:'最后的比赛',text:'你的身体已经在发出最后的警告了。每场比赛后都需要两天才能恢复。',choices:[
    {text:'打完这个赛季就退役',effects:{mindset:1}},
    {text:'再坚持一年',effects:{injury:1,mindset:1}},
    {text:'现在就挂靴',effects:{mindset:1}}
  ]},
  {id:'t39_c02',age:39,title:'告别演讲',text:'你在更衣室里做了一次感人的告别演讲。',choices:[
    {text:'感谢所有人',effects:{team_trust:2,popularity:1}},
    {text:'平静地告别',effects:{discipline:1}},
    {text:'泣不成声',effects:{mindset:1}}
  ]},
  {id:'t40_c01',age:40,title:'最后一季',text:'你已经40岁了。你是联盟最老的球员。',choices:[
    {text:'打完最后一个赛季',effects:{mindset:2}},
    {text:'现在就退役',effects:{mindset:1}},
    {text:'再打一年',effects:{mindset:1,injury:1}}
  ]},
  {id:'t40_c02',age:40,title:'传奇谢幕',text:'你的退役仪式上，全场球迷起立鼓掌。大屏幕上播放着你的生涯集锦。',choices:[
    {text:'含泪致谢',effects:{mindset:1,popularity:1}},
    {text:'平静微笑',effects:{discipline:1}},
    {text:'发表了感人的退役演说',effects:{popularity:2,mindset:1}}
  ]}
];

const TWILIGHT_NARRATIVE_EVENTS = [
  {id:'t35_n01',age:35,title:'膝盖的抗议',text:'你的膝盖在每次起跳后都会发出咔咔声。年轻球员问你没事吧，你笑着说习惯了。\n\n赛后的理疗室成了你的第二个家。冰敷、按摩、拉伸——每一项都是为了让你的身体能再多撑一天。你知道，你的身体已经在抗议了，但你还不想停下来。',effects:{injury:1,stamina:-1}},
  {id:'t35_n02',age:35,title:'老将的智慧',text:'虽然身体不行了，但你对比赛的阅读能力无人能及。教练经常在暂停时征求你的意见，队友们在场上会看向你寻求指引。\n\n"他是场上的教练，"你的主教练说，"他的经验是无价的。"你知道，你现在的价值不在于得分，而在于智慧。',effects:{basketball_iq:1}},
  {id:'t36_n01',age:36,title:'最后一个全明星？',text:'你被选为全明星替补，可能是最后一次了。全场为你欢呼，你的眼眶湿润了。\n\n你站在全明星赛的球场上，环顾四周——这里汇聚了联盟最好的球员，而你是其中最年长的一个。你不知道下一次还能不能来，所以你格外珍惜这一刻。',effects:{popularity:1,honor:1}},
  {id:'t36_n02',age:36,title:'赛后采访',text:'赛后记者问你还能打多久。你沉默了一会儿说："一天算一天。"\n\n你知道这个回答很模糊，但这就是真实的想法。你不想给自己设定一个退役日期，因为你还不想离开。但你也知道，那一天终会到来。',effects:{mindset:1}},
  {id:'t37_n01',age:37,title:'更衣室的变化',text:'更衣室里已经没有几个你认识的老面孔了。联盟更新换代的速度比你想象的快。\n\n你看着那些年轻球员，想起了当年的自己——充满活力、充满梦想、不知道前方有什么在等待。你知道，你的时代正在过去，但你还不想离开。',effects:{mindset:1}},
  {id:'t37_n02',age:37,title:'球迷的致敬',text:'在你曾经效力过的城市比赛时，球迷们为你送上了致敬视频。大屏幕上播放着你职业生涯的高光时刻，全场球迷起立鼓掌。\n\n你站在球场中央，看着那些熟悉的画面，泪水模糊了视线。你知道，无论你去哪里，这些球迷都会记得你。',effects:{popularity:1,mindset:1}},
  {id:'t38_n01',age:38,title:'数据统计',text:'你的生涯数据统计员告诉你，你的总助攻数已经排进历史前100了。你听到这个数字，有些不敢相信。\n\n"你知道这意味着什么吗？"统计员说，"你的名字和那些传奇球员并列。"你知道，你可能不是最伟大的球员，但你已经是历史的一部分了。',effects:{honor:1}},
  {id:'t38_n02',age:38,title:'训练中的挣扎',text:'训练中你发现自己连年轻球员的一半速度都跟不上了。你拼尽全力，但你的身体已经跟不上你的意志了。\n\n"你的精神还在，"教练说，"但你的身体需要休息。"你知道，这是每一个老将都要面对的现实。你开始思考，也许退役的时间快到了。',effects:{mindset:1}},
  {id:'t39_n01',age:39,title:'深夜的思考',text:'深夜你一个人坐在空荡荡的球馆里，想着退役后的生活。球馆的灯光有些暗，你的影子被拉得很长。\n\n你想起了这些年的经历——新秀年的兴奋、巅峰期的荣耀、伤病时的痛苦、交易时的迷茫。一切都像是昨天发生的事情。你知道，你的人生即将翻开新的一页。',effects:{mindset:1}},
  {id:'t39_n02',age:39,title:'最后的三分',text:'比赛最后时刻你投进了一个三分球。球在空中划出一道完美的弧线，应声入网。全场起立为你鼓掌。\n\n你知道，这可能是你职业生涯的最后几个三分球之一。你不知道还能投进多少个，但你知道，每一个都值得珍惜。',effects:{mindset:1,popularity:1}},
  {id:'t40_n01',age:40,title:'传奇的告别',text:'你的退役消息传遍了整个篮球界。无数球员和教练在社交媒体上致敬你。\n\n"他是我最尊敬的对手，"一位超级巨星说。"他是我合作过最好的队友，"一位前队友说。"他是篮球的传奇，"一位教练说。你知道，你留给这个联盟的不仅仅是数据，更是精神。',effects:{popularity:2,honor:1}},
  {id:'t40_n02',age:40,title:'最后的采访',text:'退役采访中，记者问你有什么想说的。你沉默了很久，然后说："篮球给了我一切，我无怨无悔。"\n\n你的眼眶湿润了。你想起了12岁那个在街头球场打球的孩子，想起了18岁踏入大学校园的少年，想起了22岁站在NBA赛场上的新秀。一切都像是昨天发生的事情。\n\n"谢谢你，篮球，"你在心中说，"谢谢你给了我一个精彩的人生。"',effects:{mindset:2}}
];

// 合并所有事件池
const ALL_EVENTS = {
  choice: {
    youth: YOUTH_CHOICE_EVENTS,       // 12-17
    draft: DRAFT_CHOICE_EVENTS,       // 18-21
    prime: PRIME_CHOICE_EVENTS,       // 22-34
    twilight: TWILIGHT_CHOICE_EVENTS  // 35-40
  },
  narrative: {
    youth: YOUTH_NARRATIVE_EVENTS,
    draft: DRAFT_NARRATIVE_EVENTS,
    prime: PRIME_NARRATIVE_EVENTS,
    twilight: TWILIGHT_NARRATIVE_EVENTS
  }
};

// 按年龄获取事件池
function getEventsByAge(age, type) {
  let pool;
  if (age >= 12 && age <= 17) pool = ALL_EVENTS[type].youth;
  else if (age >= 18 && age <= 21) pool = ALL_EVENTS[type].draft;
  else if (age >= 22 && age <= 34) pool = ALL_EVENTS[type].prime;
  else if (age >= 35 && age <= 40) pool = ALL_EVENTS[type].twilight;
  else pool = [];
  return pool.filter(e => e.age === age);
}

// 交易事件（22-34岁期间随机触发）
const TRADE_EVENTS = [
  {id:'trade_01',text:'球队管理层通知你，你已经被交易了。你收拾好更衣室里的东西，告别队友，前往新的城市。',trade:true},
  {id:'trade_02',text:'交易截止日前最后一刻，你被送到了另一支球队。你的手机被打爆了，队友们纷纷发来告别消息。',trade:true},
  {id:'trade_03',text:'你在训练中被告知已被交易。你默默收拾了储物柜，和教练拥抱告别。新的挑战在等着你。',trade:true},
  {id:'trade_04',text:'休赛期你接到了经纪人电话："你被交易了。"你深吸一口气，准备迎接新的篇章。',trade:true},
  {id:'trade_05',text:'球队重建计划启动，你是交易筹码之一。你被送到了一支争冠球队，这也许是个机会。',trade:true}
];

function getRandomTradeEvent() {
  return TRADE_EVENTS[Math.floor(Math.random() * TRADE_EVENTS.length)];
}

export { ALL_EVENTS, TRADE_EVENTS, getEventsByAge, getRandomTradeEvent };
