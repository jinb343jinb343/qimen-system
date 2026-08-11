import fontTools.subset
import sys

text = "观奇门遁甲机天发杀机，移星易宿；地发杀机，龙蛇起陆；人发杀机，天地反覆；天人合发，万变定基公历日期公历时间公历时刻寄宫方式寄宫规则（必选）始终寄坤二宫阳寄坤，阴寄艮阳坤阴艮寄坤使用当前时间返回门禁退出系统极速校准使用当前时间时机切入0123456789/:- []（）"
options = fontTools.subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.name_legacy = True
options.name_languages = ["*"]
options.recommended_glyphs = True
options.notdef_glyph = True
options.notdef_outline = True
options.glyph_names = True
options.symbol_cmap = True
options.legacy_cmap = True

font = fontTools.subset.load_font("assets/fonts/AaLieYanLiShu-2.ttf", options)
subsetter = fontTools.subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
fontTools.subset.save_font(font, "assets/fonts/Qimen-Robust.woff2", options)
print("Font subset generated successfully.")
