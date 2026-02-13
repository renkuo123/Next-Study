/**
 * 个人信息页面
 * ============================================================
 *
 * 【路由】/user/profile
 *
 * 包含两个功能区：
 * 1. 个人信息编辑（昵称、头像）
 * 2. 收货地址管理（增删改、设置默认）
 */
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Address = {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()

  // ---- 个人信息状态 ----
  const [name, setName] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // ---- 地址管理状态 ----
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false,
  })

  // 初始化
  useEffect(() => {
    if (session?.user.name) {
      setName(session.user.name)
    }
    fetchAddresses()
  }, [session])

  // ---- 获取地址列表 ----
  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses')
      const data = await res.json()
      if (data.success) {
        setAddresses(data.data)
      }
    } catch {
      console.error('获取地址失败')
    }
  }

  // ---- 更新个人信息 ----
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()

      if (data.success) {
        setProfileMessage('更新成功')
        // 更新 NextAuth Session 中的用户名
        await updateSession({ name })
      } else {
        setProfileMessage(data.message || '更新失败')
      }
    } catch {
      setProfileMessage('更新失败')
    } finally {
      setProfileLoading(false)
    }
  }

  // ---- 保存地址（新增/编辑）----
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses'
      const method = editingAddress ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      })
      const data = await res.json()

      if (data.success) {
        fetchAddresses()
        resetAddressForm()
      }
    } catch {
      console.error('保存地址失败')
    }
  }

  // ---- 删除地址 ----
  const handleDeleteAddress = async (id: number) => {
    if (!confirm('确定要删除此地址吗？')) return

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setAddresses(addresses.filter((a) => a.id !== id))
      }
    } catch {
      console.error('删除地址失败')
    }
  }

  // 编辑地址
  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr)
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault,
    })
    setShowAddressForm(true)
  }

  // 重置地址表单
  const resetAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddress(null)
    setAddressForm({
      name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false,
    })
  }

  return (
    <div className="space-y-8">
      {/* ==================== 个人信息 ==================== */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
        <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={session?.user.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">邮箱不可修改</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {profileMessage && (
            <p className={`text-sm ${profileMessage === '更新成功' ? 'text-green-600' : 'text-red-500'}`}>
              {profileMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={profileLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       disabled:opacity-50 transition-colors"
          >
            {profileLoading ? '保存中...' : '保存修改'}
          </button>
        </form>
      </section>

      {/* ==================== 收货地址 ==================== */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">收货地址</h2>
          <button
            onClick={() => {
              resetAddressForm()
              setShowAddressForm(true)
            }}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            + 添加新地址
          </button>
        </div>

        {/* 地址表单 */}
        {showAddressForm && (
          <form onSubmit={handleSaveAddress} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" placeholder="收件人姓名" required
                value={addressForm.name}
                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text" placeholder="手机号码" required
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text" placeholder="省份" required
                value={addressForm.province}
                onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text" placeholder="城市" required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text" placeholder="区县" required
                value={addressForm.district}
                onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <input
              type="text" placeholder="详细地址" required
              value={addressForm.detail}
              onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              />
              <span>设为默认地址</span>
            </label>
            <div className="flex space-x-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                保存
              </button>
              <button type="button" onClick={resetAddressForm} className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-100">
                取消
              </button>
            </div>
          </form>
        )}

        {/* 地址列表 */}
        {addresses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无收货地址</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{addr.name}</span>
                    <span className="text-gray-500 text-sm">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">默认</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {addr.province} {addr.city} {addr.district} {addr.detail}
                  </p>
                </div>
                <div className="flex space-x-2 text-sm">
                  <button
                    onClick={() => handleEditAddress(addr)}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
