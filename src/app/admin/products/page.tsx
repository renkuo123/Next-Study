/**
 * 后台 - 商品管理列表页
 * ============================================================
 *
 * 【路由】/admin/products
 *
 * 管理员可以在这里：
 * - 查看所有商品（包括已下架的）
 * - 新增商品
 * - 编辑商品
 * - 上架/下架商品
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import ProductActions from './ProductActions'

// 动态渲染
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  // Server Component 直接查询数据库
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + 新增商品
        </Link>
      </div>

      {/* 商品表格 */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">商品名称</th>
                <th className="px-6 py-3 text-left">分类</th>
                <th className="px-6 py-3 text-left">价格</th>
                <th className="px-6 py-3 text-left">库存</th>
                <th className="px-6 py-3 text-left">状态</th>
                <th className="px-6 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{product.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={(() => { try { return JSON.parse(product.images)[0] } catch { return '/placeholder.jpg' } })()}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-red-500">
                    {formatPrice(product.price.toString())}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.isActive
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.isActive ? '上架' : '下架'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ProductActions productId={product.id} isActive={product.isActive} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    暂无商品，
                    <Link href="/admin/products/new" className="text-blue-600">去添加</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
