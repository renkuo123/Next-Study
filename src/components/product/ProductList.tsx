/**
 * 商品列表组件
 * ============================================================
 *
 * 【组件职责】
 * 将商品数组渲染为网格布局的卡片列表。
 * 如果商品为空，显示空状态提示。
 *
 * 【Server Component】
 * 纯展示组件，不需要 'use client'。
 * 数据由父组件（页面）传入。
 */

import ProductCard from './ProductCard'

type Product = {
  id: number
  name: string
  price: string | number
  images: string
  category?: {
    name: string
    slug: string
  }
}

type ProductListProps = {
  products: Product[]
  title?: string
}

export default function ProductList({ products, title }: ProductListProps) {
  return (
    <div>
      {/* 标题 */}
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}

      {/* 商品网格 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              images={product.images}
              category={product.category}
            />
          ))}
        </div>
      ) : (
        // 空状态
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="mt-4 text-gray-500">暂无商品</p>
        </div>
      )}
    </div>
  )
}
