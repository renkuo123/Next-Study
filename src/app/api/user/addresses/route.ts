/**
 * 收货地址列表 API
 * ============================================================
 *
 * 【路由】
 * GET  /api/user/addresses → 获取当前用户的所有收货地址
 * POST /api/user/addresses → 新增收货地址
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addressSchema } from '@/lib/validators'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },  // 默认地址排在前面
        { id: 'desc' },         // 最新的排在前面
      ],
    })

    return NextResponse.json({ success: true, data: addresses })
  } catch (error) {
    console.error('获取地址失败:', error)
    return NextResponse.json(
      { success: false, message: '获取地址失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const result = addressSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // 如果设为默认地址，先取消其他默认地址
    if (result.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        ...result.data,
        isDefault: result.data.isDefault || false,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: '添加成功',
      data: address,
    })
  } catch (error) {
    console.error('添加地址失败:', error)
    return NextResponse.json(
      { success: false, message: '添加失败' },
      { status: 500 }
    )
  }
}
