/**
 * 后台 - 编辑商品页面
 * ============================================================
 *
 * 【路由】/admin/products/:id/edit
 *
 * 复用 ProductForm 组件，通过传入 initialData 区分新增和编辑模式。
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '../../ProductForm'

// 动态渲染
export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: parseInt(id) },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  if (!product) {
    notFound()
  }

  // 将 Decimal 转为 number 以传递给 Client Component
  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    images: product.images,
    categoryId: product.categoryId,
    isActive: product.isActive,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">编辑商品</h1>
      <ProductForm categories={categories} initialData={productData} />
    </div>
  )
}
