import re
import os

with open(r'e:\antigravity\IDE BOOK\奇门\theme-neu.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Replace @import
css = re.sub(
    r"@import url\('.*?'\);",
    r"@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Outfit:wght@300;400;600;700&family=Ma+Shan+Zheng&display=swap');",
    css,
    count=1
)

# 2. Replace :root { ... }
new_root = """:root {
  --bg-color: #121212;
  --bg-gradient: radial-gradient(circle at 50% 0%, #1a1a1a 0%, #121212 100%);
  --panel-bg: #1e1e1e;
  --panel-bg-hover: #262626;
  --input-bg: rgba(0, 0, 0, 0.5);
  
  --border-color: rgba(212, 175, 55, 0.2);
  --border-glow: rgba(212, 175, 55, 0.4);
  
  /* Bazi Gold Accent Colors */
  --gold-accent: #d4af37;
  --gold-light: #f9d77e;
  --blue-accent: #d4af37; /* Force blue to be gold in Bazi style */
  --cyan-glow: rgba(212, 175, 55, 0.3); /* Force cyan to gold glow */
  
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  --text-muted: #666666;
  
  /* Five Elements Colors (Bazi Style) */
  --element-wood: #52b788;  /* Bamboo Green */
  --element-fire: #e5383b;  /* Cinnabar Red */
  --element-earth: #c69c6d; /* Ochre/Gold */
  --element-metal: #e9c46a; /* Frost White/Gold */
  --element-water: #4cc9f0; /* Azure */
  
  /* Auspiciousness Colors (Bazi Scheme) */
  --auspicious: #52b788;   /* Green */
  --inauspicious: #e5383b; /* Red */
  --neutral: #e9c46a;      /* Neutral Gold */
  
  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Neumorphism tokens forced to Bazi Oriental Black/Gold */
  --neu-outer-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  --neu-inner-shadow: inset 0 2px 10px rgba(0,0,0,0.8);
  --neu-surface-glow: inset 0 1px 0 rgba(212, 175, 55, 0.2);
}"""
css = re.sub(r':root\s*\{[^}]+\}', new_root, css, count=1)

# 3. Replace body::before (noise)
new_noise = """body::before {
  content: "";
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-size: auto;
  z-index: 9999;
}"""
# The old body::before has background-image: radial-gradient... up to z-index: 0;
css = re.sub(r'body::before\s*\{[^}]+\}', new_noise, css, count=1)

# 4. Modify h1 and .btn-primary to Bazi styles
new_h1 = """h1 {
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold-accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 2.2rem;
  font-family: 'Ma Shan Zheng', cursive;
}"""
css = re.sub(r'h1\s*\{[^}]+\}', new_h1, css, count=1)

css = css.replace('background: var(--blue-accent);', 'background: linear-gradient(135deg, var(--gold-accent), #b89324);')
css = css.replace('background: #2563eb;', 'background: linear-gradient(135deg, var(--gold-light), var(--gold-accent));')
css = css.replace('border: 1px solid var(--blue-accent);', 'border: none;')
css = css.replace('border-color: var(--blue-accent);', 'border-color: var(--gold-accent);')

# 5. Add Bazi special classes at the end (before mobile queries)
bazi_classes = """
/* ================= BAZI ORIENTAL OVERRIDES ================= */
.glass-panel::after, .palace-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold-accent), transparent);
  opacity: 0.5;
  pointer-events: none;
}

@font-face {
  font-family: 'AaLieYan';
  src: local('Aa烈焰隶书'), local('AaLYLS'), url('/assets/fonts/LieYan-Subset.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@keyframes intense-glow {
  0%, 100% { text-shadow: 0 0 1px rgba(255,255,255,0.2), 0 0 2px rgba(212,175,55,0.1); opacity: 0.85; }
  50% { text-shadow: 0 0 4px rgba(255,255,255,0.8), 0 0 10px rgba(212,175,55,0.5); opacity: 1; }
}

.title-glow-float {
  color: #ffffff;
  animation: intense-glow 3s ease-in-out infinite;
  font-family: 'AaLieYan', 'Ma Shan Zheng', cursive;
}
"""

css = css.replace('/* ================= VIEW ROUTER (SPA LAYERS) ================= */', bazi_classes + '\n/* ================= VIEW ROUTER (SPA LAYERS) ================= */')

with open(r'e:\antigravity\IDE BOOK\奇门\theme-neu.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Bazi CSS genes successfully injected into Qimen Neumorphism.")
