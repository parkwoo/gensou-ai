# 📘 GenSou AI エンジニア向け手順書

## 概要

GenSou AI のシステム構成、インストール手順、設定方法、開発方法を網羅した技術ドキュメントです。

---

## 目次

1. [システム構成](#1-システム構成)
2. [インストール手順](#2-インストール手順)
3. [開発環境設定](#3-開発環境設定)
4. [API キー設定](#4-api-キー設定)
5. [AI モデル戦略](#5-ai-モデル戦略)
6. [ファインチューニング](#6-ファインチューニング)
7. [デプロイ手順](#7-デプロイ手順)
8. [トラブルシューティング](#8-トラブルシューティング)
9. [開発ガイドライン](#9-開発ガイドライン)

---

## 1. システム構成

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                     GenSou AI システム構成                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │   フロントエンド  │         │   バックエンド   │           │
│  │   (Next.js 14)   │◄──────►│   (FastAPI)      │           │
│  │                 │ HTTP    │                 │           │
│  │ • PWA 対応      │         │ • REST API      │           │
│  │ • TypeScript    │         │ • Python 3.10+  │           │
│  │ • Tailwind CSS  │         │ • SQLAlchemy    │           │
│  └─────────────────┘         └────────┬────────┘           │
│                                       │                      │
│                                  ┌────┴────┐                │
│                                  │ Database │                │
│                                  │ (SQLite/ │                │
│                                  │PostgreSQL)│               │
│                                  └─────────┘                │
│                                       │                      │
│  ┌───────────────────────────────────┴───────────────────┐  │
│  │              AI サービス（外部 API）                   │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │  │
│  │  │GPT-5 │ │Claude│ │Qwen  │ │Matsuri│ │DeepSeek│     │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### プロジェクト構成

```
gensou-ai/
├── apps/
│   ├── web/                    # Next.js フロントエンド
│   │   ├── src/
│   │   │   ├── app/            # App Router ページ
│   │   │   ├── components/     # React コンポーネント
│   │   │   ├── lib/            # ユーティリティ
│   │   │   └── stores/         # Zustand 状態管理
│   │   └── package.json
│   └── api/                    # FastAPI バックエンド
│       ├── app/
│       │   ├── main.py         # アプリケーションエントリ
│       │   ├── models/         # データベースモデル
│       │   ├── schemas/        # Pydantic スキーマ
│       │   ├── routers/        # API ルーター
│       │   └── services/       # AI サービス
│       └── requirements.txt
├── docs/                       # ドキュメント
├── scripts/                    # 開発スクリプト
├── .env.example                # 環境変数テンプレート
├── docker-compose.yml          # Docker 設定
└── package.json                # ルート package.json
```

### 技術スタック

#### フロントエンド
| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js | 14 | App Router, PWA |
| TypeScript | 5.x | 型付き開発 |
| Tailwind CSS | 3.x | スタイリング |
| Shadcn/ui | - | UI コンポーネント |
| Zustand | 4.x | 状態管理 |
| TipTap | 2.x | リッチエディタ |
| React Flow | 11.x | マインドマップ |

#### バックエンド
| 技術 | バージョン | 用途 |
|------|----------|------|
| FastAPI | 0.100+ | Web フレームワーク |
| SQLAlchemy | 2.x | ORM |
| Pydantic | 2.x | データ検証 |
| Uvicorn | 0.23+ | ASGI サーバー |

#### AI プロバイダー
| プロバイダー | モデル | 用途 |
|-----------|--------|------|
| OpenAI | GPT-5, GPT-4.1 | メインモデル |
| Anthropic | Claude 4, Claude 3.5 | 文章仕上げ |
| Alibaba Cloud (DashScope) | Qwen (qwen-turbo) | 日本語・多目的 |
| その他 | DeepSeek-V2 | 大量生成・低コスト |

---

## 2. インストール手順

### 必要条件

- **Docker** & **Docker Compose**（推奨）
- **Node.js** 18+
- **Python** 3.10+
- **pnpm** 8+

### セットアップ手順

#### Docker を使用する場合（推奨）

```bash
# リポジトリのクローン
git clone https://github.com/parkwoo/gensou-ai.git
cd gensou-ai

# 環境変数ファイルの作成
cp .env.example .env

# .env を編集して API キーを設定
nano .env

# Docker コンテナの起動
docker-compose up -d

# コンテナの状態確認
docker-compose ps
```

#### ローカル開発環境の場合

```bash
# リポジトリのクローン
git clone https://github.com/parkwoo/gensou-ai.git
cd gensou-ai

# 依存関係のインストール
pnpm install

# 環境変数ファイルの作成
cp .env.example .env
# .env を編集

# データベースの初期化（オプション）※プロジェクトルートから実行
python scripts/seed_all.py

# 開発サーバーの起動
pnpm dev
```

### アクセス先

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンド API | http://localhost:8000 |
| API ドキュメント | http://localhost:8000/docs |

---

## 3. 開発環境設定

### VS Code 推奨拡張機能

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "github.copilot"
  ]
}
```

### ESLint / Prettier 設定

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Python 開発環境

```bash
# 仮想環境の作成
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt
```

---

## 4. API キー設定

### 必要な API キー

| サービス | 取得先 | 用途 |
|---------|--------|------|
| OpenAI API | https://platform.openai.com | GPT-5, GPT-4.1（主力） |
| Anthropic | https://console.anthropic.com | Claude 4, Claude 3.5（文章仕上げ） |
| Alibaba Cloud (DashScope) | https://dashscope-intl.aliyuncs.com | Qwen / qwen-turbo（日本語・多目的） |
| DeepSeek | https://platform.deepseek.com | DeepSeek-V2（大量生成） |
| Hugging Face | https://huggingface.co | ファインチューニング（予定） |
| SakuraLLM | セルフホスト（Ollama 互換） | 日本語特化 ⚠️ フロントエンド未対応 |
| Matsuri | セルフホスト（Ollama 互換） | 日本語小説向け ⚠️ フロントエンド未対応 |

> **Qwen (DashScope) について**: 国際版エンドポイント `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` を使用します。中国リージョンのキーを使う場合は `https://dashscope.aliyuncs.com/compatible-mode` に変更してください。
>
> **SakuraLLM / Matsuri について**: バックエンドのサービスクラスは実装済みですが、フロントエンドの API ルート（`route.ts`）では現在「API が公開されていないためサポート外」として処理されています。

### .env 設定例

```bash
# ========================================
# AI API Keys
# ========================================

# OpenAI (主力)
OPENAI_API_KEY=sk-xxx

# Anthropic (文章仕上げ)
ANTHROPIC_API_KEY=sk-ant-xxx

# Qwen / DashScope (オプション)
# 国際版: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
# 中国リージョン版: https://dashscope.aliyuncs.com/compatible-mode
ALIBABA_CLOUD_API_KEY=xxx

# DeepSeek (オプション)
DEEPSEEK_API_KEY=sk-xxx

# SakuraLLM (セルフホスト・オプション)
SAKURA_API_URL=http://localhost:11434/v1/chat/completions

# Matsuri (セルフホスト・オプション)
MATSURI_API_URL=http://localhost:11435/v1/chat/completions

# ========================================
# Database
# ========================================
DATABASE_URL=sqlite:///./gensou-ai.db

# PostgreSQL (本番用)
# DATABASE_URL=postgresql://gensou_ai:password@localhost:5432/gensou_ai

# ========================================
# App
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="GenSou (玄想)"

# ========================================
# Fine-tuning（実装予定）
# ========================================
# Hugging Face (モデル公開用)
HUGGING_FACE_TOKEN=hf_xxx

# ========================================
# Notifications
# ========================================
VERCEL_WEBHOOK_SECRET=your-webhook-secret-here
NEXT_PUBLIC_VERCEL_PROJECT_ID=your-project-id
```

---

## 5. AI モデル戦略

### モデル選定ガイド

| タスク | 推奨モデル | 理由 |
|--------|-----------|------|
| アウトライン生成 | GPT-5 | 最強の推論能力 |
| 章立て | GPT-5 | 構造化に強み |
| 本文生成 | GPT-5 / Matsuri | 品質とコストのバランス |
| 推敲 | Claude 4 | 自然な日本語表現 |
| AI 感除去 | Claude 4 | 人間らしい文体 |
| 拡張 | GPT-5 | 創造性 |
| 評価 | GPT-5 | 一貫性のある評価 |
| マインドマップ | GPT-5 | 構造的思考 |
| 開発・テスト生成 | Qwen (DashScope) | コスト 90% 削減 |
| 大量テキスト生成 | DeepSeek-V2 | 最低コスト |

### コスト最適化

#### 開発フェーズ
- Qwen (DashScope) を使用（90%コスト削減）
- GPT-5/Claude は最終テストのみ

#### 本番フェーズ
- デフォルト: GPT-5（品質重視）
- 予算オプション: Qwen (DashScope), DeepSeek-V2
- 使用制限: ユーザー階層別

### 実装コード例

#### フロントエンド（TypeScript）

```typescript
import { RECOMMENDED_MODEL, PROVIDER_CONFIG } from '@/lib/ai/providers'

// タスク別推奨モデルの取得
const task = 'outline'
const provider = RECOMMENDED_MODEL[task] // 'gpt-5'

// プロバイダー情報の取得
const info = PROVIDER_CONFIG[provider]
console.log(`コスト: ¥${info.costPer1K}/1K tokens`)
```

#### バックエンド（Python）

```python
from app.services.ai_factory import AIFactory

# ストリーミング生成
async for chunk in AIFactory.generate(
    provider_name="gpt-5",
    prompt="小説の大綱を作成してください...",
    max_tokens=4096,
    temperature=0.7
):
    print(chunk, end="")

# コスト計算
cost = AIFactory.get_cost("gpt-5", tokens=1000)
```

---

## 6. ファインチューニング

> **⚠️ 未実装（実装予定）**
> ファインチューニング機能は現在開発中です。`apps/api/ml/` ディレクトリおよびトレーニングスクリプトは未作成です。
> UI（データセット管理・モデル管理画面）のみ実装されています。以下は実装予定の仕様です。

### 概要

ユーザーの執筆スタイルや特定ジャンルに特化したカスタムモデルを作成します。ファインチューニング済みモデルは推論コストが 10〜30 倍安くなります。

### パイプライン構成

```
┌─────────────────────────────────────────────────────────────┐
│  Fine-tuning Pipeline                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. データ収集                                              │
│     └─ 青空文庫（パブリックドメイン）                       │
│     └─ ユーザー生成コンテンツ（許可取得済み）               │
│     └─ ライセンス済みコンテンツ                             │
│                                                             │
│  2. データ前処理                                            │
│     └─ クリーニング・正規化                                 │
│     └─ JSONL 形式への変換                                   │
│     └─ 品質フィルタリング                                   │
│                                                             │
│  3. トレーニング（LoRA）                                    │
│     └─ ベースモデル: Qwen-7B / Qwen-14B                     │
│     └─ 手法: LoRA（Low-Rank Adaptation）                    │
│     └─ 所要時間: 2〜4 時間                                  │
│     └─ コスト: ¥2,000〜5,000                                │
│                                                             │
│  4. デプロイ                                                │
│     └─ モデルサービング（vLLM / TGI）                       │
│     └─ API エンドポイント作成                               │
│     └─ バージョン管理                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### データ準備

#### 推奨データソース

1. **青空文庫**（パブリックドメイン）
   - URL: https://www.aozora.gr.jp/
   - 10,000+ 作品の日本語文学

2. **ユーザー生成コンテンツ**
   - 許可を得た完成作品
   - 高品質な執筆データ、多様なジャンル

3. **ライセンス済みコンテンツ**
   - 商用パートナーシップ
   - ジャンル特化

#### データ形式

```jsonl
{"text": "昔々、あるところに...", "genre": "fantasy", "style": "light_novel"}
{"text": "雨の降る午後...", "genre": "romance", "style": "literary"}
```

#### 品質フィルター

- 最小文字数: 1,000 文字
- 最大文字数: 100,000 文字
- OCR エラーの除去
- 著作権表記の除去
- 句読点の正規化

#### データセット準備スクリプト（実装予定）

```python
# ml/scripts/prepare_dataset.py

from pathlib import Path
import json

def prepare_dataset():
    dataset = []

    for file in Path('data/aozora').glob('*.txt'):
        text = file.read_text()
        dataset.append({
            'text': text,
            'source': 'aozora',
            'genre': 'general',
        })

    with open('ml/datasets/jp-novel/train.jsonl', 'w') as f:
        for item in dataset:
            f.write(json.dumps(item) + '\n')

    print(f"Created dataset with {len(dataset)} samples")

if __name__ == '__main__':
    prepare_dataset()
```

### トレーニング実行（実装予定）

#### 環境構築

```bash
# apps/api/ml/ ディレクトリ作成後に実行可能
cd apps/api
pip install -r ml/requirements-ml.txt
```

#### LoRA 設定

```python
lora_config = LoraConfig(
    r=16,                    # Rank
    lora_alpha=32,           # Alpha スケーリング
    target_modules=[         # 学習対象モジュール
        "q_proj",
        "v_proj",
        "k_proj",
        "o_proj"
    ],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
```

#### ハイパーパラメータ

| パラメータ | 推奨値 | 範囲 |
|-----------|--------|------|
| Epochs | 3 | 1〜10 |
| Batch Size | 4 | 1〜8 |
| Learning Rate | 1e-4 | 1e-5〜1e-3 |
| Max Length | 2048 | 1024〜4096 |
| LoRA Rank | 16 | 8〜64 |

#### LoRA トレーニング実行

```bash
# ml/scripts/train_lora.py 実装後に実行可能
python ml/scripts/train_lora.py \
  --base_model Qwen/Qwen2.5-7B-Instruct \
  --dataset_path ml/datasets/jp-novel/train.jsonl \
  --output_dir ml/models/qwen-7b-jp-novel \
  --epochs 3 \
  --batch_size 4
```

### ハードウェア要件

| モデル | GPU メモリ | 時間 | コスト |
|--------|-----------|------|--------|
| Qwen-7B | 16GB | 2時間 | ¥2,000 |
| Qwen-14B | 24GB | 3時間 | ¥3,500 |
| Qwen-72B | 80GB | 8時間 | ¥10,000 |

### デプロイ（実装予定）

#### ローカルデプロイ（vLLM）

```bash
python -m vllm.entrypoints.api_server \
  --model ml/models/qwen-7b-jp-novel \
  --port 8000
```

#### クラウドデプロイ（RunPod）

```bash
runpodctl deploy \
  --model qwen-7b-jp-novel \
  --gpu rtx4090 \
  --region jp
```

#### フロントエンドからの利用

```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    provider: 'fine-tuned',
    model: 'qwen-7b-jp-novel-v1',
    prompt: '小説を書いてください...',
  }),
});
```

### コスト比較

| モデル | 推論コスト（1K トークン） |
|--------|-------------------------|
| Qwen-7B（セルフホスト） | ¥0.0001 |
| Qwen-14B（セルフホスト） | ¥0.0002 |
| GPT-5 | ¥0.004 |
| Claude 4 | ¥0.005 |

### モニタリング指標

- Training Loss / Validation Loss
- Perplexity
- 生成品質（人手評価）: 流暢性・一貫性・創造性・ジャンル適合性

### ベストプラクティス

1. **小規模から始める** — まず 1,000〜5,000 サンプルで品質確認
2. **ジャンル特化** — ライトノベル・ロマンス・ファンタジー・ミステリー等
3. **品質優先** — 高品質 1,000 件 > 低品質 10,000 件
4. **反復改善** — 学習 → 評価 → データ改善 → 再学習のサイクル
5. **バージョン管理** — モデルのバージョン管理を徹底

### トラブルシューティング

| 症状 | 原因 | 対処法 |
|------|------|--------|
| 出力が支離滅裂 | 学習率が高すぎる / データ品質低 | 学習率を下げ、データを見直す |
| 過学習 | エポック数が多い | エポック削減・Dropout 増加・データ追加 |
| 学習不足 | エポック数が少ない | エポック増加・LoRA Rank 引き上げ |
| コスト超過 | モデルサイズが大きい | 小モデルへ変更・max_length を削減 |

### 参考リンク

- [Qwen Documentation](https://qwenlm.github.io/)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [Hugging Face PEFT](https://huggingface.co/docs/peft)
- [vLLM](https://vllm.readthedocs.io/)

---

## 7. デプロイ手順

### オプション 1: Vercel + Railway（MVP 推奨）

#### フロントエンド（Vercel）

```bash
# Vercel CLI のインストール
npm i -g vercel

# デプロイ
cd apps/web
vercel --prod
```

**設定:**
- Build Command: `pnpm build`
- Output Directory: `.next`

**環境変数:**
```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### バックエンド（Railway）

```bash
# Railway CLI のインストール
npm i -g @railway/cli

# デプロイ
cd apps/api
railway up
```

**設定:**
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### オプション 2: Docker VPS デプロイ

#### サーバー要件

| 項目 | 最小 | 推奨 |
|------|------|------|
| CPU | 2コア | 4コア |
| RAM | 4GB | 8GB |
| ストレージ | 20GB | 50GB SSD |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

#### デプロイ手順

```bash
# サーバーに接続
ssh user@your-server.com

# Docker のインストール
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# リポジトリのクローン
git clone https://github.com/parkwoo/gensou-ai.git
cd gensou-ai

# 環境設定
cp .env.example .env
nano .env

# ビルドと起動
docker-compose build
docker-compose up -d
```

---

## 8. トラブルシューティング

### よくある問題

#### Docker 起動エラー

**問題:** コンテナが起動しない

**解決策:**
```bash
# イメージの再ビルド
docker-compose build
# キャッシュのクリア
docker-compose build --no-cache
```

#### AI API エラー

**問題:** API 呼び出しが失敗する

**解決策:**
- API キーの確認
- モデル名の確認
- クォータの確認

#### データベース接続エラー

**問題:** DB に接続できない

**解決策:**
```bash
# データベースの再作成
docker-compose down -v
docker-compose up -d
```

---

## 9. 開発ガイドライン

### コーディング規約

#### TypeScript

```typescript
// 型定義を明示
interface Novel {
  id: string
  title: string
  chapters: Chapter[]
}

// const アサーションを使用
const apiKey = process.env.API_KEY as string

// 非同期は async/await を使用
async function fetchNovels(): Promise<Novel[]> {
  const response = await fetch('/api/novels')
  return response.json()
}
```

#### Python

```python
# 型ヒントを使用
from typing import Optional

async def generate_novel(
    prompt: str,
    max_tokens: int = 2048
) -> AsyncGenerator[str, None]:
    yield "生成中..."

# Pydantic でデータ検証
from pydantic import BaseModel

class NovelCreate(BaseModel):
    title: str
    description: Optional[str] = None
```

### コミット規約

```
feat: 新機能
fix: バグ修正
docs: ドキュメント更新
style: フォーマット
refactor: リファクタリング
test: テスト追加
chore: その他
```

### プルリクエスト

1. ブランチ作成: `git checkout -b feature/your-feature`
2. 変更のコミット: `git commit -m 'feat: add feature'`
3. プッシュ: `git push origin feature/your-feature`
4. PR 作成: GitHub からプルリクエストを作成

---

## 関連ドキュメント

- **[TODO](./TODO.md)** - 実装予定・機能リスト

---

## お問い合わせ

- GitHub Issues: [https://github.com/parkwoo/gensou-ai/issues](https://github.com/parkwoo/gensou-ai/issues)
- Web サイト: [https://github.com/parkwoo/gensou-ai/](https://github.com/parkwoo/gensou-ai/)

---

**最終更新**: 2025-04-06
