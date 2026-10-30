import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { buildDateRange, keyToDate } from '../lib/date'
import './ActivityHeatmap.css'

function countToLevel(count) {
  const value = Number(count) || 0
  if (value <= 0) return 0
  if (value <= 2) return 1
  if (value <= 4) return 2
  if (value <= 6) return 3
  return 4
}

export default function ActivityHeatmap({
  activity = {},
  days = 30,
  className = '',
  title = 'Activity',
  note,
}) {
  const items = useMemo(
    () =>
      buildDateRange(days).map((key) => {
        const count = Number(activity[key]) || 0
        return {
          key,
          count,
          level: countToLevel(count),
          label: keyToDate(key).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
        }
      }),
    [activity, days],
  )

  const activeDays = items.filter((item) => item.count > 0).length

  return (
    <section
      className={`activity-heatmap${className ? ` ${className}` : ''}`}
      aria-labelledby="activity-title"
    >
      <div className="heatmap-head">
        <div>
          <h2 className="heatmap-title" id="activity-title">
            {title}
          </h2>
          <p className="heatmap-subtitle">
            {activeDays} active day{activeDays === 1 ? '' : 's'} in the last{' '}
            {days} days
          </p>
        </div>
        <CalendarDays className="heatmap-head-icon" aria-hidden="true" />
      </div>

      <div
        className="activity-heatmap-grid"
        role="img"
        aria-label={`Contribution heatmap for the last ${days} days. ${activeDays} active days.`}
      >
        {items.map((item) => (
          <span
            key={item.key}
            className={`activity-cell level-${item.level}`}
            title={`${item.label}: ${
              item.count === 0
                ? 'no activity'
                : `${item.count} activity point${item.count === 1 ? '' : 's'}`
            }`}
          />
        ))}
      </div>

      <div className="activity-heatmap-legend" aria-hidden="true">
        <span>Less</span>
        <span className="activity-cell level-0" />
        <span className="activity-cell level-1" />
        <span className="activity-cell level-2" />
        <span className="activity-cell level-3" />
        <span className="activity-cell level-4" />
        <span>More</span>
      </div>

      {note && <p className="heatmap-note">{note}</p>}
    </section>
  )
}
