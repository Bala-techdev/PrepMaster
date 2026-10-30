/* Local demo discussions. They exist only in this browser and are not
   sent anywhere; the UI labels them accordingly. */

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const seededAt = (offsetMs) => new Date(Date.now() - offsetMs).toISOString()

export const DISCUSSION_TOPICS = [
  'DSA',
  'Java OOP',
  'System Design',
  'Interview Preparation',
  'General',
]

export const INITIAL_DISCUSSIONS = [
  {
    id: 'demo-two-sum',
    title: 'How do you explain the Two Sum hash map trade-off?',
    body: 'I can write the solution, but I struggle to explain why the hash map is worth the extra space. How do you phrase the trade-off in an interview without sounding rehearsed?',
    category: 'DSA',
    author: 'Alice',
    createdAt: seededAt(2 * HOUR),
    upvotes: 24,
    isDemo: true,
    replies: [
      {
        id: 'reply-two-sum-1',
        author: 'Bala',
        body: 'I start with the brute-force cost, then say the map buys a single pass at the cost of O(n) memory. Naming both sides keeps it concrete.',
        createdAt: seededAt(90 * 60 * 1000),
      },
      {
        id: 'reply-two-sum-2',
        author: 'Charlie',
        body: 'Mentioning that a sorted input would allow two pointers also shows you are not reciting one pattern.',
        createdAt: seededAt(70 * 60 * 1000),
      },
    ],
  },
  {
    id: 'demo-encapsulation',
    title: 'Is a private field with public getters and setters really encapsulation?',
    body: 'My Java class has private fields but a public setter for every one of them. A reviewer said that is not real encapsulation. What should the class expose instead?',
    category: 'Java OOP',
    author: 'Bob',
    createdAt: seededAt(5 * HOUR),
    upvotes: 16,
    isDemo: true,
    replies: [
      {
        id: 'reply-encapsulation-1',
        author: 'Dana',
        body: 'Expose the operations the domain needs, like deposit and withdraw, and keep the invariant inside those methods. A setter only moves the same raw write behind a method name.',
        createdAt: seededAt(4 * HOUR),
      },
    ],
  },
  {
    id: 'demo-twitter',
    title: 'System design: where do you start with "Design Twitter"?',
    body: 'I freeze when the prompt is broad. Do you estimate scale first, draw the API, or talk about the feed model? Looking for a repeatable structure for a 45-minute interview.',
    category: 'System Design',
    author: 'Charlie',
    createdAt: seededAt(DAY + 2 * HOUR),
    upvotes: 45,
    isDemo: true,
    replies: [
      {
        id: 'reply-twitter-1',
        author: 'Alice',
        body: 'Requirements and scale first, then the two or three core flows. For Twitter the feed read path matters more than the profile edit path.',
        createdAt: seededAt(DAY),
      },
      {
        id: 'reply-twitter-2',
        author: 'Bala',
        body: 'Write down assumptions as you go. It gives you something to revisit when the interviewer changes a constraint.',
        createdAt: seededAt(20 * HOUR),
      },
    ],
  },
  {
    id: 'demo-routine',
    title: 'What does your daily practice routine look like?',
    body: 'I am trying to build a consistent habit without burning out. Do you solve one hard problem or a few easy ones? How do you review mistakes?',
    category: 'General',
    author: 'Dana',
    createdAt: seededAt(2 * DAY),
    upvotes: 11,
    isDemo: true,
    replies: [
      {
        id: 'reply-routine-1',
        author: 'Charlie',
        body: 'One focused problem plus a short written review works better for me than five rushed attempts.',
        createdAt: seededAt(DAY + 18 * HOUR),
      },
    ],
  },
  {
    id: 'demo-behavioural',
    title: 'How many STAR stories should I prepare?',
    body: 'I keep writing new stories for every behavioural question. Is a small set of reusable stories enough, or should each answer be unique?',
    category: 'Interview Preparation',
    author: 'Alice',
    createdAt: seededAt(3 * DAY),
    upvotes: 8,
    isDemo: true,
    replies: [
      {
        id: 'reply-behavioural-1',
        author: 'Dana',
        body: 'Five or six strong stories cover most prompts. Adapt the emphasis rather than inventing a new example each time.',
        createdAt: seededAt(2 * DAY + 12 * HOUR),
      },
    ],
  },
]

/* Fresh copies so seeded replies can never be mutated in place. */
export function createSeedDiscussions() {
  return INITIAL_DISCUSSIONS.map((discussion) => ({
    ...discussion,
    replies: discussion.replies.map((reply) => ({ ...reply })),
  }))
}
