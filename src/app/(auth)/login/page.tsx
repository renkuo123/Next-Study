/**
 * 登录页面
 * ============================================================
 *
 * 【路由】/login
 *
 * 【'use client' 指令】
 * 这个页面需要用户交互（表单输入、点击按钮），所以必须是 Client Component。
 *
 * 【Server Component vs Client Component】
 * - Server Component（默认）：在服务端渲染，可以直接访问数据库，但不能使用 useState、事件处理等
 * - Client Component（'use client'）：在浏览器中运行，可以使用 React Hooks 和事件处理
 * - 规则：需要交互的组件用 'use client'，纯展示的组件用 Server Component
 *
 * 【NextAuth signIn 流程】
 * 1. 调用 signIn('credentials', { email, password })
 * 2. NextAuth 会调用 auth.ts 中的 authorize() 回调
 * 3. 验证成功 → 生成 JWT → 存入 Cookie → 跳转到目标页面
 * 4. 验证失败 → 返回错误信息
 */
'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

/**
 * 登录页面入口
 *
 * 【Suspense 边界】
 * useSearchParams() 在静态渲染时需要被 Suspense 包裹。
 * Next.js 要求使用客户端 Hooks（如 useSearchParams）的组件
 * 必须有一个 Suspense 边界，否则构建时会报错。
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

/**
 * 登录表单组件（实际逻辑）
 */
function LoginForm() {
  // ---- React Hooks ----
  const router = useRouter()         // 路由跳转工具
  const searchParams = useSearchParams() // 获取 URL 查询参数
  const callbackUrl = searchParams.get('callbackUrl') || '/' // 登录后跳转的页面

  // ---- 状态管理 ----
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')       // 错误信息
  const [loading, setLoading] = useState(false) // 加载状态

  /**
   * 处理表单提交
   * async/await 是处理异步操作的标准方式
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // 阻止表单默认提交行为（页面刷新）
    setError('')       // 清除之前的错误信息
    setLoading(true)   // 显示加载状态

    try {
      // 调用 NextAuth 的 signIn 方法
      // redirect: false 表示不自动跳转，由我们手动处理
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // 登录失败
        setError('邮箱或密码错误')
      } else {
        // 登录成功，跳转到目标页面
        router.push(callbackUrl)
        router.refresh() // 刷新页面数据（更新 Session 状态）
      }
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false) // 无论成功失败，都关闭加载状态
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">欢迎回来</h1>
          <p className="mt-2 text-gray-600">登录您的账户</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 邮箱输入框 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors"
              placeholder="请输入邮箱"
            />
          </div>

          {/* 密码输入框 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors"
              placeholder="请输入密码"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 注册链接 */}
        <p className="text-center text-sm text-gray-600">
          还没有账户？{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
