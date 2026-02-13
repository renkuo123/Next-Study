/**
 * NextAuth API 路由处理器
 * ============================================================
 *
 * 【文件路径解析】
 * src/app/api/auth/[...nextauth]/route.ts
 *
 * [...nextauth] 是 Next.js 的"Catch-all"动态路由：
 * - 它会匹配 /api/auth/ 下的所有路径
 * - 比如：/api/auth/signin、/api/auth/signout、/api/auth/callback 等
 * - NextAuth 需要这些路由来处理登录、登出、OAuth 回调等
 *
 * 【Route Handler 是什么？】
 * 在 Next.js App Router 中，route.ts 文件用来定义 API 端点。
 * 导出的函数名对应 HTTP 方法：GET、POST、PUT、DELETE 等。
 *
 * 这里我们直接将 NextAuth 的 handlers 导出，
 * NextAuth 会自动处理所有认证相关的请求。
 */

import { handlers } from '@/lib/auth'

// 将 NextAuth 的 GET 和 POST 处理器直接导出
// GET: 处理 OAuth 回调、获取 Session 等
// POST: 处理登录提交、登出等
export const { GET, POST } = handlers
