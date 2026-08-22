require('dotenv').config();

module.exports = {
    // 服务器配置
    PORT: process.env.PORT || 8086,
    MAX_PAYLOAD_SIZE: 1024 * 512, // 512 KB 的请求体护城河，防 OOM

    // LLM 配置
    LLM_MODEL_DEFAULT: "deepseek-v4-pro", // 恢复使用原版模型，因为 flash 模型在当前接口下无响应
    LLM_TEMPERATURE: 0.65, // 玄学业务阈值，适中温度
};
