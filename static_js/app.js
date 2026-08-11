// UI Controller for Qimen Dunjia Auto-Charting Web System

let currentChartData = null;
let selectedPalaceId = null;
let currentForecastMode = "academic"; // 'academic' | 'love' | 'wealth' | 'career' | 'bestPalace'
let currentSidebarTab = "palace";      // 'palace' | 'report'

// ── UI Styles Injection ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  injectChatStyles();
  
  // 显式绑定占断模式按钮的点击事件，增强交互健壮性
  ["academic", "love", "wealth", "career", "bestPalace"].forEach(m => {
    const btn = document.getElementById(`mode-btn-${m}`);
    if (btn) {
      btn.addEventListener("click", () => setForecastMode(m));
    }
  });
  
  // 初始化手写标记黑板
  initDrawingBoard();
});

function injectChatStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .ai-chat-body { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 1rem 0.5rem; display: flex; flex-direction: column; gap: 1rem; height: 100%; min-width: 0; }
    .chat-msg { display: flex; flex-direction: column; max-width: 100%; min-width: 0; }
    .chat-msg.user { align-self: flex-end; }
    .chat-msg.assistant { align-self: flex-start; }
    
    .chat-bubble h3 { font-size: 1.05rem; color: #d4af37; margin-top: 0.5rem; margin-bottom: 0.3rem; }
    .chat-bubble h2 { font-size: 1.15rem; color: #d4af37; margin-top: 0.5rem; margin-bottom: 0.3rem; }
    .chat-bubble li { margin-bottom: 0.2rem; margin-left: 1.2rem; display: list-item; list-style-type: disc; }
    #chat-content-body {
      flex: 1;
      height: calc(100vh - 220px);
      max-height: 800px;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }

    .chat-bubble {
      padding: 0.8rem 1.1rem; border-radius: 12px; font-size: 0.95rem; line-height: 1.6;
      word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; white-space: normal; box-sizing: border-box; max-width: 100%; min-width: 0;
      font-family: 'Noto Sans SC', sans-serif;
    }
    .chat-msg.user .chat-bubble {
      background: linear-gradient(135deg, #d4af37, #f0c040); color: #1a0f00;
      border-bottom-right-radius: 2px; font-weight: 500;
    }
    .chat-msg.assistant .chat-bubble {
      background: rgba(255,255,255,0.05); color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.1); border-bottom-left-radius: 2px;
    }
    .loading-dots { display: inline-block; animation: pulse 1.5s infinite; color: #d4af37; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    
    .ai-chat-footer {
      display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.4rem;
      border-top: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.15);
      margin-top: auto;
    }
    #ai-chat-input {
      flex: 1; padding: 0.8rem 1.2rem; border-radius: 24px;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff;
      font-size: 0.9rem; outline: none; transition: border-color 0.2s;
    }
    #ai-chat-input:focus { border-color: rgba(212,175,55,0.5); }
    .ai-chat-send-btn {
      padding: 0.7rem 1.5rem; border-radius: 24px; background: #d4af37; color: #1a0f00;
      font-weight: 700; font-size: 0.9rem; border: none; cursor: pointer; transition: transform 0.1s;
    }
    .ai-chat-send-btn:active { transform: scale(0.95); }
    .ai-chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(style);
}

