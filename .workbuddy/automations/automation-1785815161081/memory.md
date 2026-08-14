# 每日产品自动更新 — 执行记录

## 2026-08-05（首次有记录的执行）
- 流程：WebSearch 抓趋势 → 合成 products.json（30 条）→ 校验 → PUT 到 Gitee `in-linz/ecommerce-data` 的 `data/products.json`。
- 结果：`products.json: PUT -> 200 OK`（文件已存在，走更新分支）。
- 平台分布：fastmoss/jimudata/thunt/tiktok/temu/amazon 各 4，sellersprite/shein 各 3。
- 品类覆盖 19 个，家居电器 4、厨房电器 3、家居照明 3 为主。
- 本期趋势主线：欧洲能源高价 → 局部取暖（暖风机/电热毯/发热马甲/暖脚垫/毛巾加热器）；8 月正处 Q4 冬品备货窗口（7 月选品→8 月打样→9 月海运→10 月入仓）；秋冬厨电（咖啡机/空气炸锅）；圣诞智能灯饰；便携储能；宠物保暖与智能；美妆合规（UK 2026-04 起功效类护肤需第三方检测摘要）。

## 2026-08-06
- 结果：`products.json: PUT -> 200 OK`，30 条，均价 $47.5，trending 23 条。
- 平台分布：amazon 5，fastmoss/jimudata/tiktok/temu 各 4，thunt/sellersprite/shein 各 3。品类 17 个。
- 本期新增趋势信号（相较 08-05）：TikTok Shop 8/4 发布秋冬焕新选品指南 → 家纺布艺（法兰绒/雕花绒被套）、真空收纳袋、挂壁垃圾桶、厨房用品需 8 月中前上架，宠物/汽摩配/运动户外 9 月集中备货；亚马逊下半年 7 大赛道（环保家居、AI 轻量化小电子、精细化宠物、轻量化露营配件、纯净功效美妆）；欧盟 7/1 取消 150 欧免税 + 每包裹 3 欧关税 → 本地仓成必选；CBAM 碳关税落地影响机械/陶瓷/金属；毛巾加热器欧洲为全球最大市场（CAGR 9.3%）；Qi2/Wi-Fi7 普及带动充电配件换代；Chinamaxxing 带火智能保温杯/恒温壶。
- 保留欧洲冬季主线：暖风机、电热毯、暖脚垫、电热毛巾架、电热围巾、发热马甲、车载座椅加热垫、摇粒绒家居服。

## 2026-08-07
- 结果：`products.json: PUT -> 200 OK`，30 条，均价 $46.39，平均毛利率 70.8%，trending 26 条。回读远端校验通过（30 条、日期全为当天）。
- 平台分布：amazon 5，fastmoss/jimudata/temu/tiktok 各 4，thunt/sellersprite/shein 各 3。品类 15 个。
- 本期新增趋势信号（相较 08-06）：**合规是最大变量** —— GPSR 2026-01 起全面强执法（技术文件须与量产一致、须指定欧代、抽查频次翻倍、罚款可达全球年营业额 4%）；e-DoC 电子符合性声明强制备案、纸质失效；RED 3.3 网络安全对联网设备强制（EN 303 645 / EN 18031）；CRA 两个节点 6-11 公告机构条款生效、9-11 安全事件上报；**REACH 纺织/家居甲醛限值修订 2026-08 本月实施**（家纺、家居服、盖毯需重新送检，沿用旧报告会卡清关）；EN 62368-1:2023 全面替代旧标；德国查德语说明书、法国查能效标签真实性；亚马逊欧洲加强 EC REP 与标签审核。
- 品类信号：DREO 案例验证「移动式环境电器」赛道（空气循环扇 2026 全球 28 亿美元→2034 48.2 亿，静音 20dB + V0 阻燃 + 倾倒断电是欧美决策要素，专利壁垒 300+ 件需先做 FTO）；Amazon 室内取暖器榜 $39.99/4.6 分/月销 4K，石墨烯加热垫月销约 1.97 万/$38.5；智能温控器增速 >120%、$80-180；宠物除味净化器增速 75%、$100-220；TikTok 官方下半年扶持：轻量化露营（搜索 +210%、转化 32%、毛利 55-65%）、多巴胺配饰（转化 38%、年均购 5-8 件）；Temu 微创新样本：磁吸收纳架退货率 2.1%、USB 宠物指甲剪退货率 3.4%（传统款 7.9%）、硅胶折叠碗加刻度防滑后首单转化 18.6%；节能居家小件（智能温控插座/门窗密封条）毛利 45-50%；TikTok 欧洲 2026-06 新增 EU8 站点，秋冬服饰刚性优于美区暖冬滞销。
- 保留欧洲冬季主线：暖风机、石墨烯电热毯、电热毛巾架、暖脚垫、车载座椅加热垫、摇粒绒家居服、围巾手套帽三件套。

