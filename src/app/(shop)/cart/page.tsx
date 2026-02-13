/**
 * 购物车页面
 * ============================================================
 *
 * 【路由】/cart
 *
 * 【Client Component】
 * 购物车页面需要大量用户交互（修改数量、删除商品、勾选等），
 * 所以使用 Client Component。
 *
 * 【数据获取方式】
 * 这里使用 useEffect + fetch 的方式获取数据（传统前端方式），
 * 因为购物车数据需要实时更新（用户操作后立即反映变化）。
 *
 * 【Zustand Store 的使用】
 * 通过 useCartStore 获取购物车状态和操作方法。
 * Zustand 会在状态变化时自动触发组件重新渲染。
 */
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 从 Zustand store 解构出状态和方法
  const { items, loading, totalPrice, fetchCart, updateQuantity, removeItem } =
    useCartStore()

  // 组件挂载时获取购物车数据
  useEffect(() => {
    if (session) {
      fetchCart()
    }
  }, [session, fetchCart])

  // 未登录时显示提示
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">购物车</h1>
        <p className="text-gray-500 mb-6">请先登录后查看购物车</p>
        <Link
          href="/login?callbackUrl=/cart"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          去登录
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">购物车</h1>

      {loading ? (
        // 加载状态
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        // 空购物车
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="mt-4 text-gray-500">购物车是空的</p>
          <Link
            href="/products"
            className="inline-block mt-4 text-blue-600 hover:text-blue-500"
          >
            去逛逛 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ==================== 商品列表 ==================== */}
          {items.map((item) => {
            // 解析商品图片
            let coverImage = '/placeholder.jpg'
            try {
              const imgs = JSON.parse(item.product.images)
              if (imgs[0]) coverImage = imgs[0]
            } catch { /* ignore */ }

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
              >
                {/* 商品图片 */}
                <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                  <img
                    src={coverImage}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </Link>

                {/* 商品信息 */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-red-500 font-bold mt-1">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* 数量控制 */}
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="px-3 py-1 min-w-[2.5rem] text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                    disabled={item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>

                {/* 小计 */}
                <div className="text-right w-24">
                  <p className="font-bold text-gray-900">
                    {formatPrice(parseFloat(item.product.price) * item.quantity)}
                  </p>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}

          {/* ==================== 结算区域 ==================== */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600">
                  共 <span className="font-bold text-gray-900">{items.length}</span> 种商品
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">合计</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatPrice(totalPrice())}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full mt-4 py-3 bg-blue-600 text-white font-medium rounded-lg
                         hover:bg-blue-700 transition-colors"
            >
              去结算
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
