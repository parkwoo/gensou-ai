"""
統合シードスクリプト
すべてのテストデータを一括で作成します
"""
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.seed_knowledge import seed_knowledge as seed_knowledge_data
from scripts.seed_novels import seed_novels as seed_novels_data


def seed_all():
    """すべてのテストデータを作成する"""
    print("=" * 50)
    print("テストデータの作成を開始します")
    print("=" * 50)
    
    # 小説のテストデータを作成
    print("\n1. 小説のテストデータを作成中...")
    seed_novels_data()
    
    # 知識ベースのテストデータを作成
    print("\n2. 知識ベースのテストデータを作成中...")
    seed_knowledge_data()
    
    print("\n" + "=" * 50)
    print("すべてのテストデータの作成が完了しました！")
    print("=" * 50)
    print("\n次のステップ：")
    print("  1. アプリケーションを再起動して、データを確認してください")
    print("  2. フロントエンド（http://localhost:3000）にアクセスして、")
    print("     - 小説一覧ページでテスト小説を確認")
    print("     - 知識ベースページでテスト知識を確認")
    print("=" * 50)


if __name__ == "__main__":
    seed_all()