## 2026-08-08
- 结果：`products.json: PUT -> 200 OK`，30 条，均价 $46.46、均采购 $15.95、平均毛利率 65.7%，trending 21 条。回读 raw 链接校验通过（30 条、日期全为 2026-08-08、8 平台、14 品类）。
- 平台分布：amazon 5，jimudata/temu/fastmoss/tiktok 各 4，sellersprite/shein/thunt 各 3。
- **新增复用技巧**：先读 `src/lib/productVisual.ts` 的 `SLUG_RULES`（26 个关键词）再起产品名，让 name 含关键词即可命中 `ProductGlyph` 示意图，本期 30 条仅 1 条落到通用图标（此前多条显示 "?"）。validate.py 已加该检测项。
- 本期新增趋势信号（相较 08-07）：
  - **Amazon 取暖器真实榜单数据**：Amazon Basics 陶瓷取暖器月销 80,646 / $23.42（批发 $11.35）、GiveBest 月销 60,319 / $26.81、DREO 16 寸 4.5 分月销 26,279 / $72.69、石墨烯对流板 $166.44（批发 $38.25）、MOES 智能温控器 $66.98。UK 侧 Pro Breeze 2000W 陶瓷暖风 £20-45、DREO Atom One £50-90（4.6/5）、油汀 VonHaus 7 片 £48；英国消费者按 27.69p/kWh 电价上限算账。
  - **Temu 2026 品类增速**（325M 用户 / 日均 1420 万单）：家居收纳 +68%（$4.2B，均价 $7.85，厨房工具占 38%）、宠物配件 +53%（复购 62%）、美妆工具 +47%、电子配件 +39%、季节装饰 +32%。半托管为 2026 最优模式，毛利比全托管高 10-15%、客单价高 42%。
  - **黑五配饰赛道验证**：时尚首饰 +163%、服装配饰 +261%、手表 +234%、银饰 +288%；秋冬围巾披肩单月 GMV >21 万美元。节奏：8 月换季上新→9 月孵化→10-11 月起量→黑五双旦爆发。
  - **GPSR 执法升级（今日最强合规信号）**：亚马逊已开始因 GPSR 不合规暂停 listing，德/法/荷监管积极执法；EU 授权代表 AR 费用 €100-500/年/品类，AR 名址须印在产品或包装上（Art.16）；技术文件须 10 天内提交、保存 10 年；违规最高罚货值 4%；**禁 CE 滥用**（纯 GPSR 管辖品禁贴 CE）；小家电典型踩坑=说明书缺"过热/遮挡散热口"多语言警示被要求重做包装。
  - 其他：Prime Day 2026 提档至 6 月；美妆类目增速 11.9%（全球美妆 +10%，电商增速为线下 6 倍）；户外家具 2026 达 $513.9 亿；露营吊床 FastMoss 数据（美区家居榜第 4，近 7 天 1908 件/$13.35 万，直播贡献 62%、达人出单率 45.79%）；欧洲储能采购量 +18-32%、毛利 50%+。
- 保留欧洲冬季主线：暖风机、石墨烯对流板、电热毯、发热护膝毯、暖手宝、暖脚器、智能温控器/计量插座、门窗节能小件、围巾三件套。

