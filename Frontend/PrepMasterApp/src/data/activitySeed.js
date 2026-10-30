import { addDays, dateKey } from '../lib/date'

/* Deterministic demo history for the heatmap and streak cards.
   It ends yesterday, so the derived current streak is 12 days and the
   longest run is 18 days. Today is never seeded: only real completions
   add to today's cell. */
const COUNT_PATTERN = [2, 3, 1, 4, 2, 5, 7, 3, 1, 4]

function addRun(target, today, fromOffset, toOffset) {
  let index = 0

  for (let offset = fromOffset; offset >= toOffset; offset -= 1) {
    const key = dateKey(addDays(today, -offset))
    target[key] = COUNT_PATTERN[index % COUNT_PATTERN.length]
    index += 1
  }
}

export function buildDemoActivity(today = new Date()) {
  const activity = {}

  /* Current run: yesterday back 12 days. `addRun` walks from the larger
     offset down to the smaller one, so pass the older offset first. */
  addRun(activity, today, 12, 1)

  /* Longest run: 18 days, separated from the current run by one gap. */
  addRun(activity, today, 31, 14)

  /* Scattered earlier practice without creating a run longer than 18. */
  for (let offset = 34; offset <= 58; offset += 3) {
    const key = dateKey(addDays(today, -offset))
    activity[key] = COUNT_PATTERN[offset % COUNT_PATTERN.length]
  }

  return activity
}