function setForecastMode(mode) {
  currentForecastMode = mode;
  
  // Update mode buttons styling
  ["academic", "love", "wealth", "career", "bestPalace"].forEach(m => {
    const btn = document.getElementById(`mode-btn-${m}`);
    if (btn) {
      if (m === mode) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });

  // Toggle nianming dropdown visibility
  const nianmingGroup = document.getElementById("nianming-group");
  if (nianmingGroup) {
    if (mode === "career") {
      nianmingGroup.classList.remove("hidden");
    } else {
      nianmingGroup.classList.add("hidden");
    }
  }

  // 控制手写画板控制栏显示状态
  const boardTools = document.getElementById("board-tools");
  if (boardTools) {
    if (mode === "academic") {
      boardTools.classList.remove("hidden");
      setTimeout(resizeCanvas, 50);
    } else {
      boardTools.classList.add("hidden");
      if (isDrawingModeActive) {
        toggleDrawingMode(false);
      }
      clearDrawingBoard();
    }
  }

  // Re-calculate and render with new mode
  triggerCalculate();
}

function switchSidebarTab(tab) {
  currentSidebarTab = tab;

  // Update tabs styling
  const btnPalace = document.getElementById("tab-btn-palace");
  const btnReport = document.getElementById("tab-btn-report");
  const btnChat = document.getElementById("tab-btn-chat");
  if (btnPalace && btnReport && btnChat) {
    btnPalace.classList.toggle("active", tab === "palace");
    btnReport.classList.toggle("active", tab === "report");
    btnChat.classList.toggle("active", tab === "chat");
  }

  // Update sidebar content display
  const headerSection = document.getElementById("interp-header-section");
  const contentBody = document.getElementById("interp-content-body");
  const chatBody = document.getElementById("chat-content-body");

  if (tab === "palace") {
    if (headerSection) headerSection.style.display = "flex";
    if (contentBody) contentBody.style.display = "block";
    if (chatBody) chatBody.style.display = "none";
    if (selectedPalaceId) {
      selectPalace(selectedPalaceId);
    } else {
      resetSidebar();
    }
  } else if (tab === "report") {
    if (headerSection) headerSection.style.display = "none";
    if (contentBody) contentBody.style.display = "block";
    if (chatBody) chatBody.style.display = "none";
    if (currentChartData) {
      renderForecastReport(currentChartData);
    } else {
      contentBody.innerHTML = `<div class="interp-placeholder"><p>请先进行排盘计算以生成运筹报告。</p></div>`;
    }
  } else if (tab === "chat") {
    if (headerSection) headerSection.style.display = "none";
    if (contentBody) contentBody.style.display = "none";
    if (chatBody) chatBody.style.display = "flex";
    if (!currentChartData) {
      document.getElementById("ai-chat-history").innerHTML = `<div class="chat-msg assistant"><div class="chat-bubble">请先进行排盘计算，然后再进行解盘。</div></div>`;
    }
  }
}

// On document load, initialize inputs with current time and plot the chart
document.addEventListener("DOMContentLoaded", () => {
  const cachedStateStr = localStorage.getItem('qimen_chat_state');
  if (cachedStateStr) {
    try {
      const state = JSON.parse(cachedStateStr);
      document.getElementById("input-date").value = state.date;
      document.getElementById("input-time").value = state.time;
      
      // 仅恢复数据和图形状态，但不强制跳转到结果页 (避免强制进入C层)
      if (typeof originalTriggerCalculate === 'function') {
        originalTriggerCalculate(true);
      }
      // 恢复内存状态
      currentChatSessionId = state.sessionId;
      qimenChatHistory = state.history || [];
      const historyEl = document.getElementById("ai-chat-history");
      if (historyEl) historyEl.innerHTML = state.html || "";
    } catch (e) {
      useCurrentTime();
    }
  } else {
    useCurrentTime();
  }
});

/**
 * Sets date and time inputs to the user's current local time
 */
function useCurrentTime() {
  const now = new Date();
  document.getElementById("input-date").value = formatLocalDate(now);
  document.getElementById("input-time").value = formatLocalTime(now);
  // 取消自动排盘跳转，避免页面加载直接跳入C层
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date object to HH:MM
 */
function formatLocalTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}



function triggerCalculate(isRestoring = false) {
  const dateStr = document.getElementById("input-date").value;
  const timeStr = document.getElementById("input-time").value;

  if (!dateStr || !timeStr) {
    alert("请选择日期和时间！");
    return;
  }

  // Construct Date object in local time
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const inputDate = new Date(year, month - 1, day, hour, minute, 0);

  // No manual overrides (removed)
  let manualJu = null;

  try {
    const jigongMethod = document.getElementById("sel-jigong").value;
    // 1. Calculate Chart Data
    const chart = QimenEngine.calculateQimenChart(inputDate, manualJu, jigongMethod);
    currentChartData = chart;
    
    // 只有非恢复状态（用户主动重排盘）才清空记忆
    if (!isRestoring) {
      currentChatSessionId = null;
      qimenChatHistory = [];
      localStorage.removeItem('qimen_chat_state');
      const historyEl = document.getElementById("ai-chat-history");
      if (historyEl) historyEl.innerHTML = "";
    }
    selectedPalaceId = null; // Reset selection

    // 2. Render Header Banner (四柱乾坤)
    document.getElementById("pillar-year").textContent = chart.pillars.year;
    document.getElementById("pillar-month").textContent = chart.pillars.month;
    document.getElementById("pillar-day").textContent = chart.pillars.day;
    document.getElementById("pillar-hour").textContent = chart.pillars.hour;

    const getKongWang = (ganZhi) => {
      if (!ganZhi || ganZhi.length < 2) return "--";
      const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
      const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
      const gan = ganZhi[0];
      const zhi = ganZhi[1];
      const gIdx = stems.indexOf(gan);
      const zIdx = branches.indexOf(zhi);
      if (gIdx === -1 || zIdx === -1) return "--";
      const xunShouIdx = (zIdx - gIdx + 12) % 12;
      const kong1 = (xunShouIdx - 2 + 12) % 12;
      const kong2 = (xunShouIdx - 1 + 12) % 12;
      return branches[kong1] + branches[kong2] + "空";
    };

    document.getElementById("pillar-year-kong").textContent = getKongWang(chart.pillars.year);
    document.getElementById("pillar-month-kong").textContent = getKongWang(chart.pillars.month);
    document.getElementById("pillar-day-kong").textContent = getKongWang(chart.pillars.day);
    document.getElementById("pillar-hour-kong").textContent = getKongWang(chart.pillars.hour);

    document.getElementById("val-term").textContent = chart.solarTerm;
    document.getElementById("val-ju").textContent = chart.dunType + chart.juNumber + "局 (" + chart.yuan + ")";
    document.getElementById("val-xunshou").textContent = chart.xunShou;
    document.getElementById("val-zhifu").textContent = chart.zhifuStar;
    document.getElementById("val-zhishi").textContent = chart.zhishiDoor;
    document.getElementById("val-xunkong").textContent = chart.emptyBranches.join("、") + "空";

    // Show banner if hidden
    document.getElementById("pillars-banner").classList.remove("hidden");

    // 3. Render Center Palace (中五宫)
    document.getElementById("center-ju-text").textContent = chart.dunType + "\n" + chart.juNumber + "局";
    
    const centerDiStem = chart.palaces[5].diPanStem || "";
    const centerGuaName = { 2: "坤二", 8: "艮八" }[chart.parasitePalace] || "坤二";
    const parasitePalaceData = chart.palaces[chart.parasitePalace];
    let centerJiStem = centerDiStem;
    if (parasitePalaceData && parasitePalaceData.tianPanStem.includes("/")) {
      centerJiStem = parasitePalaceData.tianPanStem.split("/")[1];
    }
    document.getElementById("center-yima-text").innerHTML = `旬首: ${chart.xunShou}<br>驿马: ${chart.yimaBranch}<br>地盘干: <span style="color: var(--accent-light); font-weight: bold;">${centerDiStem}</span><br>寄${centerGuaName} (天盘干: <span style="color: var(--gold-light); font-weight: bold;">${centerJiStem}</span>)`;

    // 4. Render Outer Palaces
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue; // Skip Center

      const palaceData = chart.palaces[p];
      const card = document.getElementById(`palace-${p}`);

      // Remove previous selection highlight
      card.classList.remove("selected");

      // Render Spirit (八神)
      const spiritEl = document.getElementById(`spirit-${p}`);
      if (spiritEl) {
        spiritEl.textContent = palaceData.spirit;
        if (!spiritEl.classList.contains("palace-spirit")) spiritEl.classList.add("palace-spirit");
        spiritEl.classList.remove("spirit-zhifu");
        if (palaceData.spirit === "值符") spiritEl.classList.add("spirit-zhifu");
      }

      // Badges (Xun Kong and Yi Ma)
      const badgesContainer = document.getElementById(`badges-${p}`);
      if (badgesContainer) {
        badgesContainer.innerHTML = "";
        if (palaceData.isEmpty) {
          badgesContainer.innerHTML += `<span class="badge badge-kong" title="旬空">〇</span>`;
        }
        if (palaceData.hasHorse) {
          badgesContainer.innerHTML += `<span class="badge badge-ma" title="驿马">🐎</span>`;
        }
      }
      // 内外盘判定：阳遁 1,3,4,8 内，2,6,7,9 外；阴遁相反
      const isYangDun = chart.dunType.includes("阳");
      const innerPalaces = isYangDun ? [1, 3, 4, 8] : [2, 6, 7, 9];
      card.classList.remove("inner-palace", "outer-palace");
      const isInner = innerPalaces.includes(p);
      if (isInner) {
        card.classList.add("inner-palace");
      } else {
        card.classList.add("outer-palace");
      }

      // Render Star (九星)
      const starEl = document.getElementById(`star-${p}`);
      if (starEl) {
        // Handle split stars: "天芮+天禽"
        let starLookup = palaceData.star;
        if (palaceData.star.includes("+")) {
          starLookup = palaceData.star.split("+")[0];
        }
        const isZhiFuStar = chart.zhifuStar && (palaceData.star === chart.zhifuStar || palaceData.star.includes(chart.zhifuStar));
        // Safe class update: remove old classes if needed, or just ensure base class
        if (!starEl.classList.contains("palace-star")) starEl.classList.add("palace-star");
        
        let starText = palaceData.star;
        
        // 还原经典排版，双星同行并做值符颜色隔离
        if (starText.includes("+")) {
          const [s1, s2] = starText.split("+");
          let html1 = s1.replace('天', '');
          let html2 = s2.replace('天', '');
          
          if (s1 === chart.zhifuStar) html1 = `<span class="star-zhifu">${html1}</span>`;
          if (s2 === chart.zhifuStar) html2 = `<span class="star-zhifu">${html2}</span>`;
          
          starText = `${html1}${html2}`;
        } else {
          if (isZhiFuStar) {
            starText = `<span class="star-zhifu">${starText}</span>`;
          }
        }

        if (isZhiFuStar) {
          starText += `<span class="badge-tag tag-zhifu" style="display:inline-block; margin-left:0.2rem; transform: scale(0.9);">符</span>`;
        }
        const starWang = QimenEngine.getStarWang(palaceData.star, chart.monthBranchIdx);
        if (starWang) {
          starText += `<span class="star-wang-text star-stage-${starWang}" style="display:inline-block; margin-left:0.2rem;">(${starWang})</span>`;
        }
        starEl.innerHTML = starText;
      }

      // Render Door (八门)
      const doorEl = document.getElementById(`door-${p}`);
      if (doorEl) {
        const isZhiShiDoor = chart.zhishiDoor && palaceData.door === chart.zhishiDoor;
        const hasMenPo = QimenEngine.checkMenPo(palaceData.door, p);
        
        // Safely add classes
        if (!doorEl.classList.contains("palace-door")) doorEl.classList.add("palace-door");
        doorEl.classList.remove("door-menpo", "door-zhishi"); // reset
        if (hasMenPo) {
          doorEl.classList.add("door-menpo");
        } else if (isZhiShiDoor) {
          doorEl.classList.add("door-zhishi");
        }
        
        let doorText = palaceData.door;
        if (isZhiShiDoor) {
          doorText += `<span class="badge-tag tag-zhishi">使</span>`;
        }
        if (hasMenPo) {
          doorText += `<span class="badge-tag tag-menpo">迫</span>`;
        }
        doorEl.innerHTML = doorText;
      }

      // Render Stems (天盘/地盘奇仪)
      const tianEl = document.getElementById(`tian-${p}`);
      if (tianEl) {
        let tianStemHtml = formatStemWithChangSheng(palaceData.tianPanStem, p);
        tianEl.innerHTML = tianStemHtml;
        tianEl.classList.add("tian-stem");
      }

      const diEl = document.getElementById(`di-${p}`);
      if (diEl) {
        let diStemHtml = formatStemWithChangSheng(palaceData.diPanStem, p);
        diEl.innerHTML = diStemHtml;
        diEl.classList.add("di-stem");
      }

      // 动态显示八卦宫名
      const guaEl = card.querySelector(".palace-gua");
      if (guaEl) {
        const baseGua = palaceData.gua;
        guaEl.innerHTML = baseGua + p;
      }

      // Render An Gan (暗干)
      const anEl = document.getElementById(`an-${p}`);
      if (anEl) {
        anEl.innerHTML = palaceData.anGanStem || "";
        anEl.classList.add("an-stem");
      }
    }

    // 5. Update Palace Glow animations (旬空/马星/击刑/年命等特效联动)
    updatePalaceGlows(chart);

    // 6. Reset or render sidebar depending on the active tab
    if (currentSidebarTab === "report") {
      renderForecastReport(chart);
    } else if (currentSidebarTab === "chat") {
      openAiChatTab();
    } else {
      if (selectedPalaceId) {
        selectPalace(selectedPalaceId);
      } else {
        resetSidebar();
      }
    }

    // 排盘完毕，重设一次画板 Canvas 大小以防对齐发生偏移
    if (currentForecastMode === "academic") {
      setTimeout(resizeCanvas, 100);
    }

  } catch (error) {
    console.error(error);
    alert("系统异常 (Script Error)\n\n" + error.stack);
  }
}

