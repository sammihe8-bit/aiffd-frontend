import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import OnboardingPage from './pages/OnboardingPage'
import PlaceholderPage from './pages/PlaceholderPage'
import PrivacyPage from './pages/PrivacyPage'
import AboutPage from './pages/AboutPage'
import BodyTestPage from './pages/BodyTestPage'
import ColumnPage from './pages/ColumnPage'
import ColorTestPage from './pages/ColorTestPage'
import ColorSeasonPage from './pages/ColorSeasonPage'
import StyleTestPage from './pages/StyleTestPage'
import VirtualFitPage from './pages/VirtualFitPage'
import SubscribePage from './pages/SubscribePage'
import { useAuth } from './hooks/useAuth'
import ColorElementPage from './pages/ColorElementPage'
import FashionTestPage from './pages/FashionTestPage'
import ResearchPage from './pages/ResearchPage'
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const location = useLocation()
  // 未登录：带上 reason 和来源路径跳去登录页，AuthPage 可以用 location.state 显示对应提示文案
  // reason: 'login_required' → 提示"请先登录"；AuthPage 自己再判断这个账号是否已注册过
  return token
    ? <>{children}</>
    : <Navigate to="/auth" replace state={{ reason: 'login_required', from: location.pathname }} />
}
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream font-serif">
        <Navbar />
        {/* 2026-09-14 修复：原来是 pt-[60px]，只对应旧的纯导航栏高度。
            Navbar 后来加了 34px 高的内测提示横幅（横幅+导航栏 fixed 总高度 = 94px），
            但这里的顶部留白一直没跟着更新，导致全站所有页面正文顶部都被固定定位的横幅+导航栏遮住一截。
            现在改成 94px，和 Navbar.tsx 里横幅(34px) + 导航栏(60px) 的实际总高度对齐。
            以后如果横幅或导航栏高度再变，这里也要同步改，两处高度必须保持一致。 */}
        <main className="pt-[94px]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />  {/* 2026-09-12 新增：在线测试说明，公开路由，不需要登录 */}
            <Route path="/column" element={<ColumnPage />} />
            <Route path="/virtual-fit" element={<VirtualFitPage />} />
            <Route path="/subscribe" element={<SubscribePage />} />  {/* ← 加在这里 */}
            <Route path="/research" element={<ResearchPage />} />
            {/* 以下测试相关路由改为需要登录才能进入 */}
            <Route path="/test/body" element={
              <PrivateRoute><BodyTestPage /></PrivateRoute>
            } />
            <Route path="/test/color" element={
              <PrivateRoute><ColorTestPage /></PrivateRoute>
            } />
            <Route path="/test/color/season" element={
              <PrivateRoute><ColorSeasonPage /></PrivateRoute>
            } />
            <Route path="/test/color/element" element={
              <PrivateRoute><ColorElementPage /></PrivateRoute>
            } />
            <Route path="/test/style" element={
              <PrivateRoute><StyleTestPage /></PrivateRoute>
            } />
            <Route path="/test/fashion" element={
              <PrivateRoute><FashionTestPage /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="/diagnosis" element={
              <PrivateRoute>
                <PlaceholderPage title="商品分析" description="上传商品图片或链接，AI 为你判断是否值得购买" />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
