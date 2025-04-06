'use client'

import { useState } from 'react'
import { Bell, BellRing, Rocket, MessageCircle, RefreshCw, Trash2, CheckCheck } from 'lucide-react'
import { useNotificationStore, Notification, NotificationType } from '@/stores/notification-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * 通知ベルコンポーネント
 * プッシュ通知、デプロイ通知、コメント通知などを表示
 */
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)

  // 通知を開いたときにすべて既読にする
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && unreadCount > 0) {
      markAllAsRead()
    }
  }

  // 通知をクリックしたときの処理
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    // TODO: 通知に応じたページへ遷移
    if (notification.novelId) {
      // router.push(`/editor/${notification.novelId}`)
    }
  }

  // 通知タイプに応じたアイコンを取得
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'push':
        return <Bell className="h-4 w-4" />
      case 'deployment':
        return <Rocket className="h-4 w-4" />
      case 'comment':
        return <MessageCircle className="h-4 w-4" />
      case 'update':
        return <RefreshCw className="h-4 w-4" />
      default:
        return <BellRing className="h-4 w-4" />
    }
  }

  // 通知タイプに応じた色を取得
  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'push':
        return 'bg-blue-500'
      case 'deployment':
        return 'bg-green-500'
      case 'comment':
        return 'bg-purple-500'
      case 'update':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) {
      return 'たった今'
    } else if (minutes < 60) {
      return `${minutes}分前`
    } else if (hours < 24) {
      return `${hours}時間前`
    } else if (days < 7) {
      return `${days}日前`
    } else {
      return date.toLocaleDateString('ja-JP')
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 min-w-[1.25rem] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold p-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-[500px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellRing className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">通知はありません</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-medium">通知</span>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      markAllAsRead()
                    }}
                    className="h-8 px-2"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    すべて既読
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearAll()
                  }}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  クリア
                </Button>
              </div>
            </div>

            {/* 通知リスト */}
            <ScrollArea className="max-h-[400px]">
              <div className="p-2 space-y-1">
                {notifications.slice(0, 20).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    {/* アイコン */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-secondary text-secondary-foreground rounded">
                            未読
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 削除ボタン */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>

            {/* フッター */}
            {notifications.length > 20 && (
              <div className="px-4 py-2 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  最新20件を表示しています
                </p>
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
