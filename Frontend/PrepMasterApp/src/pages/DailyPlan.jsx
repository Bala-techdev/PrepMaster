import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, CheckCircle, Info, Lock } from 'lucide-react'
import TaskCard from '../components/TaskCard'
import ProgressBar from '../components/ProgressBar'
import Modal from '../components/Modal'
import { useAppState } from '../state/appContext'
import { LEARNING_CATEGORIES } from '../data/lessons'
import './DailyPlan.css'

function getLessonCategoryId(lessonId) {
  return (
    LEARNING_CATEGORIES.find((category) =>
      category.lessons.some((lesson) => lesson.id === lessonId),
    )?.id || null
  )
}

export default function DailyPlan() {
  const { dailyTasks, stats, completeTask } = useAppState()
  const [revisitTask, setRevisitTask] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const remaining = stats.totalTasks - stats.completedCount

  const handleComplete = (task) => {
    const result = completeTask(task.id)

    if (result.ok) {
      const isLastTask = task.id === 5
      setFeedback({
        tone: 'success',
        message: isLastTask
          ? `${task.title} completed. That was the final task — today's plan is complete.`
          : `${task.title} completed. The next task is now unlocked.`,
      })
      return
    }

    if (result.reason === 'locked') {
      setFeedback({
        tone: 'error',
        message:
          'That task is still locked. Complete the previous task before marking this one complete.',
      })
      return
    }

    setFeedback({
      tone: 'error',
      message: 'This task could not be marked complete. Please try again.',
    })
  }

  return (
    <section className="daily-plan-page">
      <div className="page-container daily-plan-container">
        <header className="page-head">
          <div>
            <p className="page-eyebrow">Today</p>
            <h1 className="page-title">Daily Plan</h1>
            <p className="page-subtitle">
              Complete tasks in order — each one unlocks the next. Progress
              resets at local midnight.
            </p>
          </div>

          <div className="plan-summary">
            <div className="plan-summary-head">
              <span className="plan-summary-count">
                {stats.completedCount}/{stats.totalTasks}
              </span>
              <span className="plan-summary-label">completed</span>
            </div>
            <ProgressBar percentage={stats.percentage} small />
          </div>
        </header>

        {feedback && (
          <p
            className={`plan-status is-${feedback.tone}`}
            role={feedback.tone === 'error' ? 'alert' : 'status'}
          >
            {feedback.tone === 'success' ? (
              <CheckCircle size={16} aria-hidden="true" />
            ) : (
              <Info size={16} aria-hidden="true" />
            )}
            {feedback.message}
          </p>
        )}

        {remaining === 0 && (
          <p className="plan-status is-success" role="status">
            <CheckCircle size={16} aria-hidden="true" />
            All five tasks are complete. Your dashboard, streak and progress
            have been updated.
          </p>
        )}

        <div className="daily-tasks">
          {dailyTasks.map((task) => (
            <TaskCard
              key={task.id}
              number={task.id}
              title={task.title}
              category={task.category}
              difficulty={task.difficulty}
              estimatedTime={task.estimatedTime}
              isCompleted={task.isCompleted}
              isLocked={task.isLocked}
              onToggle={() => handleComplete(task)}
              onRevisit={() => setRevisitTask(task)}
            />
          ))}
        </div>

        <p className="unlock-explanation" role="note">
          <strong>How unlocking works:</strong> tasks unlock sequentially —
          complete the previous task to unlock the next one. Tasks cannot be
          skipped, and a locked task never has a completion control. Locked or
          completed tasks can always be reviewed. {stats.completedCount} of{' '}
          {stats.totalTasks} completed today.
        </p>
      </div>

      <Modal
        open={Boolean(revisitTask)}
        title={revisitTask ? revisitTask.title : 'Task details'}
        description={
          revisitTask
            ? `${revisitTask.category} · ${revisitTask.estimatedTime} · ${revisitTask.difficulty}`
            : undefined
        }
        onClose={() => setRevisitTask(null)}
        footer={
          revisitTask ? (
            <>
              <Link
                to={`/practice/${revisitTask.practiceId}`}
                className="btn btn-primary"
                onClick={() => setRevisitTask(null)}
              >
                Open practice view
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link
                to={`/learn/${getLessonCategoryId(revisitTask.lessonId)}/${revisitTask.lessonId}`}
                className="btn btn-secondary"
                onClick={() => setRevisitTask(null)}
              >
                <BookOpen size={15} aria-hidden="true" />
                Review lesson
              </Link>
            </>
          ) : null
        }
      >
        {revisitTask && (
          <div className="task-detail">
            <p>{revisitTask.description}</p>
            <div className="task-detail-block">
              <h3>Objective</h3>
              <p>{revisitTask.objective}</p>
            </div>
            <p className="task-detail-meta">
              <Lock size={14} aria-hidden="true" />
              This task is completed for today. Revisit the material as often
              as you like — completion is already recorded.
            </p>
          </div>
        )}
      </Modal>
    </section>
  )
}
