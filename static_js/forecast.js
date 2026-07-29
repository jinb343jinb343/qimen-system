/**
 * Qimen Forecast and Interpretation Report Generator
 * Contains rule-based analysis logic for Love, Wealth, Career, and Best Palace.
 * Shared globally with app.js
 */

/**
 * Renders the business strategic report inside the sidebar
 */
function renderForecastReport(chart) {
  const contentBody = document.getElementById("interp-content-body");
  if (!contentBody) return;

  if (currentForecastMode === "academic") {
    // 1. Academic analysis report
    let html = `
      <div class="report-section">
        <div class="report-title-bar">
          <div class="report-title">大盘诊断报告</div>
          <div class="report-subtitle">学术排盘模式</div>
        </div>
        
        <div class="report-card">
          <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">
            <strong>起局综述：</strong><br>
            本次排盘为 <strong>${chart.solarTerm} ${chart.dunType}${chart.juNumber}局</strong>。
            值符星落于 <strong>${chart.zhifuStar}</strong>，值使门落于 <strong>${chart.zhishiDoor}</strong>。<br>
            旬空地支为：<span style="color: var(--inauspicious); font-weight: bold;">${chart.emptyBranches.join("、")}</span>，
            驿马地支为：<span style="color: var(--gold-accent); font-weight: bold;">${chart.yimaBranch || "无"}</span>。
          </div>
        </div>

        <div class="report-card">
          <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--gold-light);">十干克应吉凶格局</div>
          <div class="report-list">
    `;

    let hasCombo = false;
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const palace = chart.palaces[p];
      const tStems = palace.tianPanStem.split("/");
      const dStems = palace.diPanStem.split("/");
      tStems.forEach(tStem => {
        dStems.forEach(dStem => {
          const comboKey = tStem + dStem;
          const combo = QimenEngine.STEM_COMBINATIONS[comboKey];
          if (combo) {
            hasCombo = true;
            html += `
              <div class="report-list-item">
                <strong>${palace.name}宫 [${comboKey} · ${combo.title}]：</strong>
                <span>${combo.desc}</span>
              </div>
            `;
          }
        });
      });
    }

    if (!hasCombo) {
      html += `
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">
          当前盘中无特殊十干克应吉凶格局。
        </div>
      `;
    }

    html += `
          </div>
        </div>
        
        <div class="report-card">
          <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--gold-light);">实战建议</div>
          <div style="font-size: 0.8rem; line-height: 1.5; color: var(--text-secondary);">
            学术模式下，重点关注值符与值使落宫。值符为大势方向，值使为具体执行过程。
            同时观察盘中击刑、门迫等四害所在方位，在日常行事中尽量予以规避。<br>
            💡 切换至"感情""财运""事业"或"此时最吉宫位"模式以查看深度定制的实战分析报告。
          </div>
        </div>
      </div>
    `;
    contentBody.innerHTML = html;

  } else if (currentForecastMode === "love") {
    // 2. 感情运势占断报告 (用神：乙奇、庚金、丁奇、六合，只取天盘干/六合神)
    let yiPalaceId = null, gengPalaceId = null, dingPalaceId = null, liuhePalaceId = null;
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const pal = chart.palaces[p];
      if (!yiPalaceId && pal.tianPanStem.includes("乙")) yiPalaceId = p;
      if (!gengPalaceId && pal.tianPanStem.includes("庚")) gengPalaceId = p;
      if (!dingPalaceId && pal.tianPanStem.includes("丁")) dingPalaceId = p;
      if (!liuhePalaceId && pal.spirit === "六合") liuhePalaceId = p;
    }

    const yiPalace = yiPalaceId ? chart.palaces[yiPalaceId] : null;
    const gengPalace = gengPalaceId ? chart.palaces[gengPalaceId] : null;
    const dingPalace = dingPalaceId ? chart.palaces[dingPalaceId] : null;
    const liuhePalace = liuhePalaceId ? chart.palaces[liuhePalaceId] : null;

    const analyzeLove = (palace, pid, label) => {
      if (!palace) return `<div style="font-size:0.85rem;color:var(--text-muted);">${label}落宫未上盘。</div>`;
      const harms = [];
      if (palace.isEmpty) harms.push("旬空（感情虚化难落地）");
      if (QimenEngine.checkRuMu(palace.tianPanStem, pid)) harms.push("入墓（情感被压抑封锁）");
      if (QimenEngine.checkJiXing(palace.tianPanStem, pid)) harms.push("击刑（关系中有伤害冲突）");
      if (QimenEngine.checkMenPo(palace.door, pid)) harms.push("门迫（内心焦虑，环境压制）");
      const doorInfo = QimenEngine.DOORS_INFO[palace.door];
      const doorType = doorInfo ? doorInfo.type : "平";
      return `
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
          落于 <strong>${palace.name}（${palace.direction}）</strong>，
          临 <strong>${palace.spirit}</strong>（八神）、<strong>${palace.star}</strong>（九星）、<strong>${palace.door}</strong>（${doorType}门）。
          ${harms.length > 0 ? `<br><span style="color:#f87171;font-weight:bold;">⚠️ 四害：</span>${harms.join("、")}` : `<br><span style="color:var(--auspicious);">✅ 无四害侵扰，感情状态健康。</span>`}
        </div>
      `;
    };

    let overallVerdict = "";
    const yiGood = yiPalace && !yiPalace.isEmpty && !QimenEngine.checkRuMu(yiPalace.tianPanStem, yiPalaceId);
    const gengGood = gengPalace && !gengPalace.isEmpty && !QimenEngine.checkRuMu(gengPalace.tianPanStem, gengPalaceId);
    if (yiGood && gengGood) overallVerdict = "💘 乙奇（女）与庚金（男）落宫状态优良，关系稳定，利于情感深入与缔结良缘。";
    else if (yiGood || gengGood) overallVerdict = "💛 感情运势中吉，一方主动性强且能量充沛，但需积极沟通并消除另一方的受困阻滞。";
    else overallVerdict = "⚠️ 男女双方用神均受四害或逢空制约，近期感情容易出现波折或沟通不畅，建议多加宽容与静观其变。";

    if (liuhePalace && liuhePalace.isEmpty) {
      overallVerdict += "<br>💡 象征婚姻与缘分的【六合】宫逢空亡，代表缺乏实质性纽带，易生虚无变数。";
    }

    let html = `
      <div class="report-section">
        <div class="report-title-bar">
          <div class="report-title">💘 感情运势占断报告</div>
          <div class="report-subtitle">用神：乙奇（女） + 庚金（男） + 丁奇（桃花） + 六合（契约）</div>
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">乙奇（代表情感·女方·妻子）</div>
          ${analyzeLove(yiPalace, yiPalaceId, "乙奇")}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">庚金（代表男方·丈夫）</div>
          ${analyzeLove(gengPalace, gengPalaceId, "庚金")}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">丁奇（代表桃花·密信·暗恋）</div>
          ${analyzeLove(dingPalace, dingPalaceId, "丁奇")}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">六合（代表感情纽带·婚姻家庭）</div>
          ${analyzeLove(liuhePalace, liuhePalaceId, "六合")}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">综合感情研判</div>
          <div style="font-size:0.9rem;line-height:1.6;color:var(--text-primary);">${overallVerdict}</div>
        </div>
      </div>
    `;
    contentBody.innerHTML = html;

  } else if (currentForecastMode === "wealth") {
    // 3. 财运占断报告 (用神：戊=正财, 生门=求财之门，只取天盘干)
    let wuPalaceId = null, shengPalaceId = null;
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const pal = chart.palaces[p];
      if (!wuPalaceId && pal.tianPanStem.includes("戊")) wuPalaceId = p;
      if (!shengPalaceId && pal.door === "生门") shengPalaceId = p;
    }

    const wuPalace = wuPalaceId ? chart.palaces[wuPalaceId] : null;
    const shengPalace = shengPalaceId ? chart.palaces[shengPalaceId] : null;

    const analyzeWealth = (palace, pid, label) => {
      if (!palace) return `<div style="font-size:0.85rem;color:var(--text-muted);">${label}不在八宫。</div>`;
      const harms = [];
      if (palace.isEmpty) harms.push("旬空（财运虚空，钱到手留不住）");
      if (QimenEngine.checkRuMu(palace.tianPanStem, pid)) harms.push("入墓（财源被锁，难以变现）");
      if (QimenEngine.checkJiXing(palace.tianPanStem, pid)) harms.push("击刑（理财失误，投资踩坑）");
      if (QimenEngine.checkMenPo(palace.door, pid)) harms.push("门迫（外部环境不利，被迫破财）");
      const spiritDesc = {"值符":"贵人助财","太阴":"暗财暗进","六合":"合作生财","九天":"大格局大资金","白虎":"破财凶象","玄武":"小人骗财","螣蛇":"财务纠葛缠绕","九地":"财运稳而缓慢"}[palace.spirit] || "";
      return `
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
          落于 <strong>${palace.name}（${palace.direction}）</strong>，
          临 <strong>${palace.spirit}</strong>${spiritDesc ? `（${spiritDesc}）` : ""}、<strong>${palace.star}</strong>、<strong>${palace.door}</strong>。
          ${harms.length > 0 ? `<br><span style="color:#f87171;font-weight:bold;">⚠️ 四害：</span>${harms.join("、")}` : `<br><span style="color:var(--auspicious);">✅ 无四害侵扰，财路通畅。</span>`}
        </div>
      `;
    };

    let wealthVerdict = "";
    const wuGood = wuPalace && !wuPalace.isEmpty && !QimenEngine.checkRuMu(wuPalace.tianPanStem, wuPalaceId);
    const shengGood = shengPalace && !shengPalace.isEmpty && !QimenEngine.checkMenPo(shengPalace.door, shengPalaceId);
    if (wuGood && shengGood) wealthVerdict = "💰 戊星正财无碍，生门畅通无阻！今日财运极佳，适合签约、收款、投资决策。";
    else if (wuGood || shengGood) wealthVerdict = "💛 财运中吉，部分条件有利。建议抓住有利时机，稳中求进。";
    else wealthVerdict = "⚠️ 财星与生门均受困，近期不宜大额交易或冒险投资，守财为上。";

    let html = `
      <div class="report-section">
        <div class="report-title-bar">
          <div class="report-title">💰 财运占断报告</div>
          <div class="report-subtitle">用神：戊（正财） + 生门（求财之门）</div>
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">戊（正财星·财源）</div>
          ${analyzeWealth(wuPalace, wuPalaceId, "戊")}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">生门（求财之门·财路）</div>
          ${analyzeWealth(shengPalace, shengPalaceId, "生门")}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">综合财运研研判</div>
          <div style="font-size:0.9rem;line-height:1.6;color:var(--text-primary);">${wealthVerdict}</div>
        </div>
      </div>
    `;
    contentBody.innerHTML = html;

  } else if (currentForecastMode === "bestPalace") {
    // 4. Best Palace report - find and display the optimal palace today
    let bestScore = -999;
    let bestPalaceId = 1;
    const palaceScores = [];
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const palace = chart.palaces[p];
      let score = 0;
      if (["生门", "开门", "休门"].includes(palace.door)) score += 3;
      else if (["景门", "杜门"].includes(palace.door)) score += 1;
      else score -= 2;
      const starInfo = QimenEngine.STARS_INFO[palace.star.split("+")[0]];
      if (starInfo && starInfo.type === "吉") score += 2;
      else if (starInfo && starInfo.type === "凶") score -= 2;
      if (["值符", "太阴", "六合", "九天"].includes(palace.spirit)) score += 2;
      else if (["白虎", "玄武", "螣蛇"].includes(palace.spirit)) score -= 2;
      if (palace.isEmpty) score -= 3;
      if (QimenEngine.checkRuMu(palace.tianPanStem, p)) score -= 3;
      if (QimenEngine.checkJiXing(palace.tianPanStem, p)) score -= 3;
      if (QimenEngine.checkMenPo(palace.door, p)) score -= 3;
      const sw = QimenEngine.getStarWang(palace.star, chart.monthBranchIdx);
      if (sw === "旺") score += 2; else if (sw === "相") score += 1;
      if (palace.hasHorse) score += 1;
      palaceScores.push({ p, score, palace });
      if (score > bestScore) { bestScore = score; bestPalaceId = p; }
    }
    palaceScores.sort((a, b) => b.score - a.score);
    const best = chart.palaces[bestPalaceId];

    let rankHtml = palaceScores.slice(0, 4).map((item, idx) => {
      const medal = ["🥇", "🥈", "🥉", "4️⃣"][idx];
      const pal = item.palace;
      return `<div class="report-list-item"><strong>${medal} ${pal.name}（${pal.direction}）</strong><span>${pal.spirit} · ${pal.star} · ${pal.door}　评分: ${item.score}</span></div>`;
    }).join("");

    let html = `
      <div class="report-section">
        <div class="report-title-bar">
          <div class="report-title">✨ 此时最吉宫位</div>
          <div class="report-subtitle">综合评分：门·星·神·四害·旺衰</div>
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">🏆 最优宫位</div>
          <div style="font-size:1.1rem;font-weight:bold;color:var(--gold-accent);margin-bottom:0.5rem;">${best.name}（${best.direction}）</div>
          <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
            八神：<strong>${best.spirit}</strong>　九星：<strong>${best.star}</strong>　八门：<strong>${best.door}</strong><br>
            天盘干：<strong>${best.tianPanStem}</strong>　地盘干：<strong>${best.diPanStem}</strong><br>
            <span style="color:var(--auspicious);font-weight:bold;margin-top:0.25rem;display:block;">
              建议：今日办事、出行、谈判等宜选此方位，可借此宫位能量场助力。
            </span>
          </div>
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">宫位综合排名</div>
          <div class="report-list">${rankHtml}</div>
        </div>
      </div>
    `;
    contentBody.innerHTML = html;

  } else if (currentForecastMode === "career") {
    // 5. 个人事业占断报告 (用神：求测年命+开门，只取天盘干)
    const nianming = document.getElementById("sel-nianming").value;
    let nianmingPalaceId = null;
    let kaimenPalaceId = null;

    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const pal = chart.palaces[p];
      if (!nianmingPalaceId && pal.tianPanStem.includes(nianming)) nianmingPalaceId = p;
      if (!kaimenPalaceId && pal.door === "开门") kaimenPalaceId = p;
    }

    const nianmingPalace = nianmingPalaceId ? chart.palaces[nianmingPalaceId] : null;
    const kaimenPalace = kaimenPalaceId ? chart.palaces[kaimenPalaceId] : null;

    const analyzeCareer = (palace, pid, label) => {
      if (!palace) return `<div style="font-size:0.85rem;color:var(--text-muted);">${label}落宫未上盘。</div>`;
      const harms = [];
      if (palace.isEmpty) harms.push("旬空（运势空亡，多谋少成，缺乏落地性）");
      if (QimenEngine.checkRuMu(palace.tianPanStem, pid)) harms.push("入墓 (施展受阻，容易被边缘化或能力被封锁)");
      if (QimenEngine.checkJiXing(palace.tianPanStem, pid)) harms.push("击刑（职场是非，容易受罚或有激进冲突）");
      if (QimenEngine.checkMenPo(palace.door, pid)) harms.push("门迫（工作压力过载，外界环境不友好）");
      const spiritDesc = {"值符":"贵人扶持","太阴":"谋划暗助","六合":"多方合作","九天":"大展宏图","白虎":"阻力与竞争激烈","玄武":"防口舌小人","防螣蛇":"变动缠绕不决","九地":"宜稳步固守"}[palace.spirit] || "";
      return `
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
          落于 <strong>${palace.name}（${palace.direction}）</strong>，
          临 <strong>${palace.spirit}</strong>${spiritDesc ? `（${spiritDesc}）` : ""}、<strong>${palace.star}</strong>（九星）、<strong>${palace.door}</strong>。
          ${harms.length > 0 ? `<br><span style="color:#f87171;font-weight:bold;">⚠️ 四害：</span>${harms.join("、")}` : `<br><span style="color:var(--auspicious);">✅ 无四害侵扰，事业环境相对健康。</span>`}
        </div>
      `;
    };

    let careerVerdict = "";
    const nianmingGood = nianmingPalace && !nianmingPalace.isEmpty && !QimenEngine.checkRuMu(nianmingPalace.tianPanStem, nianmingPalaceId);
    const kaimenGood = kaimenPalace && !kaimenPalace.isEmpty && !QimenEngine.checkMenPo(kaimenPalace.door, kaimenPalaceId);
    if (nianmingGood && kaimenGood) {
      careerVerdict = "💼 自身气场充沛，开门畅通吉顺！今日事业运势旺盛，利于开展新业务、求职面试、项目落地或主动求变。";
    } else if (nianmingGood || kaimenGood) {
      careerVerdict = "💛 事业运势中吉，存在局部发展的机遇。虽有来自外界或内心的阻碍，但多依靠专业背景可稳健突破。";
    } else {
      careerVerdict = "⚠️ 年命受困且事业门（开门）受挫，近期职场变数较多、阻力大，建议稳守本职，切忌盲目跳槽或做重大调整。";
    }

    let html = `
      <div class="report-section">
        <div class="report-title-bar">
          <div class="report-title">💼 个人事业占断报告</div>
          <div class="report-subtitle">用神：求测年命 [${nianming}]（天盘干） + 开门（事业星）</div>
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">求测人年命宫 [${nianming}]（代表自身能量状态）</div>
          ${analyzeCareer(nianmingPalace, nianmingPalaceId, `年命 ${nianming}`)}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">开门落宫（代表职业出路·工作平台·公司）</div>
          ${analyzeCareer(kaimenPalace, kaimenPalaceId, "开门")}
        </div>
        <div class="report-card">
          <div style="font-size:0.85rem;font-weight:bold;margin-bottom:0.5rem;color:var(--gold-light);">综合事业研判</div>
          <div style="font-size:0.9rem;line-height:1.6;color:var(--text-primary);">${careerVerdict}</div>
        </div>
      </div>
    `;
    contentBody.innerHTML = html;
  }
}

