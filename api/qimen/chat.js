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

        const isFirstTurn = !history || history.length === 0;
        let diagnosisReport = "";
        const dynamicHistory = history || [];

        // ==========================================
        // Step 2: Diagnosis Phase - 诊断链生成 (仅首轮执行)
        // ==========================================
        if (isFirstTurn) {
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
            
            const firstTurnHistory = [{ role: "user", content: user_cmd }];
            const diagStream = callQimenLlm(diagSystemPrompt, firstTurnHistory, config.LLM_MODEL_DEFAULT);
            
            for await (const chunk of diagStream) {
                diagnosisReport += chunk;
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
            // 将本次问答加入上下文，供后续追问或化解使用
            dynamicHistory.push({ role: "user", content: user_cmd });
            dynamicHistory.push({ role: "assistant", content: diagnosisReport });
        } else {
            // 是追问，提取历史记录中的最后一次诊断结论作为上下文摘要
            diagnosisReport = dynamicHistory.filter(m => m.role === 'assistant').pop()?.content || "";
            dynamicHistory.push({ role: "user", content: user_cmd });
        }

        // ==========================================
        // Step 3: Remediation Phase 或 Detail Q&A Phase (追问分流)
        // ==========================================
        if (routerData.NEED_REMEDIATION) {
            // 输出华丽的分割线 (追问时也加上，如果是化解的话)
            res.write(`data: ${JSON.stringify({ content: '\n\n---\n\n# 🛡️ 首席破局与空间化解方案\n\n' })}\n\n`);
            
            let remSkillsText = "";
            // 如果 Router 没给 R 系列，兜底给 R00-R04 (主要为了防止追问时 Router 没带 R 列表)
            const rSkills = routerData.PIPELINE.filter(s => s.startsWith('SKILL_R'));
            const finalRSkills = rSkills.length > 0 ? rSkills : ["SKILL_R00", "SKILL_R01", "SKILL_R02", "SKILL_R03", "SKILL_R04"];

            for (const skill of finalRSkills) {
                remSkillsText += await getSkillContent(skill, 'remediation') + "\n\n";
            }

            const remSystemPrompt = `你是一位高阶奇门遁甲化解策略师。
基于以下前置的《诊断报告》上下文，请严格按照指定的化解策略库，为用户生成唯一最优的破局与物理空间调整方案。
⚠️禁止重新输出“一、二、三”的诊断报告，直接输出具体的化解战术和“拆补移”实操方案！

【化解策略指令库】
${remSkillsText}
`;
            const remHistory = [
                { role: "user", content: `用户的当前提问：${user_cmd}\n\n【前置诊断结论摘要】\n${diagnosisReport}\n\n请直接输出化解动作与物理空间调理方案。` }
            ];

            const remStream = callQimenLlm(remSystemPrompt, remHistory, config.LLM_MODEL_DEFAULT);
            for await (const chunk of remStream) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
        } else if (!isFirstTurn) {
            // 追问细节，不需要化解，直接基于上下文问答
            const qaSystemPrompt = `你是一位高阶奇门遁甲分析师。这是用户的追问环节。
请基于现有的盘面和之前的诊断上下文，直接、简炼、干脆地回答用户的具体追问（2-3段即可）。
⚠️严禁重新输出完整的《时空切片诊断报告》或化解方案！

【当前奇门盘面基准】
${staticPanContext}
`;
            const qaStream = callQimenLlm(qaSystemPrompt, dynamicHistory, config.LLM_MODEL_DEFAULT);
            for await (const chunk of qaStream) {
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
