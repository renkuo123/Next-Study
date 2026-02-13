/**
 * 收货地址单项操作 API
 * ============================================================
 *
 * 【路由】
 * PUT    /api/user/addresses/:id → 更新收货地址
 * DELETE /api/user/addresses/:id → 删除收货地址
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addressSchema } from '@/lib/validators'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const result = addressSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // 验证地址属于当前用户
    const existing = await prisma.address.findFirst({
      where: { id: parseInt(id), userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: '地址不存在' },
        { status: 404 }
      )
    }

    // 如果设为默认，先取消其他默认
    if (result.data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: parseInt(id) },
        },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.address.update({
      where: { id: parseInt(id) },
      data: {
        ...result.data,
        isDefault: result.data.isDefault || false,
      },
    })

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: updated,
    })
  } catch (error) {
    console.error('更新地址失败:', error)
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params

    const existing = await prisma.address.findFirst({
      where: { id: parseInt(id), userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: '地址不存在' },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除地址失败:', error)
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    )
  }
}
