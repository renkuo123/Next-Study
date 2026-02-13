/**
 * 首页 - 商城入口
 * ============================================================
 *
 * 【路由】/ （根路径）
 *
 * 【SSR 的核心！】
 * 这是一个 Server Component（没有 'use client'），
 * 它在服务端执行，可以直接调用 Prisma 查询数据库！
 *
 * 【执行流程】
 * 1. 用户请求 / 页面
 * 2. Next.js 服务端执行这个组件（包括数据库查询）
 * 3. 将渲染好的 HTML 返回给浏览器
 * 4. 浏览器收到的是完整的 HTML（对 SEO 友好！）
 *
 * 【async 组件】
 * Server Component 可以是 async 函数！
 * 这意味着你可以直接用 await 获取数据，不需要 useEffect + useState。
 * 这是前端开发者最容易被惊艳到的特性 —— 组件里直接 await 数据库查询！
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductList from '@/components/product/ProductList'

/**
 * 【动态渲染标记】
 * 告诉 Next.js 这个页面需要在每次请求时动态渲染，而非构建时静态生成。
 * 因为这个页面需要从数据库实时获取数据。
 */
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // 直接在组件中查询数据库！
  // 这段代码只在服务端执行，数据库密码等敏感信息不会暴露给客户端
  const [featuredProducts, categories] = await Promise.all([
    // 获取最新的 8 个上架商品
    prisma.product.findMany({
      where: { isActive: true },  // 只查询已上架的商品
      include: {
        category: {               // 关联查询：同时获取分类信息
          select: {               // select 指定只返回需要的字段
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // 按创建时间倒序（最新的在前面）
      take: 8,                         // 限制返回 8 条
    }),
    // 获取所有分类
    prisma.category.findMany({
      include: {
        _count: {                 // _count 是 Prisma 的聚合查询
          select: { products: true }, // 统计每个分类下的商品数量
        },
      },
    }),
  ])

  // 序列化 Decimal 类型（Prisma 的 Decimal 不能直接传给客户端组件）
  const serializedProducts = featuredProducts.map((p) => ({
    ...p,
    price: p.price.toString(),
  }))

  return (
    <div>
      {/* ==================== Hero Banner ==================== */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              欢迎来到 NextShop
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              基于 Next.js 全栈开发的电商平台，体验 SSR 服务端渲染的强大能力
            </p>
            <Link
              href="/products"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium
                         hover:bg-blue-50 transition-colors"
            >
              开始购物
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 商品分类 ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">商品分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group p-6 bg-white rounded-xl border border-gray-100
                         hover:shadow-md hover:border-blue-200 transition-all text-center"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full
                              flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat._count.products} 件商品</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== 推荐商品 ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">最新商品</h2>
          <Link href="/products" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
            查看全部 →
          </Link>
        </div>
        <ProductList products={serializedProducts} />
      </section>
    </div>
  )
}
