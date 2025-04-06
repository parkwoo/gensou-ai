'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Palette, Check, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type DeviceMode = 'pc' | 'mobile' | 'auto'

interface LayoutSettings {
  deviceMode: DeviceMode
}

interface LayoutContext {
  settings: LayoutSettings
  setDeviceMode: (mode: DeviceMode) => void
  isMobile: boolean
}

// Create context (simplified version)
let layoutContext: LayoutContext | null = null

export function useLayout() {
  if (!layoutContext) {
    // Default context
    return {
      settings: { deviceMode: 'auto' as DeviceMode },
      setDeviceMode: () => {},
      isMobile: false,
    }
  }
  return layoutContext
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>('auto')
  const [isMobile, setIsMobile] = useState(false)

  // Detect actual device size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const setDeviceMode = (mode: DeviceMode) => {
    setDeviceModeState(mode)
    localStorage.setItem('gensou-device-mode', mode)
    
    // Apply to document
    const effectiveMode = mode === 'auto' ? (isMobile ? 'mobile' : 'pc') : mode
    document.documentElement.setAttribute('data-device-mode', effectiveMode)
  }

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('gensou-device-mode') as DeviceMode | null
    if (saved) {
      setDeviceModeState(saved)
    }
  }, [])

  // Apply mode
  useEffect(() => {
    const effectiveMode = deviceMode === 'auto' ? (isMobile ? 'mobile' : 'pc') : deviceMode
    document.documentElement.setAttribute('data-device-mode', effectiveMode)
  }, [deviceMode, isMobile])

  layoutContext = {
    settings: { deviceMode },
    setDeviceMode,
    isMobile: deviceMode === 'auto' ? isMobile : deviceMode === 'mobile',
  }

  return <>{children}</>
}

export function DeviceModeSwitcher() {
  const { settings, setDeviceMode, isMobile } = useLayout()

  // 現在のデバイスモードに基づいて表示するアイコンを決定
  const displayIcon =
    settings.deviceMode === 'mobile' ? <Smartphone className="h-4 w-4" /> :
    settings.deviceMode === 'pc' ? <Monitor className="h-4 w-4" /> :
    isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {displayIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>UI レイアウト</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setDeviceMode('auto')}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            自動（PC/モバイル）
          </span>
          {settings.deviceMode === 'auto' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDeviceMode('pc')}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            PC 最適化
          </span>
          {settings.deviceMode === 'pc' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDeviceMode('mobile')}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            モバイル最適化
          </span>
          {settings.deviceMode === 'mobile' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          現在の表示：{isMobile ? 'モバイル' : 'PC'}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [mounted, setMounted] = useState(false)

  // クライアントサイドでマウント後のみ実行
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('gensou-theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('system')
    }
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', newTheme === 'dark')
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('gensou-theme', newTheme)
    applyTheme(newTheme)
  }

  // システムテーマの変更を監視
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // マウント前は何も表示しない（ハイドレーションエラー回避）
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  // 現在のテーマに基づいてアイコンを表示
  const displayIcon =
    theme === 'dark' ? <Moon className="h-4 w-4" /> :
    theme === 'light' ? <Sun className="h-4 w-4" /> :
    <Palette className="h-4 w-4" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {displayIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>テーマ</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            ライトモード
          </span>
          {theme === 'light' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            ダークモード
          </span>
          {theme === 'dark' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            システム設定
          </span>
          {theme === 'system' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Helper hook for responsive rendering
export function useResponsive() {
  const { isMobile } = useLayout()
  
  return {
    isMobile,
    isDesktop: !isMobile,
    showOnMobile: (children: React.ReactNode) => isMobile ? children : null,
    showOnDesktop: (children: React.ReactNode) => !isMobile ? children : null,
  }
}
