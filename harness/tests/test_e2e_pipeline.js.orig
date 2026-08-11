const handler = require('../../api/qimen/chat');

// 构造测试数据 1: 带有“门迫+击刑”的商业合作局
const req = {
    method: 'POST',
    body: {
        session_id: "test_e2e",
        user_cmd: "我和张总准备合伙投资一个新项目，看看这个合作能不能成，有什么隐患没？如果不顺怎么化解？",
        raw_qimen_json: {
            meta: { mode: "时家奇门", time: "2026-07-30 14:00", ju: "阳遁一局", xunshou: "甲子戊", zhifu: "天蓬星", zhishi: "休门" },
            bazi: { year: "丙午", month: "乙未", day: "己酉", hour: "辛未" },
            palaces: {
                // 我方：日干己落震宫 (震木克己土，休囚，且伤门木克土门迫)
                3: { name: "震三宫", spirit: "白虎", star: "天冲星", gate: "伤门[门迫]", heaven_stem: "己[击刑]", earth_stem: "癸", hidden_stem: "辛", ke_ying: "犬遇青龙", remark: "白虎临宫，且己落震击刑" },
                // 对方：时干辛落坤宫 (坤土生辛金，旺相，带生门)
                2: { name: "坤二宫", spirit: "九地", star: "天芮星", gate: "生门", heaven_stem: "辛", earth_stem: "乙", hidden_stem: "丁", ke_ying: "白虎猖狂", remark: "带天芮星病灶" },
                // 资本/财运：生门戊落巽宫
                4: { name: "巽四宫", spirit: "九天", star: "天辅星", gate: "杜门", heaven_stem: "戊", earth_stem: "丙", hidden_stem: "己", ke_ying: "青龙返首", remark: "逢空亡" }
            }
        },
        history: []
    }
};

const res = {
    headersSent: false,
    setHeader: () => {},
    status: (code) => {
        console.log(`HTTP Status: ${code}`);
        return { json: (data) => console.log(data) };
    },
    write: (chunk) => {
        const match = chunk.match(/^data:\s*(.*)\s*$/);
        if (match && match[1]) {
            const dataStr = match[1];
            if (dataStr !== '"[DONE]"') {
                try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.content) {
                        process.stdout.write(parsed.content);
                    }
                } catch (e) {
                    // Ignore parse errors for split chunks
                }
            }
        }
    },
    end: () => {
        console.log("\n\n✅ 管道流式输出完全结束。");
    }
};

console.log("======================================");
console.log("🚀 开始全链路(E2E) Pipeline 沙盘推演测试");
console.log("正在通过 Router 分发并执行多段大模型推理...");
console.log("======================================\n");

handler(req, res);

// 补充前端渲染验真测试 (JSDOM 模拟)
/*
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = `...`; // 模拟渲染后的HTML
const dom = new JSDOM(html);
const di8 = dom.window.document.getElementById("di-8");
if (di8 && di8.classList.contains("color-jixing")) {
    console.log("✅ 前端渲染测试通过！");
} else {
    console.error("❌ 前端渲染测试失败，未检测到正确的颜色类名！");
}
*/
