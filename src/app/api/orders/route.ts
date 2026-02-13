/**
 * 订单 API 路由
 * ============================================================
 *
 * 【路由】
 * GET  /api/orders → 获取当前用户的订单列表
 * POST /api/orders → 创建新订单（从购物车结算）
 *
 * 【创建订单的核心流程（事务操作）】
 * 1. 获取用户购物车中的商品
 * 2. 验证库存
 * 3. 创建订单 + 订单商品项
 * 4. 扣减库存
 * 5. 清空购物车
 *
 * 以上步骤必须在一个数据库事务（Transaction）中完成！
 * 如果步骤4失败了但步骤3成功了，就会导致数据不一致。
 * 事务保证：要么全部成功，要么全部回滚。
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOrderSchema } from '@/lib/validators'
import { generateOrderNo } from '@/lib/utils'

/**
 * GET /api/orders - 获取订单列表
 */
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
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
      orderBy: { createdAt: 'desc' },
    })

    // 序列化 Decimal
    const serialized = orders.map((order) => ({
      ...order,
      totalAmount: order.totalAmount.toString(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toString(),
      })),
    }))

    return NextResponse.json({ success: true, data: serialized })
  } catch (error) {
    console.error('获取订单失败:', error)
    return NextResponse.json(
      { success: false, message: '获取订单失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders - 创建订单
 *
 * 【学习重点：Prisma 事务（Transaction）】
 * prisma.$transaction() 接收一个异步函数，
 * 函数内的所有数据库操作会在同一个事务中执行。
 * 如果其中任何操作失败，所有操作都会回滚。
 */
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
    const result = createOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // 1. 获取收货地址
    const address = await prisma.address.findFirst({
      where: {
        id: result.data.addressId,
        userId: session.user.id,
      },
    })

    if (!address) {
      return NextResponse.json(
        { success: false, message: '收货地址不存在' },
        { status: 400 }
      )
    }

    // 2. 获取购物车商品
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: '购物车为空' },
        { status: 400 }
      )
    }

    // 3. 验证库存
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `"${item.product.name}" 库存不足` },
          { status: 400 }
        )
      }
      if (!item.product.isActive) {
        return NextResponse.json(
          { success: false, message: `"${item.product.name}" 已下架` },
          { status: 400 }
        )
      }
    }

    // 4. 计算总金额
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )

    // 5. 在事务中创建订单
    const order = await prisma.$transaction(async (tx) => {
      // 5a. 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNo: generateOrderNo(),
          userId: session.user.id,
          totalAmount,
          // 地址快照：将地址信息序列化为 JSON 存储
          address: JSON.stringify({
            name: address.name,
            phone: address.phone,
            province: address.province,
            city: address.city,
            district: address.district,
            detail: address.detail,
          }),
          // 创建订单商品项
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // 价格快照
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // 5b. 扣减库存
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }, // 原子操作：减少库存
          },
        })
      }

      // 5c. 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      })

      return newOrder
    })

    return NextResponse.json({
      success: true,
      message: '订单创建成功',
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
    console.error('创建订单失败:', error)
    return NextResponse.json(
      { success: false, message: '创建订单失败' },
      { status: 500 }
    )
  }
}
