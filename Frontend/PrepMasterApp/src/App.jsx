import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute, PublicOnly } from './auth/ProtectedRoute'
import AppLayout from './components/AppLayout'
import { AppDataProvider } from './state/AppDataContext'
import Dashboard from './pages/Dashboard'
import DailyPlan from './pages/DailyPlan'
import Practice from './pages/Practice'
import ProblemDetail from './pages/ProblemDetail'
import MockInterview from './pages/MockInterview'
import MockInterviewHistory from './pages/MockInterviewHistory'
import InterviewSession from './pages/InterviewSession'
import InterviewResult from './pages/InterviewResult'
import Progress from './pages/Progress'
import Learn from './pages/Learn'
import LearnCategory from './pages/LearnCategory'
import TopicDetail from './pages/TopicDetail'
import Community from './pages/Community'
import CommunityDetail from './pages/CommunityDetail'
import Leaderboard from './pages/Leaderboard'
import Achievements from './pages/Achievements'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import SecuritySettings from './pages/SecuritySettings'
import OAuthCallback from './pages/OAuthCallback'
import ResumeScanner from './pages/ResumeScanner'
import ResumeScanHistory from './pages/ResumeScanHistory'
import SkillGapAnalysis from './pages/SkillGapAnalysis'
import ArenaProblem from './pages/ArenaProblem'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function ProtectedWorkspace() {
  return (
    <AppDataProvider>
      <AppLayout />
    </AppDataProvider>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="app-root">
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedWorkspace />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/daily-plan" element={<DailyPlan />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/practice/:problemId" element={<ProblemDetail />} />
                <Route path="/arena/:problemId" element={<ArenaProblem />} />
                <Route path="/mock-interview" element={<MockInterview />} />
                <Route
                  path="/mock-interview/history"
                  element={<MockInterviewHistory />}
                />
                <Route
                  path="/mock-interview/sessions/:sessionId"
                  element={<InterviewSession />}
                />
                <Route
                  path="/mock-interview/results/:sessionId"
                  element={<InterviewResult />}
                />
                <Route path="/progress" element={<Progress />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:categoryId" element={<LearnCategory />} />
                <Route
                  path="/learn/:categoryId/:topicId"
                  element={<TopicDetail />}
                />
                <Route path="/community" element={<Community />} />
                <Route
                  path="/community/:discussionId"
                  element={<CommunityDetail />}
                />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/resume-scanner" element={<ResumeScanner />} />
                <Route path="/resume-scanner/:scanId" element={<ResumeScanner />} />
                <Route path="/scan-history" element={<ResumeScanHistory />} />
                <Route path="/skill-gaps" element={<SkillGapAnalysis />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/security" element={<SecuritySettings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
