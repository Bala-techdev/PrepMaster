/* Question bank for the mock interview prototype. Questions are shown
   as prompts only; nothing is graded automatically. */

export const INTERVIEW_TOPICS = [
  { value: 'All', label: 'All topics' },
  { value: 'DSA', label: 'Data Structures & Algorithms' },
  { value: 'Java OOP', label: 'Java OOP' },
  { value: 'System Design', label: 'System Design' },
]

export const INTERVIEW_DIFFICULTIES = [
  { value: 'All', label: 'All difficulties' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
]

export const INTERVIEW_QUESTIONS = [
  {
    id: 'q-array-duplicates',
    topic: 'DSA',
    difficulty: 'Easy',
    prompt:
      'Given an array of integers, describe how you would find the first duplicate value. Discuss the time and space trade-offs of at least two approaches.',
    focus: 'Hash sets, sorting trade-offs and edge cases',
  },
  {
    id: 'q-sliding-window',
    topic: 'DSA',
    difficulty: 'Medium',
    prompt:
      'Explain how a sliding window works. When is it valid to move the left edge, and when would the pattern fail?',
    focus: 'Window invariants and monotonic properties',
  },
  {
    id: 'q-binary-tree',
    topic: 'DSA',
    difficulty: 'Medium',
    prompt:
      'How would you determine whether a binary tree is height-balanced? Walk through your traversal choice and its complexity.',
    focus: 'Post-order traversal and early termination',
  },
  {
    id: 'q-dp',
    topic: 'DSA',
    difficulty: 'Hard',
    prompt:
      'Design a dynamic programming solution for a problem of your choice. State the recurrence, base cases, evaluation order and how you would reduce memory.',
    focus: 'Recurrence design and space optimisation',
  },
  {
    id: 'q-graph',
    topic: 'DSA',
    difficulty: 'Hard',
    prompt:
      'Given a directed graph, explain how you would detect a cycle. Compare a depth-first approach with a topological sort.',
    focus: 'Cycle detection and traversal state',
  },
  {
    id: 'q-encapsulation',
    topic: 'Java OOP',
    difficulty: 'Easy',
    prompt:
      'What does encapsulation actually protect, and why can a public setter undermine it? Give an example of a class with a real invariant.',
    focus: 'Invariants and API design',
  },
  {
    id: 'q-polymorphism',
    topic: 'Java OOP',
    difficulty: 'Medium',
    prompt:
      'Compare inheritance and composition. Describe a case where inheritance looks convenient but composition is the better design.',
    focus: 'Substitutability and coupling',
  },
  {
    id: 'q-java-collections',
    topic: 'Java OOP',
    difficulty: 'Medium',
    prompt:
      'How would you choose between a List, a Set and a Map for a given requirement? Discuss ordering, duplicates and lookup cost.',
    focus: 'Collection contracts and complexity',
  },
  {
    id: 'q-java-concurrency',
    topic: 'Java OOP',
    difficulty: 'Hard',
    prompt:
      'Two threads update the same object. Explain how you would make the class safe without making every method synchronized unnecessarily.',
    focus: 'Visibility, atomicity and contention',
  },
  {
    id: 'q-url-shortener',
    topic: 'System Design',
    difficulty: 'Medium',
    prompt:
      'Design a URL shortener. Cover the API, code generation, storage, redirect latency and abuse prevention.',
    focus: 'Read-heavy design and collision handling',
  },
  {
    id: 'q-feed',
    topic: 'System Design',
    difficulty: 'Hard',
    prompt:
      'Design a social feed for millions of users. Discuss fan-out on write versus fan-out on read, and how you would handle a celebrity account.',
    focus: 'Fan-out trade-offs and hot keys',
  },
  {
    id: 'q-cache',
    topic: 'System Design',
    difficulty: 'Hard',
    prompt:
      'A service is slow under peak load. Explain how you would add caching, including invalidation, failure behaviour and what you would measure.',
    focus: 'Cache strategy and observability',
  },
]

export const SESSION_QUESTION_COUNT = 5
export const SESSION_DURATION_MINUTES = 45

/* Keep the requested filters when possible, then fill from the bank so
   a session always contains five unique questions. */
export function buildSessionQuestions({ difficulty = 'All', topic = 'All' } = {}) {
  const matches = INTERVIEW_QUESTIONS.filter((question) => {
    const difficultyMatch =
      difficulty === 'All' || question.difficulty === difficulty
    const topicMatch = topic === 'All' || question.topic === topic
    return difficultyMatch && topicMatch
  })

  const selected = matches.slice(0, SESSION_QUESTION_COUNT)
  const selectedIds = new Set(selected.map((question) => question.id))

  for (const question of INTERVIEW_QUESTIONS) {
    if (selected.length >= SESSION_QUESTION_COUNT) break
    if (selectedIds.has(question.id)) continue
    selected.push(question)
    selectedIds.add(question.id)
  }

  return selected.slice(0, SESSION_QUESTION_COUNT)
}
