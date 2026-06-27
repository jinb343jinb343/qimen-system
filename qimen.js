// Qimen Dunjia Astrological Engine
// Works entirely on client-side, zero dependencies

const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const SOLAR_TERMS = [
  { name: "冬至", longitude: 270, type: "阳遁", ju: [1, 7, 4] },
  { name: "小寒", longitude: 285, type: "阳遁", ju: [2, 8, 5] },
  { name: "大寒", longitude: 300, type: "阳遁", ju: [3, 9, 6] },
  { name: "立春", longitude: 315, type: "阳遁", ju: [8, 5, 2] },
  { name: "雨水", longitude: 330, type: "阳遁", ju: [9, 6, 3] },
  { name: "惊蛰", longitude: 345, type: "阳遁", ju: [1, 7, 4] },
  { name: "春分", longitude: 0,   type: "阳遁", ju: [3, 9, 6] },
  { name: "清明", longitude: 15,  type: "阳遁", ju: [4, 1, 7] },
  { name: "谷雨", longitude: 30,  type: "阳遁", ju: [5, 2, 8] },
  { name: "立夏", longitude: 45,  type: "阳遁", ju: [4, 1, 7] },
  { name: "小满", longitude: 60,  type: "阳遁", ju: [5, 2, 8] },
  { name: "芒种", longitude: 75,  type: "阳遁", ju: [6, 3, 9] },
  { name: "夏至", longitude: 90,  type: "阴遁", ju: [9, 3, 6] },
  { name: "小暑", longitude: 105, type: "阴遁", ju: [8, 2, 5] },
  { name: "大暑", longitude: 120, type: "阴遁", ju: [7, 1, 4] },
  { name: "立秋", longitude: 135, type: "阴遁", ju: [2, 5, 8] },
  { name: "处暑", longitude: 150, type: "阴遁", ju: [1, 4, 7] },
  { name: "白露", longitude: 165, type: "阴遁", ju: [9, 3, 6] },
  { name: "秋分", longitude: 180, type: "阴遁", ju: [7, 1, 4] },
  { name: "寒露", longitude: 195, type: "阴遁", ju: [6, 9, 3] },
  { name: "霜降", longitude: 210, type: "阴遁", ju: [5, 8, 2] },
  { name: "立冬", longitude: 225, type: "阴遁", ju: [6, 9, 3] },
  { name: "小雪", longitude: 240, type: "阴遁", ju: [5, 8, 2] },
  { name: "大雪", longitude: 255, type: "阴遁", ju: [4, 7, 1] }
];

const FIVE_ELEMENTS = {
  "木": ["伤门", "杜门", "天冲", "天辅", "震", "巽", "乙", "六合"],
  "火": ["景门", "天英", "离", "丙", "丁", "螣蛇"],
  "土": ["死门", "生门", "天芮", "天任", "天禽", "坤", "艮", "中", "戊", "己", "值符", "九地"],
  "金": ["开门", "惊门", "天心", "天柱", "乾", "兑", "庚", "辛", "太阴", "白虎", "九天"],
  "水": ["休门", "天蓬", "坎", "壬", "癸", "玄武"]
};

// Original positions in Ba Gua
const PALACE_NAMES = {
  1: { name: "坎一宫", gua: "坎", direction: "北", element: "水" },
  2: { name: "坤二宫", gua: "坤", direction: "西南", element: "土" },
  3: { name: "震三宫", gua: "震", direction: "东", element: "木" },
  4: { name: "巽四宫", gua: "巽", direction: "东南", element: "木" },
  5: { name: "中五宫", gua: "中", direction: "中", element: "土" },
  6: { name: "乾六宫", gua: "乾", direction: "西北", element: "金" },
  7: { name: "兑七宫", gua: "兑", direction: "西", element: "金" },
  8: { name: "艮八宫", gua: "艮", direction: "东北", element: "土" },
  9: { name: "离九宫", gua: "离", direction: "南", element: "火" }
};

const DOORS_INFO = {
  "开门": { element: "金", type: "吉", desc: "开张、出行、求财、考选、婚嫁皆大吉，万事顺利。" },
  "休门": { element: "水", type: "吉", desc: "利求财、见贵、婚姻、迁徙，百事皆宜，主安宁平和。" },
  "生门": { element: "土", type: "吉", desc: "求财、产业、营造、嫁娶、远行大吉，生机勃勃之象。" },
  "伤门": { element: "木", type: "凶", desc: "利讨债、捕盗、渔猎，忌出行、求财、婚嫁，防受伤血光。" },
  "杜门": { element: "木", type: "平", desc: "避难、隐藏、防守为吉，忌开张、求财、远行，主闭塞不通。" },
  "景门": { element: "火", type: "平", desc: "利学术、文书、献策、寻人，但防口舌是非、血光官灾。" },
  "死门": { element: "土", type: "凶", desc: "吊丧、行刑、破土吉，忌求医、出行、开张，主死气沉沉。" },
  "惊门": { element: "金", type: "凶", desc: "利捕盗、诉讼，忌出行、求财、婚嫁，主惊恐、怪异、口舌。" }
};

