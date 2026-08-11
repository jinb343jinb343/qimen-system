const fs = require('fs');

// ==== 修复 CSS ====
let css = fs.readFileSync('index.css', 'utf8');

// 清理上一版的冗余
const cssTargetToRemove = `/* 天干地干排版 (右侧垂直堆叠) */
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
.status-jixing { background: #a855f7; box-shadow: 0 0 4px #a855f7; }`;

const cssReplacement = `/* 天干地干独立弹性列排版 */
.tian-stem-wrapper, .di-stem-wrapper {
  display: flex;
  justify-content: flex-end;
}

.stems-group {
  display: flex;
  flex-direction: row;
  gap: 0.45rem; /* 寄宫天干之间的距离 */
}

.stem-col {
  display: flex;
  flex-direction: column;
  align-items: center; /* 居中对齐长生和天干 */
  justify-content: flex-end;
}

.stem-cs-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.1;
  margin-bottom: 0.2rem;
  white-space: nowrap; /* 防止长生状态挤压换行 */
}

.tian-stem-wrapper .stem-char-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.1;
  position: relative; /* 挂载状态圆点 */
}

.di-stem-wrapper .stem-char-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-secondary);
  line-height: 1.1;
  position: relative;
}

/* 极简状态圆点 */
.stem-status {
  position: absolute;
  top: -2px;
  right: -8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-rumu { background: #c48b58; box-shadow: 0 0 4px #c48b58; }
.status-jixing { background: #a855f7; box-shadow: 0 0 4px #a855f7; }`;

css = css.replace(cssTargetToRemove, cssReplacement);

// 修复 badge-tag 导致星门换行的问题，把它改成 inline 或者极简
const badgeFixRegex = /\.badge-tag\s*\{[^}]+\}/g;
if(!css.match(badgeFixRegex)) {
   css += `\n.badge-tag { font-size: 0.7rem; padding: 0.1rem 0.2rem; border-radius: 3px; border: 1px solid currentColor; margin-left: 0.2rem; white-space: nowrap; }`;
}

fs.writeFileSync('index.css', css, 'utf8');

// ==== 修复 app.js ====
let js = fs.readFileSync('static_js/app.js', 'utf8');

const jsTarget = `function formatStemWithChangSheng(stem, palaceId) {
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

const jsReplacement = `function formatStemWithChangSheng(stem, palaceId) {
  if (!stem || palaceId === 5) return stem;
  
  const getCSForSingle = (s) => {
    const branches = QimenEngine.PALACE_BRANCHES[palaceId];
    if (!branches) return "";
    const map = QimenEngine.CHANG_SHENG_MAP[s];
    if (!map) return "";
    let csArr = branches.map(b => map[b] || "").filter(Boolean);
    // 数组去重并用斜杠分割（避免比如两个支都有冠带的情况）
    csArr = [...new Set(csArr)];
    return csArr.join("/");
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

  // 独立的天干列
  let columnsHtml = stemsData.map(d => {
    return \`<div class="stem-col">
              <div class="stem-cs-text">\${d.cs}</div>
              <div class="stem-char-text \${d.class}">\${d.char}\${d.dots}</div>
            </div>\`;
  }).join("");
  
  return \`<div class="stems-group">\${columnsHtml}</div>\`;
}`;

js = js.replace(jsTarget, jsReplacement);

// 修复星门中多余的 display:block 和换行
const starTarget = `      if (isZhiFuStar) {
        starText += \`<span class="badge-tag tag-zhifu" style="margin-left:0.2rem;">符</span>\`;
      }
      const starWang = QimenEngine.getStarWang(palaceData.star, chart.monthBranchIdx);
      if (starWang) {
        starText += \`<span class="star-wang-text star-stage-\${starWang}">(\${starWang})</span>\`;
      }`;
const starReplacement = `      if (isZhiFuStar) {
        starText += \`<span class="badge-tag tag-zhifu" style="display:inline-block; margin-left:0.2rem; transform: scale(0.9);">符</span>\`;
      }
      const starWang = QimenEngine.getStarWang(palaceData.star, chart.monthBranchIdx);
      if (starWang) {
        starText += \`<span class="star-wang-text star-stage-\${starWang}" style="display:inline-block; margin-left:0.2rem;">(\${starWang})</span>\`;
      }`;

js = js.replace(starTarget, starReplacement);

fs.writeFileSync('static_js/app.js', js, 'utf8');
console.log('Final Polish done');`;
