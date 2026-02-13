/**
 * 管理后台 - 用户管理 API
 * ============================================================
 *
 * 【路由】PATCH /api/admin/users → 更新用户角色
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: '无权限' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { userId, role } = body

    if (!userId || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, message: '参数无效' },
        { status: 400 }
      )
    }

    // 不能修改自己的角色（防止误操作）
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, message: '不能修改自己的角色' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, role: true },
    })

    return NextResponse.json({
      success: true,
      message: '角色更新成功',
      data: user,
    })
  } catch (error) {
    console.error('更新用户角色失败:', error)
    return NextResponse.json({ success: false, message: '更新失败' }, { status: 500 })
  }
}