const STARS_INFO = {
  "天蓬": { element: "水", type: "凶", desc: "大凶之星。宜安防、修造，忌远行、求财、嫁娶，防盗贼。" },
  "天任": { element: "土", type: "吉", desc: "大吉之星。宜求财、嫁娶、谒贵、营造，主贵人相助，凡事吉利。" },
  "天冲": { element: "木", type: "平", desc: "次吉之星。宜出征、捕盗、渔猎，利于快速行动，忌拖延。" },
  "天辅": { element: "木", type: "吉", desc: "大吉之星。宜考学、升迁、婚嫁、求财、修造，文雅才华之象。" },
  "天英": { element: "火", type: "平", desc: "中平之星。利于社交、文书、谋划，忌求财、开张，防火灾口舌。" },
  "天芮": { element: "土", type: "凶", desc: "大凶之星（病星）。主疾病、阻滞，宜读书学习、结交朋友，忌嫁娶、出行。" },
  "天禽": { element: "土", type: "吉", desc: "大吉之星。寄居坤二宫。行事端正，凡事皆吉，百恶消散。" },
  "天柱": { element: "金", type: "凶", desc: "次凶之星。宜固守防备，忌出行、开张，防口舌纠纷、毁折意外。" },
  "天心": { element: "金", type: "吉", desc: "大吉之星。宜求医治病、进取求财、见贵、修造，主有心计智慧。" }
};

const SPIRITS_INFO = {
  "值符": { element: "土", type: "吉", desc: "八神之首，小值符。所到之处，百恶消散，万事大吉，能化险为夷。" },
  "螣蛇": { element: "火", type: "凶", desc: "虚诈之神。主怪异、噩梦、惊恐、虚无缥缈之灾，防受骗。" },
  "太阴": { element: "金", type: "吉", desc: "阴祐之神。宜密谋策划、避难隐形，主贵人暗中相助，作风隐秘。" },
  "六合": { element: "木", type: "吉", desc: "和合之神。宜谈婚论嫁、商务谈判、合伙签约，主和谐、交易成功。" },
  "白虎": { element: "金", type: "凶", desc: "凶杀之神。主血光、刑戮、病丧、冲突，极具破坏力，忌出行。" },
  "玄武": { element: "水", type: "凶", desc: "盗取之神. 主暗害、偷盗、虚伪、口舌是非，防小人暗算、遗失财物。" },
  "九地": { element: "土", type: "吉", desc: "坚牢之神. 宜屯兵防守、种植养殖、储蓄，主安静稳定，不宜主动出击。" },
  "九天": { element: "金", type: "吉", desc: "威悍之神. 宜主动出击、远行、出国、扬名，主大展宏图、青云直上。" }
};

