# -*- coding: utf-8 -*-
"""
宠物产品分析 - 每日数据生成脚本
================================
- 生成 pet_insights.json（英美欧需求/评价、TikTok 消费档位、大众/小众宠物比例、需求概览）
- 生成 pet_products.json（Amazon / TikTok Shop / Shopee / Temu 四平台宠物增量产品 + 优缺点）
- 数据基于 2026 公开趋势调研整理（APPA / FEDIAF / PFMA / AMZScout / Accio / TikTok 爆款榜），
  非各平台实时 API（平台反爬无法免费抓取）；每日刷新 updated 日期，跟随趋势文章迭代。
- 推送到 Gitee 云端（in-linz/ecommerce-data，data/*.json），前端 PetProducts.tsx 自动读取。

运行：python build_pet_data.py
（也可被 daily_update.py 调用：import build_pet_data; build_pet_data.main()）
"""
import os
import sys
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from daily_update import push, TODAY  # 复用 Gitee 推送与日期

# ----------------------------------------------------------------------------
# 行业洞察（基于 2026 公开调研，来源见注释）
# ----------------------------------------------------------------------------
PET_INSIGHTS = {
    "updated": TODAY,
    "market": {
        "global": "全球宠物护理市场 2026 约 $2890 亿，预计 2034 达 $4990 亿（CAGR 7.06%）",
        "us": "美国 2026 预计 $1650 亿（2025 为 $1580 亿，+4.4%）；宠物食品/零食为最大类约 $697 亿",
        "europe": "欧洲约 2.99 亿只宠物、1.39 亿家庭（约 50% 家庭养宠）；2025 市场 $778 亿",
        "uk": "英国 62% 家庭养宠（欧洲最高），约 1550 万只狗、1300 万只猫；市场约 $219 亿",
        "mx": "墨西哥 2025 约 $33.9 亿（拉美第二，仅次于巴西），预计 2030 达 $49.1 亿（CAGR 6.82%）；70% 家庭养宠，约 4380 万只狗、1620 万只猫；电商占 12-15% 且快速翻倍。",
        "online": "约 30% 宠物产品购买已转向线上；美国宠物电商规模约 $1023 亿",
    },
    # 英美欧需求与评价
    "regions": {
        "us": {
            "demand": "美国是全球最大宠物市场，'宠物拟人化'驱动高端化：智能设备、功能保健品、 premium 粮、订阅制（autoship）增长最快；千禧一代与 Z 世代为主力消费。",
            "review": "消费者愿意为'省心+健康'溢价；对智能设备要求 WiFi 稳定、APP 可靠；对耗材（猫砂/零食/湿巾）重视性价比与复购。退货率高集中在'安装复杂/连接不稳'的智能硬件。",
            "topNeeds": ["智能自动喂食/饮水", "宠物健康保健(益生菌/鱼油)", "行为安抚(分离焦虑)", "出行便携", "环保可持续耗材"],
        },
        "uk": {
            "demand": "英国养宠家庭比例欧洲最高（62%），狗/猫为主；受生活成本影响更看重性价比，但同时 premium 天然粮、保险、智能用品需求稳增。",
            "review": "评价聚焦'耐用+合规'：UKCA/CE 认证、低粉尘猫砂、可机洗宠物床；对跨境卖家而言物流时效与退换货体验是关键差评来源。",
            "topNeeds": ["高性价比日用品", "低粉尘/环保猫砂", "可机洗宠物床", "宠物保险", "牵引出行装备"],
        },
        "eu": {
            "demand": "欧洲各国差异大（德/法/西/意），统一趋势是可持续与合规： biodegradable 玩具、纸质/豆腐猫砂、可回收材质；德法市场客单价较高。",
            "review": "消费者重视材料安全（无 BPA、食品级）、环保声明真实；差评集中在'塑料味/做工差/尺码偏差'。CE/UKCA 与 REACH 合规是入场门槛。",
            "topNeeds": ["环保可持续用品", "合规安全材质", "智能健康设备", "猫狗出行装备", "天然粮与零食"],
        },
        "mx": {
            "demand": "墨西哥是拉美第二大宠物市场，70% 家庭养宠（全球最高之一），狗占狗猫产品购买 70%、猫增长最快（约狗的 1.5 倍速）；高温气候驱动降温用品（凉凉衣/冰垫）与防蜱虫需求；价格敏感但极重'本土适配'（西语详情页、高温实地测试、Mercado Pago 支付）；电商占 12-15% 且两年内有望翻倍。",
            "review": "消费者重'性价比+是否适配本地生活节奏'：评价聚焦是否耐高温、防蜱虫有效性、尺码准不准；物流时效与 Mercado Pago 支付体验是差评高发点；复购靠耗材（粮/猫砂/湿巾）。",
            "topNeeds": ["宠物凉凉衣/降温", "凝胶冰垫", "防蜱虫项圈", "平价自动喂食器", "高性价比日用品", "西语本地化包装"],
        },
    },
    # TikTok Shop 宠物消费档位
    "tiktokTier": (
        "TikTok Shop 宠物消费以'内容引爆+中低客单价'为特征，分三档：\n"
        "① 入门平价 $5-15：宠物服装、小玩具、牵引绳、项圈、小配件——冲动购买、短视频/直播引爆、走量为主；\n"
        "② 中端实用 $15-40：自动喂食器(带摄像头 $20-46)、智能饮水机、慢食碗、便携水壶、除毛滚筒、前扣牵引背心——'有用又好拍'；\n"
        "③ 高端智能 $40-120：自动猫砂盆($89)、宠物摄像头、GPS 定位器、自动激光玩具——客单高、内容种草强、转化稳。\n"
        "整体：爆发快、退货率低于服饰，复购靠耗材（猫砂/零食/湿巾）。"
    ),
    # 大众 / 小众宠物占比（美/英/欧/墨，来源 APPA/FEDIAF/PFMA/INEGI/mappr 2025-2026）
    "petMix": {
        "summary": "主流宠物（狗+猫）在各国均为绝对主力，但小众占比差异明显：美国最集中（小众约 8%），墨西哥因鸟/鱼/小型动物普及，小众占比最高（约 25%）；欧洲猫略多于狗（偏猫），英国狗略多于猫。跨境选品以狗猫为主战场，小众类目竞争低但体量小、需专业合规。",
        "regions": {
            "us": {
                "householdRate": "约 66% 家庭养宠",
                "mainstream": {"dog": "狗：约 70M 只，7100 万家庭（53%）", "cat": "猫：约 74M 只，5300 万家庭（39%）"},
                "niche": {"bird": "鸟：900 万家庭", "reptile": "爬宠：600 万家庭", "small": "小型动物(兔/豚鼠)：500 万", "fish": "观赏鱼：1200 万家庭", "horse": "马：200 万", "exotic": "异宠：约 1/10 家庭"},
                "note": "狗+猫占家庭宠物约 92%；小众合计约 8%。",
            },
            "uk": {
                "householdRate": "约 62% 家庭养宠（欧洲最高）",
                "mainstream": {"dog": "狗：约 1550 万只，~31% 家庭", "cat": "猫：约 1300 万只，~26% 家庭"},
                "niche": {"fish": "观赏鱼：~400 万", "bird": "鸟：~150 万", "rabbit": "兔：~100 万", "small": "仓鼠/小型动物：~80 万", "reptile": "爬宠：~40 万"},
                "note": "狗+猫占家庭宠物约 57%（按只计）；小众（鱼/鸟/兔）合计约 8%。",
            },
            "eu": {
                "householdRate": "平均约 49% 家庭养宠",
                "mainstream": {"dog": "狗：约 1.04 亿只，~25% 家庭", "cat": "猫：约 1.13 亿只，~26% 家庭（欧洲偏猫）"},
                "niche": {"fish": "观赏鱼：~2900 万", "bird": "鸟：~1500 万", "rabbit": "兔：~1300 万", "small": "小型动物：~1100 万", "reptile": "爬宠：~900 万"},
                "note": "欧洲猫略多于狗；小众合计约 7-8%。德法客单高，各国差异大。",
            },
            "mx": {
                "householdRate": "约 70% 家庭养宠（全球最高之一）",
                "mainstream": {"dog": "狗：约 4380 万只，占狗猫产品购买 70%", "cat": "猫：约 1620 万只，增速为狗约 1.5 倍"},
                "niche": {"fish": "观赏鱼：~700 万（第三大宠物）", "other": "鸟/兔/小型动物等：~1300 万"},
                "note": "狗+猫合计约 75% 的宠物只数；小众（其他小型物种）约 25%，显著高于美国——墨西哥鸟/鱼/小型动物普及度极高。",
            },
        },
    },
    # 当前主要需求方向
    "demands": [
        "宠物智能化（喂食/饮水/监控/定位，远程省心）",
        "宠物健康保健（益生菌、鱼油、关节、牙齿）",
        "人宠互动与解闷（益智玩具、漏食球、猫薄荷）",
        "出行便携（背包、水壶、车载安全带、航空箱）",
        "环保可持续（豆腐/纸质猫砂、可降解玩具、湿巾）",
        "平价高频耗材（猫砂、零食、尿垫、除毛、清洁）",
        "行为安抚（分离焦虑背心、舔食垫、舒缓用品）",
    ],
    "source": "基于 APPA 2025、FEDIAF 2025、PFMA 2025、AMZScout/Accio 2026、TikTok 爆款榜等公开资料整理；非平台实时 API。",
}


