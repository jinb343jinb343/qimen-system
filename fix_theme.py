import re
import os

with open('theme-neu.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the badge-kong, badge-ma block which was the original end
match = re.search(r'\.badge-kong,\s*\.badge-ma\s*\{.*?height:\s*16px;\s*\}', content, re.DOTALL)
if match:
    idx = match.end()
    # The next character might be the closing bracket for the @media query
    idx_close = content.find('}', idx)
    base_css = content[:idx_close + 1]
    
    new_overrides = """

/* === NEW THEME OVERRIDES (HIGH-END RESIN NEUMORPHISM) === */
:root {
  /* Slate Grey Texture Base */
  --bg-color: #24262c;
  --bg-gradient: linear-gradient(135deg, #2d3038 0%, #181a1f 100%);
  
  /* Convex Panels (Cards) */
  --panel-bg: linear-gradient(145deg, #363943 0%, #25282f 100%);
  --panel-bg-hover: linear-gradient(145deg, #3c404a 0%, #2a2e36 100%);
  
  /* Concave Inputs */
  --input-bg: #1d1f25;
  
  /* Deep Blue Buttons */
  --btn-bg: linear-gradient(180deg, #3b4d68 0%, #293649 100%);
  --btn-bg-hover: linear-gradient(180deg, #445978 0%, #303f56 100%);
  --btn-bg-active: linear-gradient(180deg, #222d3e 0%, #1a222f 100%);
  
  /* Cyber Ice Blue & Warm Gold */
  --gold-accent: #e6c896;
  --blue-accent: #5090ff;
  --cyan-glow: rgba(80, 144, 255, 0.45);
  
  /* Resin Shadows & Edge Highlights (Convex) */
  --neu-outer-shadow: 10px 10px 22px rgba(0, 0, 0, 0.75), -5px -5px 16px rgba(255, 255, 255, 0.04);
  --neu-surface-glow: inset 0 1.5px 2px rgba(255, 255, 255, 0.22);
  
  /* Deep Trench Shadows (Concave) */
  --neu-inner-shadow: inset 4px 4px 10px rgba(0, 0, 0, 0.8), inset -2px -2px 6px rgba(255, 255, 255, 0.03);
  
  /* Text */
  --text-primary: #e2e4e9;
  --text-secondary: #9497a0;
}

/* 1. 全局背景与材质（沉浸式磨砂灰黑 + 暖金环境光） */
body {
  background-color: var(--bg-color) !important;
  background-image: var(--bg-gradient) !important;
  color: var(--text-primary) !important;
}

body::before {
  content: "" !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 90vw !important;
  height: 90vh !important;
  background: radial-gradient(circle, rgba(230, 200, 150, 0.08) 0%, transparent 65%) !important;
  pointer-events: none !important;
  z-index: 0 !important;
}

/* 强烈的全屏相纸噪点材质，极大地提升高级感 */
body::after {
  content: "" !important;
  position: fixed !important;
  inset: 0 !important;
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)"/></svg>') !important;
  opacity: 0.07 !important;
  pointer-events: none !important;
  z-index: 9999 !important;
  mix-blend-mode: overlay !important;
}

/* 2. 主体容器发出逆光 */
.container { position: relative; z-index: 1; }

.nine-grid {
  position: relative;
  /* 凹陷的战术沙盘托盘 */
  background: var(--input-bg) !important;
  border-radius: 32px !important;
  padding: 1.5rem !important;
  gap: 1.5rem !important;
  box-shadow: inset 10px 10px 25px rgba(0,0,0,0.8), inset -4px -4px 12px rgba(255,255,255,0.02), 0 0 60px 10px rgba(212, 175, 55, 0.05) !important;
  border: 1px solid rgba(0,0,0,0.5) !important;
}

/* 3. 卡片与玻璃面板的高级切割感 (树脂拟态) */
.palace-card, .glass-panel, .pillar-card {
  background: var(--panel-bg) !important;
  border: 1px solid rgba(0,0,0,0.7) !important; 
  border-radius: 20px !important; 
  box-shadow: var(--neu-outer-shadow), var(--neu-surface-glow) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.palace-card:hover {
  transform: translateY(-2px) !important;
  background: var(--panel-bg-hover) !important;
  box-shadow: 12px 12px 28px rgba(0, 0, 0, 0.8), -6px -6px 20px rgba(255, 255, 255, 0.05), var(--neu-surface-glow) !important;
}

/* 4. 极致的焦点冰蓝光环 (Focus/Selected) */
.palace-card.selected {
  background: #1e2128 !important;
  border-color: transparent !important;
  box-shadow: var(--neu-inner-shadow), 0 0 0 1.5px var(--blue-accent), 0 0 18px var(--cyan-glow) !important;
}

/* 中五宫极深凹陷槽 */
.palace-center {
  background: var(--input-bg) !important;
  box-shadow: var(--neu-inner-shadow) !important;
  border: 1px solid rgba(255,255,255,0.02) !important;
}
.palace-center:hover {
  transform: none !important;
  box-shadow: var(--neu-inner-shadow), inset 0 0 0 1px rgba(230, 200, 150, 0.15) !important;
}

/* 5. 交互控件：输入框凹陷，按钮凸起 */
input[type="date"], input[type="time"], select {
  background: var(--input-bg) !important;
  border: 1px solid rgba(0,0,0,0.8) !important;
  border-radius: 10px !important;
  box-shadow: var(--neu-inner-shadow) !important;
  color: var(--text-primary) !important;
  padding: 0.6rem 1rem !important;
  transition: all 0.2s ease !important;
}

input[type="date"]:focus, input[type="time"]:focus, select:focus {
  outline: none !important;
  box-shadow: var(--neu-inner-shadow), 0 0 0 1.5px var(--blue-accent), 0 0 15px var(--cyan-glow) !important;
  border-color: transparent !important;
}

/* 深邃暗夜蓝按钮 (Slate Blue Buttons) */
button.btn {
  background: var(--btn-bg) !important;
  box-shadow: 6px 6px 15px rgba(0,0,0,0.6), -3px -3px 10px rgba(255,255,255,0.04), var(--neu-surface-glow) !important;
  border: 1px solid rgba(0,0,0,0.6) !important;
  border-radius: 12px !important;
  color: var(--text-primary) !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  transition: all 0.2s ease !important;
}
button.btn:hover {
  background: var(--btn-bg-hover) !important;
  box-shadow: 8px 8px 18px rgba(0,0,0,0.7), -4px -4px 12px rgba(255,255,255,0.05), var(--neu-surface-glow) !important;
}
button.btn.active, button.btn:active {
  background: var(--btn-bg-active) !important;
  box-shadow: var(--neu-inner-shadow) !important;
  color: var(--blue-accent) !important;
  border-top-color: rgba(0,0,0,0.9) !important;
}
button.btn-primary {
  color: var(--gold-accent) !important;
  border-bottom-color: rgba(230, 200, 150, 0.2) !important;
}

/* 6. 排版与对齐修缮 */
.tian-stem-wrapper, .di-stem-wrapper { display: flex !important; justify-content: flex-end !important; }
.stems-group { display: flex !important; flex-direction: row !important; gap: 0.45rem !important; }
.stem-col { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: flex-end !important; }
.stem-cs-text { font-size: 0.65rem !important; line-height: 1 !important; margin-bottom: 0.25rem !important; color: #71717a !important; font-weight: 500 !important; white-space: nowrap !important; }
.tian-stem-wrapper .stem-char-text { font-size: 1.4rem !important; font-weight: 700 !important; line-height: 1.1 !important; position: relative !important; text-shadow: 0 0 10px rgba(255,255,255,0.15) !important; color: #ffffff !important; }
.di-stem-wrapper .stem-char-text { font-size: 1.15rem !important; font-weight: 700 !important; line-height: 1.1 !important; position: relative !important; color: var(--text-secondary) !important; }

.palace-star-group { display: flex !important; align-items: center !important; position: relative !important; }
.palace-star { display: flex !important; flex-direction: row !important; align-items: center !important; text-shadow: 0 0 8px rgba(255,255,255,0.1) !important; }
.an-stem { position: absolute !important; right: 100% !important; margin-right: 0.3rem !important; font-size: 0.75rem !important; font-weight: 700 !important; color: #71717a !important; opacity: 0.85 !important; }

.palace-top, .palace-mid, .palace-bottom { align-items: center !important; justify-content: space-between !important; margin-left: 0 !important; }
.palace-card { padding: 0.85rem 1rem 0.85rem 1.8rem !important; }
.palace-meta-bg { display: none !important; }
.palace-door { margin-left: 0 !important; text-shadow: 0 0 8px rgba(255,255,255,0.15) !important; }
.palace-spirit { text-shadow: 0 0 8px rgba(255,255,255,0.1) !important; color: var(--gold-accent) !important; }

/* 7. 吉凶色彩重铸 (适配暗黑极简) */
.door-吉 { color: var(--auspicious) !important; text-shadow: 0 0 8px rgba(16, 185, 129, 0.4) !important; }
.door-凶 { color: var(--inauspicious) !important; text-shadow: 0 0 8px rgba(244, 63, 94, 0.4) !important; }
.star-吉 { color: var(--auspicious) !important; text-shadow: 0 0 8px rgba(16, 185, 129, 0.4) !important; }
.star-凶 { color: var(--inauspicious) !important; text-shadow: 0 0 8px rgba(244, 63, 94, 0.4) !important; }
.status-rumu { background: #eab308 !important; box-shadow: 0 0 8px rgba(234, 179, 8, 0.6) !important; }
.status-jixing { background: #d946ef !important; box-shadow: 0 0 8px rgba(217, 70, 239, 0.6) !important; }

/* 8. 移动端强制修复 (Mobile Responsive Overrides) */
@media (max-width: 600px) {
  .nine-grid {
    gap: 0.4rem !important;
    padding: 0.5rem !important;
    border-radius: 20px !important;
    box-shadow: inset 4px 4px 10px rgba(0,0,0,0.8), inset -2px -2px 6px rgba(255,255,255,0.03) !important;
  }
  .palace-card {
    padding: 0.4rem 0.3rem 0.4rem 1.1rem !important;
    border-radius: 12px !important;
    box-shadow: 4px 4px 12px rgba(0,0,0,0.8), -2px -2px 8px rgba(255,255,255,0.05), inset 0 1px 1px rgba(255,255,255,0.2) !important;
  }
  .tian-stem-wrapper .stem-char-text { font-size: 1.1rem !important; }
  .di-stem-wrapper .stem-char-text { font-size: 0.9rem !important; }
  .palace-door, .palace-spirit { font-size: 0.9rem !important; }
  .palace-star { font-size: 0.8rem !important; }
  .stem-cs-text { font-size: 0.55rem !important; }
  .an-stem { font-size: 0.65rem !important; margin-right: 0.15rem !important; }
}
"""
    
    with open('theme-neu.css', 'w', encoding='utf-8') as fw:
        fw.write(base_css + new_overrides)
    print('SUCCESS')
else:
    print('FAIL to find block')
