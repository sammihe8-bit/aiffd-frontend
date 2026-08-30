import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import OnboardingPage from './pages/OnboardingPage'
import PlaceholderPage from './pages/PlaceholderPage'
import PrivacyPage from './pages/PrivacyPage'
import BodyTestPage from './pages/BodyTestPage'
import ColumnPage from './pages/ColumnPage'
import ColorTestPage from './pages/ColorTestPage'
import ColorSeasonPage from './pages/ColorSeasonPage'
import StyleTestPage from './pages/StyleTestPage'
import VirtualFitPage from './pages/VirtualFitPage'
import SubscribePage from './pages/SubscribePage'
import { useAuth } from './hooks/useAuth'
import ColorElementPage from './pages/ColorElementPage'

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
        <main className="pt-[60px]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/column" element={<ColumnPage />} />
            <Route path="/virtual-fit" element={<VirtualFitPage />} />
            <Route path="/subscribe" element={<SubscribePage />} />  {/* ← 加在这里 */}

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
              <PrivateRoute>
                <PlaceholderPage title="时尚个性测试" description="时尚个性测试即将上线" />
              </PrivateRoute>
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