/**
 * Updates Qimen palace grid card class names with custom glow effects
 */
function updatePalaceGlows(chart) {
  // Clear all existing glow class names on cards 1-9 (except center 5)
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const card = document.getElementById(`palace-${p}`);
    if (card) {
      card.classList.remove("glow-kong", "glow-ma", "glow-clash", "glow-auspicious", "glow-nianming", "glow-love", "glow-wealth", "glow-best");
    }
  }

  // 1. 当选择学术排盘时，直接返回，不应用任何呼吸灯效果
  if (currentForecastMode === "academic") {
    return;
  }

  // Get current nianming stem for career mode
  const nianming = document.getElementById("sel-nianming") ? document.getElementById("sel-nianming").value : "癸";

  // 2. 感情模式：用神包括 乙奇、丁奇、庚金、六合。天盘干及六合神
  if (currentForecastMode === "love") {
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const palace = chart.palaces[p];
      const card = document.getElementById(`palace-${p}`);
      if (!card || !palace) continue;
      const hasYi = palace.tianPanStem.includes("乙");
      const hasDing = palace.tianPanStem.includes("丁");
      const hasGeng = palace.tianPanStem.includes("庚");
      const hasLiuhe = palace.spirit === "六合";
      if (hasYi || hasDing || hasGeng || hasLiuhe) {
        card.classList.add("glow-love");
      }
    }
    return;
  }

  // 3. 财运模式：戊=正财, 生门=求财之门。只取天盘干
  if (currentForecastMode === "wealth") {
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const palace = chart.palaces[p];
      const card = document.getElementById(`palace-${p}`);
      if (!card || !palace) continue;
      const hasWu = palace.tianPanStem.includes("戊");
      const hasShengMen = palace.door === "生门";
      if (hasWu || hasShengMen) {
        card.classList.add("glow-wealth");
      }
    }
    return;
  }

  // 4. 此时最吉宫位：综合评分最高的宫位
  if (currentForecastMode === "bestPalace") {
    let bestScore = -999;
    let bestPalaceId = 1;
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const palace = chart.palaces[p];
      let score = 0;
      // 吉门加分
      if (["生门", "开门", "休门"].includes(palace.door)) score += 3;
      else if (["景门", "杜门"].includes(palace.door)) score += 1;
      else score -= 2;
      // 吉星加分
      const starInfo = QimenEngine.STARS_INFO[palace.star.split("+")[0]];
      if (starInfo && starInfo.type === "吉") score += 2;
      else if (starInfo && starInfo.type === "凶") score -= 2;
      // 吉神加分
      if (["值符", "太阴", "六合", "九天"].includes(palace.spirit)) score += 2;
      else if (["白虎", "玄武", "螣蛇"].includes(palace.spirit)) score -= 2;
      // 四害减分
      if (palace.isEmpty) score -= 3;
      if (QimenEngine.checkRuMu(palace.tianPanStem, p)) score -= 3;
      if (QimenEngine.checkJiXing(palace.tianPanStem, p)) score -= 3;
      if (QimenEngine.checkMenPo(palace.door, p)) score -= 3;
      // 旺相加分
      const starWang = QimenEngine.getStarWang(palace.star, chart.monthBranchIdx);
      if (starWang === "旺") score += 2;
      else if (starWang === "相") score += 1;
      // 驿马加分
      if (palace.hasHorse) score += 1;
      if (score > bestScore) {
        bestScore = score;
        bestPalaceId = p;
      }
    }
    const bestCard = document.getElementById(`palace-${bestPalaceId}`);
    if (bestCard) bestCard.classList.add("glow-best");
    return;
  }

  // 5. 事业模式：求测人年命（天盘干）+ 开门（事业星）
  if (currentForecastMode === "career") {
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const palace = chart.palaces[p];
      const card = document.getElementById(`palace-${p}`);
      if (!card || !palace) continue;
      const isNianmingPalace = palace.tianPanStem.includes(nianming);
      const isKaimen = palace.door === "开门";
      if (isNianmingPalace || isKaimen) {
        card.classList.add("glow-nianming");
      }
    }
  }
}

