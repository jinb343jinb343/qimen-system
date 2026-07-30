const http = require('http');

// 数据包 A: 15:00 申时局盘
const packetA = {
    meta: {
        mode: "学术排盘分析", time: "2026-06-27 15:00", jieqi: "夏至",
        ju: "阴遁3局（中元）", xunshou: "甲辰", zhifu: "天任", zhishi: "生门"
    },
    bazi: { year: "丙午", month: "甲午", day: "壬申", hour: "戊申" },
    palaces: {
        4: { name: "巽四（东南）", spirit: "九天", star: "天冲(旺)", gate: "生门[值使]", heaven_stem: "戊", earth_stem: "乙" },
        9: { name: "离九（南）", spirit: "九地", star: "天辅(旺)", gate: "伤门", heaven_stem: "乙", earth_stem: "辛" }
    }
};

// 数据包 B: 13:15 未时局盘 (同一甲辰旬内，值符依旧是天任，值使依旧是生门，但九宫排布和时干发生了流转)
const packetB = {
    meta: {
        mode: "学术排盘分析", time: "2026-06-27 13:15", jieqi: "夏至",
        ju: "阴遁3局（中元）", xunshou: "甲辰", zhifu: "天任", zhishi: "生门"
    },
    bazi: { year: "丙午", month: "甲午", day: "壬申", hour: "丁未" },
    palaces: {
        8: { name: "艮八（东北）", spirit: "太阴", star: "天蓬(休)", gate: "生门[值使]", heaven_stem: "丙", earth_stem: "庚" },
        3: { name: "震三（东）", spirit: "值符", star: "天任(旺)", gate: "休门", heaven_stem: "壬", earth_stem: "癸" }
    }
};

// 模拟前端 Fetch API 的流式请求封装
function sendChatRequest(sessionId, rawQimenJson, userQuestion) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ sessionId, rawQimenJson, userQuestion });
        const options = {
            hostname: '127.0.0.1',
            port: 8086,
            path: '/api/qimen/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = http.request(options, (res) => {
            console.log(`\n[Harness 接收端] 开始流式打印 (Session: ${sessionId})...`);
            res.on('data', (chunk) => {
                // 原生捕获 chunked 传输并实时输出到终端
                process.stdout.write(chunk.toString());
            });
            res.on('end', () => {
                console.log('\n\n[Harness 接收端] 该轮推演完毕。');
                resolve();
            });
        });

        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
}

async function runHarness() {
    console.log("=================================================");
    console.log("启动 Test Harness 动态盘面 API 接口并发压力测试...");
    console.log("目标端口: http://127.0.0.1:8086/api/qimen/chat");
    console.log("=================================================\n");

    console.log(">>> [拨测 1] 发送数据包 A (15:00 戊申时, 旬首甲辰, 值使生门)");
    await sendChatRequest("session_A_1500", packetA, "请简述当前盘面 15:00 的时空状态，并重点分析值使生门的落宫情况。");
    
    console.log("\n-------------------------------------------------");
    console.log(">>> [拨测 2] 发送数据包 B (13:15 丁未时, 旬首甲辰, 值使生门)");
    await sendChatRequest("session_B_1315", packetB, "时空锚点退回到了 13:15 丁未时。因为同属甲辰旬，值使虽然还是生门，但请问随着时干的变换，生门的落宫发生了什么位移？");
    
    console.log("\n=================================================");
    console.log("Test Harness 联调测试流已结束。请检查大模型是否准确锚定了动态时空！(GREEN)");
}

runHarness();