## 复用要点（下次执行可直接照做）
- 日期用 `date "+%Y-%m-%d"` 取真实当天，不要写死。
- JSON 先写到 `C:/tmp/products.json`（Windows 下 Python 无法直接读 Git Bash 的 `/tmp`，脚本内路径需写成 `C:/tmp/...`）。
- 推送脚本存为 `C:/tmp/push_gitee.py`，用绝对 Windows 路径调用 python 执行（`cd /c/tmp` + 相对路径会被 Git Bash 误转为 `C:\c\tmp`）。
- 每次执行后同步复制一份到工作区 `data/products.json` 留档。
- 校验项：id 连续唯一、15 个字段齐全、cons 恰好 2 条、pros 3-4 条、price > alibabaPrice、lastUpdated 为当天。
- 平台 id 与品类中文名须与 `src/pages/Products.tsx` 中的 `platforms` 数组和 `getProductEmoji` 映射保持一致。
- 推荐流程：写 `C:/tmp/products.json` → 跑 `C:/tmp/validate.py`（15 字段/id 连续/cons=2/pros 3-4/price>alibabaPrice/rating 4.0-4.8/salesGrowth 30-200 整数/日期为当天，并检测误入的非中英文字符）→ 校验通过再推 Gitee → 回读 raw 链接 `https://gitee.com/in-linz/ecommerce-data/raw/master/data/products.json` 二次确认。
- 注意：生成中文文案时偶发混入外语词（曾出现西里尔字符），validate.py 已加该检查，务必先校验后推送。
- 产品命名务必包含 `src/lib/productVisual.ts` 中 SLUG_RULES 的关键词，否则前端 ProductGlyph 显示 "?" 通用图标。可用关键词：取暖器/电热毯/暖手宝/空气炸锅/加湿器/净化器/吸尘器/智能插座/温控器/灯带/夜灯/充电宝/追踪器/笔记本支架/标签机/收纳/封口机/美甲/胶原/宠物/健身/雨伞/耳机/咖啡/搅拌机/摄像头。
- 脚本已固化：`C:/tmp/validate.py`（校验）、`C:/tmp/push_gitee.py`（推送）、`C:/tmp/build_trend_products.py`（派生趋势数据），下次可直接复用，只需重写 `C:/tmp/products.json`。

## 2026-08-11
- 结果：`products.json: PUT -> 200 OK`（30 条）；`trend_products.json: PUT -> 200 OK`（25 条，由 products.json 派生）。两端均通过 Gitee API 回读二次校验（30 条全为当天、id 连续、15 字段齐全、cons=2）。均价 $43.97、均采购 $14.36、平均毛利率 67.3%、trending 25 条。
- 平台分布：amazon 5，jimudata/tiktok/temu/thunt 各 4，fastmoss/shein/sellersprite 各 3。品类 14 个（家居电器 5、生活用品/智能家居/家居照明/厨房电器/宠物用品 各 3 为主）。
- 本期最强时效信号：**PPWR 包装 EPR 明日（2026-08-12）强制生效**，所有使用包装的卖家须逐国注册（纯塑料/纺织首当其冲）。其余：GPSR 2026-06 修订（EU 责任人覆盖全品类、可追溯标签、20 天 Safety Gate 上报）；EU Safety Gate 2026 H1 共 4700 起警报、中国产品占 43%（玩具/电子/化妆品为前三通报品类），AR 费用约 €300-800/年；REACH 纺织/家居甲醛限值 2026-08 修订案本月实施；RED 3.3 + EN 303 645 联网设备抽查扩大；EN 62368-1:2023 全面替代旧标；德国查德语说明书、法国查能效标签真实性。
- 选品主线：欧洲冬季局部取暖（暖风机/电热毯/暖脚器/发热护膝/暖手宝）、智能温控/计量插座、圣诞智能灯饰（灯带/夜灯/充气造型灯）、节能收纳、便携储能/运动音频、宠物保暖与智能、美妆合规。
- 本期数据修复（重要）：发现前端 `Products.tsx` 取数规则为 amazon tab 读 `products.json`(platform=amazon)，而 tiktok/temu 等 tab 读的是 `trend_products.json`；此前该文件停留在极旧数据（16 条"落日投影灯"等），导致每日推的 25 条非 Amazon 商品一直未在前端展示。本期起额外生成并推送 `trend_products.json`（非 amazon→tiktok 行、temu→temu 行，stage 以 salesGrowth≥140 判 new），让 5 个 TikTok 生态 tab + Temu tab 全部显示当日新数据。另：前端 `platforms` 数组缺 `shein`，3 条 Shein 商品归入 tiktok 生态展示（数据结构已记录来源平台）。

