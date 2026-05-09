import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import OnboardingPage from './pages/OnboardingPage'
import PlaceholderPage from './pages/PlaceholderPage'
import PrivacyPage from './pages/PrivacyPage'
import { useAuth } from './hooks/useAuth'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/auth" replace />
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
