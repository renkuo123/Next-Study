/**
 * 数据库种子数据脚本
 * ============================================================
 *
 * 【什么是种子数据？】
 * 种子数据是预设的初始数据，用于：
 * 1. 开发环境快速填充测试数据
 * 2. 创建默认的管理员账户
 * 3. 预设商品分类等基础数据
 *
 * 【运行方式】
 * npx prisma db seed
 * 或者在 prisma migrate reset 时会自动执行
 *
 * 【注意事项】
 * - 种子脚本应该是幂等的（多次运行不会重复创建数据）
 * - 使用 upsert 而不是 create 来避免重复
 * - 管理员密码在实际项目中应该更复杂
 */

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

// 种子脚本独立于应用运行，需要单独创建 PrismaClient 实例
// PrismaMariaDb 接受连接字符串，内部自动管理连接池
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log('🌱 开始填充种子数据...\n')

  // ==================== 1. 创建管理员账户 ====================
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nextshop.com' },
    update: {},  // 已存在则不更新
    create: {
      name: '管理员',
      email: 'admin@nextshop.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✅ 管理员账户: ${admin.email} (密码: admin123)`)

  // 创建测试用户
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@nextshop.com' },
    update: {},
    create: {
      name: '测试用户',
      email: 'user@nextshop.com',
      password: userPassword,
      role: 'USER',
    },
  })
  console.log(`✅ 测试用户: ${user.email} (密码: user123)`)

  // ==================== 2. 创建商品分类 ====================
  const categories = [
    { name: '电子产品', slug: 'electronics' },
    { name: '服装', slug: 'clothing' },
    { name: '图书', slug: 'books' },
    { name: '家居生活', slug: 'home' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    })
  }
  console.log(`✅ 已创建 ${categories.length} 个分类`)

  // ==================== 3. 创建商品 ====================
  const allCategories = await prisma.category.findMany()
  const catMap = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]))

  const products = [
    {
      name: 'iPhone 15 Pro Max',
      description: 'Apple 最新旗舰手机，搭载 A17 Pro 芯片，钛金属设计，48MP 主摄像头。\n\n主要特性：\n- A17 Pro 芯片，性能强劲\n- 钛金属框架，轻盈耐用\n- 48MP 主摄 + 超广角 + 长焦三摄系统\n- USB-C 接口，支持 USB 3\n- 全天候电池续航',
      price: 9999,
      stock: 50,
      images: JSON.stringify(['https://picsum.photos/seed/iphone/800/800']),
      categoryId: catMap['electronics'],
    },
    {
      name: 'MacBook Pro 14 英寸',
      description: 'M3 Pro 芯片，18GB 统一内存，512GB 固态硬盘。Liquid Retina XDR 显示屏。\n\n适合专业用户的高性能笔记本电脑，无论是编程、设计还是视频剪辑都能轻松应对。',
      price: 14999,
      stock: 30,
      images: JSON.stringify(['https://picsum.photos/seed/macbook/800/800']),
      categoryId: catMap['electronics'],
    },
    {
      name: 'AirPods Pro 2',
      description: '第二代 AirPods Pro，搭载 H2 芯片。\n\n- 自适应降噪\n- 个性化空间音频\n- 触控操作\n- 最长 6 小时聆听时间',
      price: 1799,
      stock: 100,
      images: JSON.stringify(['https://picsum.photos/seed/airpods/800/800']),
      categoryId: catMap['electronics'],
    },
    {
      name: '经典款纯棉T恤',
      description: '100% 新疆长绒棉，舒适透气。\n\n- 精梳棉面料，柔软亲肤\n- 圆领设计，简约百搭\n- 多色可选\n- 机洗不变形',
      price: 99,
      stock: 200,
      images: JSON.stringify(['https://picsum.photos/seed/tshirt/800/800']),
      categoryId: catMap['clothing'],
    },
    {
      name: '商务休闲衬衫',
      description: '免烫处理，通勤必备。\n\n面料柔软，版型修身，适合日常办公和商务场合。',
      price: 259,
      stock: 80,
      images: JSON.stringify(['https://picsum.photos/seed/shirt/800/800']),
      categoryId: catMap['clothing'],
    },
    {
      name: '冬季保暖羽绒服',
      description: '90% 白鹅绒填充，蓬松保暖。\n\n- 800+ 蓬松度\n- 防风防水面料\n- 连帽设计\n- 轻便可收纳',
      price: 899,
      stock: 60,
      images: JSON.stringify(['https://picsum.photos/seed/jacket/800/800']),
      categoryId: catMap['clothing'],
    },
    {
      name: 'JavaScript 高级程序设计（第4版）',
      description: '前端开发必读经典！全面介绍 JavaScript 核心概念和最佳实践。\n\n涵盖 ES6+ 新特性、DOM 编程、异步编程、模块化等核心内容。无论你是初学者还是有经验的开发者，这本书都能帮你深入理解 JavaScript。',
      price: 89,
      stock: 150,
      images: JSON.stringify(['https://picsum.photos/seed/jsbook/800/800']),
      categoryId: catMap['books'],
    },
    {
      name: 'Node.js 实战',
      description: '从零开始学 Node.js 后端开发。\n\n通过实际项目驱动学习，包含 Express、Koa、数据库操作、API 设计、部署上线等完整知识体系。',
      price: 69,
      stock: 120,
      images: JSON.stringify(['https://picsum.photos/seed/nodebook/800/800']),
      categoryId: catMap['books'],
    },
    {
      name: '北欧简约台灯',
      description: '极简设计，三档调光。\n\n- LED 光源，护眼不频闪\n- 触控开关\n- USB 充电口\n- 适合书桌、床头',
      price: 199,
      stock: 90,
      images: JSON.stringify(['https://picsum.photos/seed/lamp/800/800']),
      categoryId: catMap['home'],
    },
    {
      name: '记忆棉颈椎枕',
      description: '慢回弹记忆棉，贴合颈椎曲线。\n\n改善睡眠质量，缓解颈椎压力。透气面料，四季适用。',
      price: 159,
      stock: 70,
      images: JSON.stringify(['https://picsum.photos/seed/pillow/800/800']),
      categoryId: catMap['home'],
    },
  ]

  for (const product of products) {
    // 用名称作为唯一标识检查是否已存在
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    })
    if (!existing) {
      await prisma.product.create({ data: product })
    }
  }
  console.log(`✅ 已创建 ${products.length} 个商品`)

  // ==================== 4. 为测试用户创建收货地址 ====================
  const existingAddress = await prisma.address.findFirst({
    where: { userId: user.id },
  })
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: user.id,
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '建国路88号SOHO现代城',
        isDefault: true,
      },
    })
    console.log(`✅ 已为测试用户创建收货地址`)
  }

  console.log('\n🎉 种子数据填充完成！')
  console.log('\n📋 测试账户:')
  console.log('   管理员: admin@nextshop.com / admin123')
  console.log('   用户:   user@nextshop.com / user123')
}

main()
  .catch((e) => {
    console.error('种子数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
