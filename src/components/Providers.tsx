/**
 * 全局 Provider 组件
 * ============================================================
 *
 * 【为什么需要这个组件？】
 * Next.js App Router 的 layout.tsx 默认是 Server Component，
 * 但 SessionProvider（NextAuth）需要在客户端运行。
 *
 * 解决方案：创建一个 Client Component 来包裹所有 Provider。
 *
 * 【Provider 模式】
 * React 的 Context Provider 模式用于跨组件共享数据。
 * SessionProvider 让任何子组件都能通过 useSession() 获取登录状态。
 *
 * 【如果将来需要更多 Provider？】
 * 比如主题（ThemeProvider）、国际化（IntlProvider）等，
 * 都可以在这里嵌套添加：
 *
 * <SessionProvider>
 *   <ThemeProvider>
 *     <IntlProvider>
 *       {children}
 *     </IntlProvider>
 *   </ThemeProvider>
 * </SessionProvider>
 */
'use client'

import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