/**
 * Renders the business strategic report inside the sidebar
 */
// renderForecastReport is now implemented in forecast.js

function resetSidebar() {
  document.getElementById("interp-title").textContent = "宫位详析";
  document.getElementById("interp-gua-badge").textContent = "待选宫位";
  document.getElementById("interp-content-body").innerHTML = `
    <div class="interp-placeholder">
      <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 9.152c.582.448 1.148.89 1.676 1.345m-1.676-1.345c-.58-.447-1.147-.887-1.678-1.34m3.354 2.685c.53.45 1.072.893 1.62 1.328m0 0a28.347 28.347 0 01-1.62-1.328m1.62 1.328c.579.447 1.139.897 1.676 1.347m0 0a28.3 28.3 0 01-1.676-1.347M13.364 7.812c-.529-.45-1.072-.893-1.62-1.328m0 0a28.347 28.347 0 011.62 1.328m-1.62-1.328a28.3 28.3 0 00-1.676 1.347m1.676-1.347c-.582-.448-1.148-.89-1.676-1.345m0 0a28.3 28.3 0 001.676 1.345M8.332 11.27a28.27 28.27 0 01-1.676-1.347m1.676 1.347c.582.448 1.148.89 1.676 1.345m-1.676-1.345c-.58-.447-1.147-.887-1.678-1.34m3.354 2.685c.53.45 1.072.893 1.62 1.328M9.014 9.03c0-2.224 1.802-4.03 4.024-4.03s4.024 1.806 4.024 4.03c0 1.026-.383 1.96-1.012 2.671L12.038 16.03a1.5 1.5 0 01-2.122 0L6.038 12.03a3.987 3.987 0 01-1.012-2.672c0-1.22.545-2.31 1.4-3.053m4.61 2.755c-.52-.397-1.01-.812-1.464-1.243"></path>
      </svg>
      <p>请在九宫格中点击任意一个宫位，以查看该宫位的神、门、星、奇仪组合与吉凶详析。</p>
    </div>
  `;
}

/**
 * Handles selecting a palace grid cell to show detailed calculations
 */
