const { translateQimenBoardToMarkdown } = require('../_core/qimen/translator');
const { callQimenLlm } = require('../_core/qimen/llmClient');
const config = require('../_configs/qimen_config');
const fs = require('fs').promises;
const path = require('path');

// 内存单例缓存所有的 SKILL
const skillCache = {};

async function getSkillContent(prefix, folder) {
    const key = `${folder}/${prefix}`;
    if (skillCache[key]) return skillCache[key];
    
    try {
        const dirPath = path.join(__dirname, `../_skills/prompts/${folder}`);
        const files = await fs.readdir(dirPath);
        const targetFile = files.find(f => f.startsWith(prefix) && f.endsWith('.md'));
        
        if (targetFile) {
            const content = await fs.readFile(path.join(dirPath, targetFile), 'utf-8');
            skillCache[key] = content;
            return content;
        } else {
            console.warn(`未找到前缀为 ${prefix} 的 SKILL 文件`);
            return "";
        }
    } catch (e) {
        console.warn(`读取 SKILL 文件夹 ${folder} 失败`, e);
        return "";
    }
}

module.exports = async function handler(req, res) {
    // 仅允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const startTime = Date.now();
        const body = req.body || {};
        const { session_id, raw_qimen_json, user_cmd, history } = body;

        if (JSON.stringify(body).length > config.MAX_PAYLOAD_SIZE) {
            return res.status(413).json({ error: "Payload Too Large: 请求体过大，已被系统拦截。" });
        }

        const staticPanContext = translateQimenBoardToMarkdown(raw_qimen_json);

        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // ==========================================
        // Step 1: Router - 场景分发与化解意图识别 (内部静默调用)
        // ==========================================
        const routerPromptTemplate = await getSkillContent('master_router', '');
        const routerSystemPrompt = `${routerPromptTemplate}\n\n【当前奇门盘面基准】\n${staticPanContext}\n\n⚠️注意：你必须仅输出格式化的 JSON 数据，不要输出任何多余的解释文字！`;
        
        let routerJsonStr = "";
        const routerHistory = [{ role: "user", content: user_cmd }];
        const routerStream = callQimenLlm(routerSystemPrompt, routerHistory, config.LLM_MODEL_DEFAULT);
        
        for await (const chunk of routerStream) {
            routerJsonStr += chunk;
        }
        
        let routerData;
        try {
            const cleanJson = routerJsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
            routerData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Router JSON 解析失败, 兜底降级", routerJsonStr);
            routerData = {
                SCENE_TAG: "SCENE_GENERAL",
                NEED_REMEDIATION: false,
                PIPELINE: ["SKILL_D01", "SKILL_D02", "SKILL_D03", "SKILL_D04"]
            };
        }

        // ==========================================
        // Step 2: Diagnosis Phase - 诊断链生成 (流式输出给前端)
        // ==========================================
        let diagSkillsText = "";
        for (const skill of routerData.PIPELINE.filter(s => s.startsWith('SKILL_D'))) {
            diagSkillsText += await getSkillContent(skill, 'diagnosis') + "\n\n";
        }

        const diagSystemPrompt = `你是一位高阶奇门遁甲分析师。你的当前任务场景是：${routerData.SCENE_TAG}。
请严格按照以下诊断逻辑步骤进行分析推演，并最终严格按照【SKILL_D04】的格式输出报告：

${diagSkillsText}

【当前奇门盘面基准】
${staticPanContext}
`;
        
        const dynamicHistory = history || [];
        dynamicHistory.push({ role: "user", content: user_cmd });

        let diagnosisReport = "";
        const diagStream = callQimenLlm(diagSystemPrompt, dynamicHistory, config.LLM_MODEL_DEFAULT);
        
        for await (const chunk of diagStream) {
            diagnosisReport += chunk;
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }

        // ==========================================
        // Step 3: Remediation Phase - 化解链生成 (若需要，流式输出)
        // ==========================================
        if (routerData.NEED_REMEDIATION) {
            // 输出华丽的分割线
            res.write(`data: ${JSON.stringify({ content: '\n\n---\n\n# 🛡️ 破局与空间化解方案\n\n' })}\n\n`);
            
            let remSkillsText = "";
            for (const skill of routerData.PIPELINE.filter(s => s.startsWith('SKILL_R'))) {
                remSkillsText += await getSkillContent(skill, 'remediation') + "\n\n";
            }

            const remSystemPrompt = `你是一位高阶奇门遁甲化解策略师。
基于以下刚刚得出的《诊断报告》，请严格按照指定的化解策略库，为用户生成落地执行的化解与物理空间风水调整方案。
⚠️禁止复述诊断报告内容，直接输出具体的行动战术和“拆补移”实操方案！

【化解策略指令库】
${remSkillsText}
`;
            // 上下文截断与组装：只传递 Diagnosis Report，不传递冗长的原始盘面和历史
            const remHistory = [
                { role: "user", content: `用户的初始问题：${user_cmd}\n\n【前置诊断结论摘要】\n${diagnosisReport}\n\n请直接输出化解动作与物理空间调理方案。` }
            ];

            const remStream = callQimenLlm(remSystemPrompt, remHistory, config.LLM_MODEL_DEFAULT);
            for await (const chunk of remStream) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
        }

        res.write(`event: done\ndata: "[DONE]"\n\n`);
        res.end();

        // --- 极简后端监控日志 ---
        const duration = Date.now() - startTime;
        console.log(`[Qimen Pipeline] Session: ${session_id || 'anonymous'} | Scene: ${routerData?.SCENE_TAG || 'N/A'} | Remediation: ${routerData?.NEED_REMEDIATION || false} | Time: ${duration}ms`);

    } catch (err) {
        console.error("Serverless Function Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        } else {
            res.end();
        }
    }
}
