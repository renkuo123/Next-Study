/**
 * 用户注册 API
 * ============================================================
 *
 * 【路由】POST /api/register
 *
 * 【这是一个 Route Handler】
 * Route Handler 是 Next.js 中定义后端 API 的方式。
 * 文件路径决定了 API 的 URL：
 *   src/app/api/register/route.ts → POST /api/register
 *
 * 【处理流程】
 * 1. 接收前端提交的注册信息（name, email, password）
 * 2. 用 Zod 验证数据格式
 * 3. 检查邮箱是否已注册
 * 4. 用 bcrypt 加密密码
 * 5. 存入数据库
 * 6. 返回结果
 *
 * 【安全要点】
 * - 密码绝不能明文存储，必须用 bcrypt 等算法加密
 * - 返回结果中不包含密码
 * - 使用 Zod 验证防止恶意数据
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validators'

/**
 * POST /api/register - 处理用户注册
 *
 * 【NextResponse 是什么？】
 * NextResponse 是 Next.js 提供的响应工具类，
 * 用来构造 HTTP 响应（设置状态码、返回 JSON 等）。
 *
 * 【request.json() 是什么？】
 * 解析请求体中的 JSON 数据。
 * 前端用 fetch('/api/register', { body: JSON.stringify(data) }) 发送的数据，
 * 后端用 request.json() 解析。
 */
export async function POST(request: Request) {
  try {
    // 1. 解析请求体
    const body = await request.json()

    // 2. 数据验证
    // safeParse 不会抛出异常，而是返回 { success, data, error }
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      // 验证失败，返回 400 错误和具体的错误信息
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0]?.message || '数据验证失败',
        },
        { status: 400 } // 400 Bad Request - 客户端请求数据有误
      )
    }

    const { name, email, password } = validationResult.data

    // 3. 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '该邮箱已注册' },
        { status: 409 } // 409 Conflict - 资源冲突
      )
    }

    // 4. 密码加密
    // bcrypt.hash(明文密码, salt轮数)
    // salt轮数越大越安全但越慢，10 是推荐值
    // 加密后的密码类似：$2a$10$N9qo8uLOickgx2ZMRZoMye...
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. 创建用户
    // Prisma 的 create 方法会自动生成 INSERT SQL 语句
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // 存储加密后的密码
      },
      // select 指定返回哪些字段（排除 password）
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // 6. 返回成功结果
    return NextResponse.json(
      {
        success: true,
        message: '注册成功',
        data: user,
      },
      { status: 201 } // 201 Created - 资源创建成功
    )
  } catch (error) {
    // 捕获意外错误（数据库连接失败等）
    console.error('注册失败:', error)
    return NextResponse.json(
      { success: false, message: '注册失败，请稍后重试' },
      { status: 500 } // 500 Internal Server Error - 服务端内部错误
    )
  }
}
