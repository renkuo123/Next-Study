/**
 * 购物车 API 路由
 * ============================================================
 *
 * 【路由】
 * GET  /api/cart → 获取当前用户的购物车列表
 * POST /api/cart → 添加商品到购物车
 *
 * 【认证检查】
 * 购物车是用户私有数据，必须先验证用户是否登录。
 * 通过 auth() 函数获取当前用户的 Session。
 *
 * 【学习重点：同一个 route.ts 可以导出多个 HTTP 方法】
 * 根据 HTTP 请求方法（GET/POST/PUT/DELETE）分发到不同的处理函数。
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addToCartSchema } from '@/lib/validators'

/**
 * GET /api/cart - 获取购物车列表
 *
 * 【Prisma include 关联查询】
 * include 让你在一次查询中获取关联表的数据，
 * 类似 SQL 的 JOIN 查询。
 */
export async function GET() {
  // 1. 验证登录状态
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 } // 401 Unauthorized - 未认证
    )
  }

  try {
    // 2. 查询用户的购物车项，包含商品信息
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            images: true,
            isActive: true,
          },
        },
      },
      orderBy: { id: 'desc' }, // 最新添加的排在前面
    })

    // 3. 序列化 Decimal 类型
    const serialized = cartItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: item.product.price.toString(),
      },
    }))

    return NextResponse.json({ success: true, data: serialized })
  } catch (error) {
    console.error('获取购物车失败:', error)
    return NextResponse.json(
      { success: false, message: '获取购物车失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cart - 添加商品到购物车
 *
 * 【Prisma upsert 操作】
 * upsert = update + insert
 * - 如果记录已存在（同一用户、同一商品）→ 更新数量
 * - 如果记录不存在 → 创建新记录
 * 这避免了先查询再决定是创建还是更新的两步操作。
 */
export async function POST(request: Request) {
  // 1. 验证登录
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  try {
    // 2. 解析并验证请求数据
    const body = await request.json()
    const result = addToCartSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const { productId, quantity } = result.data

    // 3. 检查商品是否存在且有库存
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: '商品不存在或已下架' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: '库存不足' },
        { status: 400 }
      )
    }

    // 4. 添加/更新购物车（upsert）
    const cartItem = await prisma.cartItem.upsert({
      where: {
        // 使用联合唯一索引查找
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      // 如果已存在 → 增加数量
      update: {
        quantity: { increment: quantity }, // increment 是 Prisma 的原子操作
      },
      // 如果不存在 → 创建新记录
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
    })

    return NextResponse.json({
      success: true,
      message: '已加入购物车',
      data: cartItem,
    })
  } catch (error) {
    console.error('添加购物车失败:', error)
    return NextResponse.json(
      { success: false, message: '操作失败' },
      { status: 500 }
    )
  }
}
