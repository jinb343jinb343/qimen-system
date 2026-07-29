import os
import typing
from openai import OpenAI, APIConnectionError, APIError, RateLimitError
# 若本地未安装 dotenv，请使用 pip install python-dotenv 安装
try:
    from dotenv import load_dotenv
    # 尝试加载当前目录或父目录的 .env 文件
    load_dotenv()
except ImportError:
    pass

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
BASE_URL = os.getenv("BASE_URL", "https://api.deepseek.com") 

# 在模块级别初始化客户端（若未配置 Key，在实际调用时会予以捕获并提示）
client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url=BASE_URL
)

# 【核心锁死】：奇门专家系统提示词
QIMEN_SYSTEM_PROMPT = """你是一位精通传统奇门遁甲的预测专家。你接下来的所有多轮对话和深入解答，必须严格基于用户给出的【当前奇门盘面基准】进行推演，绝对不准脱离盘面编造符号，不准顾左右而言他！"""

def call_qimen_llm(static_context: str, history_messages: typing.List[typing.Dict[str, str]], model_name: str = "deepseek-v4-flash") -> typing.Generator[str, None, None]:
    """
    向新模型发起流式请求的核心函数
    
    参数:
        static_context (str): 由翻译器生成的雷打不动静态奇门盘面文本
        history_messages (list): 经过 Session Manager 裁剪过的动态历史对话记录
        model_name (str): 动态双模型切换，默认为 "deepseek-v4-flash"
        
    返回:
        Generator 类型的流式响应文本
    """
    
    # 防御性判断：拦截空配置
    if not client.api_key:
        yield "【系统提示】DEEPSEEK_API_KEY 未配置，请在根目录 .env 文件中设置。"
        return

    # 1. 严格缝合 Payload
    # 第一顺位：融合 System Prompt 铁律，并强行拼入不可篡改的奇门盘面
    system_content = f"{QIMEN_SYSTEM_PROMPT}\n\n【当前奇门盘面基准】\n{static_context}"
    
    payload = [
        {"role": "system", "content": system_content}
    ]
    
    # 第二顺位：尾随动态对话，且该历史已被 `session_manager` 把控过长度
    payload.extend(history_messages)

    # 2. 动态双模型切换逻辑
    actual_model = "deepseek-v4-pro" if model_name == "deepseek-v4-pro" else "deepseek-v4-flash"

    # 3. 调用 API 并捕获断线异常 (KISS 防御性设计)
    try:
        response = client.chat.completions.create(
            model=actual_model,     # 动态双模型切换：PRO 或 FLASH
            messages=payload,
            stream=True,            # 核心机制：流式吐字，防超时卡死
            temperature=0.65        # 适中温度：保持推演理性，遏制幻觉发散
        )
        
        # 逐块返回流数据
        for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                yield content
                
    except APIConnectionError:
        yield "\n[通信中断] 无法连接到大模型服务器，请检查网络或代理环境。"
    except RateLimitError:
        yield "\n[限流拦截] 请求过频或额度不足，请稍后重试。"
    except APIError as e:
        yield f"\n[接口异常] 大模型服务返回错误: {e.message}"
    except Exception as e:
        yield f"\n[未知故障] 解盘流意外中断: {str(e)}"
