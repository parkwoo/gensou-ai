#!/bin/bash

# GenSou ローカル開発セットアップスクリプト

set -e

echo "🚀 GenSou ローカルセットアップ"
echo "================================"
echo ""

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 前提条件チェック
echo "📋 前提条件をチェック..."

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js が必要です${NC}"
    echo "https://nodejs.org/ からインストールしてください"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm が見つかりません。インストールします...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}✅ pnpm: $(pnpm --version)${NC}"

# Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 が必要です${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"

echo ""
echo "📦 依存関係をインストール..."

# フロントエンド
echo "   フロントエンド..."
cd apps/web
pnpm install
cd ../..

# バックエンド
echo "   バックエンド..."
cd apps/api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
cd ../..

echo ""
echo "⚙️  環境変数を設定..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  .env ファイルを作成しました${NC}"
    echo "   以下のコマンドで API キーを設定してください:"
    echo "   nano .env"
    echo ""
    echo "   最低限必要なキー:"
    echo "   OPENAI_API_KEY=sk-..."
    echo ""
else
    echo -e "${GREEN}✅ .env ファイルが存在します${NC}"
fi

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 起動方法:"
echo ""
echo "   方法 1: 個別起動（推奨）"
echo "   ─────────────────────────────────────"
echo "   # ターミナル 1: バックエンド"
echo "   cd apps/api && source venv/bin/activate"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "   # ターミナル 2: フロントエンド"
echo "   cd apps/web && pnpm dev"
echo ""
echo "   方法 2: Docker"
echo "   ─────────────────────────────────────"
echo "   docker-compose up -d"
echo ""
echo "   方法 3: pnpm"
echo "   ─────────────────────────────────────"
echo "   pnpm dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 アクセス: http://localhost:3000"
echo "📚 API ドキュメント：http://localhost:8000/docs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
