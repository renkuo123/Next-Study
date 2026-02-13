/**
 * NextAuth 基础配置（Edge 兼容）
 * ============================================================
 *
 * 【为什么要拆分配置？】
 * Next.js 的 middleware 运行在 Edge Runtime 上。
 * Edge Runtime 不支持 Node.js 原生模块（如 fs、crypto 等），
 * 而 Prisma 和 bcryptjs 依赖这些模块。
 *
 * 解决方案：拆分为两个配置文件：
 * 1. auth.config.ts（当前文件）— 不含 Prisma/bcrypt，Edge 兼容
 *    仅包含 session 策略、页面配置、回调函数
 * 2. auth.ts — 完整配置，包含 Credentials Provider
 *
 * middleware 只引用 auth.config.ts
 * API 路由引用 auth.ts（完整版）
 */

import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as 'USER' | 'ADMIN'
      }
      return session
    },

    // authorized 回调 — 在 middleware 中使用
    // 返回 true 表示允许访问，返回 false 表示拒绝
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // 已登录用户不应访问登录/注册页
      if (isLoggedIn && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        return Response.redirect(new URL('/', nextUrl))
      }

      // 需要登录的页面
      const protectedPaths = ['/user', '/checkout']
      if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
        return false // NextAuth 会自动重定向到登录页
      }

      // 管理员页面
      if (pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false
        if (auth?.user?.role !== 'ADMIN') {
          return Response.redirect(new URL('/', nextUrl))
        }
      }

      return true
    },
  },

  providers: [], // 在 auth.ts 中添加 providers
}
