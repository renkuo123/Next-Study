/**
 * 我的订单页面
 * ============================================================
 *
 * 【路由】/user/orders
 *
 * 展示当前用户的所有订单列表，支持查看订单详情。
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

// 订单状态映射
const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待付款', color: 'text-orange-500 bg-orange-50' },
  PAID: { label: '已付款', color: 'text-blue-500 bg-blue-50' },
  SHIPPED: { label: '已发货', color: 'text-purple-500 bg-purple-50' },
  COMPLETED: { label: '已完成', color: 'text-green-500 bg-green-50' },
  CANCELLED: { label: '已取消', color: 'text-gray-500 bg-gray-50' },
}

type OrderItem = {
  id: number
  quantity: number
  price: string
  product: {
    id: number
    name: string
    images: string
  }
}

type Order = {
  id: number
  orderNo: string
  totalAmount: string
  status: string
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch {
      console.error('获取订单失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500 mb-4">暂无订单</p>
          <Link href="/products" className="text-blue-600 hover:text-blue-500">
            去逛逛 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status] || statusMap.PENDING

            return (
              <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
                {/* 订单头部 */}
                <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>订单号：{order.orderNo}</span>
                    <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* 订单商品 */}
                <div className="px-6 py-4">
                  {order.items.map((item) => {
                    let coverImage = '/placeholder.jpg'
                    try {
                      const imgs = JSON.parse(item.product.images)
                      if (imgs[0]) coverImage = imgs[0]
                    } catch { /* ignore */ }

                    return (
                      <div key={item.id} className="flex items-center gap-4 py-2">
                        <Link href={`/products/${item.product.id}`}>
                          <img
                            src={coverImage}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="text-sm text-gray-900 hover:text-blue-600 line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 订单底部 */}
                <div className="px-6 py-3 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    共 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">
                      合计：<span className="text-lg font-bold text-red-500">{formatPrice(order.totalAmount)}</span>
                    </span>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: order.id }),
                          })
                          const data = await res.json()
                          if (data.success) {
                            fetchOrders() // 刷新订单列表
                          }
                        }}
                        className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        立即支付
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