// 100 Heavenly Stem combinations (十干克应) dictionary
const STEM_COMBINATIONS = {
  "戊戊": { title: "青龙伏吟", desc: "凡事闭塞阻滞，静守为吉，不宜急进，多有破财或争端。" },
  "戊己": { title: "青龙入墓", desc: "门吉尚可，门凶招祸，凡事多阻滞不顺，暗昧难清。" },
  "戊庚": { title: "值符飞宫", desc: "吉事宜快，凶事宜迟。多主变动、迁徙或破财易地。" },
  "戊辛": { title: "青龙折足", desc: "吉门得吉，凶门招灾。防失财折伤、身体意外，尤忌投资。" },
  "戊壬": { title: "青龙入天网", desc: "贤人失意，小人得意。凡事不顺，内部多纠纷官非。" },
  "戊癸": { title: "青龙华盖", desc: "利求财、见贵、结盟。若逢吉门，宜招贤纳士，凡事合和。" },
  "戊丁": { title: "青龙耀明", desc: "谒贵求官、考试求名大吉。词讼求财皆能如意。" },
  "戊丙": { title: "青龙返首", desc: "奇门第一大吉格！求财、谋事、远行皆大吉，贵人提拔，财源滚滚。" },
  "戊乙": { title: "青龙合会", desc: "谋事多吉，贵人相助，利于合作、签约与婚姻求财。" },

  "乙戊": { title: "阴害阳门", desc: "利于求取阴人财物，利于暗中私谋，表面易起摩擦。" },
  "乙己": { title: "日奇入墓", desc: "门吉事吉，门凶事凶。多主凡事多阻滞，受小人暗算陷害。" },
  "乙庚": { title: "日奇被刑", desc: "财产纠纷，诉讼不宁，夫妻不和，凡事受他人掣肘。" },
  "乙辛": { title: "青龙逃走", desc: "财物折损，家门不宁，防血光之灾。占婚主女方欲离家逃走。" },
  "乙壬": { title: "日奇入天罗", desc: "尊卑悖乱，官非诉讼。凡事多有缠绕，难以脱身。" },
  "乙癸": { title: "华盖逢星", desc: "避难、修行吉。凡事利于退隐，隐藏行踪，不宜张扬。" },
  "乙丁": { title: "奇仪相佐", desc: "文书吉利，求名有利，百事皆吉，多得兄弟朋友相助。" },
  "乙丙": { title: "奇仪顺遂", desc: "吉星相照，升迁、求财皆吉，多得贵人提拔，心想事成。" },
  "乙乙": { title: "日奇伏吟", desc: "不宜急进，宜守旧。多主凡事拖延、纠缠不清。" },

  "丙戊": { title: "飞鸟跌穴", desc: "奇门第二大吉格！不劳而获之象。谋事求财，极其顺利，事半功倍。" },
  "丙己": { title: "火悖入刑", desc: "因私情招祸，官司破财，囚人逃亡，防妇人搬弄是非。" },
  "丙庚": { title: "贼必去", desc: "若防贼贼必去，若求财财易失。多主竞争对手退却，但自身防耗财。" },
  "丙辛": { title: "谋事就成", desc: "奇仪相合。占婚姻大吉，求财亦吉，凡事得人暗中相助。" },
  "丙壬": { title: "火入天罗", desc: "为祸作乱，官灾不断，多主口舌是非，出行防翻车或盗贼。" },
  "丙癸": { title: "华盖悖师", desc: "阴人害事，灾祸频生，凡事易犯糊涂，防合同纠纷。" },
  "丙丁": { title: "星奇朱雀", desc: "贵人相助，文书呈祥，求名、考试大吉，唯防文书小过失。" },
  "丙丙": { title: "月奇悖师", desc: "主凡事易生混乱，防脾气暴躁招祸，单干吉，合作易生嫌隙。" },
  "丙乙": { title: "日月并行", desc: "谋事多成，官运亨通，名利双收，公私皆吉。" },

  "丁戊": { title: "青龙转光", desc: "官迁职升，贵人提拔，求财得利，凡事转凶为吉。" },
  "丁己": { title: "火入勾陈", desc: "奸私仇怨，防妇人招祸，多主文书口舌、阴私之事缠绕。" },
  "丁庚": { title: "文书阻隔", desc: "信件阻隔，求谋不遂。防合作破裂，出行受阻。" },
  "丁辛": { title: "朱雀折足", desc: "文书失陷，官非诉讼。凡事不宜妄动，防人言中伤。" },
  "丁壬": { title: "五关相合", desc: "贵人提携，求财、婚姻大吉。合作多成，主有喜庆之事。" },
  "丁癸": { title: "朱雀投江", desc: "文书口舌，官司失败，音信全无。防溺水或口舌招致大祸。" },
  "丁丁": { title: "星奇双辉", desc: "文书呈祥，出行吉利。多主喜事临门，才华得到施展。" },
  "丁丙": { title: "星随月转", desc: "贵人提拔，凡事顺利，越动越吉，利求职进取。" },
  "丁乙": { title: "人奇吉顺", desc: "谋事多成，贵人相助，利于学习、文书与考试。" },

  "己戊": { title: "犬遇青龙", desc: "凡事谋望皆遂。利于见贵求财，多得贵人提拔。" },
  "己己": { title: "地户逢鬼", desc: "伏吟。凡事不宜动，多主暗昧不清，病防缠绵，多有阴私纠葛。" },
  "己庚": { title: "刑格返名", desc: "官司词讼，先败后成。求财先难后易，防口舌变动。" },
  "己辛": { title: "游魂入墓", desc: "主凡事易被阴人阻碍，鬼怪作祟，防精神恍惚、失财。" },
  "己壬": { title: "地网高张", desc: "凡事受阻，多纠缠。忌远行，防口舌官非及小人暗算。" },
  "己癸": { title: "地刑玄武", desc: "凡事易生口舌，求财防盗失，男女占多有私情纠纷。" },
  "己丁": { title: "朱雀入墓", desc: "文书受阻，词讼不利。防小人暗中作梗，先吉后凶。" },
  "己丙": { title: "火悖地户", desc: "凡事易犯口舌，防妇人挑拨离间，求财不宜，宜静。" },
  "己乙": { title: "墓神不明", desc: "凡事易受阻碍，前途迷茫，利于私下谋划，不宜公开。" },

  "庚戊": { title: "天乙伏宫", desc: "谋事多阻，出行防盗，不宜百事。主客皆不利，宜守不宜攻。" },
  "庚己": { title: "官府刑格", desc: "官司败诉，破财伤身，防口舌是非，百事不宜。" },
  "庚庚": { title: "太白同宫", desc: "战格。官司纠纷，兄弟不和，凡事易发生激烈冲突，退避为上。" },
  "庚辛": { title: "白虎出力", desc: "凡事阻力极大，多有身体受伤、血光手术，防家庭纠纷。" },
  "庚壬": { title: "太白退位", desc: "远行防盗，求财不利，主守吉。凡事退一步海阔天空。" },
  "庚癸": { title: "大格", desc: "出行受阻，求财防破。占婚多有变故，忌远行涉水。" },
  "庚丁": { title: "亭亭之格", desc: "因私匿起官司，门吉尚可，门凶有大灾，防桃色纠纷。" },
  "庚丙": { title: "太白入荧", desc: "贼人自来，防小人暗算，财物遗失。防竞争对手暗中破坏。" },
  "庚乙": { title: "太白逢星", desc: "退守为吉，谋事难成。占婚主男娶女嫁多有阻碍。" },

  "辛戊": { title: "困龙被伤", desc: "官司破财，防身体受伤。凡事大忌主动出击，宜静守。" },
  "辛己": { title: "入墓不伸", desc: "凡事暗昧难明，受屈难申，多主小人得势，自身受压。" },
  "辛庚": { title: "白虎出力", desc: "主客相搏，防血光之灾。凡事多有争斗，宜防意外伤害。" },
  "辛辛": { title: "公门相刑", desc: "自相刑克。主凡事多因自身过错招致官司、破财与纠纷。" },
  "辛壬": { title: "凶蛇入狱", desc: "争讼失理，官司缠身。凡事多磨难，难以摆脱困境。" },
  "辛癸": { title: "天牢自送", desc: "凡事多忧，词讼败诉，有牢狱之灾。防作茧自缚。" },
  "辛丁": { title: "狱神得奇", desc: "经商获利，囚人逢赦。凡事转凶为吉，有意外之喜。" },
  "辛丙": { title: "干合逢奇", desc: "谋事可成，迎刃而解。占求财、合作大吉，利求名。" },
  "辛乙": { title: "白虎猖狂", desc: "奇门大凶格！凡事招灾，防血光、意外，女子防婚姻不顺或受辱。" },

  "壬戊": { title: "小蛇化龙", desc: "贵人提拔，凡事渐吉，谋事有成，利求职与迁徙。" },
  "壬己": { title: "反吟相克", desc: "凡事多反复，口舌是非。多主变动频繁，劳而无功。" },
  "壬庚": { title: "太白擒蛇", desc: "词讼公平，吉事可成。防暗箭，但最终能邪不压正。" },
  "壬辛": { title: "腾蛇相缠", desc: "凡事多纠缠缠绕，剪不断理还乱，谋事多虚诈不实。" },
  "壬壬": { title: "天网四张", desc: "两水相遇。凡事受阻，忌远行，宜守防盗。网高者可破，网低者被困。" },
  "壬癸": { title: "幼女奸淫", desc: "凡事有阻，防色情纠纷、阴私暧昧，求财防骗。" },
  "壬丁": { title: "干合逢奇", desc: "文书呈祥，谋事可成。虽有阻碍，但终得贵人暗中相助。" },
  "壬丙": { title: "水蛇奔逃", desc: "凡事不利，出行防盗，求财失利。商战多主竞争失败。" },
  "壬乙": { title: "小蛇化龙", desc: "谋事多吉，渐入佳境，贵人暗助，利于小步慢跑前进。" },

  "癸戊": { title: "天乙会合", desc: "吉门大吉，凶门招灾。多主有合作机会，但需防利弊均等。" },
  "癸己": { title: "华盖地网", desc: "凡事多阻滞，防小人中伤。男女占之，多主感情不明朗。" },
  "癸庚": { title: "太白入网", desc: "官司纠纷，谋事难成。防与人发生正面冲突，宜忍让。" },
  "癸辛": { title: "网盖天牢", desc: "凡事多灾，官讼必败。防被人暗算，作茧自缚。" },
  "癸壬": { title: "复见腾蛇", desc: "凡事多变，口舌是非。主虚惊一场，防忧郁成疾。" },
  "癸癸": { title: "天网四张", desc: "伏吟。宜静不宜动，求财防破。凡事谨慎防跌，不宜出行。" },
  "癸丁": { title: "腾蛇夭矫", desc: "奇门大凶格！文书失陷，官司失败，防虚惊恐慌、火灾破财。" },
  "癸丙": { title: "华盖悖师", desc: "凡事不顺，口舌是非。多主贵人反目，防合约被单方面撕毁。" },
  "癸乙": { title: "华盖逢星", desc: "遁迹隐形，宜修道避难，凡事退让则吉，强求必败。" }
};

