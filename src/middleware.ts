/**
 * Next.js 中间件（Middleware）
 * ============================================================
 *
 * 【什么是中间件？】
 * 中间件是在请求到达页面之前执行的代码。
 * 可以理解为"门卫"：每个请求都要先经过门卫检查。
 *
 * 【Edge Runtime 限制】
 * 中间件运行在 Edge Runtime 上，不支持 Node.js 原生模块。
 * 因此这里只引用 auth.config.ts（不包含 Prisma/bcrypt），
 * 权限检查逻辑在 auth.config.ts 的 authorized 回调中。
 *
 * 【与 auth.ts 的区别】
 * - middleware 使用 auth.config.ts（Edge 兼容、轻量级）
 * - API 路由使用 auth.ts（完整版、包含数据库认证）
 */

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export default NextAuth(authConfig).auth

/**
 * matcher 配置 - 指定中间件要拦截哪些路径
 *
 * 排除静态资源和 API 路由：
 * - /api/* (API 路由由各自的 handler 处理)
 * - /_next/static/* (Next.js 静态资源)
 * - /_next/image/* (Next.js 图片优化)
 * - /favicon.ico (网站图标)
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
