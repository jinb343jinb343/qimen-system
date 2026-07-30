import sys
import os
import unittest

# 确保将项目根目录加入 sys.path，以便能够正确识别和导入 core 模块
# 测试文件运行路径通常是在项目根目录
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from core.qimen.translator import translate_qimen_board_to_markdown
from core.qimen.session_manager import QimenSessionManager
from core.qimen.llm_client import call_qimen_llm

class TestQimenMemoryLimits(unittest.TestCase):
    def setUp(self):
        """
        测试前置准备：
        1. 初始化会话管理器（严格开启最近 6 条滑动窗口）。
        2. 准备物理测试盘面，并存入 Session。
        """
        self.session_mgr = QimenSessionManager(max_history_length=6)
        self.test_session_id = "harness_stress_test_999"
        
        # Mock 真实奇门局盘
        self.mock_qimen_json = {
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
        
        # 将原始 JSON 翻译为纯文本图纸，建立双轨制记忆通道
        static_pan_context = translate_qimen_board_to_markdown(self.mock_qimen_json)
        self.session_mgr.create_session(self.test_session_id, static_pan_context)

    def _ask_model(self, question: str) -> str:
        """封装调用大模型的单次对话"""
        self.session_mgr.append_and_slide_history(self.test_session_id, role="user", content=question)
        
        session = self.session_mgr.sessions[self.test_session_id]
        response_stream = call_qimen_llm(
            static_context=session.static_pan_context,
            history_messages=session.dynamic_history,
            model_name="deepseek-v4-pro"
        )
        
        # 同步收集大模型的返回流
        full_answer = "".join(chunk for chunk in response_stream)
        if full_answer:
            self.session_mgr.append_and_slide_history(self.test_session_id, role="assistant", content=full_answer)
            
        return full_answer

    def test_qimen_memory_retention(self):
        """核心断言卡尺测试：多轮轰炸与记忆验真"""
        
        # 3. 模拟极端用户的 8 轮连续刁钻追问
        stress_questions = [
            "大师你好，我想看看今年做服装生意的财运如何？",
            "我看盘里好像有空亡，这是什么意思？",
            "空亡具体怎么解呢？能提供点实操方法吗？",
            "如果我 9 月份去冲实它，应该选哪个方位？",
            "如果是秋天，这个方位的五行旺衰变了，又会有什么影响？",
            "那个方位的神将对我有没有帮助？",
            "除了方位，我在做生意时还需要注意什么贵人吗？",
            "这个财运大概能在哪个月份兑现？"
        ]
        
        print(f"\n[Harness] 开始模拟 {len(stress_questions)} 轮极端压力对话...")
        for i, q in enumerate(stress_questions):
            print(f"[Round {i+1}] 大模型推演中...")
            self._ask_model(q)
            
        # 4. 发起第 9 轮终极考验
        ultimate_question = "请问我们刚才一直在推演的这个奇门局中，生门落在哪个宫？值符又落在哪个宫？"
        print("\n[Harness] 触发第 9 轮终极断言提问 (此刻最早的历史记录已被裁剪丢失) ...")
        final_answer = self._ask_model(ultimate_question)
        
        print(f"\n======================================")
        print(f"[大模型终局回答]:\n{final_answer}")
        print(f"======================================\n")
        
        # 5. 【核心断言卡尺】：验证大模型是否坚守住了静态盘面记忆
        # 物理盘面基准：
        # - 生门 -> 艮八宫 (或者包含'艮'和'八')
        # - 值符 -> 坎一宫 (或者包含'坎'和'一')
        
        is_shengmen_correct = "艮" in final_answer or "八宫" in final_answer or "8宫" in final_answer
        is_zhifu_correct = "坎" in final_answer or "一宫" in final_answer or "1宫" in final_answer
        
        self.assertTrue(is_shengmen_correct, "[RED] 断言失败！大模型失忆，未能准确报出生门所在的宫位。")
        self.assertTrue(is_zhifu_correct, "[RED] 断言失败！大模型失忆，未能准确报出值符所在的宫位。")
        
        print("[GREEN] 断言通过！系统成功抵御了长对话滑动裁剪造成的遗忘风险，雷打不动的数据层防卫成功。")

if __name__ == '__main__':
    unittest.main()
