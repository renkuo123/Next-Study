/**
 * 模拟支付 API
 * ============================================================
 *
 * 【路由】POST /api/payment
 *
 * 【重要说明】
 * 这是一个模拟支付接口！真实项目中需要对接支付宝、微信支付等第三方支付平台。
 *
 * 【真实支付流程（了解即可）】
 * 1. 前端调用后端 API 创建支付订单
 * 2. 后端调用支付平台 SDK 生成支付二维码/链接
 * 3. 用户在支付平台完成支付
 * 4. 支付平台通过"回调 URL"通知我们的后端支付结果
 * 5. 后端验证回调签名，更新订单状态
 *
 * 【本接口的模拟逻辑】
 * 直接将订单状态改为"已支付"，模拟支付成功的效果。
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sleep } from '@/lib/utils'

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
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: '缺少订单ID' },
        { status: 400 }
      )
    }

    // 查找订单
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: 'PENDING', // 只能支付待付款的订单
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: '订单不存在或已支付' },
        { status: 400 }
      )
    }

    // 模拟支付处理时间（真实场景中这里会调用第三方支付 SDK）
    await sleep(1000)

    // 更新订单状态为已支付
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    })

    return NextResponse.json({
      success: true,
      message: '支付成功',
      data: {
        ...updatedOrder,
        totalAmount: updatedOrder.totalAmount.toString(),
      },
    })
  } catch (error) {
    console.error('支付失败:', error)
    return NextResponse.json(
      { success: false, message: '支付失败' },
      { status: 500 }
    )
  }
}
