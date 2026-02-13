/**
 * 商品卡片组件
 * ============================================================
 *
 * 【组件职责】
 * 展示单个商品的信息卡片，用于商品列表、首页推荐等场景。
 *
 * 【Server Component】
 * 这是一个纯展示组件，不需要 'use client'。
 * 它接收 props 并渲染 UI，没有任何客户端交互逻辑。
 *
 * 【Next.js Image 组件】
 * 使用 next/image 代替原生 <img>，因为它提供：
 * 1. 自动图片优化（压缩、格式转换）
 * 2. 懒加载（图片进入视口才加载）
 * 3. 防止布局偏移（CLS）
 */

import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

// ---- 组件 Props 类型定义 ----
type ProductCardProps = {
  id: number
  name: string
  price: string | number  // Prisma Decimal 序列化后可能是 string
  images: string          // JSON 字符串，包含图片 URL 数组
  category?: {
    name: string
    slug: string
  }
}

export default function ProductCard({ id, name, price, images, category }: ProductCardProps) {
  // 解析图片 JSON，取第一张作为封面
  // try-catch 防止 JSON 解析失败（数据异常时）
  let coverImage = '/placeholder.jpg'
  try {
    const imageList = JSON.parse(images)
    if (Array.isArray(imageList) && imageList.length > 0) {
      coverImage = imageList[0]
    }
  } catch {
    // JSON 解析失败，使用默认图片
  }

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        {/* 商品图片 */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {/* 使用原生 img 标签（避免 Next.js Image 的域名配置问题） */}
          {/* 生产环境建议使用 next/image 并配置允许的图片域名 */}
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* 商品信息 */}
        <div className="p-4">
          {/* 分类标签 */}
          {category && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {category.name}
            </span>
          )}

          {/* 商品名称 */}
          <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          {/* 价格 */}
          <p className="mt-2 text-lg font-bold text-red-500">
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </Link>
  )
}
