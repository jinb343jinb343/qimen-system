const fs = require('fs');
const path = require('path');
const { callQimenLlm } = require('../../api/_core/qimen/llmClient');
const { translateQimenBoardToMarkdown } = require('../../api/_core/qimen/translator');

// 构造测试数据 1: 带有“门迫+击刑”的商业合作局
const testCase1 = {
    user_request: "我和张总准备合伙投资一个新项目，看看这个合作能不能成，有什么隐患没？如果不顺怎么化解？",
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
    }
};

async function testMasterRouter(testCase) {
    console.log("======================================");
    console.log("🚀 开始测试 Master Router 场景路由");
    console.log("提问内容:", testCase.user_request);
    console.log("======================================");

    // 1. 加载 Master Router Prompt
    const routerPath = path.join(__dirname, '../../api/_skills/prompts/master_router.md');
    const routerPrompt = fs.readFileSync(routerPath, 'utf-8');

    // 2. 翻译盘面
    const panContext = translateQimenBoardToMarkdown(testCase.raw_qimen_json);

    // 3. 组装 System Prompt (按照 Master Router 的设定，要求它直接输出 JSON)
    // 强制它只输出 JSON
    const systemPrompt = `${routerPrompt}\n\n【当前盘面数据】\n${panContext}\n\n⚠️注意：你必须仅输出格式化的 JSON 数据，不要输出任何多余的解释文字！不要使用 markdown 代码块包裹，直接输出 JSON 字符串！`;

    // 4. 调用大模型
    const history = [
        { role: "user", content: testCase.user_request }
    ];

    console.log("⏳ 正在请求 DeepSeek...");
    const stream = callQimenLlm(systemPrompt, history, "deepseek-v4-flash");

    let result = "";
    for await (const chunk of stream) {
        result += chunk;
        process.stdout.write(chunk); // 实时打印流式输出
    }
    
    console.log("\n\n✅ 路由判定结束。");
}

(async () => {
    try {
        await testMasterRouter(testCase1);
    } catch (e) {
        console.error("测试异常:", e);
    }
})();
