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
import { AppStateProvider } from './state/AppStateContext'
import Dashboard from './pages/Dashboard'
import DailyPlan from './pages/DailyPlan'
import Practice from './pages/Practice'
import ProblemDetail from './pages/ProblemDetail'
import MockInterview from './pages/MockInterview'
import Progress from './pages/Progress'
import Learn from './pages/Learn'
import LearnCategory from './pages/LearnCategory'
import TopicDetail from './pages/TopicDetail'
import Community from './pages/Community'
import CommunityDetail from './pages/CommunityDetail'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
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
    <AppStateProvider>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <div className="app-root">
            <Routes>
              <Route element={<PublicOnly />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<ProtectedWorkspace />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/daily-plan" element={<DailyPlan />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/practice/:problemId" element={<ProblemDetail />} />
                  <Route path="/mock-interview" element={<MockInterview />} />
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
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </AppStateProvider>
  )
}

export default App
