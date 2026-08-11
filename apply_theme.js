const fs = require('fs');
let css = fs.readFileSync('index.css', 'utf8');

// 1. 替换 :root
const rootRegex = /:root\s*\{[\s\S]*?\}/;
const newRoot = `:root {
  /* Neumorphism 灰金蓝体系 (Neumorphic Ash & Ice) */
  --bg-color: #1e2025; 
  --bg-gradient: none;
  --panel-bg: #272932;
  
  --border-color: rgba(255, 255, 255, 0.04);
  --border-glow: rgba(96, 165, 250, 0.3);
  
  /* Accent Colors */
  --gold-accent: #e2c38d;
  --gold-light: #fbeaca;
  --blue-accent: #60a5fa;
  --blue-glow: rgba(96, 165, 250, 0.25);
  
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  
  /* 拟态光影核心 Tokens */
  --neu-outer-shadow: 6px 6px 14px rgba(0, 0, 0, 0.45), -4px -4px 12px rgba(255, 255, 255, 0.03);
  --neu-inner-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.03);
  --neu-surface-glow: inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 -1px 1px rgba(0, 0, 0, 0.4);
  
  /* 五行降噪色 (适配灰调) */
  --element-wood: #4ade80;
  --element-fire: #f87171;
  --element-earth: #fbbf24;
  --element-metal: #cbd5e1;
  --element-water: #60a5fa;
  
  --auspicious: #34d399;
  --inauspicious: #fb7185;
  --neutral: #a78bfa;
  
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`;
css = css.replace(rootRegex, newRoot);

// 2. 替换 body::before 星空特效为边缘微光
const bgRegex = /body::before\s*\{[\s\S]*?z-index:\s*0;\n\}/;
const newBg = `body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at top left, rgba(96,165,250,0.06), transparent 50%),
    radial-gradient(circle at bottom right, rgba(226,195,141,0.06), transparent 50%);
  pointer-events: none;
  z-index: 0;
}`;
if(css.match(bgRegex)) css = css.replace(bgRegex, newBg);
else console.log('Bg regex not found');

// 3. 替换 .glass-panel
const glassRegex = /\.glass-panel\s*\{[\s\S]*?\}\n\n\.glass-panel:hover\s*\{[\s\S]*?\}/;
const newGlass = `.glass-panel {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all var(--transition-normal);
}

.glass-panel:hover {
  box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.5), -4px -4px 12px rgba(255, 255, 255, 0.04), var(--neu-surface-glow);
}`;
if(css.match(glassRegex)) css = css.replace(glassRegex, newGlass);
else console.log('Glass regex not found');

// 4. 替换 Inputs
const inputRegex = /input\[type="date"\],[\s\S]*?select:focus\s*\{[\s\S]*?\}/;
const newInput = `input[type="date"],
input[type="time"],
select {
  background: #1a1b20;
  border: 1px solid transparent;
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  box-shadow: var(--neu-inner-shadow);
  transition: all var(--transition-fast);
}

input[type="date"]:focus,
input[type="time"]:focus,
select:focus {
  border-color: rgba(96, 165, 250, 0.3);
  box-shadow: var(--neu-inner-shadow), 0 0 0 1px rgba(96, 165, 250, 0.1);
}`;
if(css.match(inputRegex)) css = css.replace(inputRegex, newInput);
else console.log('Input regex not found');

// 5. 替换 Buttons
const btnRegex = /button\.btn\s*\{[\s\S]*?\}\n\nbutton\.btn:hover\s*\{[\s\S]*?\}/;
const newBtn = `button.btn {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow);
  transition: all var(--transition-fast);
}

button.btn:hover {
  color: var(--text-primary);
  box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.5), -2px -2px 8px rgba(255, 255, 255, 0.05), var(--neu-surface-glow);
}
button.btn:active {
  box-shadow: var(--neu-inner-shadow);
  transform: translateY(1px);
}`;
if(css.match(btnRegex)) css = css.replace(btnRegex, newBtn);
else console.log('btn regex not found');

// 6. 替换 Primary Button
const btnPrimaryRegex = /button\.btn-primary\s*\{[\s\S]*?\}\n\nbutton\.btn-primary:hover\s*\{[\s\S]*?\}/;
const newBtnPrimary = `button.btn-primary {
  background: var(--panel-bg);
  color: var(--blue-accent);
  border: 1px solid rgba(96, 165, 250, 0.2);
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow), 0 0 12px var(--blue-glow);
}

button.btn-primary:hover {
  background: #2a2d36;
  color: #93c5fd;
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow), 0 0 20px rgba(96, 165, 250, 0.4);
}`;
if(css.match(btnPrimaryRegex)) css = css.replace(btnPrimaryRegex, newBtnPrimary);
else console.log('btn primary regex not found');

// 7. 替换 Angnet Button
const angnetRegex = /button\.btn-angnet\s*\{[\s\S]*?button\.btn-angnet:hover::before\s*\{[\s\S]*?\}/;
const newAngnet = `button.btn-angnet {
  background: var(--panel-bg);
  border: 1px solid rgba(226, 195, 141, 0.2);
  color: var(--gold-accent);
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow), 0 0 12px rgba(226, 195, 141, 0.1);
}

button.btn-angnet:hover {
  color: var(--gold-light);
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow), 0 0 20px rgba(226, 195, 141, 0.25);
}`;
if(css.match(angnetRegex)) css = css.replace(angnetRegex, newAngnet);
else console.log('angnet regex not found');

// 8. 替换 Palace Card
const palaceRegex = /\.palace-card\s*\{[\s\S]*?overflow:\s*hidden;\n\}/;
const newPalace = `.palace-card {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
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
else console.log('palace card regex not found');

const palaceHoverRegex = /\.palace-card::before\s*\{[\s\S]*?\}\n\n\.palace-card:hover\s*\{[\s\S]*?\}/;
const newPalaceHover = `.palace-card::before {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 20px var(--gold-glow);
  opacity: 0;
  transition: opacity var(--transition-normal);
  z-index: 0;
  pointer-events: none;
}

.palace-card:hover {
  box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.04), var(--neu-surface-glow);
  border-color: rgba(226, 195, 141, 0.3);
}`;
if(css.match(palaceHoverRegex)) css = css.replace(palaceHoverRegex, newPalaceHover);
else console.log('palace hover regex not found');

// 9. 替换中五宫
const centerRegex = /\.palace-center\s*\{[\s\S]*?gap:\s*0\.5rem;\n\}/;
const newCenter = `.palace-center {
  background: #1e2025;
  box-shadow: var(--neu-inner-shadow);
  border: 1px solid rgba(0,0,0,0.2);
  cursor: default;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}`;
if(css.match(centerRegex)) css = css.replace(centerRegex, newCenter);
else console.log('palace center regex not found');

fs.writeFileSync('index.css', css, 'utf8');
console.log('Done CSS Theme Updates');
