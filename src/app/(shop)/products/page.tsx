/**
 * 商品列表页 - 支持搜索、分类筛选、分页
 * ============================================================
 *
 * 【路由】/products
 * 【查询参数示例】/products?keyword=手机&categoryId=1&page=2&sortBy=price&sortOrder=asc
 *
 * 【Server Component + 搜索参数】
 * 在 Server Component 中，通过 searchParams prop 获取 URL 查询参数。
 * 这比客户端获取参数 + useEffect 请求数据的方式更优雅：
 * - 数据在服务端获取，首屏加载更快
 * - URL 包含搜索状态，可以分享和收藏
 * - SEO 友好（搜索引擎能索引到搜索结果页）
 *
 * 【学习重点：Prisma 查询构建器】
 * Prisma 的 where 条件支持多种操作符：
 * - contains: 模糊匹配（LIKE '%xxx%'）
 * - gte/lte: 大于等于/小于等于
 * - in: 包含在列表中
 * - AND/OR: 组合条件
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductList from '@/components/product/ProductList'

// 动态渲染：页面包含数据库查询和搜索参数
export const dynamic = 'force-dynamic'

// Next.js 15+ 的 searchParams 是 Promise 类型
type Props = {
  searchParams: Promise<{
    keyword?: string
    categoryId?: string
    page?: string
    sortBy?: string
    sortOrder?: string
  }>
}

export default async function ProductsPage({ searchParams }: Props) {
  // 等待并解析搜索参数
  const params = await searchParams
  const keyword = params.keyword || ''
  const categoryId = params.categoryId ? parseInt(params.categoryId) : undefined
  const page = parseInt(params.page || '1')
  const pageSize = 12
  const sortBy = params.sortBy || 'createdAt'
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc'

  // ---- 构建查询条件 ----
  // Prisma 的 where 条件是一个对象，可以动态构建
  const where = {
    isActive: true, // 只显示上架商品
    // 关键词搜索：在商品名称和描述中模糊匹配
    ...(keyword && {
      OR: [
        { name: { contains: keyword } },        // 名称包含关键词
        { description: { contains: keyword } }, // 描述包含关键词
      ],
    }),
    // 分类筛选
    ...(categoryId && { categoryId }),
  }

  // ---- 并行查询：商品列表 + 总数 ----
  // Promise.all 让两个查询同时执行，比串行查询更快
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { [sortBy]: sortOrder }, // 动态排序字段
      skip: (page - 1) * pageSize,      // 跳过前 N 条（分页）
      take: pageSize,                    // 取 N 条
    }),
    prisma.product.count({ where }),     // 统计总数（用于计算总页数）
  ])

  const totalPages = Math.ceil(total / pageSize)

  // 获取所有分类（用于筛选侧边栏）
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  // 序列化价格
  const serializedProducts = products.map((p) => ({
    ...p,
    price: p.price.toString(),
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* ==================== 左侧筛选栏 ==================== */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">商品分类</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !categoryId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  全部分类
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?categoryId=${cat.id}${keyword ? `&keyword=${keyword}` : ''}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      categoryId === cat.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ==================== 右侧商品列表 ==================== */}
        <div className="flex-1">
          {/* 顶部：搜索栏 + 排序 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* 搜索表单 */}
            <form action="/products" method="GET" className="flex w-full sm:w-auto">
              <input
                type="text"
                name="keyword"
                defaultValue={keyword}
                placeholder="搜索商品..."
                className="flex-1 sm:w-64 px-4 py-2 border border-gray-300 rounded-l-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
            </form>

            {/* 排序选择 */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>排序：</span>
              {[
                { label: '最新', value: 'createdAt-desc' },
                { label: '价格低→高', value: 'price-asc' },
                { label: '价格高→低', value: 'price-desc' },
              ].map((option) => {
                const [field, order] = option.value.split('-')
                const isActive = sortBy === field && sortOrder === order
                return (
                  <Link
                    key={option.value}
                    href={`/products?sortBy=${field}&sortOrder=${order}${keyword ? `&keyword=${keyword}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}`}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 搜索结果统计 */}
          <p className="text-sm text-gray-500 mb-4">
            共找到 <span className="font-medium text-gray-900">{total}</span> 件商品
            {keyword && <>，关键词：&quot;{keyword}&quot;</>}
          </p>

          {/* 商品列表 */}
          <ProductList products={serializedProducts} />

          {/* ==================== 分页 ==================== */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              {/* 上一页 */}
              {page > 1 && (
                <Link
                  href={`/products?page=${page - 1}${keyword ? `&keyword=${keyword}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  上一页
                </Link>
              )}

              {/* 页码 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/products?page=${p}${keyword ? `&keyword=${keyword}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {p}
                </Link>
              ))}

              {/* 下一页 */}
              {page < totalPages && (
                <Link
                  href={`/products?page=${page + 1}${keyword ? `&keyword=${keyword}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  下一页
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
