/**
 * 注册页面
 * ============================================================
 *
 * 【路由】/register
 *
 * 【注册流程】
 * 1. 用户填写表单（昵称、邮箱、密码、确认密码）
 * 2. 前端用 Zod 验证表单数据
 * 3. 发送 POST 请求到 /api/register
 * 4. 注册成功 → 自动跳转到登录页
 *
 * 【学习重点】
 * - 使用 fetch API 向后端发送请求
 * - 前端表单验证 + 错误处理
 * - 前后端分离的数据交互模式
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerSchema } from '@/lib/validators'

export default function RegisterPage() {
  const router = useRouter()

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * 处理输入框变化
   * 使用一个通用的处理函数，通过 name 属性区分不同字段
   * 这比为每个字段写一个 handler 更简洁
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,                    // 保留其他字段
      [e.target.name]: e.target.value, // 只更新当前字段
    }))
  }

  /**
   * 处理注册提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. 前端验证（使用 Zod）
      const validationResult = registerSchema.safeParse(formData)
      if (!validationResult.success) {
        setError(validationResult.error.issues[0]?.message || '请检查输入')
        setLoading(false)
        return
      }

      // 2. 发送注册请求
      // fetch 是浏览器内置的 HTTP 请求函数
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 告诉服务器：请求体是 JSON 格式
        },
        body: JSON.stringify(formData), // 将对象序列化为 JSON 字符串
      })

      // 3. 解析响应
      const data = await response.json()

      if (!response.ok || !data.success) {
        // HTTP 状态码不是 2xx，或者业务逻辑返回失败
        setError(data.message || '注册失败')
        return
      }

      // 4. 注册成功，跳转到登录页
      router.push('/login?registered=true')
    } catch {
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">创建账户</h1>
          <p className="mt-2 text-gray-600">开始您的购物之旅</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              昵称
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请输入昵称"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱地址
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="至少6个字符"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              确认密码
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请再次输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        {/* 登录链接 */}
        <p className="text-center text-sm text-gray-600">
          已有账户？{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
