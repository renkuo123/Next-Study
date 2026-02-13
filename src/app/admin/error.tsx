/**
 * 后台管理错误处理页面
 */
'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('后台错误:', error)
  }, [error])

  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">后台页面出错</h2>
      <p className="text-gray-500 mb-6">请检查数据库连接或联系开发人员。</p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        重试
      </button>
    </div>
  )
}
