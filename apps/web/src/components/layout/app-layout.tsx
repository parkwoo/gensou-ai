'use client'

import { useState } from 'react'
import { Book, PenTool, Sparkles, Settings, Menu, X, Home, Network } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLayout } from '@/lib/layout'
import { DeviceModeSwitcher, ThemeSwitcher } from '@/lib/layout'
import { NotificationBell } from '@/components/ui/notification-bell'

interface NavigationProps {
  children: React.ReactNode
}

export function AppLayout({ children }: NavigationProps) {
  const pathname = usePathname()
  const { isMobile, setDeviceMode } = useLayout()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: '小説一覧', href: '/novels', icon: Book },
    { name: 'マインドマップ', href: '/mindmap', icon: Network },
    { name: '知識ベース', href: '/knowledge', icon: PenTool },
    { name: '設定', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* PC レイアウト - サイドバー */}
      <div className={cn(
        'hidden md:block',
        'fixed left-0 top-0 h-full w-64 border-r bg-background',
        'z-30'
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Network className="h-6 w-6 text-primary" />
            <span>GenSou AI</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex gap-2">
            <NotificationBell />
            <ThemeSwitcher />
            <DeviceModeSwitcher />
          </div>
        </div>
      </div>

      {/* モバイル レイアウト - トップバー */}
      <div className={cn(
        'md:hidden',
        'fixed left-0 top-0 right-0 h-14 border-b bg-background',
        'z-30 flex items-center justify-between px-4'
      )}>
        <div className="flex items-center gap-2 font-bold">
          <Network className="h-5 w-5 text-primary" />
          <span>GenSou AI</span>
        </div>
        
        <div className="flex items-center gap-1">
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {mobileMenuOpen && (
        <div className={cn(
          'md:hidden',
          'fixed inset-0 top-14 bg-background z-20',
          'p-4 space-y-2'
        )}>
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-lg">{item.name}</span>
              </Link>
            )
          })}
          
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <NotificationBell />
              <ThemeSwitcher />
              <DeviceModeSwitcher />
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className={cn(
        'transition-all duration-300',
        'md:ml-64',
        'pt-14 md:pt-0'
      )}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* モバイル - ボトムナビゲーション（オプション） */}
      <div className={cn(
        'md:hidden',
        'fixed bottom-0 left-0 right-0 border-t bg-background',
        'z-30 flex justify-around items-center h-16',
        'safe-area-inset-bottom'
      )}>
        {navigation.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Simple button component for mobile menu
function Button({ 
  children, 
  variant, 
  size, 
  onClick,
  className 
}: {
  children: React.ReactNode
  variant: string
  size: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        variant === 'ghost' && 'hover:bg-muted',
        size === 'icon' && 'h-10 w-10',
        className
      )}
    >
      {children}
    </button>
  )
}
