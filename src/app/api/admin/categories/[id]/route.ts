/**
 * 管理后台 - 分类单项操作 API
 * ============================================================
 *
 * 【路由】
 * PUT    /api/admin/categories/:id → 更新分类
 * DELETE /api/admin/categories/:id → 删除分类
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validators'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, message: '无权限' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const result = categorySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // 检查 slug 是否被其他分类使用
    const existing = await prisma.category.findFirst({
      where: { slug: result.data.slug, id: { not: parseInt(id) } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: '该标识已被使用' },
        { status: 409 }
      )
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: result.data.name,
        slug: result.data.slug,
        image: result.data.image || null,
      },
    })

    return NextResponse.json({ success: true, message: '更新成功', data: category })
  } catch (error) {
    console.error('更新分类失败:', error)
    return NextResponse.json({ success: false, message: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, message: '无权限' }, { status: 403 })
  }

  try {
    const { id } = await params

    // 检查分类下是否有商品
    const productCount = await prisma.product.count({
      where: { categoryId: parseInt(id) },
    })

    if (productCount > 0) {
      return NextResponse.json(
        { success: false, message: `该分类下还有 ${productCount} 个商品，请先移除或迁移商品` },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除分类失败:', error)
    return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 })
  }
}
