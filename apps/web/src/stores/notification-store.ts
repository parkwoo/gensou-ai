/**
 * 通知管理用のZustandストア
 * プッシュ通知、デプロイ通知、コメント通知などを管理
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'push' | 'deployment' | 'comment' | 'update'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  novelId?: string
  chapterId?: string
  read: boolean
  created_at: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  getUnreadNotifications: () => Notification[]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id: string) => {
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      removeNotification: (id: string) => {
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id)
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.read)
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
)

/**
 * 通知を作成するヘルパー関数
 */
export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    novelId?: string
    chapterId?: string
  }
): Omit<Notification, 'id' | 'created_at'> {
  return {
    type,
    title,
    message,
    ...options,
    read: false,
  }
}

/**
 * 通知タイプに応じた色を取得
 */
export function getNotificationColor(type: NotificationType): string {
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

/**
 * 通知タイプに応じたアイコン名を取得
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'push':
      return 'bell'
    case 'deployment':
      return 'rocket'
    case 'comment':
      return 'message-circle'
    case 'update':
      return 'refresh-cw'
    default:
      return 'bell'
  }
}
