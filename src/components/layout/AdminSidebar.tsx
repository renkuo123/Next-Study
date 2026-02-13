/**
 * 后台管理侧边栏组件
 * ============================================================
 *
 * 管理后台的导航侧边栏，包含 Dashboard、商品管理、订单管理等入口。
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/admin', label: '仪表盘', icon: '📊', exact: true },
  { href: '/admin/products', label: '商品管理', icon: '📦', exact: false },
  { href: '/admin/orders', label: '订单管理', icon: '🛒', exact: false },
  { href: '/admin/categories', label: '分类管理', icon: '📁', exact: false },
  { href: '/admin/users', label: '用户管理', icon: '👥', exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex-shrink-0">
      <div className="p-6">
        {/* Logo */}
        <Link href="/admin" className="text-xl font-bold text-white">
          NextShop Admin
        </Link>
        <p className="text-gray-400 text-xs mt-1">后台管理系统</p>
      </div>

      {/* 导航菜单 */}
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* 底部：返回前台 */}
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>返回前台</span>
        </Link>
      </div>
    </aside>
  )
}
