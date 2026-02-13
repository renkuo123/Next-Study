/**
 * 认证页面布局
 * ============================================================
 *
 * 【路由组 (Route Group)】
 * (auth) 是一个路由组，注意括号 ()！
 * - 路由组不会影响 URL 路径：/login 而不是 /auth/login
 * - 路由组的主要作用是共享布局
 * - 登录/注册页面不需要 Header/Footer，所以用单独的布局
 *
 * 【布局 Layout 的作用】
 * Layout 组件会包裹该路由组下所有页面。
 * 页面切换时 Layout 不会重新渲染（保持状态）。
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 认证页面不需要 Header/Footer，直接渲染子页面 */}
      {children}
    </div>
  )
}
