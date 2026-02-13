/**
 * 用户中心布局
 * ============================================================
 *
 * 【路由】/user/*
 *
 * 为用户中心的所有页面提供统一的侧边导航栏。
 * 这是嵌套布局的实际应用：
 *   RootLayout → ShopLayout (Header/Footer) → UserLayout (侧边栏)
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 用户中心导航菜单配置
const menuItems = [
  { href: '/user/profile', label: '个人信息', icon: '👤' },
  { href: '/user/orders', label: '我的订单', icon: '📦' },
]

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // usePathname() 获取当前路由路径，用于高亮当前菜单项
  const pathname = usePathname()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* 左侧导航 */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border p-4 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4 px-3">用户中心</h3>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* 右侧内容区 */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
