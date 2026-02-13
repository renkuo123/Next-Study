/**
 * 分类商品页面
 * ============================================================
 *
 * 【路由】/categories/electronics
 *
 * 【动态路由参数 [slug]】
 * slug 是分类的 URL 友好标识符（如 "electronics"、"clothing"）
 * 相比使用 ID（/categories/1），slug 更有语义，对 SEO 更友好
 *
 * 【学习重点：notFound()】
 * 当查找的分类不存在时，调用 notFound() 会：
 * 1. 返回 404 HTTP 状态码
 * 2. 显示 Next.js 的 404 页面（可以自定义 not-found.tsx）
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductList from '@/components/product/ProductList'
import Link from 'next/link'

// 动态渲染：需要实时获取分类和商品数据
export const dynamic = 'force-dynamic'

// ---- 动态 SEO ----
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    return { title: '分类未找到 - NextShop' }
  }

  return {
    title: `${category.name} - NextShop`,
    description: `浏览 ${category.name} 分类下的所有商品`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 根据 slug 查找分类
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    notFound()
  }

  // 查询该分类下的所有上架商品
  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 序列化 Decimal
  const serializedProducts = products.map((p) => ({
    ...p,
    price: p.price.toString(),
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">全部商品</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category.name}</span>
      </div>

      {/* 分类标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        <p className="mt-2 text-gray-600">共 {products.length} 件商品</p>
      </div>

      {/* 商品列表 */}
      <ProductList products={serializedProducts} />
    </div>
  )
}
