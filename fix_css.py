import io, re

try:
    with io.open('theme-neu.css', 'rb') as f:
        content = f.read()
    
    # 解码，如果后面是 UTF-16LE，会被 decode('utf-8') 认为是乱码
    # 但我们最好直接暴力切除
    try:
        text = content.decode('utf-8')
    except:
        text = content.decode('utf-8', errors='ignore')
    
    # 查找可能的乱码部分 (因为之前用了 Add-Content)
    idx1 = text.find('SPLASH AESTHETICS')
    idx2 = text.find('\x00S\x00P\x00L\x00A\x00S\x00H') # UTF-16LE signature
    
    if idx2 != -1:
        text = text[:idx2-50]
    elif idx1 != -1:
        text = text[:idx1-50]

    # 清除旧的 font-face 避免重复
    if "@font-face" in text and "AaLieYan" in text:
        pass # already has it
    else:
        font_face = """
@font-face {
  font-family: 'AaLieYan';
  src: url('assets/fonts/LieYan-Subset.woff2') format('woff2'),
       url('assets/fonts/Bazi-LieYan.woff2') format('woff2'),
       url('assets/fonts/AaLieYanLiShu-2.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
"""
        text = font_face + text

    splash_css = """
/* ==========================================
 * SPLASH AESTHETICS (LAYER A)
 * ========================================== */
#view-splash {
  background-image: url('assets/images/bg-desktop.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100vw;
}

@media (max-width: 768px) {
  #view-splash {
    background-image: url('assets/images/bg-mobile.png');
  }
}

@keyframes breatheFloatMain {
  0%, 100% { transform: translateY(0) scale(1); text-shadow: 0 0 20px rgba(255,255,255,0.4); }
  50% { transform: translateY(-15px) scale(1.05); text-shadow: 0 0 50px rgba(255,255,255,0.9); }
}

@keyframes breatheFloatSub {
  0%, 100% { transform: translateY(0); text-shadow: 0 0 10px rgba(255,255,255,0.3); }
  50% { transform: translateY(-5px); text-shadow: 0 0 25px rgba(255,255,255,0.7); }
}

.breathe-main {
  animation: breatheFloatMain 4s ease-in-out infinite;
  display: inline-block;
  font-family: 'AaLieYan', sans-serif;
  letter-spacing: 5px;
}

.breathe-sub {
  animation: breatheFloatSub 4.5s ease-in-out infinite;
  display: inline-block;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.8s; }
.delay-3 { animation-delay: 1.4s; }

.auth-input {
  width: 100%;
  padding: 1rem 1.2rem;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: var(--text-primary);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  outline: none;
  text-align: center;
  letter-spacing: 2px;
  font-size: 1rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: border-color 0.3s;
}
.auth-input:focus {
  border-color: rgba(255,255,255,0.3);
}

.splash-quote {
  position: absolute; 
  bottom: 12vh; 
  text-align: center; 
  font-family: 'AaLieYan', sans-serif; 
  font-size: 1.1rem; 
  line-height: 2.2; 
  color: rgba(255,255,255,0.9); 
  text-shadow: 0 0 10px rgba(255,255,255,0.6); 
  max-width: 90vw; 
  padding: 0 20px; 
  pointer-events: none; 
  z-index: 51;
  letter-spacing: 4px;
}
"""
    if "breatheFloatMain" not in text:
        text += splash_css

    with io.open('theme-neu.css', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fixed theme-neu.css successfully")
except Exception as e:
    print(e)
