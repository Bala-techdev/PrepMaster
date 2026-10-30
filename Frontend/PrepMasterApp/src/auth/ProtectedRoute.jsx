import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import PageState from '../components/PageState'

function SessionLoader() {
  return (
    <div className="session-loader">
      <PageState
        variant="loading"
        title="Checking your session"
        description="Preparing your PrepMaster workspace."
      />
    </div>
  )
}

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SessionLoader />

  if (status !== 'authenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    )
  }

  return <Outlet />
}

export function PublicOnly() {
  const { status } = useAuth()

  if (status === 'loading') return <SessionLoader />
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
