/**
 * 管理后台 - 商品单项操作 API
 * ============================================================
 *
 * 【路由】
 * PATCH  /api/admin/products/:id → 更新商品信息
 * DELETE /api/admin/products/:id → 删除商品
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json(
      { success: false, message: '无权限' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()

    // 动态构建更新数据（只更新传入的字段）
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = body.price
    if (body.stock !== undefined) updateData.stock = body.stock
    if (body.images !== undefined) updateData.images = body.images
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: { ...product, price: product.price.toString() },
    })
  } catch (error) {
    console.error('更新商品失败:', error)
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
  if (!(await checkAdmin())) {
    return NextResponse.json(
      { success: false, message: '无权限' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params

    // 检查商品是否有关联的订单
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: parseInt(id) },
    })

    if (orderItemCount > 0) {
      return NextResponse.json(
        { success: false, message: '该商品已有关联订单，建议下架而非删除' },
        { status: 400 }
      )
    }

    // 先删除关联的购物车项
    await prisma.cartItem.deleteMany({
      where: { productId: parseInt(id) },
    })

    // 再删除商品
    await prisma.product.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除商品失败:', error)
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    )
  }
}
