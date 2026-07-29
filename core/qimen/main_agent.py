import sys
import typing

# 导入步骤 1, 2, 3 的核心模块
from core.qimen.translator import translate_qimen_board_to_markdown
from core.qimen.session_manager import QimenSessionManager
from core.qimen.llm_client import call_qimen_llm

# 全局单例的会话管理器，默认最近 6 条滑动窗口
session_mgr = QimenSessionManager(max_history_length=6)

def run_qimen_chat_flow(session_id: str, raw_qimen_json: typing.Dict[int, typing.Dict[str, str]], user_question: str):
    """
    统一的解盘控制流函数
    参数:
        session_id: 当前用户的唯一会话ID
        raw_qimen_json: 未翻译的原始奇门排盘 JSON 数据
        user_question: 用户的提问文本
    """
    # 1. 首次提问初始化：如果 Session 不存在，则先翻译并锁定盘面
    if session_id not in session_mgr.sessions:
        print("【系统内部】检测到新会话，正在将原始 JSON 翻译为纯文本图纸...")
        static_pan_context = translate_qimen_board_to_markdown(raw_qimen_json)
        # 建立双轨制记忆通道
        session_mgr.create_session(session_id, static_pan_context)
    
    # 2. 将用户的最新问题追加进动态历史
    session_mgr.append_and_slide_history(session_id, role="user", content=user_question)
    
    # 3. 提取当前会话的物理隔离上下文
    session = session_mgr.sessions[session_id]
    static_context = session.static_pan_context
    history_messages = session.dynamic_history
    
    # 4. 调用大模型，【显式传入 model_name="deepseek-v4-pro"】确保最高智商
    print("【DeepSeek-V4-Pro】正在解盘推演中，请稍候...\n", end="", flush=True)
    response_stream = call_qimen_llm(
        static_context=static_context,
        history_messages=history_messages,
        model_name="deepseek-v4-pro"
    )
    
    # 5. 流式打印到终端，并实时收集完整答案
    full_answer = ""
    for chunk in response_stream:
        print(chunk, end="", flush=True)
        full_answer += chunk
        
    print("\n")  # 换行，保证终端格式整洁
    
    # 6. 核心动作：将大模型的回答追加进动态历史，并触发最近 6 条自动裁剪限制
    if full_answer:
        session_mgr.append_and_slide_history(session_id, role="assistant", content=full_answer)

if __name__ == "__main__":
    # Mock 一份用于终端交互测试的奇门局盘 JSON 数据
    mock_qimen_json = {
        1: {"palace": "坎一宫", "star": "天蓬星", "gate": "休门", "spirit": "值符", "heaven_stem": "戊", "earth_stem": "己"},
        2: {"palace": "坤二宫", "star": "天芮星", "gate": "死门", "spirit": "九天", "heaven_stem": "乙", "earth_stem": "辛", "remark": "逢空亡"},
        3: {"palace": "震三宫", "star": "天冲星", "gate": "伤门", "spirit": "九地", "heaven_stem": "壬", "earth_stem": "癸"},
        4: {"palace": "巽四宫", "star": "天辅星", "gate": "杜门", "spirit": "玄武", "heaven_stem": "丁", "earth_stem": "壬"},
        5: {"palace": "中五宫", "star": "天禽星", "gate": "未门", "spirit": "未知", "heaven_stem": "庚", "earth_stem": "庚"},
        6: {"palace": "乾六宫", "star": "天心星", "gate": "开门", "spirit": "白虎", "heaven_stem": "辛", "earth_stem": "乙"},
        7: {"palace": "兑七宫", "star": "天柱星", "gate": "惊门", "spirit": "六合", "heaven_stem": "癸", "earth_stem": "丁"},
        8: {"palace": "艮八宫", "star": "天任星", "gate": "生门", "spirit": "太阴", "heaven_stem": "丙", "earth_stem": "庚"},
        9: {"palace": "离九宫", "star": "天英星", "gate": "景门", "spirit": "螣蛇", "heaven_stem": "己", "earth_stem": "丙"}
    }
    
    test_session_id = "test_user_001"
    
    print("==================================================")
    print("【奇门遁甲智能解盘系统】 - 终端深度对话测试版已启动")
    print("当前使用的 LLM 引擎：DeepSeek-V4-Pro (硬编码切换)")
    print("已挂载测试局盘（含天芮星、逢空亡、生门等特征）")
    print("（输入 'exit' 或 'quit' 退出终端系统）")
    print("==================================================")
    
    while True:
        try:
            # 持续拉起 Input 交互框
            user_input = input("\nInput >>> ")
            if user_input.strip().lower() in ["exit", "quit"]:
                print("系统已正常退出。")
                break
                
            if not user_input.strip():
                continue
                
            # 执行完整的后端推演闭环
            run_qimen_chat_flow(
                session_id=test_session_id,
                raw_qimen_json=mock_qimen_json,
                user_question=user_input
            )
        except KeyboardInterrupt:
            print("\n系统被强制退出。")
            break
        except Exception as e:
            print(f"\n[致命故障] 解盘主控系统发生崩溃: {str(e)}")
