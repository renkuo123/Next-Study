/**
 * 后台 - 订单管理页面
 * ============================================================
 *
 * 【路由】/admin/orders
 *
 * 管理员可以查看所有用户的订单，并更新订单状态（如：发货、完成）。
 */

import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import OrderStatusActions from './OrderStatusActions'

// 动态渲染
export const dynamic = 'force-dynamic'

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待付款', color: 'bg-orange-50 text-orange-600' },
  PAID: { label: '已付款', color: 'bg-blue-50 text-blue-600' },
  SHIPPED: { label: '已发货', color: 'bg-purple-50 text-purple-600' },
  COMPLETED: { label: '已完成', color: 'bg-green-50 text-green-600' },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">订单管理</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">订单号</th>
                <th className="px-6 py-3 text-left">用户</th>
                <th className="px-6 py-3 text-left">商品数</th>
                <th className="px-6 py-3 text-left">金额</th>
                <th className="px-6 py-3 text-left">状态</th>
                <th className="px-6 py-3 text-left">下单时间</th>
                <th className="px-6 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const status = statusMap[order.status] || statusMap.PENDING
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{order.orderNo}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                        <p className="text-xs text-gray-500">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order._count.items}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-500">
                      {formatPrice(order.totalAmount.toString())}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">暂无订单</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
