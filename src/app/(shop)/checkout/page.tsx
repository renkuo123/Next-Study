/**
 * 结算页面
 * ============================================================
 *
 * 【路由】/checkout
 *
 * 【受保护路由】
 * 通过 middleware.ts 配置，未登录用户访问此页面会被重定向到登录页。
 *
 * 【结算流程】
 * 1. 展示购物车商品清单
 * 2. 用户选择收货地址
 * 3. 确认下单 → 调用订单创建 API
 * 4. 订单创建成功 → 跳转到支付页面
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

type Address = {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, fetchCart, clearCart } = useCartStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 获取购物车和地址数据
  useEffect(() => {
    fetchCart()
    fetchAddresses()
  }, [fetchCart])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses')
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setAddresses(data.data)
        // 默认选中第一个地址或默认地址
        const defaultAddr = data.data.find((a: Address) => a.isDefault) || data.data[0]
        setSelectedAddressId(defaultAddr.id)
      }
    } catch {
      console.error('获取地址失败')
    }
  }

  // 提交订单
  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      setError('请选择收货地址')
      return
    }
    if (items.length === 0) {
      setError('购物车为空')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. 创建订单
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: selectedAddressId }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || '创建订单失败')
        return
      }

      // 2. 模拟支付
      const payRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.data.id }),
      })
      const payData = await payRes.json()

      if (payData.success) {
        // 清空本地购物车状态
        clearCart()
        // 跳转到订单详情页
        router.push(`/user/orders?paid=true`)
      } else {
        // 支付失败，但订单已创建
        router.push(`/user/orders`)
      }
    } catch {
      setError('提交订单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">确认订单</h1>

      <div className="space-y-6">
        {/* ==================== 收货地址 ==================== */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">收货地址</h2>

          {addresses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">暂无收货地址</p>
              <button
                onClick={() => router.push('/user/profile?tab=address')}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                添加收货地址
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{addr.name}</span>
                      <span className="text-gray-500">{addr.phone}</span>
                      {addr.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">默认</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {addr.province} {addr.city} {addr.district} {addr.detail}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* ==================== 商品清单 ==================== */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">商品清单</h2>
          <div className="divide-y">
            {items.map((item) => {
              let coverImage = '/placeholder.jpg'
              try {
                const imgs = JSON.parse(item.product.images)
                if (imgs[0]) coverImage = imgs[0]
              } catch { /* ignore */ }

              return (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <img
                    src={coverImage}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(parseFloat(item.product.price) * item.quantity)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ==================== 提交订单 ==================== */}
        <section className="bg-white rounded-xl border p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-600">共 {items.length} 种商品</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">应付金额</p>
              <p className="text-2xl font-bold text-red-500">
                {formatPrice(totalPrice())}
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={loading || items.length === 0}
            className="w-full mt-4 py-3 bg-red-500 text-white font-medium rounded-lg
                       hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? '提交中...' : '提交订单并支付'}
          </button>
        </section>
      </div>
    </div>
  )
}
