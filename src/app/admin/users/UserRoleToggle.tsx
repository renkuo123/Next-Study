/**
 * 用户角色切换组件
 */
'use client'

import { useRouter } from 'next/navigation'

type Props = {
  userId: string
  currentRole: string
}

export default function UserRoleToggle({ userId, currentRole }: Props) {
  const router = useRouter()

  const handleToggleRole = async () => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    const confirmMsg = `确定要将此用户设为 ${newRole === 'ADMIN' ? '管理员' : '普通用户'} 吗？`
    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.message || '操作失败')
      }
    } catch {
      alert('操作失败')
    }
  }

  return (
    <button
      onClick={handleToggleRole}
      className="text-sm text-blue-600 hover:text-blue-500"
    >
      {currentRole === 'ADMIN' ? '取消管理员' : '设为管理员'}
    </button>
  )
}
