import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

// Pages
import LoginPage from '@/pages/LoginPage'
import NicknamePage from '@/pages/NicknamePage'
import QREntryPage from '@/pages/QREntryPage'
import QRGeneratorPage from '@/pages/QRGeneratorPage'
import HomePage from '@/pages/HomePage'
import EmotionPage from '@/pages/EmotionPage'
import StoryListPage from '@/pages/StoryListPage'
import StoryDetailPage from '@/pages/StoryDetailPage'
import WritePage from '@/pages/WritePage'
import ResultPage from '@/pages/ResultPage'
import RankingPage from '@/pages/RankingPage'
import ArchivePage from '@/pages/ArchivePage'
import MyPage from '@/pages/MyPage'

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/home" replace />
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (!profile?.nickname) return <Navigate to="/nickname" replace />
  return <>{children}</>
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-black text-primary mb-2">SITTALK</h1>
        <p className="text-sm text-muted-foreground animate-pulse">불러오는 중...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/enter" element={<QREntryPage />} />

      {/* Nickname setup */}
      <Route path="/nickname" element={<NicknamePage />} />

      {/* Protected */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/emotions" element={<ProtectedRoute><EmotionPage /></ProtectedRoute>} />
      <Route path="/story-list" element={<ProtectedRoute><StoryListPage /></ProtectedRoute>} />
      <Route path="/story/:id" element={<ProtectedRoute><StoryDetailPage /></ProtectedRoute>} />
      <Route path="/write/:id" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
      <Route path="/result/:id" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
      <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
      <Route path="/qr-generator" element={<ProtectedRoute><QRGeneratorPage /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
