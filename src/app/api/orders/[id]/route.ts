/**
 * 订单详情 API
 * ============================================================
 *
 * 【路由】GET /api/orders/:id
 *
 * 获取单个订单的详细信息，包含订单商品列表。
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId: session.user.id, // 只能查看自己的订单
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: '订单不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        totalAmount: order.totalAmount.toString(),
        items: order.items.map((item) => ({
          ...item,
          price: item.price.toString(),
        })),
      },
    })
  } catch (error) {
    console.error('获取订单详情失败:', error)
    return NextResponse.json(
      { success: false, message: '获取订单详情失败' },
      { status: 500 }
    )
  }
}