// ----------------------------------------------------
// ASTRONOMICAL CALCULATIONS
// ----------------------------------------------------

/**
 * Calculates Julian Date (JD) from a UTC date-time
 */
function getJulianDate(year, month, day, hour, minute, second = 0) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  let A = Math.floor(y / 100);
  let B = 2 - A + Math.floor(A / 4);
  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  jd += (hour + minute / 60 + second / 3600) / 24;
  return jd;
}

/**
 * Calculates the apparent longitude of the Sun (in degrees, [0, 360))
 * Based on Jean Meeus' "Astronomical Algorithms" low-precision formula
 */
function getSunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  
  // Mean longitude of the Sun, corrected for aberration
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  // Mean anomaly of the Sun
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  
  L0 = L0 % 360;
  if (L0 < 0) L0 += 360;
  M = M % 360;
  if (M < 0) M += 360;
  
  const Mrad = (M * Math.PI) / 180;
  
  // Equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.002891 * Math.sin(3 * Mrad);
          
  const theta = L0 + C;
  
  // Longitude of ascending node of Moon's orbit
  const omega = 125.04 - 1934.136 * T;
  const omegaRad = (omega * Math.PI) / 180;
  
  // Apparent longitude of the Sun
  let lambda = theta - 0.00569 - 0.00478 * Math.sin(omegaRad);
  
  lambda = lambda % 360;
  if (lambda < 0) lambda += 360;
  return lambda;
}

/**
 * Resolves which Solar Term (0-23) the sun longitude belongs to
 */
function getSolarTerm(lambda) {
  // Shift so Winter Solstice (冬至, 270 deg) is at index 0
  const shifted = (lambda - 270 + 360) % 360;
  const termIdx = Math.floor(shifted / 15);
  return {
    index: termIdx,
    term: SOLAR_TERMS[termIdx]
  };
}

/**
 * Calculates Gan-Zhi index (0-59) of a day based on local Julian Day Number
 */
function getDayGanZhiIndex(jdn) {
  // JDN 2440588 is Jan 1, 1970 (Xin-Si day, index 17)
  // (2440588 + 49) % 60 = 17. Formula is (jdn + 49) % 60
  return (jdn + 49) % 60;
}

// ----------------------------------------------------
// MAIN CHARTING LOGIC
// ----------------------------------------------------

/**
 * Generates the complete Qimen Dunjia Chart
 * @param {Date} date - Local date-time input
 * @param {Object} manualJu - Optional: { type: "阳遁"|"阴遁", number: 1..9 } to override calculations
 */
