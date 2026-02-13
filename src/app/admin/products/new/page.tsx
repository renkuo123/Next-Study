/**
 * 后台 - 新增商品页面
 * ============================================================
 *
 * 【路由】/admin/products/new
 *
 * 管理员通过表单创建新商品。
 * 这个页面混合使用了 Server Component 和 Client Component：
 * - 分类列表通过 Server Component 直接从数据库获取
 * - 表单交互部分是 Client Component
 */

import { prisma } from '@/lib/prisma'
import ProductForm from '../ProductForm'

// 动态渲染
export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  // Server Component 中直接获取分类列表
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新增商品</h1>
      {/* 将分类列表通过 props 传递给 Client Component */}
      <ProductForm categories={categories} />
    </div>
  )
}
