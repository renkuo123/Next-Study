/**
 * 通用工具函数
 * ============================================================
 *
 * 存放项目中通用的辅助函数。
 * 这些函数与业务逻辑无关，可以在前后端共用。
 */

/**
 * 合并 CSS 类名（简化版）
 *
 * 【用途】
 * 在 React 组件中，经常需要根据条件合并多个 className。
 * 比如：cn('text-red-500', isActive && 'font-bold', className)
 *
 * @param classes - 类名列表，支持字符串、undefined、null、false
 * @returns 合并后的类名字符串
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 格式化价格显示
 *
 * 【为什么需要这个函数？】
 * 数据库中存储的价格是 Decimal 类型（如 199.00），
 * 显示给用户时需要加上货币符号和千分位格式化。
 *
 * @param price - 价格数值（number 或 string 类型都支持）
 * @returns 格式化后的价格字符串，如 "¥199.00"
 *
 * @example
 * formatPrice(1999.5)  // "¥1,999.50"
 * formatPrice("99")    // "¥99.00"
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(num)
}

/**
 * 生成订单编号
 *
 * 【生成规则】
 * ORD + 年月日 + 6位随机数
 * 例如：ORD20240315123456
 *
 * 【注意】
 * 在高并发场景下，这种方式可能会重复。
 * 生产环境建议使用：雪花算法（Snowflake）或数据库自增序列。
 * 这里为了学习简单，使用时间戳 + 随机数。
 */
export function generateOrderNo(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // 20240315
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0') // 6位随机数
  return `ORD${dateStr}${random}`
}

/**
 * 延迟函数（模拟网络请求、支付等场景）
 *
 * @param ms - 延迟毫秒数
 * @returns Promise，在指定时间后 resolve
 *
 * @example
 * await sleep(1000) // 等待1秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 截断文本
 * 超过指定长度时在末尾添加省略号
 *
 * @param text - 原始文本
 * @param maxLength - 最大长度，默认 100
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