function selectPalace(palaceId) {
  if (!currentChartData) return;

  // Update highlights
  if (selectedPalaceId) {
    document.getElementById(`palace-${selectedPalaceId}`).classList.remove("selected");
  }
  selectedPalaceId = palaceId;
  document.getElementById(`palace-${palaceId}`).classList.add("selected");

  const palace = currentChartData.palaces[palaceId];

  // Render Sidebar Header
  document.getElementById("interp-title").textContent = palace.name;
  document.getElementById("interp-gua-badge").textContent = palace.gua + "卦 · " + palace.direction;

  // 宫位数字映射 (先天八卦数、后天八卦数、五行生成数)
  const palaceNumbersMap = {
    1: { name: "坎一宫", xiantian: 6, houtian: 1, wuxing: "1、6", element: "水 (天一生水，地六成之)" },
    2: { name: "坤二宫", xiantian: 8, houtian: 2, wuxing: "5、10", element: "土 (天五生土，地十成之)" },
    3: { name: "震三宫", xiantian: 4, houtian: 3, wuxing: "3、8", element: "木 (天三生木，地八成之)" },
    4: { name: "巽四宫", xiantian: 5, houtian: 4, wuxing: "3、8", element: "木 (天三生木，地八成之)" },
    5: { name: "中五宫", xiantian: "—", houtian: 5, wuxing: "5、10", element: "土 (天五生土，地十成之)" },
    6: { name: "乾六宫", xiantian: 1, houtian: 6, wuxing: "4、9", element: "金 (地四生金，天九成之)" },
    7: { name: "兑七宫", xiantian: 2, houtian: 7, wuxing: "4、9", element: "金 (地四生金，天九成之)" },
    8: { name: "艮八宫", xiantian: 7, houtian: 8, wuxing: "5、10", element: "土 (天五生土，地十成之)" },
    9: { name: "离九宫", xiantian: 3, houtian: 9, wuxing: "2、7", element: "火 (地二生火，天七成之)" }
  };
  const numInfo = palaceNumbersMap[palaceId] || { xiantian: "—", houtian: palaceId, wuxing: "—", element: "" };

  // Build analysis HTML
  let html = "";

  // 1. Overview and elements
  html += `
    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; line-height: 1.6;">
      本宫属 <strong>${palace.element}</strong>，所辖卦位为 <strong>${palace.gua}</strong>，方位 <strong>${palace.direction}</strong>。
      ${palace.isEmpty ? `<span style="color: var(--inauspicious); font-weight: bold;">(时下旬空)</span>` : ""}
      ${palace.hasHorse ? `<span style="color: var(--element-earth); font-weight: bold;">(驿马驰入)</span>` : ""}
      ${currentChartData.parasitePalace === palaceId ? `<span style="color: var(--gold-accent); font-weight: bold;">(中五寄宫)</span>` : ""}
    </div>

    <div class="interp-card" style="margin-top: 0.5rem; margin-bottom: 0.75rem; padding: 0.75rem 1rem;">
      <div style="font-size: 0.8rem; font-weight: bold; margin-bottom: 0.6rem; color: var(--gold-light); display: flex; align-items: center; gap: 0.4rem;">
        🔢 宫位象数理数
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center;">
        <div style="background: rgba(255,255,255,0.02); padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.2rem;">先天八卦数</div>
          <div style="font-size: 1.05rem; font-weight: bold; color: var(--gold-accent);">${numInfo.xiantian}</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.2rem;">后天八卦数</div>
          <div style="font-size: 1.05rem; font-weight: bold; color: var(--gold-accent);">${numInfo.houtian}</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.2rem;">五行生成数</div>
          <div style="font-size: 1.05rem; font-weight: bold; color: var(--gold-accent);">${numInfo.wuxing}</div>
        </div>
      </div>
      <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem; text-align: center; font-style: italic;">
        五行生成：${numInfo.element}
      </div>
    </div>
  `;

  // 2. Spirit (神)
  const spiritInfo = QimenEngine.SPIRITS_INFO[palace.spirit];
  html += `
    <div class="interp-card">
      <div class="card-label">神盘八神</div>
      <div class="card-value ${getElementColorClass(palace.spirit)}">${palace.spirit}</div>
      <div class="card-desc">${spiritInfo ? spiritInfo.desc : "无"}</div>
    </div>
  `;

  // 3. Star (星)
  let starName = palace.star;
  let starDesc = "";
  let starType = "平";
  if (starName.includes("+")) {
    // split star
    const stars = starName.split("+");
    const info0 = QimenEngine.STARS_INFO[stars[0]];
    const info1 = QimenEngine.STARS_INFO[stars[1]];
    starDesc = `${stars[0]}: ${info0 ? info0.desc : ""}<br>${stars[1]}: ${info1 ? info1.desc : ""}`;
    starType = info0 ? info0.type : "平";
  } else {
    const info = QimenEngine.STARS_INFO[starName];
    starDesc = info ? info.desc : "无";
    starType = info ? info.type : "平";
  }
  const isZhiFuStar = currentChartData.zhifuStar && (starName === currentChartData.zhifuStar || starName.includes(currentChartData.zhifuStar));
  const starWang = QimenEngine.getStarWang(starName, currentChartData.monthBranchIdx);
  const starWangDesc = {
    "旺": "处于 [旺] 状态：九星五行生时令五行（我生者旺）。此时星体能量得到最强发挥，吉星极吉，凶星极凶，是绝佳的主动出击信号。",
    "相": "处于 [相] 状态：九星五行与时令五行相同（同行比和）。星体得时令帮扶，能量次旺，其原有的吉凶特征会显著显现。",
    "废": "处于 [废] 状态：时令五行生助九星五行（生我者废）。虽然有源头生助，但星体处于休眠、退气状态，无心出力，吉凶性质模糊弱化。",
    "休": "处于 [休] 状态：九星五行克制时令五行（我克者休）。星体需要消耗自身能量去压制时令，处于退气和休歇之地，吉凶大幅减弱。",
    "囚": "处于 [囚] 状态：时令五行克制九星五行（克我者囚）。星体被当前时令严密压制拘禁，能量几乎被完全锁死，无法发挥任何吉凶影响力。"
  }[starWang] || "";
  
  const monthBranchName = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"][currentChartData.monthBranchIdx];
  const monthElementName = QimenEngine.getBranchElement(currentChartData.monthBranchIdx);
  
  let starWangText = "";
  if (starWang) {
    starWangText = `<br><span style="color: ${starWang === "旺" || starWang === "相" ? "var(--auspicious)" : "var(--text-muted)"}; font-weight: bold; margin-top:0.25rem; display:block;">[月令状态] ${starWang}：</span>落月建 <strong>${monthBranchName}</strong> (${monthElementName}月)，${starWangDesc}`;
  }

  html += `
    <div class="interp-card">
      <div class="card-label">天盘九星</div>
      <div class="card-value star-${starType}">
        ${starName} (${starType}星)
        ${isZhiFuStar ? `<span class="badge-tag tag-zhifu">值符星</span>` : ""}
        ${starWang ? `<span class="badge-tag" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color: inherit;">${starWang}</span>` : ""}
      </div>
      <div class="card-desc">
        ${starDesc}
        ${starWangText}
      </div>
    </div>
  `;

  // 4. Door (门)
  const doorInfo = QimenEngine.DOORS_INFO[palace.door];
  const doorType = doorInfo ? doorInfo.type : "平";
  const isZhiShiDoor = currentChartData.zhishiDoor && palace.door === currentChartData.zhishiDoor;
  const hasMenPo = QimenEngine.checkMenPo(palace.door, palaceId);
  
  html += `
    <div class="interp-card">
      <div class="card-label">人盘八门</div>
      <div class="card-value door-${doorType}">
        ${palace.door} (${doorType}门)
        ${isZhiShiDoor ? `<span class="badge-tag tag-zhishi">值使门</span>` : ""}
        ${hasMenPo ? `<span class="badge-tag tag-menpo" style="color:var(--inauspicious);">门迫</span>` : ""}
      </div>
      <div class="card-desc">
        ${doorInfo ? doorInfo.desc : "无"}
        ${hasMenPo ? `<br><span style="color:var(--inauspicious); font-weight:bold; margin-top:0.25rem; display:block;">[警告] 门迫：本宫门五行 ${doorInfo?.element || ""} 克落宫五行 ${palace.element}，构成门迫。代表在该宫位求测人事（如签订协议、做出行动）时，将面临严重内耗、破财或强烈环境压制。</span>` : ""}
      </div>
    </div>
    
    <!-- An Gan (暗干) -->
    <div class="interp-card">
      <div class="card-label">暗干 (门下隐干)</div>
      <div class="card-value ${getStemColorClass(palace.anGanStem)}">暗 ${palace.anGanStem}</div>
      <div class="card-desc">时干加值使门飞布之暗干，代表本宫在人事（八门）执行过程中，暗中发挥作用的潜在天时场力与隐秘动机。</div>
    </div>
  `;

  // 5. Stems Combinations (奇仪克应)
  let primaryTianStem = palace.tianPanStem;
  let extraHtml = "";

  if (primaryTianStem.includes("/")) {
    const parts = primaryTianStem.split("/");
    primaryTianStem = parts[0];
    const secondaryTianStem = parts[1];

    // Look up secondary combination
    const secKey = secondaryTianStem + palace.diPanStem;
    const secCombo = QimenEngine.STEM_COMBINATIONS[secKey];
    if (secCombo) {
      extraHtml = `
        <div class="combo-badge" style="margin-top: 0.5rem; border-color: rgba(255,255,255,0.05);">
          <div class="combo-header">
            <span class="combo-title">寄宫组合: ${secondaryTianStem} + ${palace.diPanStem}</span>
            <span class="combo-name">${secCombo.title}</span>
          </div>
          <div class="card-desc">${secCombo.desc}</div>
        </div>
      `;
    }
  }

  const mainKey = primaryTianStem + palace.diPanStem;
  const mainCombo = QimenEngine.STEM_COMBINATIONS[mainKey];

  // Twelve Chang Sheng and Harms detail builder
  const getCSDetail = (s, role) => {
    const branches = QimenEngine.PALACE_BRANCHES[palaceId];
    if (!branches || branches.length === 0) return "";
    const map = QimenEngine.CHANG_SHENG_MAP[s];
    if (!map) return "";
    
    const detail = branches.map(b => `<strong>${b}</strong>方（即${map[b]}之气）`).join("，");
    let extra = "";
    if (role === "tian" && QimenEngine.checkJiXing(s, palaceId)) {
      extra += ` <span class="badge-tag tag-jixing">击刑</span>（代表做事容易受挫、身体有损或犯纪律刑法）`;
    }
    if (QimenEngine.checkRuMu(s, palaceId)) {
      extra += ` <span class="badge-tag tag-rumu">入墓</span>（代表能量被封锁、隐藏或陷入低谷，能力难以发挥）`;
    }
    return `<strong>${s}</strong>：落${palace.name}，对${detail}${extra}`;
  };
  
  let csTianText = "";
  if (palace.tianPanStem.includes("/")) {
    csTianText = palace.tianPanStem.split("/").map(s => getCSDetail(s, "tian")).join("<br>");
  } else {
    csTianText = getCSDetail(palace.tianPanStem, "tian");
  }
  
  let csDiText = "";
  let cleanDiStem = palace.diPanStem;
  if (cleanDiStem.includes("/")) {
    csDiText = cleanDiStem.split("/").map(s => getCSDetail(s, "di")).join("<br>");
  } else {
    csDiText = getCSDetail(cleanDiStem, "di");
  }
  
  html += `
    <div class="interp-card">
      <div class="card-label">十干克应 (天盘/地盘奇仪)</div>
      <div class="card-value">天盘 ${palace.tianPanStem} · 地盘 ${palace.diPanStem}</div>
      ${mainCombo ? `
        <div class="combo-badge">
          <div class="combo-header">
            <span class="combo-title">主盘组合: ${primaryTianStem} + ${palace.diPanStem.split("/")[0]}</span>
            <span class="combo-name">${mainCombo.title}</span>
          </div>
          <div class="card-desc">${mainCombo.desc}</div>
        </div>
      ` : `<div class="card-desc">常规奇仪组合，无特殊克应格局。</div>`}
      ${extraHtml}
    </div>
    
    <!-- Stems energy status (十二长生与四害) -->
    <div class="interp-card">
      <div class="card-label">十干能量状态 (十二长生与四害)</div>
      <div class="card-desc" style="line-height: 1.6; font-size: 0.82rem;">
        <div style="margin-bottom: 0.5rem; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
          <span style="color: var(--gold-accent); font-weight: bold;">天盘干能量：</span><br>
          ${csTianText}
        </div>
        <div>
          <span style="color: var(--text-secondary); font-weight: bold;">地盘干能量：</span><br>
          ${csDiText}
        </div>
      </div>
    </div>
  `;

  // 6. Synthesis / Combined Auspiciousness
  let overallAuspiciousness = "中平局";
  let analysisSummary = "";

  const dType = doorType;
  const sType = starType;

  if (dType === "吉" && sType === "吉") {
    overallAuspiciousness = "大吉格";
    analysisSummary = "本宫神星门皆显吉相，奇仪组合协调，利于主动出击、推进各项事务，多得贵人及天时相助。";
  } else if (dType === "吉" && sType === "平") {
    overallAuspiciousness = "中吉格";
    analysisSummary = "本宫门吉而星平，利于人事沟通、求财及合作事务。天时中平，按部就班谋划可成。";
  } else if (dType === "吉" && sType === "凶") {
    overallAuspiciousness = "吉凶参半 (门吉星凶)";
    analysisSummary = "本宫人事有利（门吉），但天时阻碍较大（星凶）。适合务实求财、私下联络，不宜声势浩大地开展新事业。";
  } else if (dType === "凶" && sType === "吉") {
    overallAuspiciousness = "吉凶参半 (门凶星吉)";
    analysisSummary = "本宫虽得天时（星吉），但人事不和或多有意外（门凶）。凡事需谨防口舌或受伤折损，多加防范为上。";
  } else if (dType === "凶" && sType === "凶") {
    overallAuspiciousness = "大凶格";
    analysisSummary = "本宫星门皆凶，且奇仪受克，谋事阻力重重。大忌出行、投资、开张，建议静守以避其锋芒。";
  } else {
    overallAuspiciousness = "中平局";
    analysisSummary = "本宫气场均衡，无明显大吉大凶。宜顺其自然，固守本分，不宜冒险。";
  }

  // Add Empty Palace exception
  if (palace.isEmpty) {
    analysisSummary += " 另外，由于本宫处于旬空状态，吉凶之力皆打折扣，谋事多虚无飘渺、难以落地，宜以静制动。";
  }

  html += `
    <div class="interp-card">
      <div class="card-label">宫位吉凶综合研判</div>
      <div class="card-value" style="color: ${overallAuspiciousness.includes("大吉") || overallAuspiciousness.includes("中吉") ? "var(--auspicious)" :
      overallAuspiciousness.includes("大凶") ? "var(--inauspicious)" : "var(--neutral)"
    };">${overallAuspiciousness}</div>
      <div class="card-desc">${analysisSummary}</div>
    </div>
  `;

  document.getElementById("interp-content-body").innerHTML = html;
}

/**
 * Maps Stem names to HSL class colors
 */
function getStemColorClass(stem) {
  let primary = stem || "";
  if (primary.includes("/")) {
    primary = primary.split("/")[0];
  }
  if (["甲", "乙"].includes(primary)) return "el-wood";
  if (["丙", "丁"].includes(primary)) return "el-fire";
  if (["戊", "己"].includes(primary)) return "el-earth";
  if (["庚", "辛"].includes(primary)) return "el-metal";
  if (["壬", "癸"].includes(primary)) return "el-water";
  return "";
}

/**
 * Helper to format stem with Twelve Chang Sheng stages and Ru Mu indicator
 */
function formatStemWithChangSheng(stem, palaceId) {
  if (!stem || palaceId === 5) return stem;
  
  const shortCsMap = {
    '长生':'生', '沐浴':'沐', '冠带':'冠', '临官':'临', '帝旺':'旺',
    '衰':'衰', '病':'病', '死':'死', '墓':'墓', '绝':'绝', '胎':'胎', '养':'养'
  };

  const getCSForSingle = (s) => {
    const branches = QimenEngine.PALACE_BRANCHES[palaceId];
    if (!branches) return "";
    const map = QimenEngine.CHANG_SHENG_MAP[s];
    if (!map) return "";
    let csArr = branches.map(b => {
      let fullCs = map[b] || "";
      return shortCsMap[fullCs] || fullCs;
    }).filter(Boolean);
    // 去重，合并寄宫干带来的相同长生
    csArr = [...new Set(csArr)];
    return csArr.join("");
  };
  
  const processSingleData = (s) => {
    const cs = getCSForSingle(s);
    const isRuMu = QimenEngine.checkRuMu(s, palaceId);
    const isJiXing = QimenEngine.checkJiXing(s, palaceId);
    
    let stemClass = "stem-normal";
    let statusDots = "";
    if (isJiXing) stemClass = "stem-jixing";
    else if (isRuMu) stemClass = "stem-rumu";
    
    if (isRuMu) statusDots += `<span class="stem-status status-rumu" title="入墓"></span>`;
    if (isJiXing) statusDots += `<span class="stem-status status-jixing" title="击刑"></span>`;
    
    return { char: s, cs: cs, class: stemClass, dots: statusDots };
  };
  
  let stemsData = [];
  if (stem.includes("/")) {
    // 反转数组，将客干(寄干)排在左侧外层，主干留在右侧内层
    stemsData = stem.split("/").reverse().map(processSingleData);
  } else {
    stemsData = [processSingleData(stem)];
  }

  // 独立的天干列排版
  let columnsHtml = stemsData.map(d => {
    return `<div class="stem-col">
              <div class="stem-cs-text">${d.cs}</div>
              <div class="stem-char-text ${d.class}">${d.char}${d.dots}</div>
            </div>`;
  }).join("");
  
  return `<div class="stems-group">${columnsHtml}</div>`;
}

/**
 * Maps Element names (from Stars/Doors/Spirits) to HSL class colors
 */
function getElementColorClass(name) {
  for (const [element, list] of Object.entries(QimenEngine.FIVE_ELEMENTS)) {
    if (list.includes(name)) {
      if (element === "木") return "el-wood";
      if (element === "火") return "el-fire";
      if (element === "土") return "el-earth";
      if (element === "金") return "el-metal";
      if (element === "水") return "el-water";
    }
  }
  return "";
}

// ══════════════════════════════════════════════════════════════
// AI CHAT INTERFACE — 赛博大仙打字机流式对话
// ══════════════════════════════════════════════════════════════

let currentChatSessionId = null;
let aiChatController = null;
let qimenChatHistory = []; // 云原生前端记忆中枢

function clearAiChat() {
  if (aiChatController) {
    aiChatController.abort();
    aiChatController = null;
  }
  currentChatSessionId = null;
  qimenChatHistory = []; // 清空记忆
  localStorage.removeItem('qimen_chat_state'); // 清除本地缓存
  const historyEl = document.getElementById("ai-chat-history");
  if (historyEl) historyEl.innerHTML = "";
  openAiChatTab();
}

function saveChatState() {
  if (!currentChatSessionId) return;
  const state = {
    date: document.getElementById("input-date").value,
    time: document.getElementById("input-time").value,
    sessionId: currentChatSessionId,
    history: qimenChatHistory,
    html: document.getElementById("ai-chat-history").innerHTML
  };
  localStorage.setItem('qimen_chat_state', JSON.stringify(state));
}

function openAiChatTab() {
  switchSidebarTab('chat');
  if (!currentChartData) {
    alert("请先排盘后再请求解盘！");
    return;
  }
  
  if (!currentChatSessionId) {
    currentChatSessionId = "session_" + Date.now();
    const pad = (num) => String(num).padStart(2, "0");
    const d = currentChartData.dateTime;
    const timeStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    document.getElementById("ai-chat-history").innerHTML = `
      <div class="chat-msg assistant">
        <div class="chat-bubble">您好，我是您的AI解盘助理。我已经重新读取了最新的排盘图纸（${timeStr}，${currentChartData.dunType}${currentChartData.juNumber}局）。先前的对话已清空，请问您想测算什么事情？</div>
      </div>
    `;
  }
  document.getElementById("ai-chat-input").value = "";
  setTimeout(() => document.getElementById("ai-chat-input").focus(), 100);
}

async function sendAiChat() {
  const inputEl = document.getElementById("ai-chat-input");
  const text = inputEl.value.trim();
  if (!text) return;

  const historyEl = document.getElementById("ai-chat-history");
  
  // 添加用户消息
  const userMsgEl = document.createElement("div");
  userMsgEl.className = "chat-msg user";
  userMsgEl.innerHTML = `<div class="chat-bubble">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
  historyEl.appendChild(userMsgEl);
  
  inputEl.value = "";
  historyEl.scrollTop = historyEl.scrollHeight;
  
  // 添加大仙加载占位
  const aiMsgEl = document.createElement("div");
  aiMsgEl.className = "chat-msg assistant";
  const bubbleEl = document.createElement("div");
  bubbleEl.className = "chat-bubble";
  bubbleEl.innerHTML = "<span class='loading-dots'>思考中...</span>";
  aiMsgEl.appendChild(bubbleEl);
  historyEl.appendChild(aiMsgEl);
  historyEl.scrollTop = historyEl.scrollHeight;
  
  const btnEl = document.querySelector(".ai-chat-send-btn");
  btnEl.disabled = true;
  inputEl.disabled = true;

  try {
      const rawQimenJson = buildAngnetText(currentChartData);
      let aiFullResponse = "";
      
      const parseMarkdown = (text) => {
        let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/^\s*-\s+(.*)/gim, '<li>$1</li>');
        html = html.split('\n').map(line => {
          if (line.match(/^<(h2|h3|li)/)) return line;
          return line + '<br>';
        }).join('');
        return html.replace(/(<br>)*$/, "");
      };
      
      await streamQimenChat(currentChatSessionId, rawQimenJson, text, (chunk) => {
          if (bubbleEl.querySelector('.loading-dots')) {
              bubbleEl.innerHTML = "";
          }
          aiFullResponse += chunk;
          bubbleEl.innerHTML = parseMarkdown(aiFullResponse);
          historyEl.scrollTop = historyEl.scrollHeight;
      });

      // 对话完成后，更新滑动窗口记忆
      qimenChatHistory.push({ role: "user", content: text });
      qimenChatHistory.push({ role: "assistant", content: aiFullResponse });
      // 阀门：仅保留最近 3 轮（6句话）
      if (qimenChatHistory.length > 6) {
          qimenChatHistory = qimenChatHistory.slice(qimenChatHistory.length - 6);
      }
  } catch(e) {
      if (e.name !== 'AbortError') {
          bubbleEl.innerHTML = `<span style='color:#f87171'>天机混乱，通信中断。[${e.message}]</span>`;
      }
  } finally {
      btnEl.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
      saveChatState(); // 每次对话结束后，保存整个网页的状态快照
  }
}

