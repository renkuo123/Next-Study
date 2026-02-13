/**
 * Zustand 购物车状态管理
 * ============================================================
 *
 * 【什么是 Zustand？】
 * Zustand 是一个轻量级的 React 状态管理库。
 * 相比 Redux，它更简单：
 * - 不需要 Provider 包裹
 * - 不需要 action/reducer 样板代码
 * - 直接 create() 创建 store，任何组件都能直接使用
 *
 * 【为什么购物车需要客户端状态？】
 * 购物车数据同时存在于：
 * 1. 服务端数据库（已登录用户的持久化数据）
 * 2. 客户端 Zustand（实时更新 UI，不需要刷新页面）
 *
 * 用户添加商品到购物车时：
 * 1. 先调用 API 存入数据库（持久化）
 * 2. 同时更新 Zustand 状态（UI 实时更新）
 *
 * 【使用方式】
 * import { useCartStore } from '@/store/cart'
 *
 * function MyComponent() {
 *   const { items, totalItems, fetchCart } = useCartStore()
 *   // ...
 * }
 */

import { create } from 'zustand'

// ---- 类型定义 ----

type CartProduct = {
  id: number
  name: string
  price: string
  stock: number
  images: string
}

type CartItem = {
  id: number
  quantity: number
  product: CartProduct
}

// Store 的类型定义（包含状态和方法）
type CartStore = {
  // ---- 状态 ----
  items: CartItem[]         // 购物车商品列表
  loading: boolean          // 加载状态

  // ---- 计算属性（getter）----
  // Zustand 没有内置 computed，用方法代替
  totalItems: () => number  // 购物车总商品数
  totalPrice: () => number  // 购物车总金额

  // ---- 方法（actions）----
  fetchCart: () => Promise<void>                    // 从服务器获取购物车数据
  addItem: (productId: number, quantity: number) => Promise<boolean>  // 添加商品
  updateQuantity: (itemId: number, quantity: number) => Promise<void>  // 更新数量
  removeItem: (itemId: number) => Promise<void>     // 删除商品
  clearCart: () => void                             // 清空购物车（本地）
}

/**
 * 创建购物车 Store
 *
 * create() 接收一个函数，参数 set 用于更新状态，get 用于读取当前状态。
 * 返回一个 React Hook（useCartStore），在组件中直接使用。
 */
export const useCartStore = create<CartStore>((set, get) => ({
  // ---- 初始状态 ----
  items: [],
  loading: false,

  // ---- 计算属性 ----
  totalItems: () => {
    // reduce 是数组的"归约"方法，将数组中所有元素的数量累加
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  totalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    )
  },

  // ---- 从服务器获取购物车 ----
  fetchCart: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      if (data.success) {
        set({ items: data.data })
      }
    } catch (error) {
      console.error('获取购物车失败:', error)
    } finally {
      set({ loading: false })
    }
  },

  // ---- 添加商品到购物车 ----
  addItem: async (productId, quantity) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await response.json()
      if (data.success) {
        // 添加成功后重新获取购物车数据
        await get().fetchCart()
        return true
      }
      return false
    } catch {
      return false
    }
  },

  // ---- 更新商品数量 ----
  updateQuantity: async (itemId, quantity) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',       // PATCH 表示部分更新
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      const data = await response.json()
      if (data.success) {
        // 乐观更新：先更新本地状态，提升用户体验
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      }
    } catch (error) {
      console.error('更新数量失败:', error)
    }
  },

  // ---- 删除购物车商品 ----
  removeItem: async (itemId) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        // 从本地状态中移除
        set({
          items: get().items.filter((item) => item.id !== itemId),
        })
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  },

  // ---- 清空购物车（本地状态）----
  clearCart: () => {
    set({ items: [] })
  },
}))
