/**
 * 管理后台布局
 * ============================================================
 *
 * 【路由】/admin/*
 *
 * 管理后台有自己独立的布局（不使用前台的 Header/Footer）。
 * 左侧固定侧边栏 + 右侧内容区。
 *
 * 【权限保护】
 * 在 middleware.ts 中已配置：只有 ADMIN 角色才能访问 /admin/* 路由。
 * 非管理员会被重定向到首页。
 */

import AdminSidebar from '@/components/layout/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 左侧导航栏 */}
      <AdminSidebar />

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
