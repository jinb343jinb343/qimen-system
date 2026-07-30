const http = require('http');

const CONCURRENT_REQUESTS = 50;
const MAX_ACCEPTABLE_TIME_MS = 2500; // 容忍上限：非阻塞模式下，大模型首包响应时间

const data = JSON.stringify({
    session_id: "stress_test",
    raw_qimen_json: { test: "mock_data" },
    user_cmd: "压力测试"
});

const options = {
    hostname: '127.0.0.1',
    port: 8086,
    path: '/api/qimen/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

let completed = 0;
let totalTime = 0;
let errors = 0;

console.log(`[Stress Test] 开始发起 ${CONCURRENT_REQUESTS} 个并发请求以检测事件循环阻塞...`);
console.log(`提示：如果服务器内部存在 fs.readFileSync 等同步 IO，响应时间将呈线性爆炸。`);

const startTime = Date.now();

for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    const reqStart = Date.now();
    const req = http.request(options, res => {
        let firstChunkReceived = false;
        res.on('data', () => {
            if (!firstChunkReceived) {
                // 只记录建立连接到接收到首包的时间
                const duration = Date.now() - reqStart;
                totalTime += duration;
                completed++;
                firstChunkReceived = true;
                
                // 拿到首包就断开，避免占用资源等待完整生成
                req.destroy();
                checkDone();
            }
        });
    });

    req.on('error', error => {
        // req.destroy() 会触发 ECONNRESET，忽略它
        if (error.code !== 'ECONNRESET') {
           console.error(`\n[请求 ${i} 失败]:`, error.message);
           errors++;
           completed++;
           checkDone();
        }
    });

    req.write(data);
    req.end();
}

function checkDone() {
    if (completed >= CONCURRENT_REQUESTS) {
        const endTime = Date.now();
        const totalDuration = endTime - startTime;
        const avgTime = totalTime / CONCURRENT_REQUESTS;
        
        console.log(`\n====================================`);
        console.log(`[Stress Test] 压测结束!`);
        console.log(`并发请求数: ${CONCURRENT_REQUESTS}`);
        console.log(`失败/丢包数: ${errors}`);
        console.log(`总体完成耗时: ${totalDuration} ms`);
        console.log(`首包平均响应时间: ${avgTime.toFixed(2)} ms`);
        console.log(`====================================`);
        
        if (errors > 0 || avgTime > MAX_ACCEPTABLE_TIME_MS) {
            console.error(`\n❌ [ASSERTION FAILED]`);
            console.error(`首包响应时间严重超时或存在丢包，平均耗时 ${avgTime.toFixed(2)}ms。`);
            console.error(`诊断：事件循环极大概率被同步 IO (如 fs.readFileSync) 物理阻塞！`);
            process.exit(1);
        } else {
            console.log(`\n✅ [ASSERTION PASSED]`);
            console.log(`并发响应迅速，事件循环完全畅通。IO 剥离重构已生效！`);
            process.exit(0);
        }
    }
}
