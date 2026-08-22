const { OpenAI } = require('openai');
require('dotenv').config();
const config = require('../../_configs/qimen_config');

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('[Fatal] DEEPSEEK_API_KEY is missing. Set it in Vercel Environment Variables.');
  // Immediate fail to avoid silent errors
  throw new Error('DEEPSEEK_API_KEY missing');
}
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = process.env.BASE_URL || "https://api.deepseek.com";

const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: BASE_URL
});

const QIMEN_SYSTEM_PROMPT = `你是一位精通传统奇门遁甲的预测专家。你接下来的所有多轮对话和深入解答，必须严格基于用户给出的【当前奇门盘面基准】进行推演，绝对不准脱离盘面编造符号，不准顾左右而言他！\n\n【排版铁律】：禁止在你的回复中使用任何 Markdown 表格语法（即 |---| 结构）来罗列数据。所有宫位详情和符号解析，一律改用标准的“列表换行”或“粗体段落”格式来层层展开。`;


async function* callQimenLlm(systemPrompt, historyMessages, modelName = "deepseek-v4-flash") {
    if (!client.apiKey) {
        yield "【系统提示】DEEPSEEK_API_KEY 未配置，请在根目录 .env 文件中设置。";
        return;
    }

    const payload = [{ role: "system", content: systemPrompt }];
    payload.push(...historyMessages);

    const actualModel = modelName === "deepseek-v4-pro" ? "deepseek-v4-pro" : "deepseek-v4-flash";

    try {
        const stream = await client.chat.completions.create({
            model: actualModel,
            messages: payload,
            stream: true,
            temperature: config.LLM_TEMPERATURE
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta || {};
            const content = delta.content || "";
            const reasoning = delta.reasoning_content || "";
            
            // 兼容 DeepSeek 的深度思考/推理模型 (如 R1 或 V4 Flash 的变体)
            if (content) {
                yield content;
            } else if (reasoning) {
                yield reasoning; 
            }
        }
    } catch (error) {
        if (error.status === 401) {
            yield "\n[授权失败] API Key 无效或未提供正确认证。";
        } else if (error.status === 429) {
            yield "\n[限流拦截] 请求过频或额度不足，请稍后重试。";
        } else {
            yield `\n[系统异常] 大模型服务返回错误: ${error.message}`;
        }
    }
}

module.exports = { callQimenLlm, QIMEN_SYSTEM_PROMPT };