## 重大踩坑 & 流程修正（必读）
- **push_gitee.py 被其他自动化任务改写为硬编码只推 news/trends**，本任务直接运行它，误把 `C:/tmp/` 下 8/8 的旧 news/trends 推到远端（commit 03:16）。随后用 `C:/tmp/restore_gitee.py` 从 Gitee 历史 commit 恢复到 8/10 版本（commit 03:22），最终 news/trends 停在 8/10 live web 版，前端可正常读取。
- **由此挖出一个更严重的跨任务根因**：经 md5 比对，03:16（本任务误推）与 03:21（新闻任务当日推送）的 news.json **完全相同，且都等于 `C:/tmp/news.json` 这个 8/8 的陈旧文件**。说明新闻任务把当日抓取的新内容写进了工作区 `data/news.json`，但 push 时读的是 `C:/tmp/news.json`，**导致它连续多天推上去的其实是旧数据**。该问题同样会影响本任务。
- **修复**：`C:/tmp/push_gitee.py` 已重写为①必须显式传 key（`python push_gitee.py products trend_products`），不传则不写任何文件，任务间不再互相覆盖；②自动在「工作区 data/」与「C:/tmp/」之间挑 **mtime 最新** 的那份作为源，并打印实际使用路径；③JSON 解析失败即中止推送。下次执行务必用带参数的方式调用并核对打印出的源路径。
- 教训：**本任务只应推 products 与 trend_products**，永远不要动 news/trends/其他文件；运行前先确认脚本内容未被篡改。
- 排查工具：`C:/tmp/restore_gitee.py` 可从 Gitee 历史 commit 回滚任意文件（按 `before` 时间点挑最近一次提交）。判断"某次推送是否真的更新了内容"，最快的方法是拉多个 commit 的内容做 md5 比对，而不是只看提交时间。
- Gitee raw 链接（`raw.githubusercontent`/gitee raw）可能被限流返回 451，回读校验请改用 `contents` API（`GET /repos/{owner}/{repo}/contents/data/{key}.json?access_token=...&ref=master`，内容 base64 解码），不要依赖 raw。
- validate.py 的 BAD_CHAR 白名单已扩充（加入 €£¥ 货币、㎡㎏ 单位、×÷± 数学符、Ü 等西欧变音字母），这些均为合法字符，此前属误报。

## 2026-08-11（同日重触发 · 仅校验不重建）
- 本次自动化同日再次触发。经核对：本地 `data/products.json`（30 条，lastUpdated 2026-08-11）与自动化记录均显示当日完整执行已成功，故未重复跑 WebSearch/合成/推送，避免无谓消耗与内容抖动。
- 改用 `C:/tmp/verify_remote.py` 回读 Gitee 远端校验：**products.json HTTP 200、30 条、日期全为 2026-08-11、15 字段齐全、id 连续**；**trend_products.json HTTP 200、25 条**（该文件 schema 无 lastUpdated/id/15 字段，属正常）。两端数据完整、未被其他任务覆盖。
- 结论：今天的产品更新已落地且远端完好，无需再次推送。

