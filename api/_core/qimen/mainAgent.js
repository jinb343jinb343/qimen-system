const readline = require('readline');
const { translateQimenBoardToMarkdown } = require('./translator');
const { QimenSessionManager } = require('./sessionManager');
const { callQimenLlm } = require('./llmClient');

const sessionMgr = new QimenSessionManager(6);

async function runQimenChatFlow(sessionId, rawQimenJson, userQuestion) {
    if (!sessionMgr.sessions[sessionId]) {
        console.log("【系统内部】检测到新会话，正在通过直译器 1:1 映射原版 JSON 盘面图纸...");
        const staticPanContext = translateQimenBoardToMarkdown(rawQimenJson);
        sessionMgr.createSession(sessionId, staticPanContext);
    }

    sessionMgr.appendAndSlideHistory(sessionId, "user", userQuestion);

    const session = sessionMgr.sessions[sessionId];
    const staticContext = session.staticPanContext;
    const historyMessages = session.dynamicHistory;

    process.stdout.write("【DeepSeek-V4-Pro】正在解盘推演中，请稍候...\n");
    
    let fullAnswer = "";
    const responseStream = callQimenLlm(staticContext, historyMessages, "deepseek-v4-pro");
    
    for await (const chunk of responseStream) {
        process.stdout.write(chunk);
        fullAnswer += chunk;
    }
    
    console.log("\n");

    if (fullAnswer) {
        sessionMgr.appendAndSlideHistory(sessionId, "assistant", fullAnswer);
    }
}

async function main() {
    // 100% 替换为您原版绝对准确的真实 JSON 数据字典
    const mockQimenJson = {
        meta: {
            mode: "学术排盘分析",
            time: "2026-06-27 15:00",
            jieqi: "夏至",
            ju: "阴遁3局（中元）",
            xunshou: "甲辰",
            zhifu: "天任",
            zhishi: "生门",
            xunkong: "寅、卯空",
            yima: "寅"
        },
        bazi: {
            year: "丙午",
            month: "甲午",
            day: "壬申",
            hour: "戊申"
        },
        palaces: {
            4: { name: "巽四（东南）", spirit: "九天", star: "天冲(旺)", gate: "生门[值使]", hidden_stem: "暗戊", heaven_stem: "戊(带/临)", earth_stem: "乙(带/沐)", ke_ying: "【青龙合会】谋事多吉，贵人相助，利于合作、签约与婚姻求财。" },
            9: { name: "离九（南）", spirit: "九地", star: "天辅(旺)", gate: "伤门", hidden_stem: "暗壬", heaven_stem: "乙(生)", earth_stem: "辛(病)[击刑]", ke_ying: "【青龙逃走】财物折损，家门不宁，防血光之灾。占婚主女方欲离家逃走。" },
            2: { name: "坤二（西南）", spirit: "玄武", star: "天英(相)", gate: "杜门[门迫]", hidden_stem: "暗庚", heaven_stem: "辛(衰/旺)", earth_stem: "己/丙(带/沐/衰/病)[击刑]", ke_ying: "【入墓不伸】凡事暗昧难明，受屈难申，多主小人得势，自身受压。", remark: "寄宫" },
            3: { name: "震三（东）", spirit: "值符", star: "天任(废)[值符]", gate: "休门", hidden_stem: "暗己", heaven_stem: "壬(死)", earth_stem: "戊(沐)[击刑]", ke_ying: "【小蛇化龙】贵人提拔，凡事渐吉，谋事有成，利求职与迁徙。", remark: "旬空" },
            5: { name: "中五宫（中宫）", detail: "阴遁3局 | 旬首: 甲辰 | 驿马: 寅" },
            7: { name: "兑七（西）", spirit: "白虎", star: "天芮+天禽(废)", gate: "景门[门迫]", hidden_stem: "暗丁", heaven_stem: "己/丙(生/死)", earth_stem: "癸(病)", ke_ying: "【地刑玄武】凡事易生口舌，求财防盗失，男女占多有私情纠纷。" },
            8: { name: "艮八（东北）", spirit: "螣蛇", star: "天蓬(休)", gate: "开门", hidden_stem: "暗癸", heaven_stem: "庚(墓/绝)[击刑][入墓]", earth_stem: "壬(衰/病)", ke_ying: "【太白退位】远行防盗，求财不利，主守吉。凡事退一步海阔天空。", remark: "旬空 | 驿马" },
            1: { name: "坎一（北）", spirit: "太阴", star: "天心(囚)", gate: "惊门", hidden_stem: "暗辛", heaven_stem: "丁(绝)", earth_stem: "庚(死)", ke_ying: "【文书阻隔】信件阻隔，求谋不遂。防合作破裂，出行受阻。" },
            6: { name: "乾六（西北）", spirit: "六合", star: "天柱(囚)", gate: "死门", hidden_stem: "暗丙", heaven_stem: "癸(衰/旺)", earth_stem: "丁(养/胎)", ke_ying: "【腾蛇夭矫】奇门大凶格！文书失陷，官司失败，防虚惊恐慌、火灾破财。" }
        },
        geju_summary: [
            "坎一宫：天丁+地庚 → 【文书阻隔】",
            "坤二宫：天辛+地己 → 【入墓不伸】",
            "震三宫：天壬+地戊 → 【小蛇化龙】",
            "巽四宫：天戊+地乙 → 【青龙合会】",
            "乾六宫：天癸+地丁 → 【腾蛇夭矫】",
            "兑七宫：天己+地癸 → 【地刑玄武】",
            "艮八宫：天庚+地壬 → 【太白退位】",
            "离九宫：天乙+地辛 → 【青龙逃走】"
        ],
        extra: {
            yue_ling: "午（供旺衰分析参考）"
        }
    };

    const testSessionId = "test_user_001";

    console.log("==================================================");
    console.log("【奇门遁甲智能解盘系统】 - 终端深度对话测试版已启动");
    console.log("当前使用的 LLM 引擎：DeepSeek-V4-Pro");
    console.log("挂载数据源：100% 原版真实学术 JSON 全量数据包");
    console.log("（输入 'exit' 或 'quit' 退出终端系统）");
    console.log("==================================================");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '\nInput >>> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const userInput = line.trim();
        if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
            console.log("系统已正常退出。");
            rl.close();
            return;
        }
        if (!userInput) { rl.prompt(); return; }

        try {
            await runQimenChatFlow(testSessionId, mockQimenJson, userInput);
        } catch (error) {
            console.error(`\n[致命故障] 解盘主控系统发生崩溃: ${error.message}`);
        }
        rl.prompt();
    }).on('close', () => {
        process.exit(0);
    });
}

if (require.main === module) {
    main();
}