function calculateQimenChart(date, manualJu = null, jigongMethod = "kun") {
  // 1. Convert to UTC values for JDN / Sun longitude math
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth() + 1;
  const utcDay = date.getUTCDate();
  const utcHour = date.getUTCHours();
  const utcMin = date.getUTCMinutes();
  const utcSec = date.getUTCSeconds();
  
  const jd = getJulianDate(utcYear, utcMonth, utcDay, utcHour, utcMin, utcSec);
  const lambda = getSunLongitude(jd);
  
  // 2. Solar Term
  const termInfo = getSolarTerm(lambda);
  const solarTermName = termInfo.term.name;
  
  // 3. Local date variables for Pillar calculation
  const localYear = date.getFullYear();
  const localMonth = date.getMonth() + 1;
  const localDay = date.getDate();
  const localHour = date.getHours();
  
  // 4. Day JDN with late-Zi adjustment (day changes at 23:00)
  // Get JDN at noon of the local date
  let localJDN = Math.floor(getJulianDate(localYear, localMonth, localDay, 12, 0, 0) + 0.5);
  const isLateZi = localHour >= 23;
  if (isLateZi) {
    localJDN += 1;
  }
  
  // 5. Gan-Zhi calculations
  // Year Gan-Zhi
  const yearGZ = getYearGanZhi(localYear, localMonth, lambda);
  
  // Month Gan-Zhi
  const monthBranchIdx = getMonthBranchIndex(lambda);
  const monthGZStartIdx = (yearGZ.index % 5 * 2 + 2) % 10;
  const monthOffset = (monthBranchIdx - 2 + 12) % 12;
  const monthStemIdx = (monthGZStartIdx + monthOffset) % 10;
  const monthGanZhi = HEAVENLY_STEMS[monthStemIdx] + EARTHLY_BRANCHES[monthBranchIdx];
  
  // Day Gan-Zhi
  const dayGZIdx = getDayGanZhiIndex(localJDN);
  const dayStemIdx = dayGZIdx % 10;
  const dayBranchIdx = dayGZIdx % 12;
  const dayGanZhi = HEAVENLY_STEMS[dayStemIdx] + EARTHLY_BRANCHES[dayBranchIdx];
  
  // Hour Gan-Zhi
  // In traditional time, hour is divided into 12 double-hours
  const hourBranchIdx = Math.floor((localHour + 1) / 2) % 12;
  const hourGZStartIdx = (dayStemIdx % 5 * 2) % 10;
  const hourStemIdx = (hourGZStartIdx + hourBranchIdx) % 10;
  const hourGanZhi = HEAVENLY_STEMS[hourStemIdx] + EARTHLY_BRANCHES[hourBranchIdx];
  
  // 6. Qimen Ju determination (Chai Bu method)
  // Find the nearest preceding 甲 (Jia) or 己 (Ji) day (Fu Tou) in the 60-day cycle
  const fuTouIdx = dayGZIdx - (dayGZIdx % 5);
  const fuTouBranchIdx = fuTouIdx % 12;

  let yuanName = "";
  let yuanIdx = 0; // 0 for Upper, 1 for Middle, 2 for Lower
  if ([0, 6, 3, 9].includes(fuTouBranchIdx)) {
    yuanName = "上元";
    yuanIdx = 0;
  } else if ([2, 8, 5, 11].includes(fuTouBranchIdx)) {
    yuanName = "中元";
    yuanIdx = 1;
  } else {
    yuanName = "下元";
    yuanIdx = 2;
  }
  
  let dunType = termInfo.term.type;
  let juNumber = termInfo.term.ju[yuanIdx];
  
  // Handle manual override
  if (manualJu && manualJu.type && manualJu.number) {
    dunType = manualJu.type;
    juNumber = parseInt(manualJu.number, 10);
  }
  
  // Determine parasite palace (寄宫)
  let parasitePalace = 2; // Default to Kun 2
  if (jigongMethod === "yangkun_yingen") {
    parasitePalace = (dunType === "阳遁") ? 2 : 8;
  }
  
  // 7. Qimen Charting Palace Rotation
  const STEM_SEQUENCE = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];
  
  // A. Di Pan Stems
  const diPan = {};
  for (let i = 0; i < 9; i++) {
    let palace;
    if (dunType === "阳遁") {
      palace = (juNumber - 1 + i) % 9 + 1;
    } else {
      palace = (juNumber - 1 - i + 18) % 9 + 1;
    }
    diPan[palace] = STEM_SEQUENCE[i];
  }
  
  // B. Xun Shou
  // Resolve Hour index in 60-cycle
  let hour60Idx = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === hourStemIdx && i % 12 === hourBranchIdx) {
      hour60Idx = i;
      break;
    }
  }
  const xunShou60Idx = hour60Idx - (hour60Idx % 10);
  const xunShouBranchIdx = xunShou60Idx % 12;
  const xunShouName = "甲" + EARTHLY_BRANCHES[xunShouBranchIdx];
  
  const XUN_SHOU_HIDING = {
    0: "戊",  // 甲子戊
    10: "己", // 甲戌己
    8: "庚",  // 甲申庚
    6: "辛",  // 甲午辛
    4: "壬",  // 甲辰壬
    2: "癸"   // 甲寅癸
  };
  const hidingStem = XUN_SHOU_HIDING[xunShouBranchIdx];
  
  // Find pxun (palace of Xun Shou on Di Pan)
  let pxun = 0;
  for (let p = 1; p <= 9; p++) {
    if (diPan[p] === hidingStem) {
      pxun = p;
      break;
    }
  }
  
  // C. Zhi Fu Star & Zhi Shi Door
  const ORIGINAL_STARS = {
    1: "天蓬", 2: "天芮", 3: "天冲", 4: "天辅", 5: "天禽", 6: "天心", 7: "天柱", 8: "天任", 9: "天英"
  };
  const ORIGINAL_DOORS = {
    1: "休门", 2: "死门", 3: "伤门", 4: "杜门", 5: "死门", 6: "开门", 7: "惊门", 8: "生门", 9: "景门"
  };
  
  const zhifuStar = ORIGINAL_STARS[pxun];
  const zhishiDoor = ORIGINAL_DOORS[pxun];
  
  // D. Rotate Stars (Tian Pan)
  // Outer palaces clockwise sequence
  const outerPalaces = [1, 8, 3, 4, 9, 2, 7, 6];
  const outerStars = ["天蓬", "天任", "天冲", "天辅", "天英", "天芮", "天柱", "天心"];
  
  // Find ptarget (where Zhi Fu Star goes)
  const hourStem = HEAVENLY_STEMS[hourStemIdx];
  const targetStem = hourStem === "甲" ? hidingStem : hourStem;
  let ptarget = 0;
  for (let p = 1; p <= 9; p++) {
    if (diPan[p] === targetStem) {
      ptarget = p;
      break;
    }
  }
  if (ptarget === 5) {
    ptarget = parasitePalace;
  }
  
  const starToOrigIndex = {
    "天蓬": 0, "天任": 1, "天冲": 2, "天辅": 3, "天英": 4, "天芮": 5, "天禽": 5, "天柱": 6, "天心": 7
  };
  const idxStar = starToOrigIndex[zhifuStar];
  const idxPalace = outerPalaces.indexOf(ptarget);
  const diff = (idxPalace - idxStar + 8) % 8;
  
  const tianPanStars = {};
  const tianPanStems = {};
  
  for (let k = 0; k < 8; k++) {
    const palace = outerPalaces[k];
    const starIdx = (k - diff + 8) % 8;
    const star = outerStars[starIdx];
    tianPanStars[palace] = star;
    
    const origPalaceOfStar = {
      "天蓬": 1, "天任": 8, "天冲": 3, "天辅": 4, "天英": 9, "天芮": 2, "天柱": 7, "天心": 6
    }[star];
    
    tianPanStems[palace] = diPan[origPalaceOfStar];
    
    const parasiteStar = ORIGINAL_STARS[parasitePalace];
    if (star === parasiteStar) {
      tianPanStars[palace] = star + "+天禽";
      tianPanStems[palace] = diPan[parasitePalace] + "/" + diPan[5];
    }
  }
  tianPanStars[5] = "";
  tianPanStems[5] = "";
  
  // E. Rotate Doors (Ren Pan)
  const S = (hourBranchIdx - xunShouBranchIdx + 12) % 12;
  let pdoor = pxun;
  if (dunType === "阳遁") {
    pdoor = (pxun - 1 + S) % 9 + 1;
  } else {
    pdoor = (pxun - 1 - S + 18) % 9 + 1;
  }
  if (pdoor === 5) {
    pdoor = parasitePalace;
  }
  
  const outerDoors = ["休门", "生门", "伤门", "杜门", "景门", "死门", "惊门", "开门"];
  const origDoorPalace = pxun === 5 ? parasitePalace : pxun;
  const idxDoor = outerPalaces.indexOf(origDoorPalace);
  const idxPalaceDoor = outerPalaces.indexOf(pdoor);
  const diffDoor = (idxPalaceDoor - idxDoor + 8) % 8;
  
  const renPanDoors = {};
  for (let k = 0; k < 8; k++) {
    const palace = outerPalaces[k];
    const doorIdx = (k - diffDoor + 8) % 8;
    renPanDoors[palace] = outerDoors[doorIdx];
  }
  renPanDoors[5] = "";
  
  // F. Rotate Spirits (Shen Pan)
  const SPIRITS = ["值符", "螣蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];
  const idxZhifu = outerPalaces.indexOf(ptarget);
  const shenPanSpirits = {};
  for (let k = 0; k < 8; k++) {
    const palace = outerPalaces[k];
    let spiritIdx;
    if (dunType === "阳遁") {
      spiritIdx = (k - idxZhifu + 8) % 8;
    } else {
      spiritIdx = (idxZhifu - k + 8) % 8;
    }
    shenPanSpirits[palace] = SPIRITS[spiritIdx];
  }
  shenPanSpirits[5] = "";
  
  // G. Empty Palaces (旬空)
  const XUN_KONG_BRANCHES = {
    "甲子": ["戌", "亥"],
    "甲戌": ["申", "酉"],
    "甲申": ["午", "未"],
    "甲午": ["辰", "巳"],
    "甲辰": ["寅", "卯"],
    "甲寅": ["子", "丑"]
  };
  const BRANCH_TO_PALACE = {
    "子": 1, "丑": 8, "寅": 8, "卯": 3, "辰": 4, "巳": 4, "午": 9, "未": 2, "申": 2, "酉": 7, "戌": 6, "亥": 6
  };
  const emptyBranches = XUN_KONG_BRANCHES[xunShouName];
  const emptyPalaces = emptyBranches.map(b => BRANCH_TO_PALACE[b]);
  
  // H. Horse Star (驿马)
  const hbName = EARTHLY_BRANCHES[hourBranchIdx];
  let yimaPalace = 0;
  if (["申", "子", "辰"].includes(hbName)) yimaPalace = 8;
  else if (["寅", "午", "戌"].includes(hbName)) yimaPalace = 2;
  else if (["巳", "酉", "丑"].includes(hbName)) yimaPalace = 6;
  else if (["亥", "卯", "未"].includes(hbName)) yimaPalace = 4;
  
  // I. An Gan Stems (暗干) - 时干加值使门法
  const anPanStems = {};
  const targetAnStem = hourStem === "甲" ? hidingStem : hourStem;
  const idxAnStart = STEM_SEQUENCE.indexOf(targetAnStem);
  
  for (let i = 0; i < 9; i++) {
    let p;
    if (dunType === "阳遁") {
      p = (pdoor - 1 + i) % 9 + 1;
    } else {
      p = (pdoor - 1 - i + 18) % 9 + 1;
    }
    anPanStems[p] = STEM_SEQUENCE[(idxAnStart + i) % 9];
  }
  
  // 8. Pack Chart Palace Data
  const palaces = {};
  for (let p = 1; p <= 9; p++) {
    const nameInfo = PALACE_NAMES[p];
    
    // Check if empty
    const isEmpty = emptyPalaces.includes(p);
    const hasHorse = yimaPalace === p;
    
    let combo = null;
    let tStem = tianPanStems[p] || "";
    let dStem = diPan[p] || "";
    if (p === parasitePalace) {
      dStem = diPan[parasitePalace] + "/" + diPan[5];
    }
    
    // For combinations lookup, we strip out parasitic stems if needed
    // E.g. "戊/乙" -> we look up "戊"+dStem
    let lookupTStem = tStem;
    if (tStem.includes("/")) {
      lookupTStem = tStem.split("/")[0]; // Take primary
    }
    const comboKey = lookupTStem + dStem;
    if (STEM_COMBINATIONS[comboKey]) {
      combo = {
        key: comboKey,
        title: STEM_COMBINATIONS[comboKey].title,
        desc: STEM_COMBINATIONS[comboKey].desc
      };
    }
    
    palaces[p] = {
      id: p,
      name: nameInfo.name,
      gua: nameInfo.gua,
      direction: nameInfo.direction,
      element: nameInfo.element,
      diPanStem: dStem,
      tianPanStem: tStem,
      anGanStem: anPanStems[p] || "",
      star: tianPanStars[p] || "",
      door: renPanDoors[p] || "",
      spirit: shenPanSpirits[p] || "",
      isEmpty: isEmpty,
      hasHorse: hasHorse
    };
  }
  
  return {
    dateTime: date,
    solarTerm: solarTermName,
    dunType: dunType,
    juNumber: juNumber,
    yuan: yuanName,
    xunShou: xunShouName,
    zhifuStar: zhifuStar,
    zhishiDoor: zhishiDoor,
    pillars: {
      year: yearGZ.gan + yearGZ.zhi,
      month: monthGanZhi,
      day: dayGanZhi,
      hour: hourGanZhi
    },
    emptyBranches: emptyBranches,
    yimaBranch: {
      "8": "寅", "2": "申", "6": "亥", "4": "巳"
    }[yimaPalace] || "",
    parasitePalace: parasitePalace,
    monthBranchIdx: monthBranchIdx,
    palaces: palaces
  };
}

