const handler = require('../../api/qimen/chat');

async function runTest() {
    console.log("======================================");
    console.log("🚀 开始【多轮对话/追问】沙盘推演测试");
    console.log("======================================\n");

    const raw_qimen_json = {
        meta: { mode: "时家奇门", time: "2026-07-30 14:00", ju: "阳遁一局", xunshou: "甲子戊", zhifu: "天蓬星", zhishi: "休门" },
        bazi: { year: "丙午", month: "乙未", day: "己酉", hour: "辛未" },
        palaces: {
            3: { name: "震三宫", spirit: "白虎", star: "天冲星", gate: "伤门[门迫]", heaven_stem: "己[击刑]", earth_stem: "癸", hidden_stem: "辛", ke_ying: "犬遇青龙", remark: "白虎临宫，且己落震击刑" },
            2: { name: "坤二宫", spirit: "九地", star: "天芮星", gate: "生门", heaven_stem: "辛", earth_stem: "乙", hidden_stem: "丁", ke_ying: "白虎猖狂", remark: "带天芮星病灶" },
            4: { name: "巽四宫", spirit: "九天", star: "天辅星", gate: "杜门", heaven_stem: "戊", earth_stem: "丙", hidden_stem: "己", ke_ying: "青龙返首", remark: "逢空亡" }
        }
    };

    // 我们直接模拟第一轮已经完成，此时历史记录里有用户的提问和系统的长诊断报告
    const mockDiagnosisReport = `
# 奇门遁甲·时空切片诊断报告

> **💡 核心结论**
> **建议立即终止合作，这是一个带有致命隐患的虚设陷阱**。
> 对方资金完全没有到位（逢空亡），且对方主体暗藏极强破坏性，我方处于被压制与自我内耗的状态，强行推进必有大灾。

---

## 一、 多维博弈网络拆解 (角色与现状)
- **我方姿态 (日干己)**：处于极度衰凶状态。现实中筹码不足，心态焦虑，甚至可能涉及违规操作（击刑+门迫）。
- **对方老板/主体 (年干丙/值符天蓬)**：实力虚张声势，意图不仅不真实，还伴随着高风险。
- **项目与资金 (生门/戊)**：资本金（戊）落巽宫逢空亡，完全是个画饼空谈的虚假盘。

## 二、 核心病灶与风险排查 (关键坑点)
- **全局钥匙眼 (Key Pin)**：震三宫我方门迫击刑，坤二宫对方白虎猖狂。
- **现实风险对标**：不仅资金被卡死，而且若入局会遭遇严重的官司纠纷与肢体冲突。

## 三、 战略定调与后续方向
- **生克大势**：日干木克时干土，看似能掌控，实则是自不量力惹怒凶神。
- **战术指导**：绝不可硬刚，必须立即止损！
`;

    const history = [
        { role: "user", content: "看看这个合作能不能成，有什么隐患？" },
        { role: "assistant", content: mockDiagnosisReport }
    ];

    console.log("📝 模拟第一轮对话已存在 (包含诊断报告)...\n");

    // 第二轮追问：具体怎么化解？
    const req = {
        method: 'POST',
        body: {
            session_id: "test_followup",
            user_cmd: "既然这么凶险，那我具体该怎么化解？如何安全撤退？",
            raw_qimen_json,
            history
        }
    };

    const res = {
        headersSent: false,
        setHeader: () => {},
        status: (code) => ({ json: (data) => console.log(data) }),
        write: (chunk) => {
            const match = chunk.match(/^data:\s*(.*)\s*$/);
            if (match && match[1]) {
                const dataStr = match[1];
                if (dataStr !== '"[DONE]"') {
                    try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed.content) process.stdout.write(parsed.content);
                    } catch (e) {}
                }
            }
        },
        end: () => {
            console.log("\n\n✅ 追问测试完成。");
        }
    };

    console.log("⏳ 发起追问: [既然这么凶险，那我具体该怎么化解？如何安全撤退？]\n");
    await handler(req, res);
}

runTest();
