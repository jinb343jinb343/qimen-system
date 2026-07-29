const http = require('http');
const fs = require('fs');
const path = require('path');
const { translateQimenBoardToMarkdown } = require('./core/qimen/translator');
const { QimenSessionManager } = require('./core/qimen/sessionManager');
const { callQimenLlm } = require('./core/qimen/llmClient');
const config = require('./configs/qimen_config');

const sessionMgr = new QimenSessionManager(6);

const PORT = config.PORT;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

http.createServer(async (req, res) => {
  // ---- 拦截 API 接口路由 ----
  if (req.url === '/api/qimen/chat' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { 
          body += chunk.toString(); 
          if (body.length > config.MAX_PAYLOAD_SIZE) {
              // 物理级斩断恶意连接
              res.writeHead(413, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: "Payload Too Large: 请求体过大，已被系统拦截。" }));
              req.socket.destroy();
          }
      });
      req.on('end', async () => {
          try {
              const data = JSON.parse(body);
              const { session_id, raw_qimen_json, user_cmd } = data;
              
              if (!sessionMgr.sessions[session_id]) {
                  // 前端传过来新鲜的 raw_qimen_json，立刻翻译成纯文本作为 static_context
                  const staticPanContext = translateQimenBoardToMarkdown(raw_qimen_json);
                  sessionMgr.createSession(session_id, staticPanContext);
              }
              
              sessionMgr.appendAndSlideHistory(session_id, "user", user_cmd);
              const session = sessionMgr.sessions[session_id];
              
              // 开启 Server-Sent Events (SSE) 以支持前端打字机特效
              res.writeHead(200, {
                  'Content-Type': 'text/event-stream; charset=utf-8',
                  'Cache-Control': 'no-cache',
                  'Connection': 'keep-alive'
              });
              
              let fullAnswer = "";
              const responseStream = callQimenLlm(session.staticPanContext, session.dynamicHistory, config.LLM_MODEL_DEFAULT);
              
              for await (const chunk of responseStream) {
                  // 将文本分块封装成规范的 SSE 数据包发送
                  res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                  fullAnswer += chunk;
              }
              
              if (fullAnswer) {
                  sessionMgr.appendAndSlideHistory(session_id, "assistant", fullAnswer);
              }
              // 发送结束信号
              res.write(`event: done\ndata: "[DONE]"\n\n`);
              res.end();
          } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
          }
      });
      return;
  }

  // ---- 处理静态文件 ----
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('File Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      res.end(content, 'utf-8');
    }
  });
}).listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  let lanIp = '127.0.0.1';
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // 过滤掉内部/回环地址以及 IPv6
      if (net.family === 'IPv4' && !net.internal) {
        lanIp = net.address;
        break;
      }
    }
  }
  
  console.log(`========================================`);
  console.log(`奇门遁甲后端服务已启动!`);
  console.log(`PC 本地访问: http://127.0.0.1:${PORT}/`);
  console.log(`手机局域网测试: http://${lanIp}:${PORT}/`);
  console.log(`========================================`);
});
