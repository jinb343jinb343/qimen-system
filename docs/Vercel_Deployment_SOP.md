# 奇门遁甲 V2.0 云端部署与架构防坑指南 (Vercel SOP)

> 本文档用于记录从本地开发向 Vercel 云原生 (Serverless + 静态前端) 混合模式部署时的核心雷区与标准操作流程 (SOP)。后续任何 Agent 或人类开发者更新代码时，**必须严格遵守此架构，违者必导致云端大崩溃。**

---

## 一、 核心架构拓扑图

为了兼容 Vercel 那极其敏感的“零配置智能推断引擎”，项目的绝对架构结构必须保持如下：

```text
根目录 (qimen-system)/
├── index.html                  # 【前端唯一入口】纯 HTML，绝对不能被 Node 引擎污染
├── static_js/                  # 【前端脚本堡垒】所有前端 js 必须放在这，绝对不能放在根目录
├── docs/                       # 【文档区】
└── api/                        # 【云端后端禁区】Vercel 规定的 Serverless 运行空间
    ├── package.json            # 后端的所有依赖 (如 openai) 必须且只能在这里
    ├── qimen/
    │   └── chat.js             # 【唯一的合法接口】向前端暴露的实际调用入口
    ├── _core/                  # 内部工具逻辑 (带下划线，必须对外隐身)
    ├── _configs/               # 配置文件 (带下划线，必须对外隐身)
    └── _skills/                # SOP 提示词 (带下划线，必须对外隐身)
```

---

## 二、 绝对不准触碰的三大铁律

### 铁律 1：根目录禁区 (防 `document is not defined` 崩溃)
*   **严禁在根目录放置 `package.json`**：只要放了，Vercel 就会把整个前端当做纯 Node.js 服务去构建，必然爆红寻找入口文件。
*   **严禁在根目录放置任何 `app.js` 或 `*.js`**：Vercel 的雷达极易将根目录的 js 误判为云函数（Serverless Function），如果在服务器端跑了包含 `document.getElementById` 的代码，页面将直接返回 **500 崩溃**。前端脚本必须永居 `static_js/`。

### 铁律 2：API 目录的下划线隐身法 (防 Build Error 爆红)
*   `api/` 目录下放置的任何非接口文件（如 `_core` 运算引擎、`_configs` 配置文件），**其文件夹命名必须以下划线 `_` 开头**。
*   **原理**：Vercel 默认会将 `api/` 里的每一个文件都强行编译成云函数。如果不加下划线屏蔽，Vercel 就会强行把普通的工具代码当成 API 去打包，导致严重语法编译错误，系统永久死锁。

### 铁律 3：Vercel 幽灵缓存与核弹重置
*   如果遇到“同一个代码，预览（Preview）是绿灯，主线生产（Production）是红灯 Error”的情况。
*   **不要再改代码了！** 这是 Vercel 主力服务器残留的脏缓存卡死了。
*   **唯一解法**：去 Vercel 的 `Settings -> General` 拉到最底下，**Delete Project** 删掉项目，然后回到首页重连 GitHub 仓库一键导入。
*   *(切记：重新导入时必须在 Environment Variables 中补填 `DEEPSEEK_API_KEY`！)*

### 铁律 4：绝对禁止在跨平台脚本中破坏 UTF-8 编码 (防 500 SyntaxError 崩溃)
*   如果使用 Windows 的 PowerShell 脚本 (如 `-replace` 命令) 去批量修改含中文字符的 `.js` 代码，**极易破坏原文件的 UTF-8 编码**，导致中文字符变成乱码，甚至吞噬相邻的引号。
*   一旦乱码文件推上 Vercel，Node.js 引擎在解析 `chat.js` 等入口文件时，会直接抛出 `SyntaxError: Invalid or unexpected token`，导致大模型通信瞬间崩溃 (返回 500 错误)。
*   **规范**：代码内的字符串/路径替换，必须使用安全的 IDE 或者原生 Node.js 流操作，确保文件编码永久保持纯净的 UTF-8。

---

## 三、 本地开发与更新流转

1.  **开发与更新**：如果只是更新前台 UI，直接修改 `index.html` 和 `static_js/` 里的文件。如果更新提示词，修改 `api/_skills/qimen_sop.md`。
2.  **推送云端**：正常的 `git add .` -> `git commit` -> `git push`。只要不破坏上述目录结构，Vercel 必然每次秒亮绿灯。
3.  **日志审计**：如果出现连不上的情况，一定要去 Vercel 的 `Deployments` 里点开那条记录，看最下方的 `Runtime Logs`（不是 Build Logs），确认大模型秘钥是否正常工作。
4.  **端侧防坑（乌龙警报）**：在历经重置与重构后，手机端或电脑端经常会保留**旧版的网页链接**或严重的浏览器缓存。当发现后端绿灯但前端依然报“通信中断”时，第一件事是检查当前浏览器地址栏的链接是否是最新的 Vercel Project 链接，并开启无痕模式测试。

**—— 由 Antigravity 架构师签署封印 (2026.07)**
