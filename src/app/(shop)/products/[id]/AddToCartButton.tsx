/**
 * 加入购物车按钮组件（Client Component）
 * ============================================================
 *
 * 【为什么这个组件需要 'use client'？】
 * 因为它需要：
 * 1. useState 管理数量选择状态
 * 2. 点击事件处理（用户交互）
 * 3. 调用 fetch 发送 API 请求
 *
 * 【Server Component 和 Client Component 的协作】
 * 商品详情页（page.tsx）是 Server Component，负责从数据库获取数据
 * 加入购物车按钮是 Client Component，负责处理用户交互
 *
 * 父组件（Server）将数据通过 props 传递给子组件（Client），
 * 这是 Next.js App Router 推荐的"组合模式"。
 */
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

type AddToCartButtonProps = {
  productId: number
  stock: number
  price: string
}

export default function AddToCartButton({ productId, stock, price }: AddToCartButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 是否可以购买
  const canBuy = stock > 0

  /**
   * 处理加入购物车
   */
  const handleAddToCart = async () => {
    // 未登录 → 跳转登录页
    if (!session) {
      router.push(`/login?callbackUrl=/products/${productId}`)
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 发送 POST 请求到购物车 API
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('已加入购物车！')
        // 3秒后清除提示
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.message || '操作失败')
      }
    } catch {
      setMessage('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 数量选择器 */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">数量：</span>
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={quantity >= stock}
          >
            +
          </button>
        </div>
        {/* 小计 */}
        <span className="text-sm text-gray-500">
          小计：{formatPrice(parseFloat(price) * quantity)}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          disabled={!canBuy || loading}
          className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {loading ? '添加中...' : canBuy ? '加入购物车' : '暂时缺货'}
        </button>
        <button
          onClick={async () => {
            await handleAddToCart()
            if (canBuy) router.push('/cart')
          }}
          disabled={!canBuy || loading}
          className="flex-1 py-3 px-6 bg-orange-500 text-white font-medium rounded-lg
                     hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          立即购买
        </button>
      </div>

      {/* 操作提示 */}
      {message && (
        <p className={`text-sm text-center ${message.includes('成功') || message.includes('已加入') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
