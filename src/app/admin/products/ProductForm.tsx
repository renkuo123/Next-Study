/**
 * 商品表单组件（新增/编辑共用）
 * ============================================================
 *
 * 【组件复用】
 * 新增和编辑商品使用同一个表单组件。
 * 通过 initialData 是否存在来区分模式：
 * - initialData 存在 → 编辑模式（PATCH 请求）
 * - initialData 不存在 → 新增模式（POST 请求）
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  id: number
  name: string
}

type ProductData = {
  id: number
  name: string
  description: string
  price: number
  stock: number
  images: string
  categoryId: number
  isActive: boolean
}

type Props = {
  categories: Category[]
  initialData?: ProductData  // 编辑模式时传入
}

export default function ProductForm({ categories, initialData }: Props) {
  const router = useRouter()
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '0',
    images: initialData?.images || '[]',
    categoryId: initialData?.categoryId?.toString() || '',
    isActive: initialData?.isActive ?? true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images,
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
      }

      const url = isEditing
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/admin/products')
        router.refresh()
      } else {
        setError(data.message || '操作失败')
      }
    } catch {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border p-6 space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* 商品名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">商品名称 *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入商品名称"
        />
      </div>

      {/* 商品描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">商品描述 *</label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入商品描述"
        />
      </div>

      {/* 价格和库存 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">价格 (元) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">库存 *</label>
          <input
            type="number"
            min="0"
            required
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      {/* 商品分类 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">商品分类 *</label>
        <select
          required
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 商品图片 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          商品图片 (JSON 数组格式)
        </label>
        <textarea
          rows={2}
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
        />
        <p className="text-xs text-gray-400 mt-1">
          输入 JSON 格式的图片 URL 数组，例如：[&quot;https://example.com/img.jpg&quot;]
        </p>
      </div>

      {/* 上架状态 */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm text-gray-700">上架销售</span>
      </label>

      {/* 操作按钮 */}
      <div className="flex space-x-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:opacity-50 transition-colors"
        >
          {loading ? '保存中...' : isEditing ? '保存修改' : '创建商品'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}
