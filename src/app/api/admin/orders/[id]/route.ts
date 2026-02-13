/**
 * 管理后台 - 订单状态更新 API
 * ============================================================
 *
 * 【路由】PATCH /api/admin/orders/:id
 *
 * 管理员可以更新订单的状态（发货、完成、取消等）。
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: '无权限' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // 验证状态值是否合法
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: '无效的订单状态' },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      message: '状态更新成功',
      data: { ...order, totalAmount: order.totalAmount.toString() },
    })
  } catch (error) {
    console.error('更新订单状态失败:', error)
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    )
  }
}
