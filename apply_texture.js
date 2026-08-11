const fs = require('fs');
let css = fs.readFileSync('index.css', 'utf8');

// 1. 完全重写 :root
const rootRegex = /:root\s*\{[\s\S]*?\}/;
const newRoot = `:root {
  /* 极致高级拟态 (High-End Texture Neumorphism) */
  --bg-color: #1a1c23;
  --bg-gradient: linear-gradient(135deg, #1f212a 0%, #13141a 100%);
  
  --panel-bg: linear-gradient(145deg, #2a2d39 0%, #1e2029 100%);
  --panel-bg-hover: linear-gradient(145deg, #2d313d 0%, #22242e 100%);
  
  --border-color: rgba(255, 255, 255, 0.03);
  --border-glow: rgba(96, 165, 250, 0.5);
  
  /* Accent Colors: 冰蓝 & 沙金 */
  --gold-accent: #dcb37b;
  --gold-light: #f4dcb5;
  --gold-glow: rgba(220, 179, 123, 0.3);
  
  --blue-accent: #60a5fa;
  --blue-glow: rgba(96, 165, 250, 0.35);
  
  /* 文字层级与光影 */
  --text-primary: #f3f4f6;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;
  
  /* 雕刻字体阴影 (内嵌感) */
  --text-inset: 1px 1px 1px rgba(255,255,255,0.1), -1px -1px 1px rgba(0,0,0,0.8);
  /* 发光字体阴影 (灵动感) */
  --text-glow: 0 0 12px rgba(255,255,255,0.25);
  
  /* 多层灵动光影 (精细打磨边缘) */
  /* 外层：左上弱光 + 右下深影，带来浮雕体积感 */
  --neu-outer-shadow: 
    10px 10px 24px rgba(0, 0, 0, 0.55), 
    -6px -6px 16px rgba(110, 120, 150, 0.04);
  
  /* 表面光泽：极细的 1px 边缘切角高光 */
  --neu-surface-glow: 
    inset 1px 1px 2px rgba(255, 255, 255, 0.08), 
    inset -1px -1px 2px rgba(0, 0, 0, 0.3);
    
  /* 深度内凹 (按压/中五宫) */
  --neu-inner-shadow: 
    inset 6px 6px 12px rgba(0, 0, 0, 0.6), 
    inset -4px -4px 10px rgba(120, 130, 160, 0.05);

  --transition-fast: 0.2s cubic-bezier(0.2, 0, 0, 1);
  --transition-normal: 0.35s cubic-bezier(0.2, 0, 0, 1);
}`;
css = css.replace(rootRegex, newRoot);

// 2. 注入全局噪点与氛围背景光
const bodyBeforeRegex = /body::before\s*\{[\s\S]*?z-index:\s*0;\n\}/;
const newBodyBg = `body::before {
  content: "";
  position: fixed;
  top: -20%; left: -20%; width: 140%; height: 140%;
  background: 
    radial-gradient(circle at 10% 20%, rgba(96, 165, 250, 0.07) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(220, 179, 123, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 50% 100%, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)"/></svg>');
  opacity: 0.04; 
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
}`;
if(css.match(bodyBeforeRegex)) {
  css = css.replace(bodyBeforeRegex, newBodyBg);
} else {
  // Try finding body block and append
  css = css.replace(/body\s*\{[\s\S]*?\}/, match => match + '\n\n' + newBodyBg);
}

// 3. 增强宫位卡片的层次与色彩对比
const palaceRegex = /\.palace-card\s*\{[\s\S]*?overflow:\s*hidden;\n\}/;
const newPalace = `.palace-card {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  cursor: pointer;
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow);
  transition: all var(--transition-normal);
  user-select: none;
  overflow: hidden;
}`;
if(css.match(palaceRegex)) css = css.replace(palaceRegex, newPalace);

const newPalaceHover = `.palace-card:hover {
  background: var(--panel-bg-hover);
  transform: translateY(-2px);
  box-shadow: 
    14px 14px 30px rgba(0, 0, 0, 0.7), 
    -6px -6px 18px rgba(110, 120, 150, 0.06), 
    var(--neu-surface-glow),
    0 0 0 1px rgba(220, 179, 123, 0.15);
}`;
css = css.replace(/\.palace-card:hover\s*\{[\s\S]*?\}/, newPalaceHover);

// 4. 重做中五宫 (内嵌风)
const centerRegex = /\.palace-center\s*\{[\s\S]*?gap:\s*0\.5rem;\n\}/;
const newCenter = `.palace-center {
  background: linear-gradient(145deg, #1c1d24 0%, #16171d 100%);
  box-shadow: var(--neu-inner-shadow);
  border: 1px solid rgba(0,0,0,0.5);
  cursor: default;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 0.5rem;
}`;
if(css.match(centerRegex)) css = css.replace(centerRegex, newCenter);

css = css.replace(/\.palace-center:hover\s*\{[\s\S]*?\}/, `.palace-center:hover {
  transform: none;
  background: linear-gradient(145deg, #1c1d24 0%, #16171d 100%);
  box-shadow: var(--neu-inner-shadow), inset 0 0 0 1px rgba(220,179,123,0.1);
}`);

// 5. 让字体光影更灵动 (加上雕刻感或发光感)
// 对宫位名称、神星门增加微光
css += `
.palace-spirit, .palace-door, .palace-star {
  text-shadow: var(--text-glow);
}
.palace-name, .center-info {
  text-shadow: var(--text-inset);
}
.tian-stem-wrapper .stem-char-text {
  background: linear-gradient(to bottom, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.8));
}
.di-stem-wrapper .stem-char-text {
  background: linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.9));
}
`;

fs.writeFileSync('index.css', css, 'utf8');
console.log('Deep Texture Theme Applied Successfully');
