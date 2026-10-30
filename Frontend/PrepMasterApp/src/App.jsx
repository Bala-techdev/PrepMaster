import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import DailyPlan from './pages/DailyPlan'
import Practice from './pages/Practice'
import ProblemDetail from './pages/ProblemDetail'
import MockInterview from './pages/MockInterview'
import Progress from './pages/Progress'
import Learn from './pages/Learn'
import LearnCategory from './pages/LearnCategory'
import LessonDetail from './pages/LessonDetail'
import Community from './pages/Community'
import CommunityDetail from './pages/CommunityDetail'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { AppStateProvider } from './state/AppStateContext'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function App() {
  return (
    <AppStateProvider>
      <Router>
        <ScrollToTop />
        <div className="app-root">
          <AppLayout>
            <Routes>
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
                path="/learn/:categoryId/:lessonId"
                element={<LessonDetail />}
              />
              <Route path="/community" element={<Community />} />
              <Route
                path="/community/:discussionId"
                element={<CommunityDetail />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </div>
      </Router>
    </AppStateProvider>
  )
}

export default App
