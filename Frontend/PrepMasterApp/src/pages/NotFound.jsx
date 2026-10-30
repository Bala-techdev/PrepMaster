import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import EmptyState from '../components/EmptyState'

export default function NotFound() {
  return (
    <section className="not-found-page">
      <div className="page-container">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="This route does not exist in the PrepMaster prototype. Use the navigation or return to the dashboard."
        >
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </EmptyState>
      </div>
    </section>
  )
}
