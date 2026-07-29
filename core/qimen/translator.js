/**
 * 奇门遁甲全量数据文本翻译器 (100% 原汁原味直译)
 * 绝对不包含任何二次计算、推导或加工。原版 JSON 提供什么，就输出什么。
 */
function translateQimenBoardToMarkdown(data) {
    if (typeof data === 'string') return data;
    let lines = [];
    lines.push("═══════════════════════════════════════════");
    lines.push("   奇门遁甲盘面参数 · 供 Angnet 解盘使用");
    lines.push("═══════════════════════════════════════════\n");

    if (data.meta) {
        lines.push("【智能运筹诊断】");
        lines.push(`  占断模式：${data.meta.mode || ''}\n`);
        
        lines.push("【基本信息】");
        lines.push(`  排盘时间：${data.meta.time || ''}`);
        lines.push(`  当前节气：${data.meta.jieqi || ''}`);
        lines.push(`  排盘局数：${data.meta.ju || ''}`);
        lines.push(`  时旬首　：${data.meta.xunshou || ''}`);
        lines.push(`  值符星　：${data.meta.zhifu || ''}`);
        lines.push(`  值使门　：${data.meta.zhishi || ''}`);
        lines.push(`  旬空地支：${data.meta.xunkong || ''}`);
        lines.push(`  驿马地支：${data.meta.yima || ''}\n`);
    }

    if (data.bazi) {
        lines.push("【四柱八字】");
        lines.push(`  年柱（岁次）：${data.bazi.year || ''}`);
        lines.push(`  月柱（月建）：${data.bazi.month || ''}`);
        lines.push(`  日柱（日元）：${data.bazi.day || ''}`);
        lines.push(`  时柱（时神）：${data.bazi.hour || ''}\n`);
    }

    if (data.palaces) {
        lines.push("【九宫盘面参数】");
        lines.push("  格式：宫位 | 卦位-方位 | 神 | 星(旺衰) | 门[特殊] | 天干(长生) | 地干(长生) | 暗干 | 旬空/驿马");
        lines.push("  ─────────────────────────────────────────────────────────");
        
        // 按照原版排版顺序：巽4, 离9, 坤2, 震3, 中5, 兑7, 艮8, 坎1, 乾6
        const keys = [4, 9, 2, 3, 5, 7, 8, 1, 6]; 
        for (const key of keys) {
            if (!data.palaces[key]) continue;
            const p = data.palaces[key];
            if (key === 5) {
                lines.push(`  ● ${p.name}: ${p.detail}`);
                continue;
            }
            
            lines.push(`  ● ${p.name}`);
            lines.push(`      八神：${p.spirit}　　　　九星：${p.star}`);
            lines.push(`      八门：${p.gate}　　暗干：${p.hidden_stem}`);
            lines.push(`      天盘奇仪：${p.heaven_stem}　　地盘奇仪：${p.earth_stem}`);
            lines.push(`      十干克应：${p.ke_ying}`);
            if (p.remark) {
                lines.push(`      特殊标记：${p.remark}`);
            }
            lines.push("");
        }
    }

    if (data.geju_summary) {
        lines.push("【格局汇总】");
        for (const geju of data.geju_summary) {
            lines.push(`  ${geju}`);
        }
        lines.push("");
    }

    if (data.extra) {
        lines.push("【解盘请求】");
        lines.push("  以上为本次奇门遁甲排盘的完整参数。");
        lines.push("  请 Angnet 根据以上数据进行专业解盘分析。");
        lines.push(`  月令地支：${data.extra.yue_ling || ''}`);
        lines.push("═══════════════════════════════════════════");
    }

    return lines.join('\n');
}

module.exports = { translateQimenBoardToMarkdown };
