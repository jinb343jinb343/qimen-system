const { translateQimenBoardToMarkdown } = require('../_core/qimen/translator');
const { callQimenLlm } = require('../_core/qimen/llmClient');
const config = require('../_configs/qimen_config');

// 方案 A: 内存单例缓存
let globalSopCache = null;
async function getSopContent() {
    if (globalSopCache !== null) return globalSopCache;
    try {
        const fs = require('fs').promises;
        const path = require('path');
        const sopPath = path.join(__dirname, '../_skills/qimen_sop.md');
        globalSopCache = await fs.readFile(sopPath, 'utf-8');
    } catch (e) {
        console.warn("未找�?SOP 文件，降级为普通模�?);
        globalSopCache = "";
    }
    return globalSopCache;
}

module.exports = async function handler(req, res) {
    // 仅允�?POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Vercel 环境�?req.body 已经被自动解析为 Object
        const body = req.body || {};
        const { session_id, raw_qimen_json, user_cmd, history } = body;

        // 如果负载过大，物理级截断 (防恶意构�?
        if (JSON.stringify(body).length > config.MAX_PAYLOAD_SIZE) {
            return res.status(413).json({ error: "Payload Too Large: 请求体过大，已被系统拦截�? });
        }

        // 每次请求动态生成核心上下文
        const staticPanContext = translateQimenBoardToMarkdown(raw_qimen_json);
        const sopContent = await getSopContent();

        const { QIMEN_SYSTEM_PROMPT } = require('../_core/qimen/llmClient');
        const systemPrompt = `${QIMEN_SYSTEM_PROMPT}\n\n${sopContent}\n\n【当前奇门盘面基准】\n${staticPanContext}`;
        
        // 装载前端传来的历史记忆，并追加当前问�?        const dynamicHistory = history || [];
        dynamicHistory.push({ role: "user", content: user_cmd });

        // 设置 SSE 响应�?        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 发送给 LLM 处理流式响应
        const responseStream = callQimenLlm(systemPrompt, dynamicHistory, config.LLM_MODEL_DEFAULT);
        
        for await (const chunk of responseStream) {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        
        res.write(`event: done\ndata: "[DONE]"\n\n`);
        res.end();
    } catch (err) {
        console.error("Serverless Function Error:", err);
        // 如果连接尚未发�?headers，则发�?500
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        } else {
            res.end();
        }
    }
}