/**
 * Calculates Year Gan-Zhi
 */
function getYearGanZhi(year, month, lambda) {
  let yearForGanZhi = year;
  // If we are in Jan/Feb and solar longitude is before Spring Begins (315), it is the previous year
  if (month <= 2 && lambda < 315) {
    yearForGanZhi = year - 1;
  }
  const offset = (yearForGanZhi - 1984) % 60;
  const index = offset < 0 ? offset + 60 : offset;
  return {
    index: index,
    gan: HEAVENLY_STEMS[index % 10],
    zhi: EARTHLY_BRANCHES[index % 12]
  };
}

/**
 * Calculates Month Earthly Branch Index (0-11, where 0 is 寅)
 */
function getMonthBranchIndex(lambda) {
  const shifted = (lambda - 315 + 360) % 360;
  const mIdx = Math.floor(shifted / 30);
  return (mIdx + 2) % 12; // 寅 is index 2 in EARTHLY_BRANCHES
}

// Twelve Chang Sheng Data and Helpers
const CHANG_SHENG_MAP = {
  "甲": { "亥": "长生", "子": "沐浴", "丑": "冠带", "寅": "临官", "卯": "帝旺", "辰": "衰", "巳": "病", "午": "死", "未": "墓", "申": "绝", "酉": "胎", "戌": "养" },
  "乙": { "午": "长生", "巳": "沐浴", "辰": "冠带", "卯": "临官", "寅": "帝旺", "丑": "衰", "子": "病", "亥": "死", "戌": "墓", "酉": "绝", "申": "胎", "未": "养" },
  "丙": { "寅": "长生", "卯": "沐浴", "辰": "冠带", "巳": "临官", "午": "帝旺", "未": "衰", "申": "病", "酉": "死", "戌": "墓", "亥": "绝", "子": "胎", "丑": "养" },
  "丁": { "酉": "长生", "申": "沐浴", "未": "冠带", "午": "临官", "巳": "帝旺", "辰": "衰", "卯": "病", "寅": "死", "丑": "墓", "子": "绝", "亥": "胎", "戌": "养" },
  "戊": { "寅": "长生", "卯": "沐浴", "辰": "冠带", "巳": "临官", "午": "帝旺", "未": "衰", "申": "病", "酉": "死", "戌": "墓", "亥": "绝", "子": "胎", "丑": "养" },
  "己": { "酉": "长生", "申": "沐浴", "未": "冠带", "午": "临官", "巳": "帝旺", "辰": "衰", "卯": "病", "寅": "死", "丑": "墓", "子": "绝", "亥": "胎", "戌": "养" },
  "庚": { "巳": "长生", "午": "沐浴", "未": "冠带", "申": "临官", "酉": "帝旺", "戌": "衰", "亥": "病", "子": "死", "丑": "墓", "寅": "绝", "卯": "胎", "辰": "养" },
  "辛": { "子": "长生", "亥": "沐浴", "戌": "冠带", "酉": "临官", "申": "帝旺", "未": "衰", "午": "病", "巳": "死", "辰": "墓", "卯": "绝", "寅": "胎", "丑": "养" },
  "壬": { "申": "长生", "酉": "沐浴", "戌": "冠带", "亥": "临官", "子": "帝旺", "丑": "衰", "寅": "病", "卯": "死", "辰": "墓", "巳": "绝", "午": "胎", "未": "养" },
  "癸": { "卯": "长生", "寅": "沐浴", "丑": "冠带", "子": "临官", "亥": "帝旺", "戌": "衰", "酉": "病", "申": "死", "未": "墓", "午": "绝", "巳": "胎", "辰": "养" }
};

