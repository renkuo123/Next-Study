/**
 * 网站顶部导航栏组件
 * ============================================================
 *
 * 【'use client' 原因】
 * Header 需要：
 * 1. 使用 useSession() 获取登录状态（React Hook，只能在客户端使用）
 * 2. 响应用户交互（点击菜单、登出等）
 *
 * 【useSession vs auth()】
 * - useSession()：Client Component 中使用，返回 session 和 loading 状态
 * - auth()：Server Component 中使用，直接返回 session（是 async 函数）
 * 因为 Header 需要交互，所以用 useSession()
 */
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  // 获取当前用户的 Session 信息
  // status 可以是: 'loading' | 'authenticated' | 'unauthenticated'
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ---- Logo ---- */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            NextShop
          </Link>

          {/* ---- 导航链接 ---- */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              全部商品
            </Link>
            <Link href="/categories/electronics" className="text-gray-700 hover:text-blue-600 transition-colors">
              电子产品
            </Link>
            <Link href="/categories/clothing" className="text-gray-700 hover:text-blue-600 transition-colors">
              服装
            </Link>
            <Link href="/categories/books" className="text-gray-700 hover:text-blue-600 transition-colors">
              图书
            </Link>
          </nav>

          {/* ---- 右侧操作区 ---- */}
          <div className="flex items-center space-x-4">
            {/* 购物车链接 */}
            <Link
              href="/cart"
              className="text-gray-700 hover:text-blue-600 transition-colors relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </Link>

            {/* 用户状态：加载中 / 已登录 / 未登录 */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              // ---- 已登录：显示用户菜单 ----
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm">{session.user.name}</span>
                </button>

                {/* 下拉菜单 */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <Link
                      href="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      个人中心
                    </Link>
                    <Link
                      href="/user/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      我的订单
                    </Link>
                    {/* 管理员才显示后台入口 */}
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        管理后台
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // ---- 未登录：显示登录/注册按钮 ----
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg
                             hover:bg-blue-700 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
