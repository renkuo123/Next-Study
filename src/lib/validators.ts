/**
 * Zod 数据验证规则
 * ============================================================
 *
 * 【什么是 Zod？】
 * Zod 是一个 TypeScript 优先的数据验证库。
 * 它可以在运行时验证数据是否符合预期的格式和类型。
 *
 * 【为什么前后端都需要验证？】
 * - 前端验证：提升用户体验（即时反馈）
 * - 后端验证：确保数据安全（前端验证可以被绕过！）
 * - Zod 的好处：同一份规则，前后端共用！
 *
 * 【使用方式】
 * import { loginSchema } from '@/lib/validators'
 *
 * // 验证数据
 * const result = loginSchema.safeParse(formData)
 * if (!result.success) {
 *   console.log(result.error.errors) // 验证错误列表
 * } else {
 *   console.log(result.data) // 验证通过的数据（已自动推断类型）
 * }
 */

import { z } from 'zod'

// ==================== 用户认证相关 ====================

/**
 * 登录表单验证规则
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少6个字符')
    .max(100, '密码最多100个字符'),
})

/**
 * 注册表单验证规则
 * .refine() 用于自定义验证逻辑（这里检查两次密码是否一致）
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, '昵称至少2个字符')
      .max(20, '昵称最多20个字符'),
    email: z
      .string()
      .min(1, '请输入邮箱')
      .email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(6, '密码至少6个字符')
      .max(100, '密码最多100个字符'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'], // 错误信息关联到 confirmPassword 字段
  })

// ==================== 商品相关 ====================

/**
 * 创建/编辑商品的验证规则
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(1, '请输入商品名称')
    .max(200, '商品名称最多200个字符'),
  description: z
    .string()
    .min(1, '请输入商品描述'),
  price: z
    .number()
    .positive('价格必须大于0')
    .max(99999999.99, '价格超出范围'),
  stock: z
    .number()
    .int('库存必须是整数')
    .min(0, '库存不能为负数'),
  categoryId: z
    .number()
    .int()
    .positive('请选择商品分类'),
  images: z
    .string()
    .min(1, '请上传至少一张商品图片'),
  isActive: z.boolean().optional(),
})

// ==================== 购物车相关 ====================

/**
 * 添加购物车验证规则
 */
export const addToCartSchema = z.object({
  productId: z.number().int().positive('无效的商品ID'),
  quantity: z.number().int().min(1, '数量至少为1').max(99, '数量最多99'),
})

/**
 * 更新购物车数量验证规则
 */
export const updateCartSchema = z.object({
  quantity: z.number().int().min(1, '数量至少为1').max(99, '数量最多99'),
})

// ==================== 订单相关 ====================

/**
 * 创建订单验证规则
 */
export const createOrderSchema = z.object({
  addressId: z.number().int().positive('请选择收货地址'),
})

// ==================== 收货地址相关 ====================

/**
 * 收货地址验证规则
 */
export const addressSchema = z.object({
  name: z.string().min(1, '请输入收件人姓名').max(50, '姓名最多50个字符'),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  district: z.string().min(1, '请选择区县'),
  detail: z.string().min(1, '请输入详细地址').max(200, '地址最多200个字符'),
  isDefault: z.boolean().optional(),
})

// ==================== 分类相关 ====================

/**
 * 分类验证规则
 */
export const categorySchema = z.object({
  name: z.string().min(1, '请输入分类名称').max(50, '分类名称最多50个字符'),
  slug: z
    .string()
    .min(1, '请输入分类标识')
    .regex(/^[a-z0-9-]+$/, '标识只能包含小写字母、数字和连字符'),
  image: z.string().optional(),
})

// ==================== 导出类型 ====================
// z.infer 可以从 Zod schema 自动推导出 TypeScript 类型
// 这样就不需要手动维护两份类型定义了！

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartInput = z.infer<typeof updateCartSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CategoryInput = z.infer<typeof categorySchema>
