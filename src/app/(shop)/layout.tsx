/**
 * 前台商城布局
 * ============================================================
 *
 * 【Layout 的层级关系】
 * RootLayout (src/app/layout.tsx)
 *   └── ShopLayout (当前文件) ← 包含 Header + Footer
 *       ├── 首页 (page.tsx)
 *       ├── 商品列表 (products/page.tsx)
 *       ├── 商品详情 (products/[id]/page.tsx)
 *       ├── 购物车 (cart/page.tsx)
 *       └── 用户中心 (user/...)
 *
 * 【路由组布局的好处】
 * 前台页面共享 Header/Footer，而认证页面和管理后台使用各自的布局。
 * 用户在前台页面之间切换时，Header/Footer 不会重新渲染。
 */

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航 */}
      <Header />

      {/* 页面主体内容 */}
      {/* flex-1 让主体区域自动填充剩余高度，确保 Footer 始终在底部 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 底部信息 */}
      <Footer />
    </div>
  )
}
