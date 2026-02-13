/**
 * 根布局文件 - 整个应用的最外层包裹
 * ============================================================
 *
 * 【layout.tsx 的作用】
 * 这是 Next.js App Router 的根布局，会包裹所有页面。
 * 它定义了 <html> 和 <body> 标签，是整个应用的"壳"。
 *
 * 【布局嵌套层级】
 * RootLayout（当前文件）
 *   ├── (shop)/layout.tsx → 前台页面布局（Header + Footer）
 *   ├── (auth)/layout.tsx → 认证页面布局（简洁布局）
 *   └── admin/layout.tsx  → 后台管理布局（侧边栏）
 *
 * 【SessionProvider 的作用】
 * NextAuth 需要 SessionProvider 来在客户端共享 Session 状态。
 * 所有使用 useSession() 的组件必须在 SessionProvider 内部。
 *
 * 【为什么要单独创建 Providers 组件？】
 * RootLayout 是 Server Component（默认），不能使用 'use client'。
 * SessionProvider 需要在客户端运行。
 * 所以我们将 Provider 提取到单独的 Client Component 中。
 */

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

// ---- 字体配置 ----
// Next.js 内置了 Google Fonts 优化，自动下载并自托管字体文件
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// ---- 全局 SEO 元数据 ----
// 这些是默认的 SEO 信息，各页面可以通过 export const metadata 覆盖
export const metadata: Metadata = {
  title: {
    default: 'NextShop - 全栈电商平台',       // 默认标题
    template: '%s | NextShop',                 // 子页面标题模板
  },
  description: '基于 Next.js 的全栈电商学习项目，包含 SSR、API 路由、用户认证等功能',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Providers 包裹所有子组件，提供 Session 上下文 */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
