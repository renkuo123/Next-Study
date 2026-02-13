/**
 * 管理后台 - 商品管理 API
 * ============================================================
 *
 * 【路由】
 * GET  /api/admin/products → 获取所有商品（含下架）
 * POST /api/admin/products → 创建新商品
 *
 * 【权限检查】
 * 所有管理员 API 都需要验证用户角色是否为 ADMIN。
 * 虽然 middleware.ts 已经做了路由级别的拦截，
 * 但 API 层面也需要做检查（双重保险，防止直接调用 API 绕过中间件）。
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validators'

/**
 * 通用的管理员权限检查函数
 * 复用在所有 admin API 中
 */
async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json(
      { success: false, message: '无权限' },
      { status: 403 }  // 403 Forbidden - 已认证但权限不足
    )
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const serialized = products.map((p) => ({
      ...p,
      price: p.price.toString(),
    }))

    return NextResponse.json({ success: true, data: serialized })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json(
      { success: false, message: '无权限' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const result = productSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        ...result.data,
        isActive: result.data.isActive ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      message: '创建成功',
      data: { ...product, price: product.price.toString() },
    })
  } catch (error) {
    console.error('创建商品失败:', error)
    return NextResponse.json(
      { success: false, message: '创建失败' },
      { status: 500 }
    )
  }
}