# ----------------------------------------------------------------------------
# 四平台宠物增量产品（真实趋势 + 优缺点）
# stage: new=新晋快速增量 / old=成熟常青增量
# ----------------------------------------------------------------------------
PET_PRODUCTS = [
    # ---------------- Amazon（美国站，数据来自 AMZScout / Accio 2026）----------------
    {"platform": "amazon", "name": "Smart Automatic Feeder (PETLIBRO 5L)", "nameZh": "智能自动喂食器", "price": "$40-60",
     "salesGrowth": "搜索量 +465%", "stage": "new",
     "pros": ["APP 远程定时定量", "多宠家庭刚需", "出差/加班省心"], "cons": ["依赖 WiFi，断网失效", "卡粮/堵粮偶发", "需定期清洁"]},
    {"platform": "amazon", "name": "Tofu Cat Litter", "nameZh": "豆腐猫砂", "price": "$15-25",
     "salesGrowth": "搜索量 +488%", "stage": "new",
     "pros": ["植物基可冲厕", "低粉尘护呼吸道", "环保可降解"], "cons": ["单价高于矿砂", "结团弱于膨润土", "潮湿易霉"]},
    {"platform": "amazon", "name": "Freeze-Dried Pet Treats", "nameZh": "冻干宠物零食", "price": "$8-20",
     "salesGrowth": "单品月销 63.7 万+", "stage": "new",
     "pros": ["高蛋白诱食强", "无添加受宠", "训练奖励神器"], "cons": ["价格偏高", "需密封防潮", "部分挑食无效"]},
    {"platform": "amazon", "name": "Slow Feeder Puzzle Bowl", "nameZh": "慢食解压碗", "price": "$10-15",
     "salesGrowth": "搜索量 +172%", "stage": "new",
     "pros": ["防暴饮暴食/防胀气", "益智减压", "BPA 免费"], "cons": ["凹槽难清洗", "大狗易破解", "部分犬不买账"]},
    {"platform": "amazon", "name": "Dog/Cat Probiotics", "nameZh": "宠物益生菌", "price": "$15-30",
     "salesGrowth": "搜索量 +102%", "stage": "new",
     "pros": ["调理肠道免疫", "软便/腹泻改善", "日常保健"], "cons": ["需持续服用", "效果个体差异", "需冷藏部分款"]},
    {"platform": "amazon", "name": "Self-Cleaning Litter Box", "nameZh": "自清洁猫砂盆", "price": "$300-600",
     "salesGrowth": "品类收入 +93%", "stage": "old",
     "pros": ["自动除便省心", "除臭减量", "多猫家庭友好"], "cons": ["价高", "故障/卡猫风险", "占空间需供电"]},
    {"platform": "amazon", "name": "ChomChom Reusable Hair Remover", "nameZh": "可复用除毛滚筒", "price": "$25-30",
     "salesGrowth": "22 万+ 评价常青爆款", "stage": "old",
     "pros": ["无需电池/粘纸", "可水洗复用", "吸毛强"], "cons": ["纯手动", "大件家具费劲", "需清空集毛仓"]},
    {"platform": "amazon", "name": "KONG Classic Chew Toy", "nameZh": "KONG 耐咬益智玩具", "price": "$10-15",
     "salesGrowth": "8.2 万+ 评价常青", "stage": "old",
     "pros": ["天然橡胶耐咬", "可填食益智", "全犬型适用"], "cons": ["需手动填食", "极端啃咬犬会破", "清洁麻烦"]},

    # ---------------- TikTok Shop（主战场：美/英/墨爆款，来自 TikTok 爆款榜 / EchoTik / Kalodata / Accio 2026）----------------
    # 墨西哥本土爆款（高温气候 + 防蜱虫 + 高性价比，西语本地化）
    {"platform": "tiktok", "name": "Pet Cooling Vest (MX hot climate)", "nameZh": "宠物凉凉衣/降温衣", "price": "$5-15",
     "salesGrowth": "墨西哥高温刚需爆款", "stage": "new",
     "pros": ["降温透气", "热带印花本土化", "高性价比走量"], "cons": ["尺码偏差大", "质量参差", "非四季刚需"]},
    {"platform": "tiktok", "name": "Gel Cooling Mat", "nameZh": "凝胶冰垫", "price": "$6-18",
     "salesGrowth": "墨西哥居家散热爆款", "stage": "new",
     "pros": ["自冷免电", "宠物爱趴", "便携易洗"], "cons": ["易划破漏胶", "高温易黏", "大宠压塌"]},
    {"platform": "tiktok", "name": "Tick & Flea Collar", "nameZh": "防蜱虫项圈", "price": "$3-10",
     "salesGrowth": "墨西哥户外防护爆款", "stage": "new",
     "pros": ["户外防蜱虫", "平价高频", "西语包装"], "cons": ["药效时长不一", "过敏风险", "需定期换"]},
    {"platform": "tiktok", "name": "Foldable Silicone Pet Funnel", "nameZh": "可折叠硅胶喂食漏斗", "price": "$8-12",
     "salesGrowth": "美/墨单周出货 12 万+", "stage": "new",
     "pros": ["多宠分装", "可折叠便携", "退货率仅 2.1%"], "cons": ["单一功能", "硅胶味", "大宠不够"]},
    {"platform": "tiktok", "name": "Slow Feeder Puzzle Bowl", "nameZh": "慢食解压碗", "price": "$14",
     "salesGrowth": "PetTok 爆款", "stage": "new",
     "pros": ["防胀气内容易爆", "10 倍缓食", "'before/after' 视频引流"], "cons": ["大狗不适用", "凹槽藏污"]},
    {"platform": "tiktok", "name": "No-Pull Front-Clip Harness", "nameZh": "前扣无拉牵引背心", "price": "$22",
     "salesGrowth": "Walk 改造视频 5 亿+ 播放", "stage": "new",
     "pros": ["纠正爆冲", "视频转化高", "多尺寸"], "cons": ["尺寸需准", "长期搭扣耐用存疑"]},
    {"platform": "tiktok", "name": "Portable Dog Water Bottle", "nameZh": "便携狗狗水壶", "price": "$12",
     "salesGrowth": "出行爆款", "stage": "new",
     "pros": ["一键出水防漏", "单手操作", "徒步/自驾必备"], "cons": ["容量小", "高温易闷"]},
    {"platform": "tiktok", "name": "Lick Mat with Suction", "nameZh": "吸盘舔食垫", "price": "$10",
     "salesGrowth": "洗澡安抚神器爆款", "stage": "new",
     "pros": ["涂花生酱粘浴缸", "洗澡不挣扎", "分离焦虑安抚"], "cons": ["需清洗", "易粘毛", "部分犬撕咬"]},
    {"platform": "tiktok", "name": "Self-Cleaning Litter Box", "nameZh": "自清洁猫砂盆", "price": "$89",
     "salesGrowth": "安装视频 2 亿+ 播放", "stage": "new",
     "pros": ["自动铲屎周清", "'life-changing' 口碑", "种草强"], "cons": ["价高", "卡猫/故障风险", "需电源"]},
    {"platform": "tiktok", "name": "Window Perch with Suction", "nameZh": "吸盘窗户猫台", "price": "$18",
     "salesGrowth": "观鸟内容爆款", "stage": "new",
     "pros": ["秒装承重 30lb", "猫爱观景", "无需打孔"], "cons": ["玻璃承重有限", "掉落风险", "冬季冰冷"]},
    {"platform": "tiktok", "name": "Automatic Laser Toy", "nameZh": "自动激光逗猫玩具", "price": "$25",
     "salesGrowth": "居家办公刚需爆款", "stage": "new",
     "pros": ["随机光路逗猫", "自动熄灭防过激", "独处解闷"], "cons": ["需电池", "部分猫无视", "红光争议"]},
    {"platform": "tiktok", "name": "Interactive Treat Ball", "nameZh": "互动漏食球", "price": "$16",
     "salesGrowth": "分离焦虑爆款", "stage": "new",
     "pros": ["益智漏食", "缓解分离焦虑", "耐咬"], "cons": ["滚动噪音", "易丢失", "大块犬不适用"]},
    {"platform": "tiktok", "name": "Cat/Dog Apparel", "nameZh": "宠物服装/雨衣", "price": "$3-15",
     "salesGrowth": "单品月销 15 万+", "stage": "old",
     "pros": ["可爱高转化", "节日/拍照刚需", "客单低走量"], "cons": ["尺码偏差大", "质量参差", "非刚需复购低"]},

    # ---------------- Shopee（东南亚，来自 Accio 2026）----------------
    {"platform": "shopee", "name": "Elevated Bowl Stand (BECHON)", "nameZh": "高架食盆架", "price": "$3-5",
     "salesGrowth": "越南月销 135 万+", "stage": "old",
     "pros": ["平价高量", "护颈防吐", "东南亚刚需"], "cons": ["无智能", "塑料感", "稳定性一般"]},
    {"platform": "shopee", "name": "2-in-1 Food & Water Dispenser", "nameZh": "2合1 食水器（重力）", "price": "$5-8",
     "salesGrowth": "月销 13.6 万+", "stage": "old",
     "pros": ["省空间", "重力免电", "性价比高"], "cons": ["无电控定时", "水质易脏", "大宠不够"]},
    {"platform": "shopee", "name": "Stainless Steel Double Bowl", "nameZh": "双碗不锈钢高架碗", "price": "$4-7",
     "salesGrowth": "月销 6.9 万+", "stage": "old",
     "pros": ["食品级易洁", "护颈", "耐用"], "cons": ["无智能", "防滑一般", "搬运重"]},
    {"platform": "shopee", "name": "Pet Wet Wipes / Cleaner", "nameZh": "宠物湿巾/清洁", "price": "$2-6",
     "salesGrowth": "高频复购", "stage": "new",
     "pros": ["便捷平价", "高频复购", "多场景"], "cons": ["消耗快", "香精敏感", "材质薄"]},
    {"platform": "shopee", "name": "Pet Apparel (Southeast Asia)", "nameZh": "平价宠物服装", "price": "$1-5",
     "salesGrowth": "季节/节日走量", "stage": "new",
     "pros": ["低价走量", "可爱送礼", "款式多"], "cons": ["质量参差", "尺码乱", "退货率高"]},

    # ---------------- Temu（超低价走量）----------------
    {"platform": "temu", "name": "Ultra-Cheap Leash & Collar", "nameZh": "超低价牵引绳/项圈", "price": "$0.2-2",
     "salesGrowth": "极致低价走量", "stage": "new",
     "pros": ["价格碾压", "走量爆", "款式多"], "cons": ["质量/耐用差", "扣具易断", "合规存疑"]},
    {"platform": "temu", "name": "Basic Auto Feeder", "nameZh": "基础自动喂食器", "price": "$2.5-5",
     "salesGrowth": "低价自动款增量", "stage": "new",
     "pros": ["极致低价", "尝鲜门槛低", "走量"], "cons": ["无智能/APP", "易卡/易坏", "塑料感"]},
    {"platform": "temu", "name": "Pet Apparel", "nameZh": "宠物服装", "price": "$0.24-2.8",
     "salesGrowth": "超低价款式多", "stage": "old",
     "pros": ["极低单价", "款式海量", "冲动购"], "cons": ["质量参差", "尺码乱", "退货多"]},
    {"platform": "temu", "name": "Smart Water Fountain (budget)", "nameZh": "中低端智能饮水机", "price": "$8-15",
     "salesGrowth": "低价智能增量", "stage": "new",
     "pros": ["低价智能", "流动水诱饮", "颜价比"], "cons": ["水泵噪音", "寿命短", "滤芯另购"]},
    {"platform": "temu", "name": "Freeze-Dried Treats (budget)", "nameZh": "平价冻干零食", "price": "$3-8",
     "salesGrowth": "低价零食增量", "stage": "new",
     "pros": ["低价尝鲜", "诱食强", "小包走量"], "cons": ["来源/新鲜度存疑", "规格小", "批次不稳"]},
]


def build_pet_products():
    out = []
    for i, p in enumerate(PET_PRODUCTS):
        item = dict(p)
        item["id"] = i + 1
        item["lastUpdated"] = TODAY
        out.append(item)
    return out


def main():
    print(f"=== 宠物数据生成 {TODAY} ===")
    insights = dict(PET_INSIGHTS)
    insights["updated"] = TODAY
    products = build_pet_products()
    print(f"pet_insights + pet_products({len(products)} 条) 生成完成")
    push("pet_insights", insights)
    push("pet_products", products)
    print("宠物数据推送完成。")


if __name__ == "__main__":
    main()
