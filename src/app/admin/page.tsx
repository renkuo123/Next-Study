/**
 * 管理后台 Dashboard
 * ============================================================
 *
 * 【路由】/admin
 *
 * 【Server Component 直接查数据库】
 * Dashboard 展示统计数据（用户数、商品数、订单数、销售额等），
 * 使用 Server Component 直接查询数据库，无需写 API 接口。
 *
 * 【Prisma 聚合查询】
 * - count(): 计数
 * - aggregate(): 聚合计算（求和、平均值等）
 * - groupBy(): 分组统计
 */

import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

// 动态渲染：Dashboard 需要实时统计数据
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // 并行查询所有统计数据（提高性能）
  const [
    userCount,
    productCount,
    orderCount,
    salesData,
    recentOrders,
  ] = await Promise.all([
    // 用户总数
    prisma.user.count(),
    // 商品总数
    prisma.product.count(),
    // 订单总数
    prisma.order.count(),
    // 销售总额（已付款的订单）
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    // 最近 5 个订单
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
  ])

  // 统计卡片数据
  const stats = [
    {
      title: '总用户数',
      value: userCount.toString(),
      icon: '👥',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '商品总数',
      value: productCount.toString(),
      icon: '📦',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: '订单总数',
      value: orderCount.toString(),
      icon: '🛒',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: '销售总额',
      value: formatPrice(salesData._sum.totalAmount?.toString() || '0'),
      icon: '💰',
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">仪表盘</h1>

      {/* ==================== 统计卡片 ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== 最近订单 ==================== */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">订单号</th>
                <th className="px-6 py-3 text-left">用户</th>
                <th className="px-6 py-3 text-left">商品数</th>
                <th className="px-6 py-3 text-left">金额</th>
                <th className="px-6 py-3 text-left">状态</th>
                <th className="px-6 py-3 text-left">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{order.orderNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order._count.items}</td>
                  <td className="px-6 py-4 text-sm font-medium text-red-500">
                    {formatPrice(order.totalAmount.toString())}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    暂无订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
