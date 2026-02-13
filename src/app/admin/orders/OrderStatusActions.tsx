/**
 * 订单状态操作组件
 * ============================================================
 *
 * 管理员可以更新订单状态的流转：
 * PENDING → CANCELLED（取消）
 * PAID → SHIPPED（发货）
 * SHIPPED → COMPLETED（完成）
 */
'use client'

import { useRouter } from 'next/navigation'

type Props = {
  orderId: number
  currentStatus: string
}

// 定义状态流转规则
const statusTransitions: Record<string, { next: string; label: string }[]> = {
  PENDING: [{ next: 'CANCELLED', label: '取消' }],
  PAID: [{ next: 'SHIPPED', label: '发货' }],
  SHIPPED: [{ next: 'COMPLETED', label: '完成' }],
  COMPLETED: [],
  CANCELLED: [],
}

export default function OrderStatusActions({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const actions = statusTransitions[currentStatus] || []

  const handleStatusChange = async (newStatus: string) => {
    const confirmMsg = `确定要将订单状态更新为 ${newStatus} 吗？`
    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.message || '操作失败')
      }
    } catch {
      alert('操作失败')
    }
  }

  if (actions.length === 0) {
    return <span className="text-xs text-gray-400">—</span>
  }

  return (
    <div className="flex items-center space-x-2">
      {actions.map((action) => (
        <button
          key={action.next}
          onClick={() => handleStatusChange(action.next)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
