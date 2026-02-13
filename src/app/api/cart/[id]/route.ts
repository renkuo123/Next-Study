/**
 * 购物车单项操作 API
 * ============================================================
 *
 * 【路由】
 * PATCH  /api/cart/123 → 更新购物车项的数量
 * DELETE /api/cart/123 → 删除购物车项
 *
 * 【动态路由参数 [id]】
 * 这里的 id 是 CartItem 的 ID（不是商品 ID）。
 * 通过 URL 参数传递要操作的目标，这是 RESTful API 的标准设计。
 *
 * 【RESTful API 设计规范】
 * - GET    /api/cart      → 获取列表
 * - POST   /api/cart      → 创建新记录
 * - PATCH  /api/cart/:id  → 更新单条记录
 * - DELETE /api/cart/:id  → 删除单条记录
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateCartSchema } from '@/lib/validators'

/**
 * PATCH /api/cart/:id - 更新购物车商品数量
 */
export async function PATCH(
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
    const result = updateCartSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // 验证该购物车项属于当前用户
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(id),
        userId: session.user.id, // 确保只能修改自己的购物车
      },
      include: { product: true },
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: '购物车项不存在' },
        { status: 404 }
      )
    }

    // 检查库存
    if (result.data.quantity > cartItem.product.stock) {
      return NextResponse.json(
        { success: false, message: '库存不足' },
        { status: 400 }
      )
    }

    // 更新数量
    const updated = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: result.data.quantity },
    })

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: updated,
    })
  } catch (error) {
    console.error('更新购物车失败:', error)
    return NextResponse.json(
      { success: false, message: '操作失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart/:id - 删除购物车商品
 */
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

    // 验证购物车项属于当前用户
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(id),
        userId: session.user.id,
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: '购物车项不存在' },
        { status: 404 }
      )
    }

    // 删除
    await prisma.cartItem.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除购物车项失败:', error)
    return NextResponse.json(
      { success: false, message: '操作失败' },
      { status: 500 }
    )
  }
}
