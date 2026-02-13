/**
 * 后台 - 分类管理页面
 * ============================================================
 *
 * 【路由】/admin/categories
 *
 * 管理员可以在这里管理商品分类（增删改）。
 * 使用了 Server Component（表格） + Client Component（操作按钮 + 表单）的混合模式。
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  id: number
  name: string
  slug: string
  image: string | null
  _count?: { products: number }
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', image: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch {
      console.error('获取分类失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : '/api/admin/categories'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (data.success) {
        fetchCategories()
        resetForm()
        router.refresh()
      } else {
        alert(data.message || '操作失败')
      }
    } catch {
      alert('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此分类吗？')) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchCategories()
      } else {
        alert(data.message || '删除失败')
      }
    } catch {
      alert('删除失败')
    }
  }

  const handleEdit = (cat: Category) => {
    setEditing(cat)
    setFormData({ name: cat.name, slug: cat.slug, image: cat.image || '' })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditing(null)
    setFormData({ name: '', slug: '', image: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + 新增分类
        </button>
      </div>

      {/* 新增/编辑表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 mb-6 max-w-lg space-y-4">
          <h3 className="font-semibold">{editing ? '编辑分类' : '新增分类'}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
            <input
              type="text" required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="如：智能手机"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL 标识 (slug)</label>
            <input
              type="text" required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="如：smartphones（小写英文+连字符）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类图片 URL（可选）</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              {editing ? '保存' : '创建'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50">
              取消
            </button>
          </div>
        </form>
      )}

      {/* 分类列表 */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">名称</th>
                <th className="px-6 py-3 text-left">标识 (slug)</th>
                <th className="px-6 py-3 text-left">商品数</th>
                <th className="px-6 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{cat.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{cat.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat._count?.products ?? 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-500">编辑</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-400">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">暂无分类</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
