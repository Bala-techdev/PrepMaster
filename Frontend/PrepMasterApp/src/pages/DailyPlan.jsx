import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, CheckCircle, Info, Lock } from 'lucide-react'
import TaskCard from '../components/TaskCard'
import ProgressBar from '../components/ProgressBar'
import Modal from '../components/Modal'
import { useAppData } from '../state/useAppData'
import './DailyPlan.css'

export default function DailyPlan() {
  const { tasks, stats, completeTask, completingTaskId } = useAppData()
  const [revisitTask, setRevisitTask] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const remaining = Math.max(0, stats.totalTasks - stats.completedCount)
  const busy = Boolean(completingTaskId)

  const handleComplete = async (task) => {
    setFeedback(null)
    const result = await completeTask(task.id)

    if (result.ok) {
      const isLastTask = stats.completedCount + 1 >= stats.totalTasks
      const xp = result.completion?.xpAwarded
      setFeedback({
        tone: 'success',
        message: isLastTask
          ? `${task.title} completed. That was the final task — today's plan is complete.${xp ? ` +${xp} XP awarded.` : ''}`
          : `${task.title} completed.${xp ? ` +${xp} XP awarded.` : ''} The next task is now unlocked.`,
      })
      if (result.warning) {
        setFeedback((current) => ({
          tone: 'error',
          message: `${current.message} ${result.warning}`,
        }))
      }
      return
    }

    setFeedback({
      tone: 'error',
      message: result.message || 'This task could not be marked complete. Please try again.',
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
              Complete tasks in order — each one unlocks the next. Progress is
              saved to your account and resets at midnight in your plan timezone.
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

        {stats.totalTasks > 0 && remaining === 0 && (
          <p className="plan-status is-success" role="status">
            <CheckCircle size={16} aria-hidden="true" />
            All {stats.totalTasks} tasks are complete. Your dashboard, streak and
            progress have been updated by the backend.
          </p>
        )}

        <div className="daily-tasks">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              number={task.order}
              title={task.title}
              category={task.category}
              difficulty={task.difficulty}
              xpReward={task.xpReward}
              isCompleted={task.isCompleted}
              isLocked={task.isLocked}
              isBusy={completingTaskId === task.id}
              onToggle={() => handleComplete(task)}
              onRevisit={() => setRevisitTask(task)}
            />
          ))}
        </div>

        <p className="unlock-explanation" role="note">
          <strong>How unlocking works:</strong> tasks unlock sequentially —
          complete the previous task to unlock the next one. Tasks cannot be
          skipped, and a locked task never has a completion control. Completed
          tasks can always be reviewed. {stats.completedCount} of{' '}
          {stats.totalTasks} completed today.
          {busy && ' Saving your completion…'}
        </p>
      </div>

      <Modal
        open={Boolean(revisitTask)}
        title={revisitTask ? revisitTask.title : 'Task details'}
        description={
          revisitTask
            ? `${revisitTask.category} · ${revisitTask.difficulty} · ${revisitTask.xpReward} XP`
            : undefined
        }
        onClose={() => setRevisitTask(null)}
        footer={
          revisitTask ? (
            <>
              {revisitTask.questionId && (
                <Link
                  to={`/practice/${revisitTask.questionId}`}
                  className="btn btn-primary"
                  onClick={() => setRevisitTask(null)}
                >
                  Open practice view
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              )}
              <Link
                to={`/learn/${revisitTask.categoryId}`}
                className="btn btn-secondary"
                onClick={() => setRevisitTask(null)}
              >
                <BookOpen size={15} aria-hidden="true" />
                Review track
              </Link>
            </>
          ) : null
        }
      >
        {revisitTask && (
          <div className="task-detail">
            <p>
              This task is part of today&apos;s backend-generated plan for{' '}
              <strong>{revisitTask.category}</strong>. Open the practice view to
              read the full prompt and reference material.
            </p>
            <div className="task-detail-block">
              <h3>Recorded reward</h3>
              <p>
                Completing this task awards {revisitTask.xpReward} XP and records
                the question as solved in your progress history.
              </p>
            </div>
            <p className="task-detail-meta">
              <Lock size={14} aria-hidden="true" />
              This task is completed for today. Completion is already recorded,
              so revisiting it will not award XP twice.
            </p>
          </div>
        )}
      </Modal>
    </section>
  )
}
