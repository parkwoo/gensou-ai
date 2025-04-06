"""
知識ベースの展示用データを作成するスクリプト
小説3作品と相互に関連する高品質なデータ
"""
import sys
import os

# apps/apiをパスに追加
# Docker内とローカル両方に対応
current_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists('/app/app'):
    # Docker環境
    sys.path.insert(0, '/app')
else:
    # ローカル環境
    sys.path.insert(0, os.path.abspath(os.path.join(current_dir, '..', 'apps', 'api')))

from app.database import get_db
from app.models import Knowledge
from datetime import datetime
import json
import uuid


# 展示用知識ベースデータ（小説3作品と相互に関連）
EXHIBITION_KNOWLEDGE_DATA = [
    # === 時の庭園関連 ===
    {
        "type": "character",
        "name": "神埼蓮",
        "description": "大正時代の造園師。「時の庭園」の三代目。藤宮詩織への想いを胸に、百年の約束を守り続ける。",
        "tags": ["時の庭園", "主人公", "大正時代", "造園師"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "藤宮詩織",
        "description": "大正時代の名家の娘。蓮と恋に落ちるが、身分違いの恋により嫁ぐ。百年後の約束を残して逝く。",
        "tags": ["時の庭園", "ヒロイン", "大正時代", "悲劇のヒロイン"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "神埼遥蓮",
        "description": "現代の歴史学者。蓮と詩織の曾孫。曾祖父の日記を通じて百年の約束を知り、庭園の再生に尽力する。",
        "tags": ["時の庭園", "主人公", "現代", "歴史学者"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "神埼一樹",
        "description": "現代の物理学者。「量子時空間と記憶の転送」を研究。遥蓮と共に百年の約束を果たす。",
        "tags": ["時の庭園", "現代", "物理学者", "量子力学"],
        "related_ids": []
    },
    {
        "type": "location",
        "name": "時の庭園",
        "description": "東京・本郷にある老舗造園。明治創業で、三代にわたる物語の舞台。百年の桜が植えられている。",
        "tags": ["時の庭園", "場所", "東京", "庭園"],
        "related_ids": []
    },
    {
        "type": "item",
        "name": "蓮の日記",
        "description": "神埼蓮が残した日記。詩織との恋と百年の約束が記されている。遥蓮がこれを発見し、物語が動き出す。",
        "tags": ["時の庭園", "日記", "遺品", "きっかけ"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "百年の約束",
        "description": "「百年後の桜が咲く春、この庭で待っている」という蓮と詩織の約束。時を超えた愛を象徴する。",
        "tags": ["時の庭園", "愛", "約束", "テーマ"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "量子もつれ",
        "description": "一樹の研究テーマ。時間と空間を超えて、人と人、記憶と記憶が繋がる現象。物語の科学的裏付け。",
        "tags": ["時の庭園", "科学", "量子力学", "テーマ"],
        "related_ids": []
    },

    # === 星の海の向こう側関連 ===
    {
        "type": "character",
        "name": "神崎海斗",
        "description": "宇宙探査船『星海』の船長。元軍人だが、平和を愛するリーダー。エーテルナとの和平を選ぶ。",
        "tags": ["星の海の向こう側", "主人公", "船長", "リーダーシップ"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "天宮七海",
        "description": "異星人の専門家。科学者として、そして人間として、文明間の理解を目指す。",
        "tags": ["星の海の向こう側", "ヒロイン", "科学者", "異星人専門家"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "エーテル",
        "description": "惑星エーテルナの代表。高度な精神文明を持つ異星人。戦争を知らず、愛と理解を説く。",
        "tags": ["星の海の向こう側", "異星人", "エーテルナ代表", "平和主義"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "X-7",
        "description": "自律型AI。人類とエーテルナの架け橋として、論理的視点から問題解決に貢献する。",
        "tags": ["星の海の向こう側", "AI", "相棒", "論理的思考"],
        "related_ids": []
    },
    {
        "type": "location",
        "name": "惑星エーテルナ",
        "description": "地球のような青い惑星。戦争を知らず、高度な精神文明を持つ。百年前に地球からの来訪を予言されていた。",
        "tags": ["星の海の向こう側", "場所", "惑星", "異星文明"],
        "related_ids": []
    },
    {
        "type": "item",
        "name": "宇宙探査船『星海』",
        "description": "地球製の宇宙探査船。謎の重力波信号を追って、銀河の彼方へ旅立つ。",
        "tags": ["星の海の向こう側", "宇宙船", "移動手段"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "ファースト・コンタクト",
        "description": "異星文明との最初の接触。恐怖と理解の狭間で揺れる人類の試練。",
        "tags": ["星の海の向こう側", "テーマ", "異星接触", "文明的試練"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "文明の共存",
        "description": "異なる文明が理解し合い、共に生きること。海斗たちが目指す理想。",
        "tags": ["星の海の向こう側", "テーマ", "平和", "共存"],
        "related_ids": []
    },

    # === 時計塔の秘密関連 ===
    {
        "type": "character",
        "name": "北条美咲",
        "description": "古美術商。曾祖父の遺した古時計の修理を依頼し、予期せぬ冒険に巻き込まれる。",
        "tags": ["時計塔の秘密", "主人公", "古美術商", "謎解き"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "神代恭介",
        "description": "老舗時計店「時の司」の5代目店主。静かで理知的な時計職人。美咲と共に謎に挑む。",
        "tags": ["時計塔の秘密", "時計職人", "店主", "協力者"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "北条玲奈",
        "description": "美咲の妹。行方不明となっており、彼女の失踪が物語のきっかけとなる。",
        "tags": ["時計塔の秘密", "妹", "行方不明", "きっかけ"],
        "related_ids": []
    },
    {
        "type": "location",
        "name": "時計店「時の司」",
        "description": "京都の老舗時計店。創業は明治時代。神秘的な雰囲気を纏う。",
        "tags": ["時計塔の秘密", "場所", "京都", "時計店"],
        "related_ids": []
    },
    {
        "type": "item",
        "name": "伝説の古時計",
        "description": "美咲の曾祖父が遺した古時計。「時の司」で作られるはずだった行方不明の時計。夜中に勝手に動き出す。",
        "tags": ["時計塔の秘密", "時計", "遺品", "不思議"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "タイムスリップ",
        "description": "現代から過去へと遡る現象。時計を通じて起こる謎の現象。",
        "tags": ["時計塔の秘密", "SF", "時間", "現象"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "過去の秘密結社",
        "description": "大正時代に存在した謎の組織。時計の秘密を守り、歴史の影で動いていた。",
        "tags": ["時計塔の秘密", "大正時代", "秘密結社", "謎"],
        "related_ids": []
    },

    # === 作品間の共通テーマ・関連付け ===
    {
        "type": "term",
        "name": "時を超える愛",
        "description": "「時の庭園」の百年の約束、「星の海」の文明的愛、「時計塔」の永遠の絆。全作品を貫くテーマ。",
        "tags": ["共通テーマ", "愛", "時間", "運命"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "量子時空間",
        "description": "時の庭園の一樹の研究。星の海のワープ航法の基礎理論とも関連。時計塔のタイムスリップの科学的説明にもなる。",
        "tags": ["共通テーマ", "科学", "時間", "空間"],
        "related_ids": []
    },
    {
        "type": "location",
        "name": "大正時代",
        "description": "時の庭園の第1部、時計塔の過去パートの舞台。全作品に影響を与える重要な時代。",
        "tags": ["共通", "時代", "大正", "歴史"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "予言",
        "description": "星の海では百年前の来訪が予言されていた。時の庭園では百年の約束が果たされる。作品間で共鳴するテーマ。",
        "tags": ["共通テーマ", "予言", "運命", "時間"],
        "related_ids": []
    },
    {
        "type": "character",
        "name": "神埼家",
        "description": "時の庭園の主人公の家系。代々造園師として、時の庭園を守り続けてきた。",
        "tags": ["時の庭園", "家系", "造園師", "守護者"],
        "related_ids": []
    },
    {
        "type": "term",
        "name": "記憶の転送",
        "description": "時の庭園で一樹が研究する現象。過去の記憶が現在に届く。星の海の文明交流にも応用可能な概念。",
        "tags": ["共通テーマ", "科学", "記憶", "時間"],
        "related_ids": []
    },
]


def seed_knowledge():
    """展示用知識ベースデータを挿入する"""
    db = next(get_db())

    print("展示用知識ベースデータを作成中...")

    # 既存のデータを削除
    db.query(Knowledge).delete()
    db.commit()

    # 先に全ての知識データを作成してIDを取得
    knowledge_map = {}
    created_count = 0

    for data in EXHIBITION_KNOWLEDGE_DATA:
        knowledge_id = str(uuid.uuid4())
        knowledge_map[data["name"]] = knowledge_id

        new_knowledge = Knowledge(
            id=knowledge_id,
            type=data["type"],
            name=data["name"],
            description=data["description"],
            tags=json.dumps(data["tags"], ensure_ascii=False),
            related_ids=json.dumps([], ensure_ascii=False),  # 後で更新
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(new_knowledge)
        created_count += 1
        print(f"  作成: {data['name']} ({data['type']})")

    db.commit()

    # 関連付けを設定（作品間の相互関係）
    relationships = {
        # 時の庭園の関連
        "神埼蓮": ["藤宮詩織", "時の庭園", "蓮の日記", "百年の約束"],
        "藤宮詩織": ["神埼蓮", "百年の約束", "時を超える愛"],
        "神埼遥蓮": ["神埼一樹", "蓮の日記", "時の庭園", "量子もつれ"],
        "神埼一樹": ["神埼遥蓮", "量子もつれ", "記憶の転送", "量子時空間"],
        "時の庭園": ["神埼蓮", "神埼遥蓮", "蓮の日記"],
        "蓮の日記": ["神埼蓮", "神埼遥蓮", "百年の約束"],
        "百年の約束": ["時を超える愛", "予言", "藤宮詩織", "神埼蓮"],
        "量子もつれ": ["量子時空間", "記憶の転送", "神埼一樹"],

        # 星の海の向こう側の関連
        "神崎海斗": ["天宮七海", "エーテル", "惑星エーテルナ", "文明の共存"],
        "天宮七海": ["神崎海斗", "エーテル", "ファースト・コンタクト"],
        "エーテル": ["神崎海斗", "天宮七海", "惑星エーテルナ", "文明の共存"],
        "X-7": ["神崎海斗", "天宮七海"],
        "惑星エーテルナ": ["エーテル", "ファースト・コンタクト", "文明の共存"],
        "宇宙探査船『星海』": ["神崎海斗", "惑星エーテルナ"],
        "ファースト・コンタクト": ["文明の共存", "惑星エーテルナ"],
        "文明の共存": ["時を超える愛", "ファースト・コンタクト"],

        # 時計塔の秘密の関連
        "北条美咲": ["神代恭介", "伝説の古時計", "北条玲奈"],
        "神代恭介": ["北条美咲", "時計店「時の司」", "伝説の古時計"],
        "北条玲奈": ["北条美咲", "タイムスリップ"],
        "時計店「時の司」": ["神代恭介", "伝説の古時計"],
        "伝説の古時計": ["北条美咲", "タイムスリップ", "大正時代"],
        "タイムスリップ": ["量子時空間", "大正時代", "過去の秘密結社"],
        "過去の秘密結社": ["大正時代", "タイムスリップ"],

        # 共通テーマの関連
        "時を超える愛": ["百年の約束", "文明の共存", "量子時空間", "予言"],
        "量子時空間": ["量子もつれ", "記憶の転送", "タイムスリップ"],
        "大正時代": ["神埼蓮", "藤宮詩織", "伝説の古時計", "過去の秘密結社"],
        "予言": ["百年の約束", "惑星エーテルナ", "時を超える愛"],
        "神埼家": ["神埼蓮", "神埼遥蓮", "時の庭園"],
        "記憶の転送": ["量子もつれ", "量子時空間", "神埼一樹"],
    }

    # 関連IDを更新
    for name, related_names in relationships.items():
        if name in knowledge_map:
            related_ids = [knowledge_map[rn] for rn in related_names if rn in knowledge_map]
            knowledge = db.query(Knowledge).filter(Knowledge.name == name).first()
            if knowledge:
                knowledge.related_ids = json.dumps(related_ids, ensure_ascii=False)
                knowledge.updated_at = datetime.utcnow()

    db.commit()
    print(f"\n完了！{created_count}件の展示用知識データを作成しました。")
    print("\n小説3作品と相互に関連する展示用データを作成しました。")
    print("作品間の共通テーマ（時を超える愛、量子時空間、大正時代など）で繋がっています。")


if __name__ == "__main__":
    seed_knowledge()
