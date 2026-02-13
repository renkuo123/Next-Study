/**
 * 前台加载状态页面
 * ============================================================
 *
 * 【loading.tsx 的作用】
 * 当页面数据正在加载时（Server Component 在服务端执行查询），
 * Next.js 会自动显示这个 loading.tsx 的内容。
 *
 * 【原理：React Suspense】
 * Next.js 在底层使用 React 的 Suspense 机制：
 * <Suspense fallback={<Loading />}>
 *   <Page />  ← 这个组件在 await 数据时，显示 fallback
 * </Suspense>
 *
 * 【骨架屏 (Skeleton)】
 * 用灰色块模拟页面结构，比转圈 loading 体验更好。
 * 用户可以预判页面布局，减少感知等待时间。
 */

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 骨架屏：模拟商品网格 */}
      <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
