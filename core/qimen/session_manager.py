import typing

class QimenSession:
    """
    单体会话结构，严格遵循“双轨制隔离设计”
    """
    def __init__(self, static_pan_context: str):
        # 轨 1：雷打不动、不可裁剪的奇门盘面纯文本
        self.static_pan_context: str = static_pan_context
        # 轨 2：动态多轮聊天记录
        self.dynamic_history: typing.List[typing.Dict[str, str]] = []


class QimenSessionManager:
    """
    全局的会话管理器 (双轨制中央档案馆)
    """
    def __init__(self, max_history_length: int = 6):
        """
        初始化管理器
        :param max_history_length: 动态历史记录的滑动窗口最大长度（默认最近 6 条）
        """
        self.sessions: typing.Dict[str, QimenSession] = {}
        self.max_history_length = max_history_length

    def create_session(self, session_id: str, static_pan_context: str):
        """
        初始化用户的专属档案，注入静态盘面数据
        """
        self.sessions[session_id] = QimenSession(static_pan_context)

    def append_and_slide_history(self, session_id: str, role: str, content: str):
        """
        核心裁剪函数：追加对话并应用滑动窗口卡尺
        :param session_id: 用户或会话的唯一标识
        :param role: 对话角色 (如 'user', 'assistant')
        :param content: 对话内容
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} 未建立，请先调用 create_session()。")
            
        session = self.sessions[session_id]
        
        # 1. 追加最新的动态对话记录
        session.dynamic_history.append({
            "role": role,
            "content": content
        })
        
        # 2. 滑动窗口卡尺：保证 dynamic_history 的长度不超过 max_history_length
        # 这就是双轨制的核心：无论这里怎么裁（裁剪最早的对话），static_pan_context 都丝毫不受影响
        if len(session.dynamic_history) > self.max_history_length:
            # 仅保留最近的 max_history_length 条记录
            session.dynamic_history = session.dynamic_history[-self.max_history_length:]

    def get_session_payload(self, session_id: str) -> typing.List[typing.Dict[str, str]]:
        """
        组装最终要发送给大模型的 Payload（验证/输出用）
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} 不存在。")
            
        session = self.sessions[session_id]
        
        # 将静态的“奇门盘面文本”作为 System 或头部注入
        # 随后拼接所有保留在滑动窗口内的动态历史记录
        payload = [
            {"role": "system", "content": f"【奇门遁甲盘面（请严格以此为准进行解盘）】\n{session.static_pan_context}"}
        ]
        
        payload.extend(session.dynamic_history)
        return payload
