"""
通知関連のルーター
Vercel Web Push APIからプッシュ通知を受信するエンドポイント
"""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/notifications")

# Vercelから送信される署名を検証
VERCEL_WEBHOOK_SECRET = os.getenv("VERCEL_WEBHOOK_SECRET", "")


class PushNotification(BaseModel):
    """Vercelから送信されるプッシュ通知"""
    type: str  # "push" | "deployment" | "comment" | "update"
    url: Optional[str] = None
    app: Optional[str] = None
    deployment_id: Optional[str] = None
    project: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[str] = None
    modified_at: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    novel_id: Optional[str] = None


class NotificationResponse(BaseModel):
    """通知のレスポンス"""
    status: str
    message: Optional[str] = None


def process_notification(notification: PushNotification):
    """
    通知を処理するバックグラウンドタスク
    実際の実装では、データベースに保存やWebSocketでフロントエンドに通知
    """
    logger.info(f"通知を受信: {notification.type}")
    logger.info(f"タイトル: {notification.title}")
    logger.info(f"メッセージ: {notification.message}")
    
    # TODO: データベースに通知を保存
    # TODO: WebSocketでフロントエンドに通知を送信
    # TODO: メール通知を送信（設定されている場合）


@router.post("/webhook", response_model=NotificationResponse)
async def handle_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Vercelからプッシュ通知を受信するエンドポイント
    """
    # 署名の検証（開発環境ではスキップ可能）
    signature = request.headers.get("x-vercel-signature")
    if VERCEL_WEBHOOK_SECRET and signature != VERCEL_WEBHOOK_SECRET:
        logger.warning("無効な署名を受信しました")
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    # リクエストボディを解析
    try:
        body = await request.json()
        event_type = body.get("type", "")
        
        if event_type == "push":
            # プッシュ通知
            push_data = body
            notification = PushNotification(**push_data)
            background_tasks.add_task(process_notification, notification)
            
        elif event_type == "deployment":
            # デプロイ通知
            deployment_data = body
            notification = PushNotification(**deployment_data)
            background_tasks.add_task(process_notification, notification)
            
        elif event_type == "comment":
            # コメント通知
            comment_data = body
            notification = PushNotification(**comment_data)
            background_tasks.add_task(process_notification, notification)
            
        elif event_type == "update":
            # 更新通知
            update_data = body
            notification = PushNotification(**update_data)
            background_tasks.add_task(process_notification, notification)
            
        else:
            logger.warning(f"不明なイベントタイプ: {event_type}")
            return NotificationResponse(
                status="success",
                message=f"Unknown event type: {event_type}"
            )
        
        return NotificationResponse(status="success")
        
    except Exception as e:
        logger.error(f"通知処理エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
