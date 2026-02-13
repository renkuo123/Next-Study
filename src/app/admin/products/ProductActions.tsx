/**
 * 商品操作按钮组件（Client Component）
 * ============================================================
 *
 * 【为什么需要单独的 Client Component？】
 * 商品列表页是 Server Component，但操作按钮需要用户交互（点击事件）。
 * 所以将需要交互的部分提取为 Client Component。
 *
 * 【Server Action 替代方案】
 * 这里也可以使用 Next.js 的 Server Actions 来处理表单操作，
 * 但用 API Route 的方式更通用、更容易理解。
 */
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = {
  productId: number
  isActive: boolean
}

export default function ProductActions({ productId, isActive }: Props) {
  const router = useRouter()

  // 切换上架/下架状态
  const handleToggleActive = async () => {
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      // 刷新页面数据（Server Component 重新执行查询）
      router.refresh()
    } catch {
      alert('操作失败')
    }
  }

  // 删除商品
  const handleDelete = async () => {
    if (!confirm('确定要删除此商品吗？此操作不可撤销！')) return

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.message || '删除失败')
      }
    } catch {
      alert('删除失败')
    }
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="text-blue-600 hover:text-blue-500"
      >
        编辑
      </Link>
      <button
        onClick={handleToggleActive}
        className={`${isActive ? 'text-orange-500 hover:text-orange-400' : 'text-green-600 hover:text-green-500'}`}
      >
        {isActive ? '下架' : '上架'}
      </button>
      <button
        onClick={handleDelete}
        className="text-red-500 hover:text-red-400"
      >
        删除
      </button>
    </div>
  )
}
