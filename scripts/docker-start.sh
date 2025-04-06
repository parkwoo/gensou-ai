#!/bin/bash

# GenSou Docker 起動スクリプト

set -e

echo "🐳 GenSou Docker 起動"
echo "===================="
echo ""

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Docker チェック
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker が必要です${NC}"
    echo "https://docs.docker.com/get-docker/ からインストールしてください"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose が必要です${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose: $(docker-compose --version)${NC}"
echo ""

# 環境変数チェック
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env ファイルが見つかりません${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env ファイルを作成しました${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  API キーを設定してください:${NC}"
    echo "   nano .env"
    echo ""
    echo "   最低限必要なキー:"
    echo "   OPENAI_API_KEY=sk-..."
    echo ""
    read -p "続行しますか？ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# API キーチェック
if ! grep -q "OPENAI_API_KEY=sk-" .env && \
   ! grep -q "ALIBABA_CLOUD_API_KEY=" .env && \
   ! grep -q "DEEPSEEK_API_KEY=sk-" .env; then
    echo -e "${YELLOW}⚠️  API キーが設定されていない可能性があります${NC}"
    echo "   AI 機能を使用するには API キーが必要です"
    echo ""
    read -p "続行しますか？ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📦 Docker コンテナを起動..."

# 既存コンテナを停止
docker-compose down -q 2>/dev/null || true

# 新規起動
docker-compose up -d --build

echo ""
echo "⏳ 起動を待機..."
sleep 5

# 状態確認
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ コンテナが起動しました${NC}"
else
    echo -e "${RED}❌ コンテナの起動に失敗しました${NC}"
    docker-compose logs
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 GenSou (玄想) が起動しました！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 フロントエンド：http://localhost:3000"
echo "📚 API ドキュメント：http://localhost:8000/docs"
echo "🔧 バックエンド：http://localhost:8000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 便利なコマンド:"
echo ""
echo "   ログ確認:"
echo "   docker-compose logs -f"
echo ""
echo "   停止:"
echo "   docker-compose down"
echo ""
echo "   再起動:"
echo "   docker-compose restart"
echo ""
echo "   コンテナ内に入る:"
echo "   docker-compose exec web sh"
echo "   docker-compose exec api sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