/**
 * Builds the complete structured text for Angnet interpretation
 */
function buildAngnetText(chart) {
  const pad = (num) => String(num).padStart(2, "0");
  const dateStr = `${chart.dateTime.getFullYear()}-${pad(chart.dateTime.getMonth() + 1)}-${pad(chart.dateTime.getDate())} ${pad(chart.dateTime.getHours())}:${pad(chart.dateTime.getMinutes())}`;

  const nianming = document.getElementById("sel-nianming") ? document.getElementById("sel-nianming").value : "癸";

  // Helper: get short chang sheng for a stem in a palace (supports parasite double stems split by '/')
  const getCS = (stem, palaceId) => {
    if (!stem || palaceId === 5) return "";
    
    const getCSForSingle = (s) => {
      const branches = QimenEngine.PALACE_BRANCHES[palaceId];
      if (!branches || branches.length === 0) return "";
      const map = QimenEngine.CHANG_SHENG_MAP[s];
      if (!map) return "";
      return branches.map(b => QimenEngine.CHANG_SHENG_SHORT[map[b]] || map[b] || "").filter(Boolean).join("/");
    };
    
    if (stem.includes("/")) {
      return stem.split("/").map(getCSForSingle).filter(Boolean).join("/");
    }
    return getCSForSingle(stem);
  };

  const lines = [];

  // ─── 标题 ───
  lines.push("═══════════════════════════════════════════");
  lines.push("   奇门遁甲盘面参数 · 供 Angnet 解盘使用");
  lines.push("═══════════════════════════════════════════");
  lines.push("");

  // ─── 智能运筹诊断 ───
  lines.push("【智能运筹诊断】");
  if (currentForecastMode === "academic") {
    lines.push("  占断模式：学术排盘分析");
  } else if (currentForecastMode === "love") {
    lines.push("  占断模式：感情运势占断分析");
  } else if (currentForecastMode === "wealth") {
    lines.push("  占断模式：财运占断分析");
  } else if (currentForecastMode === "bestPalace") {
    lines.push("  占断模式：此时最吉方位推荐分析");
  } else if (currentForecastMode === "career") {
    lines.push("  占断模式：个人事业与运筹分析");
    lines.push(`  求测人年命天干：${nianming}`);
    let nianmingPalaceId = null;
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      if (chart.palaces[p].tianPanStem.includes(nianming)) { nianmingPalaceId = p; break; }
    }
    const nianmingPalace = nianmingPalaceId ? chart.palaces[nianmingPalaceId] : null;
    if (nianmingPalace) {
      lines.push(`  年命落宫位置：${nianmingPalace.name} (${nianmingPalace.direction})`);
    } else {
      lines.push(`  年命落宫位置：未上盘`);
    }
  }
  lines.push("");

  // ─── 基本信息 ───
  lines.push("【基本信息】");
  lines.push(`  排盘时间：${dateStr}`);
  lines.push(`  当前节气：${chart.solarTerm}`);
  lines.push(`  排盘局数：${chart.dunType}${chart.juNumber}局（${chart.yuan}）`);
  lines.push(`  时旬首　：${chart.xunShou}`);
  lines.push(`  值符星　：${chart.zhifuStar}`);
  lines.push(`  值使门　：${chart.zhishiDoor}`);
  lines.push(`  旬空地支：${chart.emptyBranches.join("、")}空`);
  lines.push(`  驿马地支：${chart.yimaBranch || "无"}`);
  lines.push("");

  // ─── 四柱 ───
  lines.push("【四柱八字】");
  lines.push(`  年柱（岁次）：${chart.pillars.year}`);
  lines.push(`  月柱（月建）：${chart.pillars.month}`);
  lines.push(`  日柱（日元）：${chart.pillars.day}`);
  lines.push(`  时柱（时神）：${chart.pillars.hour}`);
  lines.push("");

  // ─── 九宫参数（按方位顺序）───
  lines.push("【九宫盘面参数】");
  lines.push("  格式：宫位 | 卦位-方位 | 神 | 星(旺衰) | 门[特殊] | 天干(长生) | 地干(长生) | 暗干 | 旬空/驿马");
  lines.push("  ─────────────────────────────────────────────────────────");

  // 方位显示顺序：按九宫方位（从西北到正北，对应传统九宫布局）
  const displayOrder = [
    { p: 4, dir: "东南" }, { p: 9, dir: "正南" }, { p: 2, dir: "西南" },
    { p: 3, dir: "正东" }, { p: 5, dir: "中宫" }, { p: 7, dir: "正西" },
    { p: 8, dir: "东北" }, { p: 1, dir: "正北" }, { p: 6, dir: "西北" }
  ];

  const BRANCH_NAMES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const monthBranch = BRANCH_NAMES[chart.monthBranchIdx];

  for (const { p } of displayOrder) {
    const palace = chart.palaces[p];
    if (!palace) continue;

    const palaceLabel = palace.name.replace("宫", "");

    if (p === 5) {
      lines.push(`  ● 中五宫（中宫）：${chart.dunType}${chart.juNumber}局 | 旬首: ${chart.xunShou} | 驿马: ${chart.yimaBranch || "无"}`);
      continue;
    }

    // Star wang status
    const starWang = QimenEngine.getStarWang(palace.star, chart.monthBranchIdx);
    const starDisplay = palace.star + (starWang ? `(${starWang})` : "");

    // Door special markers
    let doorDisplay = palace.door;
    const isZhiShi = chart.zhishiDoor && palace.door === chart.zhishiDoor;
    const menPo = QimenEngine.checkMenPo(palace.door, p);
    if (isZhiShi) doorDisplay += "[值使]";
    if (menPo) doorDisplay += "[门迫]";

    // Star special markers
    let starFull = starDisplay;
    const isZhiFu = chart.zhifuStar && (palace.star === chart.zhifuStar || palace.star.includes(chart.zhifuStar));
    if (isZhiFu) starFull += "[值符]";

    // Chang sheng for tian/di stems
    const tianCS = getCS(palace.tianPanStem, p);
    const diCS = getCS(palace.diPanStem, p);
    const tianDisplay = palace.tianPanStem + (tianCS ? `(${tianCS})` : "");
    const diDisplay = palace.diPanStem + (diCS ? `(${diCS})` : "");

    // Ji xing / Ru mu checks
    let tianExtra = "";
    if (QimenEngine.checkJiXing(palace.tianPanStem, p)) tianExtra += "[击刑]";
    if (QimenEngine.checkRuMu(palace.tianPanStem, p)) tianExtra += "[入墓]";
    let diExtra = "";
    if (QimenEngine.checkJiXing(palace.diPanStem, p)) diExtra += "[击刑]";
    if (QimenEngine.checkRuMu(palace.diPanStem, p)) diExtra += "[入墓]";

    // Stem combination
    const tStem = palace.tianPanStem.includes("/") ? palace.tianPanStem.split("/")[0] : palace.tianPanStem;
    const dStem = palace.diPanStem.includes("/") ? palace.diPanStem.split("/")[0] : palace.diPanStem;
    const comboKey = tStem + dStem;
    const combo = QimenEngine.STEM_COMBINATIONS[comboKey];

    // Flags
    const flags = [];
    if (palace.isEmpty) flags.push("旬空");
    if (palace.hasHorse) flags.push("驿马");
    if (chart.parasitePalace === p) flags.push("寄宫");

    lines.push(`  ● ${palaceLabel}（${palace.direction}）`);
    lines.push(`      八神：${palace.spirit}　　　　九星：${starFull}`);
    lines.push(`      八门：${doorDisplay}　　暗干：暗${palace.anGanStem}`);
    lines.push(`      天盘奇仪：${tianDisplay}${tianExtra}　　地盘奇仪：${diDisplay}${diExtra}`);
    if (combo) {
      lines.push(`      十干克应：【${combo.title}】${combo.desc}`);
    }
    if (flags.length > 0) {
      lines.push(`      特殊标记：${flags.join(" | ")}`);
    }
    lines.push("");
  }

  // ─── 格局汇总 ───
  lines.push("【格局汇总】");
  const specialFormats = [];
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = chart.palaces[p];
    const tStem = palace.tianPanStem.includes("/") ? palace.tianPanStem.split("/")[0] : palace.tianPanStem;
    const dStem = palace.diPanStem.includes("/") ? palace.diPanStem.split("/")[0] : palace.diPanStem;
    const key = tStem + dStem;
    const combo = QimenEngine.STEM_COMBINATIONS[key];
    if (combo) {
      specialFormats.push(`  ${palace.name}：天${tStem}+地${dStem} → 【${combo.title}】`);
    }
  }
  if (specialFormats.length > 0) {
    specialFormats.forEach(f => lines.push(f));
  } else {
    lines.push("  无特殊奇仪格局");
  }
  lines.push("");

  // ─── 请求解盘提示 ───
  lines.push("【解盘请求】");
  lines.push("  以上为本次奇门遁甲排盘的完整参数。");
  lines.push("  请 Angnet 根据以上数据进行专业解盘分析。");
  lines.push(`  月令地支：${monthBranch}（供旺衰分析参考）`);
  lines.push("═══════════════════════════════════════════");

  return lines.join("\n");
}