const PALACE_BRANCHES = {
  1: ["子"],
  2: ["未", "申"],
  3: ["卯"],
  4: ["辰", "巳"],
  5: [],
  6: ["戌", "亥"],
  7: ["酉"],
  8: ["丑", "寅"],
  9: ["午"]
};

const CHANG_SHENG_SHORT = {
  "长生": "生", "沐浴": "沐", "冠带": "带", "临官": "临", "帝旺": "旺",
  "衰": "衰", "病": "病", "死": "死", "墓": "墓", "绝": "绝", "胎": "胎", "养": "养"
};

function checkMenPo(door, palaceId) {
  if (!door || palaceId === 5) return false;
  const doorElement = DOORS_INFO[door]?.element;
  const palaceElement = PALACE_NAMES[palaceId]?.element;
  if (!doorElement || !palaceElement) return false;
  if (doorElement === "木" && palaceElement === "土") return true;
  if (doorElement === "火" && palaceElement === "金") return true;
  if (doorElement === "土" && palaceElement === "水") return true;
  if (doorElement === "金" && palaceElement === "木") return true;
  if (doorElement === "水" && palaceElement === "火") return true;
  return false;
}

function checkJiXing(stem, palaceId) {
  if (!stem || palaceId === 5) return false;
  const helper = (s) => {
    if (s === "戊" && palaceId === 3) return true;
    if (s === "己" && palaceId === 2) return true;
    if (s === "庚" && palaceId === 8) return true;
    if (s === "辛" && palaceId === 9) return true;
    if (s === "壬" && palaceId === 4) return true;
    if (s === "癸" && palaceId === 4) return true;
    return false;
  };
  if (stem.includes("/")) {
    return stem.split("/").some(helper);
  }
  return helper(stem);
}

