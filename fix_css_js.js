const fs = require('fs');

// ==== 修复 CSS ====
let css = fs.readFileSync('index.css', 'utf8');

const cssTarget1 = `.palace-card {
  background: rgba(15, 19, 46, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;
}`;

const cssReplacement1 = `.palace-card {
  background: rgba(15, 19, 46, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;
  overflow: hidden;
}`;

const cssTarget2 = `/* Palace inner components */
.palace-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.palace-mid-left {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  margin: auto 0;
}

.palace-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  flex: 1.2;
  min-width: 0;
  text-align: right;
}`;

const cssReplacement2 = `/* Palace inner components */
.palace-meta-bg {
  position: absolute;
  bottom: 0.75rem;
  right: 1rem;
  text-align: right;
  opacity: 0.12;
  z-index: 0;
  pointer-events: none;
}
.palace-meta-bg .palace-gua { font-size: 1.1rem; font-weight: bold; color: var(--text-secondary); display: block; }
.palace-meta-bg .palace-name { font-size: 0.8rem; color: var(--text-muted); }

.palace-top, .palace-mid, .palace-bottom {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.palace-top {
  align-items: flex-start;
  height: 24px;
}

.palace-mid {
  align-items: center;
  margin: auto 0;
}

.palace-bottom {
  align-items: flex-end;
}

.palace-star-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}`;

const cssTarget3 = `.palace-stems {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
  line-height: 1.1;
  gap: 0.4rem;
}

.tian-stem {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.di-stem {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.an-stem {
  color: var(--text-muted);
}

.stem-normal {
  /* No special color */
}`;

const cssReplacement3 = `/* 天干地干排版 (右侧垂直堆叠) */
.tian-stem-wrapper, .di-stem-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stem-char-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: flex-end;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.di-stem-wrapper .stem-char-row {
  font-size: 1.15rem;
  color: var(--text-secondary);
}

.stem-cs-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: flex-end;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
  line-height: 1;
}

/* 状态标签圆点 */
.stem-status {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 2px;
  vertical-align: super;
}
.status-rumu { background: #c48b58; box-shadow: 0 0 4px #c48b58; }
.status-jixing { background: #a855f7; box-shadow: 0 0 4px #a855f7; }

.an-stem {
  color: rgba(255,255,255,0.4);
}

.stem-normal {
  /* No special color */
}`;

css = css.replace(cssTarget1, cssReplacement1)
         .replace(cssTarget2, cssReplacement2)
         .replace(cssTarget3, cssReplacement3);
fs.writeFileSync('index.css', css, 'utf8');
console.log('CSS replace done');

// ==== 修复 app.js ====
let js = fs.readFileSync('static_js/app.js', 'utf8');

const jsTarget1 = `      let starText = palaceData.star;
      
      // 处理双星换行 (例如：天芮+天禽)
      if (starText.includes("+")) {
        const [s1, s2] = starText.split("+");
        starText = \`\${s1}<div style="font-size: 0.75em; opacity: 0.85; margin-top: 0.1rem; line-height: 1;">\${s2}</div>\`;
      }

      if (isZhiFuStar) {
        starText += \`<span class="badge-tag tag-zhifu" style="margin-top:0.2rem;">符</span>\`;
      }
      const starWang = QimenEngine.getStarWang(palaceData.star, chart.monthBranchIdx);
      if (starWang) {
        starText += \`<div class="star-wang-text star-stage-\${starWang}" style="margin-left:0; margin-top:0.15rem;">(\${starWang})</div>\`;
      }`;

const jsReplacement1 = `      let starText = palaceData.star;
      
      // 还原经典排版，双星同行
      if (starText.includes("+")) {
        const [s1, s2] = starText.split("+");
        starText = \`\${s1.replace('天', '')}\${s2.replace('天', '')}\`;
      }

      if (isZhiFuStar) {
        starText += \`<span class="badge-tag tag-zhifu" style="margin-left:0.2rem;">符</span>\`;
      }
      const starWang = QimenEngine.getStarWang(palaceData.star, chart.monthBranchIdx);
      if (starWang) {
        starText += \`<span class="star-wang-text star-stage-\${starWang}">(\${starWang})</span>\`;
      }`;