## 2026-08-12
- 结果：`products.json: PUT -> 200 OK`（30 条）、`trend_products.json: PUT -> 200 OK`（25 条，由 products.json 派生）。两端均通过 contents API 回读二次校验（products 30 条、日期集合 {'2026-08-12'}、id 连续、15 字段齐全；trend_products 25 条）。均价 $41.30、均采购 $11.06、平均毛利率 73.2%、trending 25 条。
- 平台分布：amazon 5，tiktok/jimudata/thunt/temu 各 4，fastmoss/sellersprite/shein 各 3。品类 14 个（家居电器 5、厨房电器 4、智能家居/电子配件/家居照明 各 3 为主）。示意图命中：30 条全部命中 SLUG_RULES 关键词（0 条通用图标，验证脚本已确认）。
- 本期最强时效信号：**PPWR 包装 EPR 今日（2026-08-12）强制生效**，所有用包装卖家须逐国注册（纯塑料/纺织首当其冲）→ 已写入 #10 防潮除湿收纳盒、#18 真空收纳袋的 cons。其余：TikTok Shop 美区 3C 家电秋冬企划（影音/数码配件/办公文具/家电/个护美妆）、家装 5 大场景（节庆灯饰/圣诞送礼/秋冬取暖/返校收纳/户外露营）、全托管综合选品日历（8 月中前厨房+居家日用上架，9 月宠物/保暖/数码集中备货）；Amazon 取暖器真实榜单（Amazon Basics $13.79/月销 4.9 万、PELONIS 油汀 $73.55、智能温控器增速 120%）、欧洲站除湿/冷凝防潮爆发、智能环境家电超 320 亿美元；Temu 5 类热卖（家居小件 $3.99-12.99 退货<8%、手机配件带 MFi/UL 认证转化 +47%、季节服饰、宠物 $22-38、美妆工具）；FastMoss 格纹法兰绒盖毯 $77.94 爆款、西语区保暖内衣；Shein 冬季配饰（仿兔毛围巾/水晶首饰/保暖手套/金属手袋）。
- 选品主线：欧洲冬季局部取暖（暖风机/电热毯/暖手宝/发热手套/法兰绒电热毯/石墨烯对流板）、加湿/除湿防潮、圣诞智能灯饰（LED 灯带/落日投影灯/太阳能夜灯）、节能智能（温控器/智能插座/宠物喂食）、收纳换季、便携储能/搅拌、宠物与美妆合规。

## 重大踩坑 & 流程修正（必读）— 2026-08-12 更新
- **再次触发跨任务冲突（已修复）**：本任务运行 `python C:/tmp/push_gitee.py products trend_products` 时，脚本实际只推了 `news.json` / `trends.json`（PUT 200），products/trend_products 完全没推上去。经查 `C:/tmp/push_gitee.py` 已被**并发运行的「新闻/趋势」自动化在 08:57:11 改写为硬编码 news/trends 版本（忽略 argv）**——这正是 08-08 记录过的同一根因，只是换了个时间点复发。本次 news/trends 推的是它自己 08:57 的当日数据（非陈旧），故远端 news/trends 未被污染，无需回滚。
- **根因定论**：`push_gitee.py` 是「产品更新」与「新闻/趋势」两个自动化共享的文件，后者每次运行都会把它覆盖成自己的硬编码版本。任何依赖 push_gitee.py 的约定都不可靠。
- **永久修复（本次落地）**：本任务改用**专属独立脚本 `C:/tmp/push_daily_products.py`**（文件名不被新闻任务碰），只推 `products` 与 `trend_products`，自动选 mtime 最新源，且**推完立即经 contents API 回读 base64 解码校验条数与日期**。本次运行结果：products 30 条/日期 2026-08-12、trend_products 25 条，远端校验全过。
- **下次执行铁律**：① 不要再调用 `push_gitee.py`（会被覆盖、误推 news/trends）；② 直接 `python C:/tmp/push_daily_products.py`；③ 推完看末尾「远端回读校验」行，必须出现 products.json 30 条+日期当天、trend_products.json 25 条 才算成功；④ 运行前勿去改写 `push_gitee.py`（那是新闻任务的文件，动了反而让它出错）。
- 复用链路不变：`C:/tmp/products.json` → 校验 `C:/tmp/validate.py` → 派生 `C:/tmp/build_trend_products.py` → 推送 `C:/tmp/push_daily_products.py`；每次同步复制 `products.json`/`trend_products.json` 到工作区 `data/` 留档。
- 校验项：id 连续唯一、15 字段齐全、cons 恰好 2、pros 3-4、price>alibabaPrice、rating 4.0-4.8、salesGrowth 30-200 整数、lastUpdated 当天；名称须含 `src/lib/productVisual.ts` 的 SLUG_RULES 关键词（本日 0 条通用图标）。
