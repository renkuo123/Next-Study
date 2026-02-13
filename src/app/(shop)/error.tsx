/**
 * 前台错误处理页面
 * ============================================================
 *
 * 【error.tsx 的作用】
 * 当页面渲染过程中发生未捕获的错误时，Next.js 会显示这个组件。
 * 它相当于一个错误边界（Error Boundary），防止错误导致整个应用崩溃。
 *
 * 【必须是 Client Component】
 * Error Boundary 是 React 的客户端特性，所以 error.tsx 必须使用 'use client'。
 *
 * 【Props 说明】
 * - error: 错误对象
 * - reset: 重置函数，调用后会尝试重新渲染页面
 */
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // 在控制台打印错误信息（方便调试）
  useEffect(() => {
    console.error('页面错误:', error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-xl border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">出错了</h2>
        <p className="text-gray-500 mb-6">
          抱歉，页面加载时遇到了问题。请稍后重试。
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={reset} // 尝试重新加载页面
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <a
            href="/"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