function checkRuMu(stem, palaceId) {
  if (!stem || palaceId === 5) return false;
  const helper = (s) => {
    if (palaceId === 2 && s === "癸") return true;
    if (palaceId === 4 && ["辛", "壬"].includes(s)) return true;
    if (palaceId === 6 && ["乙", "丙", "戊"].includes(s)) return true;
    if (palaceId === 8 && ["丁", "己", "庚"].includes(s)) return true;
    return false;
  };
  if (stem.includes("/")) {
    return stem.split("/").some(helper);
  }
  return helper(stem);
}

function getBranchElement(branchIdx) {
  // ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
  if ([0, 11].includes(branchIdx)) return "水"; // 子, 亥
  if ([2, 3].includes(branchIdx)) return "木";  // 寅, 卯
  if ([5, 6].includes(branchIdx)) return "火";  // 巳, 午
  if ([8, 9].includes(branchIdx)) return "金";  // 申, 酉
  if ([1, 4, 7, 10].includes(branchIdx)) return "土"; // 丑, 辰, 未, 戌
  return "";
}

function getStarWang(starName, monthBranchIdx) {
  if (!starName || monthBranchIdx === undefined) return "";
  let lookupStar = starName;
  if (starName.includes("+")) {
    lookupStar = starName.split("+")[0];
  }
  const starElement = STARS_INFO[lookupStar]?.element;
  const monthElement = getBranchElement(monthBranchIdx);
  if (!starElement || !monthElement) return "";
  
  if (starElement === monthElement) return "相";
  
  // 我生者旺
  if (starElement === "水" && monthElement === "木") return "旺";
  if (starElement === "木" && monthElement === "火") return "旺";
  if (starElement === "火" && monthElement === "土") return "旺";
  if (starElement === "土" && monthElement === "金") return "旺";
  if (starElement === "金" && monthElement === "水") return "旺";
  
  // 生我者废
  if (starElement === "水" && monthElement === "金") return "废";
  if (starElement === "木" && monthElement === "水") return "废";
  if (starElement === "火" && monthElement === "木") return "废";
  if (starElement === "土" && monthElement === "火") return "废";
  if (starElement === "金" && monthElement === "土") return "废";
  
  // 我克者休
  if (starElement === "水" && monthElement === "火") return "休";
  if (starElement === "木" && monthElement === "土") return "休";
  if (starElement === "火" && monthElement === "金") return "休";
  if (starElement === "土" && monthElement === "水") return "休";
  if (starElement === "金" && monthElement === "木") return "休";
  
  // 克我者囚
  if (starElement === "水" && monthElement === "土") return "囚";
  if (starElement === "木" && monthElement === "金") return "囚";
  if (starElement === "火" && monthElement === "水") return "囚";
  if (starElement === "土" && monthElement === "木") return "囚";
  if (starElement === "金" && monthElement === "火") return "囚";
  
  return "";
}

// Export functions for browser environment
window.QimenEngine = {
  calculateQimenChart,
  DOORS_INFO,
  STARS_INFO,
  SPIRITS_INFO,
  STEM_COMBINATIONS,
  PALACE_NAMES,
  FIVE_ELEMENTS,
  CHANG_SHENG_MAP,
  PALACE_BRANCHES,
  CHANG_SHENG_SHORT,
  checkMenPo,
  checkJiXing,
  checkRuMu,
  getBranchElement,
  getStarWang
};
