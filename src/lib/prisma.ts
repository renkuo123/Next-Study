/**
 * Prisma 客户端单例模式
 * ============================================================
 *
 * 【Prisma v7 重要变更：Driver Adapter】
 * Prisma v7 不再直接连接数据库，而是通过"驱动适配器（Driver Adapter）"连接。
 * 这是一种更灵活的架构，支持多种数据库驱动。
 *
 * 对于 MySQL 数据库，我们使用 @prisma/adapter-mariadb：
 * - MariaDB 是 MySQL 的开源分支，协议完全兼容
 * - 这个适配器同时支持 MySQL 和 MariaDB
 *
 * 【单例模式说明】
 * 在 Next.js 开发环境中，每次代码热更新会重新执行模块代码。
 * 使用 globalThis 缓存实例，避免创建过多数据库连接。
 *
 * 【使用方式】
 * import { prisma } from '@/lib/prisma'
 * const users = await prisma.user.findMany()
 */

import { PrismaClient } from '@/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// 声明全局类型
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * 创建 Prisma 客户端实例
 *
 * 【连接流程】
 * PrismaMariaDb 适配器接受数据库连接字符串，内部自动管理连接池。
 * 我们只需传入 DATABASE_URL 即可。
 */
function createPrismaClient(): PrismaClient {
  // 创建适配器，直接传入数据库连接字符串
  // PrismaMariaDb 内部会自动创建和管理连接池
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)

  // 创建 PrismaClient，传入适配器
  return new PrismaClient({
    adapter,
  }) as unknown as PrismaClient
}

// 核心逻辑：如果全局已有实例就复用，否则创建新实例
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 非生产环境下保存到全局对象
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
