/* Reusable daily task model. Every page reads the same definitions so
   task counts, titles and links cannot drift between screens. */

export const DAILY_TASKS = [
  {
    id: 1,
    title: 'Two Sum',
    category: 'DSA',
    topic: 'Arrays & Hashing',
    difficulty: 'Easy',
    estimatedTime: '45 min',
    objective:
      'Practise trading memory for speed with a hash map and explain the trade-off out loud.',
    description:
      'Find two indices in an array that add up to a target value. Optimise the brute-force solution to a single pass.',
    practiceId: 'two-sum',
    lessonId: 'arrays-and-hash-maps',
  },
  {
    id: 2,
    title: 'Sliding Window',
    category: 'DSA',
    topic: 'Arrays & Hashing',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    objective:
      'Learn when a moving window can replace recomputing every subarray.',
    description:
      'Use a sliding window to track a substring without repeating characters. Keep the window valid as the right edge advances.',
    practiceId: 'longest-substring',
    lessonId: 'sliding-window',
  },
  {
    id: 3,
    title: 'Valid Parentheses',
    category: 'DSA',
    topic: 'Stacks',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    objective:
      'Recognise when last-in-first-out ordering models the problem.',
    description:
      'Validate a string of brackets using a stack. Cover the empty string, unmatched closers and leftover openers.',
    practiceId: 'valid-parentheses',
    lessonId: 'stacks-and-queues',
  },
  {
    id: 4,
    title: 'Encapsulation in Java',
    category: 'Java OOP',
    topic: 'Encapsulation',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    objective:
      'Design a class that protects its invariants instead of exposing raw fields.',
    description:
      'Build a BankAccount class with private state, validated operations and a read-only balance. Explain why every field does not need a setter.',
    practiceId: 'java-encapsulation',
    lessonId: 'encapsulation',
  },
  {
    id: 5,
    title: 'Design a URL Shortener',
    category: 'System Design',
    topic: 'Scalability',
    difficulty: 'Hard',
    estimatedTime: '60 min',
    objective:
      'Practise structuring a design answer around requirements, data model and scale.',
    description:
      'Design a service that turns long URLs into short codes. Cover collision handling, redirects, caching and analytics.',
    practiceId: 'url-shortener',
    lessonId: 'url-shortener',
  },
]

export const DAILY_TASK_IDS = DAILY_TASKS.map((task) => task.id)

export function getTaskById(id) {
  return DAILY_TASKS.find((task) => task.id === Number(id)) || null
}

export function getTaskIndex(id) {
  return DAILY_TASKS.findIndex((task) => task.id === Number(id))
}