async function streamQimenChat(sessionId, rawQimenJson, userCmd, onChunk) {
    const payload = {
        session_id: sessionId,
        raw_qimen_json: rawQimenJson,
        user_cmd: userCmd,
        history: qimenChatHistory
    };

    aiChatController = new AbortController();

    try {
        const response = await fetch('/api/qimen/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: aiChatController.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: 后端接口未响应`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split('\n');
            buffer = lines.pop(); // 保留最后一行未完整的数据

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '"[DONE]"' || dataStr === "[DONE]") return; 
                    
                    try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed.content) {
                            onChunk(parsed.content);
                        }
                    } catch (e) { }
                }
            }
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Builds the complete structured text for Angnet interpretation
 */
// buildAngnetText is now implemented in forecast.js

// ──────────────────────────────────────────────────────────────
// 手写标记黑板（仅学术排盘模式可用）
// ──────────────────────────────────────────────────────────────
let isDrawingModeActive = false;
let isDrawing = false;
let penColor = "#ef4444"; // 默认荧光红
let penWidth = 3;
let lastX = 0;
let lastY = 0;

function initDrawingBoard() {
  const canvas = document.getElementById("qimen-canvas");
  if (!canvas) return;

  const startDrawing = (e) => {
    if (!isDrawingModeActive) return;
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    lastX = clientX - rect.left;
    lastY = clientY - rect.top;
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawingModeActive) return;
    
    // 如果是触摸事件，防止屏幕滚动干扰书写
    if (e.touches) {
      e.preventDefault();
    }
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  };

  const stopDrawing = () => {
    isDrawing = false;
  };

  // 绑定鼠标事件
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // 绑定移动端触摸事件
  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);

  // 绑定窗口尺寸变化
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  const canvas = document.getElementById("qimen-canvas");
  if (!canvas) return;
  const container = document.getElementById("nine-grid-container");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // 备份原内容以防重置尺寸时丢失笔迹
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width || 1;
  tempCanvas.height = canvas.height || 1;
  const tempCtx = tempCanvas.getContext("2d");
  if (canvas.width > 0 && canvas.height > 0) {
    tempCtx.drawImage(canvas, 0, 0);
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = penColor;
  ctx.lineWidth = penWidth;
  
  // 优质荧光发光质感
  ctx.shadowBlur = 4;
  ctx.shadowColor = penColor;

  // 恢复之前绘制的笔迹
  ctx.drawImage(tempCanvas, 0, 0, width, height);
}

