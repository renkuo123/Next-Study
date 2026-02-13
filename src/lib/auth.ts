/**
 * NextAuth.js 完整认证配置
 * ============================================================
 *
 * 【配置拆分说明】
 * - auth.config.ts: 基础配置（Edge 兼容），用于 middleware
 * - auth.ts（当前文件）: 完整配置，包含 Credentials Provider
 *
 * 【认证流程（Credentials Provider + JWT）】
 * 1. 用户提交邮箱 + 密码
 * 2. authorize() 回调验证密码是否正确
 * 3. 验证通过 → 生成 JWT Token → 存到 HttpOnly Cookie 中
 * 4. 后续请求自动携带 Cookie → NextAuth 解析 Token → 获取用户信息
 *
 * 【导出说明】
 * - handlers: GET/POST 路由处理器，用于 /api/auth/* 路由
 * - auth: 获取当前用户 Session 的函数（在 Server Component 中使用）
 * - signIn: 登录函数
 * - signOut: 登出函数
 */

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  // ---- 认证提供者 ----
  providers: [
    CredentialsProvider({
      name: 'credentials',

      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },

      /**
       * authorize 回调 - 核心认证逻辑
       *
       * 【执行时机】用户点击登录时调用
       * 【返回值】
       *   - 返回用户对象 → 登录成功
       *   - 返回 null → 登录失败
       *   - 抛出错误 → 登录失败并显示错误信息
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码')
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error('用户不存在')
        }

        // 验证密码
        // bcrypt.compare() 将用户输入的明文密码与数据库中的哈希值比较
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('密码错误')
        }

        // 返回用户信息（编码到 JWT Token 中，不要返回密码！）
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
})
