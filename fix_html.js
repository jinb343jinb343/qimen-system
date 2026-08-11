const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const palaces = [
  {id: 4, gua: '巽四', dir: '东南', title: 'Top Left'},
  {id: 9, gua: '离九', dir: '正南', title: 'Top Middle'},
  {id: 2, gua: '坤二', dir: '西南', title: 'Top Right'},
  {id: 3, gua: '震三', dir: '正东', title: 'Middle Left'},
  {id: 7, gua: '兑七', dir: '正西', title: 'Middle Right'},
  {id: 8, gua: '艮八', dir: '东北', title: 'Bottom Left'},
  {id: 1, gua: '坎一', dir: '正北', title: 'Bottom Middle'},
  {id: 6, gua: '乾六', dir: '西北', title: 'Bottom Right'}
];

for (let p of palaces) {
  const target = `        <!-- Palace ${p.id} (${p.gua}宫 - ${p.title}) -->
        <div class="palace-card" id="palace-${p.id}" onclick="selectPalace(${p.id})">
          <div class="palace-left">
            <span class="palace-spirit" id="spirit-${p.id}">--</span>
            <div class="palace-mid-left">
              <span class="an-stem" id="an-${p.id}">--</span>
              <span class="palace-star" id="star-${p.id}">--</span>
            </div>
            <span class="palace-door" id="door-${p.id}">--</span>
          </div>
          <div class="palace-right">
            <div class="palace-badges" id="badges-${p.id}"></div>
            <div class="palace-stems">
              <span class="tian-stem" id="tian-${p.id}">--</span>
              <span class="di-stem" id="di-${p.id}">--</span>
            </div>
            <div class="palace-meta">
              <span class="palace-gua">${p.gua}</span>
              <div class="palace-name">${p.dir}</div>
            </div>
          </div>
        </div>`;

  const replacement = `        <!-- Palace ${p.id} (${p.gua}宫 - ${p.title}) -->
        <div class="palace-card" id="palace-${p.id}" onclick="selectPalace(${p.id})">
          <div class="palace-meta-bg">
            <span class="palace-gua">${p.gua.replace(/[一二三四五六七八九]/g, '')}${p.id}</span>
            <div class="palace-name">${p.dir}</div>
          </div>
          <div class="palace-top">
            <span class="palace-spirit" id="spirit-${p.id}">--</span>
            <div class="palace-badges" id="badges-${p.id}"></div>
          </div>
          <div class="palace-mid">
            <div class="palace-star-group">
              <span class="an-stem" id="an-${p.id}">--</span>
              <span class="palace-star" id="star-${p.id}">--</span>
            </div>
            <div class="tian-stem-wrapper" id="tian-${p.id}">--</div>
          </div>
          <div class="palace-bottom">
            <span class="palace-door" id="door-${p.id}">--</span>
            <div class="di-stem-wrapper" id="di-${p.id}">--</div>
          </div>
        </div>`;
  
  html = html.replace(target, replacement);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('HTML replace done');
