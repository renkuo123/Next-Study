/**
 * 网站底部组件
 * ============================================================
 *
 * 【Server Component】
 * Footer 是纯展示组件，不需要用户交互，所以使用默认的 Server Component。
 * Server Component 的优势：
 * 1. 不会发送 JavaScript 到客户端（减小 bundle 体积）
 * 2. 可以直接在服务端渲染 HTML
 * 3. SEO 更友好
 */

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌介绍 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">NextShop</h3>
            <p className="text-sm text-gray-400 max-w-md">
              基于 Next.js 全栈开发的电商平台学习项目。
              包含 SSR 服务端渲染、API 路由、用户认证、数据库操作等核心功能。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm hover:text-white transition-colors">
                  全部商品
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-white transition-colors">
                  购物车
                </Link>
              </li>
              <li>
                <Link href="/user/orders" className="text-sm hover:text-white transition-colors">
                  我的订单
                </Link>
              </li>
            </ul>
          </div>

          {/* 技术栈 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase mb-4">技术栈</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Next.js (App Router)</li>
              <li>TypeScript</li>
              <li>Prisma + MySQL</li>
              <li>NextAuth.js</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} NextShop. 学习项目，仅供参考。</p>
        </div>
      </div>
    </footer>
  )
}
