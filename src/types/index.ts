/**
 * TypeScript 类型定义
 * ============================================================
 *
 * 【文件用途】
 * 集中管理项目中使用的 TypeScript 类型。
 * Prisma 会自动生成数据库模型的类型，但有些业务场景需要自定义类型，
 * 比如 API 响应格式、组件 Props 等。
 *
 * 【学习重点】
 * - type vs interface：type 更灵活（支持联合类型、交叉类型），
 *   interface 更适合定义对象结构（支持扩展 extends）
 * - 这里统一使用 type 保持一致性
 */

// ==================== API 响应类型 ====================

/**
 * 通用 API 响应格式
 *
 * 【设计思路】
 * 所有 API 返回统一格式，前端可以用同一套逻辑处理：
 * - success: true  → 读取 data
 * - success: false → 显示 message 错误信息
 *
 * 泛型 <T> 让 data 的类型可以灵活指定：
 * ApiResponse<User>   → data 是 User 类型
 * ApiResponse<Product[]> → data 是 Product 数组
 */
export type ApiResponse<T = unknown> = {
  success: boolean   // 是否成功
  message?: string   // 提示信息（错误时必须提供）
  data?: T           // 响应数据（成功时提供）
}

/**
 * 分页响应格式
 * 用于商品列表、订单列表等需要分页的场景
 */
export type PaginatedResponse<T> = {
  items: T[]        // 当前页的数据列表
  total: number     // 总记录数
  page: number      // 当前页码（从 1 开始）
  pageSize: number  // 每页条数
  totalPages: number // 总页数
}

// ==================== 用户相关类型 ====================

/**
 * 安全的用户信息（不包含密码）
 * 返回给前端时，绝对不能包含密码字段！
 */
export type SafeUser = {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  avatar: string | null
  createdAt: Date
}

// ==================== 商品相关类型 ====================

/**
 * 商品列表项（包含分类信息）
 * 用于商品列表页展示
 */
export type ProductWithCategory = {
  id: number
  name: string
  description: string
  price: string     // Decimal 在 JSON 序列化后变成 string
  stock: number
  images: string
  isActive: boolean
  categoryId: number
  createdAt: Date
  updatedAt: Date
  category: {
    id: number
    name: string
    slug: string
  }
}

// ==================== 购物车相关类型 ====================

/**
 * 购物车项（包含商品信息）
 */
export type CartItemWithProduct = {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    price: string
    stock: number
    images: string
    isActive: boolean
  }
}

// ==================== 订单相关类型 ====================

/**
 * 订单详情（包含订单商品和用户信息）
 */
export type OrderWithItems = {
  id: number
  orderNo: string
  totalAmount: string
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  address: string
  createdAt: Date
  updatedAt: Date
  items: {
    id: number
    quantity: number
    price: string
    product: {
      id: number
      name: string
      images: string
    }
  }[]
}

// ==================== 搜索与筛选类型 ====================

/**
 * 商品搜索/筛选参数
 */
export type ProductSearchParams = {
  keyword?: string      // 搜索关键词
  categoryId?: number   // 分类ID
  minPrice?: number     // 最低价格
  maxPrice?: number     // 最高价格
  page?: number         // 页码
  pageSize?: number     // 每页条数
  sortBy?: 'price' | 'createdAt' | 'name' // 排序字段
  sortOrder?: 'asc' | 'desc'              // 排序方向
}

// ==================== NextAuth 类型扩展 ====================

/**
 * 扩展 NextAuth 的 Session 类型
 *
 * 【为什么需要扩展？】
 * NextAuth 默认的 Session 只包含 name、email、image。
 * 我们需要在 Session 中添加 id 和 role，这样在页面中可以直接获取用户角色。
 *
 * 【这是 TypeScript 的"模块扩展"（Module Augmentation）】
 * 通过 declare module 可以扩展第三方库的类型定义
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'USER' | 'ADMIN'
      image?: string | null
    }
  }

  interface User {
    role: 'USER' | 'ADMIN'
  }
}
