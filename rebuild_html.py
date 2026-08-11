import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Extract Header
header_match = re.search(r'(<header.*?</header>)', html, re.DOTALL)
header = header_match.group(1)

# 2. Extract Control Grid (Inputs inside form)
control_grid_match = re.search(r'(<div class="control-grid">.*?</div>\s*</div>)', html, re.DOTALL)
control_grid = control_grid_match.group(1)

# 3. Extract Forecast Modes (Modes + Nianming)
modes_match = re.search(r'(<div style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 1\.5rem; align-items: center;">.*?</div>\s*</div>\s*</div>)', html, re.DOTALL)
modes = modes_match.group(1)
# Modify modes margin
modes = modes.replace('margin-top: 1rem;', 'margin-top: 0;')

# 4. Extract Results Section (Pillars, Board Tools, Layout)
results_match = re.search(r'(<!-- Pillars Banner.*?)</main>', html, re.DOTALL)
results_part1 = results_match.group(1) + '</main>'
sidebar_match = re.search(r'(<!-- Detailed Interpretations Sidebar.*?)</aside>', html, re.DOTALL)
sidebar = sidebar_match.group(1) + '</aside>'

# Assembly
new_html = html[:header_match.end()] + """

    <!-- ================= LAYER A: LOGIN ================= -->
    <div id="view-login" class="view-layer active">
      <div class="glass-panel" style="max-width: 380px; margin: 4rem auto; padding: 2.5rem 2rem; text-align: center; border-radius: 20px;">
        <h2 style="color: var(--gold-accent); margin-bottom: 0.5rem; font-size: 1.5rem; letter-spacing: 2px;">门神指纹验证</h2>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 2rem;">文刀流 · 奇门遁甲高阶系统</p>
        
        <input type="text" id="login-username" placeholder="请输入口令 (默认: admin)" autocomplete="off" style="width: 100%; margin-bottom: 1.2rem; padding: 0.8rem 1rem; background: var(--input-bg); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; color: var(--text-primary); box-shadow: var(--neu-inner-shadow); outline: none;">
        
        <input type="password" id="login-password" placeholder="请输入秘钥 (默认: 8888)" autocomplete="off" style="width: 100%; margin-bottom: 2rem; padding: 0.8rem 1rem; background: var(--input-bg); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; color: var(--text-primary); box-shadow: var(--neu-inner-shadow); outline: none;" onkeypress="if(event.key==='Enter') attemptLogin()">
        
        <button type="button" class="btn btn-primary" onclick="attemptLogin()" style="width: 100%; padding: 0.8rem; border-radius: 12px; font-size: 1rem; letter-spacing: 4px;">解开封印</button>
      </div>
    </div>

    <!-- ================= LAYER B: INPUT ================= -->
    <div id="view-input" class="view-layer">
      <div style="display: flex; justify-content: flex-start; margin-bottom: 1rem;">
        <button type="button" class="btn" onclick="switchView('login')" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-radius: 8px;">&lt; 退出系统</button>
      </div>
      
      <section class="glass-panel control-panel animate-fade-in">
        <form id="qimen-form" onsubmit="event.preventDefault(); triggerCalculate();">
""" + "\n" + control_grid + """
        </form>
      </section>
    </div>

    <!-- ================= LAYER C: RESULTS ================= -->
    <div id="view-result" class="view-layer">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; background: var(--panel-bg); padding: 1rem; border-radius: 16px; box-shadow: var(--neu-outer-shadow);">
        <button type="button" class="btn" onclick="switchView('input')" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-radius: 8px; white-space: nowrap;">&lt; 重新排盘</button>
        
        <!-- Moved Forecast Modes here (Layer C) -->
""" + modes + """
      </div>

""" + results_part1 + """
      
      """ + sidebar + """
    </div>
"""

# Find footer start
footer_match = re.search(r'(<!-- Footer -->)', html)
new_html += html[footer_match.start():]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("HTML reassembly successful.")