function toggleDrawingMode(forceState) {
  const canvas = document.getElementById("qimen-canvas");
  const btn = document.getElementById("btn-toggle-draw");
  if (!canvas || !btn) return;

  if (forceState !== undefined) {
    isDrawingModeActive = forceState;
  } else {
    isDrawingModeActive = !isDrawingModeActive;
  }

  if (isDrawingModeActive) {
    canvas.classList.add("drawing-active");
    btn.classList.add("active");
    btn.textContent = "🚫 禁用画笔";
    resizeCanvas();
  } else {
    canvas.classList.remove("drawing-active");
    btn.classList.remove("active");
    btn.textContent = "✏️ 开启画笔";
    isDrawing = false;
  }
}

function clearDrawingBoard() {
  const canvas = document.getElementById("qimen-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changePenColor(color) {
  penColor = color;
  const canvas = document.getElementById("qimen-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
  }

  // 更新按钮高亮样式
  const dots = document.querySelectorAll(".color-dot");
  dots.forEach(dot => {
    if (dot.getAttribute("onclick").includes(color)) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

// ==========================================
// SPA ROUTING & LOGIN (Layer A, B, C)
// ==========================================

function switchView(viewId) {
  document.querySelectorAll('.view-layer').forEach(layer => {
    layer.classList.remove('active');
  });
  const target = document.getElementById('view-' + viewId);
  if (target) {
    target.classList.add('active');
  }
}

function attemptLogin() {
  let user = document.getElementById('login-username').value;
  let pwd = document.getElementById('login-password').value;
  
  if (user === 'jinb343' && pwd === 'jinb343') {
    switchView('input');
  } else {
    alert('用户名或密码错误，请重新输入');
  }
}

function attemptLoginSplash() {
  document.getElementById('login-password').value = '8888';
  attemptLogin();
}

// Patch triggerCalculate to automatically switch to result view
const originalTriggerCalculate = window.triggerCalculate;
window.triggerCalculate = function(isRestoring = false) {
  if (originalTriggerCalculate) originalTriggerCalculate(isRestoring);
  switchView('result');
};

