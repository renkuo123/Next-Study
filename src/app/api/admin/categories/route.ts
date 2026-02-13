/**
 * 管理后台 - 分类管理 API
 * ============================================================
 *
 * 【路由】
 * GET  /api/admin/categories → 获取所有分类（含商品计数）
 * POST /api/admin/categories → 创建新分类
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

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, message: '无权限' }, { status: 403 })
  }

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('获取分类失败:', error)
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, message: '无权限' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const result = categorySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // 检查 slug 是否已存在
    const existing = await prisma.category.findUnique({
      where: { slug: result.data.slug },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: '该标识已存在' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: result.data.name,
        slug: result.data.slug,
        image: result.data.image || null,
      },
    })

    return NextResponse.json({ success: true, message: '创建成功', data: category })
  } catch (error) {
    console.error('创建分类失败:', error)
    return NextResponse.json({ success: false, message: '创建失败' }, { status: 500 })
  }
}