const jsTarget2 = `function formatStemWithChangSheng(stem, palaceId) {
  if (!stem || palaceId === 5) return stem;
  
  const getCSForSingle = (s) => {
    const branches = QimenEngine.PALACE_BRANCHES[palaceId];
    if (!branches) return "";
    const map = QimenEngine.CHANG_SHENG_MAP[s];
    if (!map) return "";
    return branches.map(b => map[b] || "").filter(Boolean).join("/");
  };
  
  const processSingle = (s) => {
    const cs = getCSForSingle(s);
    const isRuMu = QimenEngine.checkRuMu(s, palaceId);
    const isJiXing = QimenEngine.checkJiXing(s, palaceId);
    
    let stemClass = "stem-normal";
    if (isJiXing) {
      stemClass = "stem-jixing";
    } else if (isRuMu) {
      stemClass = "stem-rumu";
    }
    
    const csHtml = cs ? \`<span class="cs-text" style="margin-left: 0; margin-bottom: 2px; display: block; text-align: center; line-height: 1;">\${cs}</span>\` : "";
    
    let stemWrapper = \`<span class="\${stemClass}">\${s}</span>\`;
    if (isRuMu) {
      stemWrapper += \`<span class="badge-tag tag-rumu">墓</span>\`;
    }
    if (isJiXing) {
      stemWrapper += \`<span class="badge-tag tag-jixing">刑</span>\`;
    }
    
    return \`<div style="display: inline-flex; flex-direction: column; align-items: center; justify-content: flex-end; vertical-align: bottom;">
      \${csHtml}
      <div style="display: inline-flex; align-items: center;">\${stemWrapper}</div>
    </div>\`;
  };
  
  if (stem.includes("/")) {
    const parts = stem.split("/");
    const mainHtml = processSingle(parts[0]);
    const guestHtml = processSingle(parts[1]);
    return \`<div style="display: inline-flex; align-items: flex-end; gap: 0.2rem; white-space: nowrap;">\${guestHtml}\${mainHtml}</div>\`;
  }
  return processSingle(stem);
}`;

const jsReplacement2 = `function formatStemWithChangSheng(stem, palaceId) {
  if (!stem || palaceId === 5) return stem;
  
  const getCSForSingle = (s) => {
    const branches = QimenEngine.PALACE_BRANCHES[palaceId];
    if (!branches) return "";
    const map = QimenEngine.CHANG_SHENG_MAP[s];
    if (!map) return "";
    return branches.map(b => map[b] || "").filter(Boolean).join("");
  };
  
  const processSingleData = (s) => {
    const cs = getCSForSingle(s);
    const isRuMu = QimenEngine.checkRuMu(s, palaceId);
    const isJiXing = QimenEngine.checkJiXing(s, palaceId);
    
    let stemClass = "stem-normal";
    let statusDots = "";
    if (isJiXing) stemClass = "stem-jixing";
    else if (isRuMu) stemClass = "stem-rumu";
    
    if (isRuMu) statusDots += \`<span class="stem-status status-rumu" title="入墓"></span>\`;
    if (isJiXing) statusDots += \`<span class="stem-status status-jixing" title="击刑"></span>\`;
    
    return { char: s, cs: cs, class: stemClass, dots: statusDots };
  };
  
  let stemsData = [];
  if (stem.includes("/")) {
    stemsData = stem.split("/").map(processSingleData);
  } else {
    stemsData = [processSingleData(stem)];
  }

  // 构建统一结构
  let csHtml = stemsData.map(d => \`<span style="display:inline-block; width:1.2em; text-align:center;">\${d.cs}</span>\`).join("");
  let charHtml = stemsData.map(d => \`<span class="\${d.class}" style="position:relative; display:inline-block; width:1em; text-align:center;">\${d.char}\${d.dots}</span>\`).join("");
  
  return \`<div class="stem-cs-row">\${csHtml}</div>
          <div class="stem-char-row">\${charHtml}</div>\`;
}`;

js = js.replace(jsTarget1, jsReplacement1)
       .replace(jsTarget2, jsReplacement2);
fs.writeFileSync('static_js/app.js', js, 'utf8');
console.log('JS replace done');
