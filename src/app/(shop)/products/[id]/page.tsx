/**
 * 商品详情页 - SSR 动态路由
 * ============================================================
 *
 * 【路由】/products/123（123 是商品 ID）
 *
 * 【动态路由 [id]】
 * 文件名中的 [id] 是动态路由参数。
 * 访问 /products/1 时，params.id = "1"
 * 访问 /products/42 时，params.id = "42"
 * 这类似于前端路由中的 :id 参数。
 *
 * 【SSR + SEO 优化】
 * 1. 商品详情页使用 SSR，搜索引擎可以爬取到完整内容
 * 2. generateMetadata 动态生成页面标题和描述
 * 3. 社交媒体分享时能显示正确的标题和图片
 *
 * 【学习重点】
 * - 动态路由参数的获取方式
 * - generateMetadata 动态 SEO
 * - 混合使用 Server Component 和 Client Component
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import AddToCartButton from './AddToCartButton'

// 动态渲染：需要实时获取商品数据
export const dynamic = 'force-dynamic'

// ---- 动态 SEO 元数据 ----

/**
 * generateMetadata - 动态生成页面的 SEO 信息
 *
 * 【为什么需要动态 Metadata？】
 * 不同商品页面应该有不同的标题和描述：
 * - /products/1 → <title>iPhone 15 - NextShop</title>
 * - /products/2 → <title>MacBook Pro - NextShop</title>
 *
 * 搜索引擎根据 title 和 description 展示搜索结果
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    select: { name: true, description: true },
  })

  if (!product) {
    return { title: '商品未找到 - NextShop' }
  }

  return {
    title: `${product.name} - NextShop`,
    description: product.description.slice(0, 160), // 描述限制160字符
  }
}

// ---- 页面组件 ----

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 查询商品详情，包含分类信息
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
    },
  })

  // 商品不存在 → 显示 404 页面
  // notFound() 会触发 Next.js 的 not-found.tsx 页面
  if (!product || !product.isActive) {
    notFound()
  }

  // 解析商品图片
  let images: string[] = []
  try {
    images = JSON.parse(product.images)
  } catch {
    images = []
  }

  // 同分类推荐商品
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }, // 排除当前商品
      isActive: true,
    },
    take: 4,
    include: {
      category: { select: { name: true, slug: true } },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ==================== 商品详情 ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧：商品图片 */}
        <div className="space-y-4">
          {/* 主图 */}
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={images[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* 缩略图列表 */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：商品信息 */}
        <div className="space-y-6">
          {/* 分类面包屑 */}
          <div className="text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600">首页</a>
            <span className="mx-2">/</span>
            <a href={`/categories/${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          {/* 商品名称 */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* 价格 */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-red-500">
              {formatPrice(product.price.toString())}
            </span>
          </div>

          {/* 库存状态 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">库存：</span>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600">有货 ({product.stock}件)</span>
            ) : (
              <span className="text-sm text-red-600">缺货</span>
            )}
          </div>

          {/* 加入购物车按钮 - 这是一个 Client Component */}
          {/* 因为它需要用户交互（点击按钮、选择数量） */}
          <AddToCartButton
            productId={product.id}
            stock={product.stock}
            price={product.price.toString()}
          />

          {/* 商品描述 */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">商品详情</h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 相关推荐 ==================== */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">相关推荐</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <a key={p.id} href={`/products/${p.id}`} className="group block">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={(() => { try { return JSON.parse(p.images)[0] } catch { return '/placeholder.jpg' } })()}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</h3>
                    <p className="mt-2 text-lg font-bold text-red-500">{formatPrice(p.price.toString())}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
