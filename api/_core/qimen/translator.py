import typing

def translate_qimen_board_to_markdown(board_data: typing.Dict[int, typing.Dict[str, str]]) -> str:
    """
    将奇门遁甲排盘数据（九宫格字典）转换为优雅的 Markdown 纯文本。
    
    参数:
        board_data (dict): 九宫格数据字典，键为宫位（如 1-9），值为包含星、门、神、三奇六仪等信息的字典。
                           示例: 
                           {
                               1: {"palace": "坎一宫", "star": "天蓬", "gate": "休门", "spirit": "值符", "heaven_stem": "戊", "earth_stem": "己"},
                               ...
                           }
                           
    返回:
        str: 拼接好的 Markdown 纯文本
    """
    markdown_lines = []
    
    markdown_lines.append("# 奇门遁甲排盘信息\n")
    
    # 遍历九宫格数据并拼接为 Markdown
    for palace_idx, palace_info in sorted(board_data.items()):
        palace_name = palace_info.get('palace', f"宫位 {palace_idx}")
        star = palace_info.get('star', '无')
        gate = palace_info.get('gate', '无')
        spirit = palace_info.get('spirit', '无')
        heaven = palace_info.get('heaven_stem', '无')
        earth = palace_info.get('earth_stem', '无')
        
        markdown_lines.append(f"## {palace_name}")
        markdown_lines.append(f"- **八神**: {spirit}")
        markdown_lines.append(f"- **九星**: {star}")
        markdown_lines.append(f"- **八门**: {gate}")
        markdown_lines.append(f"- **天地盘**: 天盘【{heaven}】 / 地盘【{earth}】\n")
        
    return "\n".join(markdown_lines)

# TODO: 后续按需增加针对整个局（如用局、日空、时空等）的解析逻辑
