/**
 * 用户个人信息 API
 * ============================================================
 *
 * 【路由】
 * GET   /api/user/profile → 获取个人信息
 * PATCH /api/user/profile → 更新个人信息
 *
 * 【PATCH vs PUT】
 * - PUT：完整替换资源（需要提供所有字段）
 * - PATCH：部分更新资源（只需要提供要修改的字段）
 * 这里用 PATCH 因为用户可能只修改昵称而不修改其他信息
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取信息失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name } = body

    if (!name || name.length < 2 || name.length > 20) {
      return NextResponse.json(
        { success: false, message: '昵称长度需要在2-20个字符之间' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: updatedUser,
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    )
  }
}
