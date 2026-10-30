/* Learning tracks, lessons and sample explanations. All content is
   static prototype material; no network requests are made. */

export const LEARNING_CATEGORIES = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description:
      'Build pattern recognition for arrays, strings, stacks, trees and dynamic programming.',
    level: 'Beginner to Advanced',
    icon: 'Folder',
    color: 'var(--prem-blue)',
    lessons: [
      {
        id: 'arrays-and-hash-maps',
        title: 'Arrays and Hash Maps',
        description:
          'Use a hash map to replace nested loops with constant-time lookups.',
        level: 'Beginner',
        duration: '20 min',
        topic: 'Arrays',
        practiceId: 'two-sum',
        explanation: [
          'An array gives O(1) access by index but O(n) membership checks when unsorted. A hash map stores key/value pairs and answers membership and lookup questions in expected O(1) time, at the cost of extra memory.',
          'The Two Sum pattern is the canonical trade: instead of checking every pair, walk the array once and ask whether the complement you need has already been seen. This converts an O(n²) search into O(n) work.',
          'When you present this solution, say what you are trading away. The interviewer wants to hear that the map uses O(n) additional space and that duplicate values are handled by checking before inserting.',
        ],
        keyPoints: [
          'Hash map lookup is expected O(1), worst case O(n) under heavy collisions.',
          'Check for the complement before inserting the current value to avoid reusing an element.',
          'Always state the space trade-off, not only the time improvement.',
        ],
        code: {
          language: 'javascript',
          snippet: `function twoSum(nums, target) {
  const seen = new Map()

  for (let i = 0; i < nums.length; i += 1) {
    const complement = target - nums[i]
    if (seen.has(complement)) {
      return [seen.get(complement), i]
    }
    seen.set(nums[i], i)
  }

  return []
}`,
        },
        tip:
          'If the input is already sorted, a two-pointer approach may use O(1) space. Ask whether sorting is allowed before assuming the hash map is required.',
      },
      {
        id: 'sliding-window',
        title: 'Sliding Window',
        description:
          'Maintain a moving range and update the answer incrementally instead of recomputing it.',
        level: 'Intermediate',
        duration: '25 min',
        topic: 'Arrays & Strings',
        practiceId: 'longest-substring',
        explanation: [
          'A sliding window is a pair of indices that describe a contiguous range. The right edge expands the range; the left edge contracts it when the window becomes invalid. Each index moves at most once, so the total work is linear.',
          'Windows apply when the problem asks about a contiguous subarray or substring and the validity of a range can be updated incrementally. If the property is not monotonic, a simple window may not be correct.',
          'For "longest substring without repeating characters", store the last index of each character. When a repeat appears inside the window, jump the left edge past its previous position. Do not reset it to zero, which would discard valid progress.',
        ],
        keyPoints: [
          'Both pointers move forward only, giving O(n) time.',
          'Update the window state when expanding and when contracting.',
          'Guard against moving the left edge backwards.',
        ],
        code: {
          language: 'javascript',
          snippet: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map()
  let left = 0
  let best = 0

  for (let right = 0; right < s.length; right += 1) {
    const char = s[right]
    if (lastSeen.has(char) && lastSeen.get(char) >= left) {
      left = lastSeen.get(char) + 1
    }
    lastSeen.set(char, right)
    best = Math.max(best, right - left + 1)
  }

  return best
}`,
        },
        tip:
          'Write the window invariant in one sentence before coding. If you cannot state it, the window is probably the wrong tool.',
      },
      {
        id: 'stacks-and-queues',
        title: 'Stacks and Queues',
        description:
          'Choose last-in-first-out or first-in-first-out based on the ordering the problem requires.',
        level: 'Beginner',
        duration: '20 min',
        topic: 'Stacks',
        practiceId: 'valid-parentheses',
        explanation: [
          'A stack exposes the most recently added item; a queue exposes the oldest. The choice is a statement about which item must be handled next, not a matter of preference.',
          'Bracket matching is a stack problem because a closing bracket must match the most recent unmatched opener. Keeping a map from closer to opener makes the check direct and readable.',
          'Breadth-first search is a queue problem because nodes at the current depth must all be processed before deeper nodes. Using the wrong structure changes the traversal order, not just performance.',
        ],
        keyPoints: [
          'Push open brackets and validate on close.',
          'Check for an empty stack before popping.',
          'Require an empty stack at the end to catch unmatched openers.',
        ],
        code: {
          language: 'javascript',
          snippet: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []

  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
    } else if (stack.pop() !== pairs[char]) {
      return false
    }
  }

  return stack.length === 0
}`,
        },
        tip:
          'Test the empty input, a single closer and a string with only openers. Those three cases expose most stack bugs.',
      },
    ],
  },
  {
    id: 'java-oop',
    title: 'Java OOP',
    description:
      'Design classes with clear responsibilities, protected invariants and useful abstractions.',
    level: 'Beginner to Intermediate',
    icon: 'Code',
    color: 'var(--prem-purple)',
    lessons: [
      {
        id: 'encapsulation',
        title: 'Encapsulation and Invariants',
        description:
          'Hide representation details and expose operations that keep objects valid.',
        level: 'Beginner',
        duration: '25 min',
        topic: 'Encapsulation',
        practiceId: 'java-encapsulation',
        explanation: [
          'Encapsulation is not simply making fields private. It means the class owns its representation and exposes a small API that preserves its invariants. A public setter can undo that protection just as easily as a public field.',
          'For a bank account, the invariant is that the balance never becomes negative and only valid amounts are accepted. Deposits and withdrawals are the operations that can enforce it. A getter is safe because it cannot mutate state.',
          'Use the narrowest visibility that works, keep fields private, and prefer methods that express domain actions. If a caller needs to replace several fields together, that is often a missing operation rather than a missing setter.',
        ],
        keyPoints: [
          'Private fields plus validated methods, not private fields plus public setters.',
          'Validate before mutating so failures leave the object unchanged.',
          'Use value objects such as Money instead of raw primitives when units matter.',
          'A getter can still leak a mutable internal collection; return a copy or an unmodifiable view.',
        ],
        code: {
          language: 'java',
          snippet: `public final class BankAccount {
    private long balanceCents;

    public BankAccount(long openingBalanceCents) {
        if (openingBalanceCents < 0) {
            throw new IllegalArgumentException("Opening balance cannot be negative");
        }
        this.balanceCents = openingBalanceCents;
    }

    public long getBalanceCents() {
        return balanceCents;
    }

    public void deposit(long amountCents) {
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Deposit must be positive");
        }
        balanceCents += amountCents;
    }

    public void withdraw(long amountCents) {
        if (amountCents <= 0 || amountCents > balanceCents) {
            throw new IllegalArgumentException("Invalid withdrawal");
        }
        balanceCents -= amountCents;
    }
}`,
        },
        tip:
          'In an interview, name the invariant first, then show which methods protect it. That is more convincing than listing access modifiers.',
      },
      {
        id: 'inheritance-and-polymorphism',
        title: 'Inheritance and Polymorphism',
        description:
          'Prefer composition when behaviour varies, and use polymorphism to remove type switches.',
        level: 'Intermediate',
        duration: '30 min',
        topic: 'Polymorphism',
        explanation: [
          'Inheritance expresses an is-a relationship and lets a subclass reuse or override behaviour. It also couples the subclass to the parent implementation, so use it when the relationship is genuinely substitutable.',
          'Polymorphism lets callers depend on an interface while each implementation decides how to behave. Replacing a type switch with a common interface usually makes new cases additive rather than invasive.',
          'Prefer composition when one object merely uses another. It keeps responsibilities separate and avoids fragile base-class problems. Favour small interfaces over deep hierarchies.',
        ],
        keyPoints: [
          'Program to an interface, not a concrete implementation.',
          'A subclass must honour the parent contract (Liskov substitution).',
          'Prefer composition for has-a relationships.',
          'Use abstract classes when shared state or partial implementation is genuinely common.',
        ],
        code: {
          language: 'java',
          snippet: `interface PaymentMethod {
    void pay(long amountCents);
}

final class CardPayment implements PaymentMethod {
    public void pay(long amountCents) {
        // Delegate to the card processor.
    }
}

final class Checkout {
    private final PaymentMethod paymentMethod;

    Checkout(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    void complete(long amountCents) {
        paymentMethod.pay(amountCents);
    }
}`,
        },
        tip:
          'If a subclass throws UnsupportedOperationException for inherited methods, the hierarchy probably models the wrong relationship.',
      },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    description:
      'Break a product into services, data models, APIs and scaling strategies.',
    level: 'Intermediate to Advanced',
    icon: 'Flag',
    color: 'var(--prem-amber)',
    lessons: [
      {
        id: 'url-shortener',
        title: 'Designing a URL Shortener',
        description:
          'A complete walkthrough of requirements, code generation, storage and redirects.',
        level: 'Intermediate',
        duration: '35 min',
        topic: 'Scalability',
        practiceId: 'url-shortener',
        explanation: [
          'Start with requirements and scale. Clarify read/write ratio, retention, custom aliases, analytics and availability targets. A shortener is read-heavy, so the redirect path deserves the most attention.',
          'For code generation, a Base62-encoded counter is compact and collision-free but predictable. Random codes require collision checks. Either way, the code is the primary key in the mapping store.',
          'Redirects should avoid expensive work. Cache popular mappings, keep analytics asynchronous, and return a 302 or 301 according to whether links may change. Rate-limit creation to limit abuse.',
        ],
        keyPoints: [
          'Estimate traffic and storage before choosing components.',
          'Keep the redirect path small: lookup, cache, respond.',
          'Discuss collisions, expiries and custom aliases explicitly.',
          'Analytics belongs off the critical path.',
          'State trade-offs for SQL versus a distributed key-value store.',
        ],
        code: {
          language: 'text',
          snippet: `POST /api/links
  -> validate URL, rate limit, allocate code
  -> store { code, longUrl, ownerId, expiresAt }
  -> return { shortUrl }

GET /:code
  -> cache lookup
  -> mapping store lookup on miss
  -> 302 Location: longUrl
  -> enqueue click event asynchronously`,
        },
        tip:
          'Spend the first few minutes on requirements. A precise scope is more valuable than naming many technologies.',
      },
      {
        id: 'caching-and-scaling',
        title: 'Caching and Horizontal Scaling',
        description:
          'Reduce latency with caches and keep stateless services easy to scale.',
        level: 'Advanced',
        duration: '30 min',
        topic: 'Scalability',
        explanation: [
          'A cache trades freshness and memory for latency and database load. The key questions are what to cache, how long, and how stale data is invalidated. Popular short links are ideal candidates because reads repeat.',
          'Stateless application nodes can be scaled horizontally behind a load balancer. Session state and uploaded files belong in shared stores, not local memory. Sticky sessions are a workaround, not a scaling strategy.',
          'Choose a cache invalidation strategy deliberately. Time-to-live is simple and bounded; write-through keeps data fresher at higher write cost. For redirects, a short TTL after an edit is usually acceptable.',
        ],
        keyPoints: [
          'Measure hit rate and tail latency, not just average latency.',
          'Add jitter to TTLs to avoid synchronized expiry storms.',
          'Keep application nodes stateless.',
          'Plan for cache failure: the database must survive a cold cache.',
        ],
        code: {
          language: 'text',
          snippet: `request(code):
  value = cache.get(code)
  if value is not null:
      return value
  value = database.findByCode(code)
  if value is null:
      return 404
  cache.set(code, value, ttl=300s + jitter)
  return value`,
        },
        tip:
          'Never claim a cache guarantees freshness. Say what staleness the product can tolerate and how you bound it.',
      },
    ],
  },
  {
    id: 'interview-prep',
    title: 'Interview Preparation',
    description:
      'Practise explaining your reasoning, structuring answers and handling behavioural questions.',
    level: 'All levels',
    icon: 'Star',
    color: 'var(--prem-green)',
    lessons: [
      {
        id: 'communicating-your-approach',
        title: 'Communicating Your Approach',
        description:
          'Turn silent problem solving into a structured, collaborative explanation.',
        level: 'Beginner',
        duration: '20 min',
        topic: 'Communication',
        explanation: [
          'Interviewers evaluate how you reason, not only whether the final code passes. State the problem in your own words, ask clarifying questions and describe a brute-force baseline before optimising.',
          'Narrate decisions at milestones rather than every keystroke. Say what you are about to do, why, and what would change your mind. When stuck, name the specific obstacle and propose a smaller experiment.',
          'Close by testing the solution with a small case, an edge case and an empty input. Summarise the complexity and the trade-offs you chose.',
        ],
        keyPoints: [
          'Restate the problem and confirm assumptions.',
          'Offer a baseline, then improve it.',
          'Explain trade-offs, not just steps.',
          'Test edge cases before declaring completion.',
          'Ask for hints with a specific question.',
        ],
        code: {
          language: 'text',
          snippet: `1. Clarify: input size, duplicates, sortedness, output format
2. Baseline: describe the brute-force cost
3. Optimise: name the pattern and the invariant
4. Code: narrate only at meaningful milestones
5. Verify: normal case, edge case, empty input
6. Summarise: time, space, trade-offs`,
        },
        tip:
          'Rehearse a two-minute explanation of your last project. Clear structure is easier to improve than raw speed.',
      },
      {
        id: 'behavioural-interviews-star',
        title: 'Behavioural Answers with STAR',
        description:
          'Structure real examples around situation, task, action and result.',
        level: 'Beginner',
        duration: '25 min',
        topic: 'Behavioural',
        explanation: [
          'STAR gives a behavioural answer a shape: Situation, Task, Action, Result. Keep the situation brief, make your personal actions specific, and finish with a measurable or observable result.',
          'Use "I" rather than "we" when describing your contribution. Interviewers need to separate your decisions from the team outcome. It is fine to mention collaborators as long as your role is clear.',
          'Prepare a small set of adaptable stories: a conflict, a failure, a deadline, a technical trade-off and a piece of feedback you acted on. Reuse them instead of inventing a new story for every question.',
        ],
        keyPoints: [
          'Spend at most 20% of the answer on context.',
          'Describe your actions and reasoning, not the whole team history.',
          'End with a result and a reflection.',
          'Prepare stories across conflict, failure, leadership and learning.',
        ],
        code: {
          language: 'text',
          snippet: `Situation: legacy checkout failed during peak traffic
Task: reduce failures without a full rewrite
Action: added metrics, isolated the retry loop, introduced a queue
Result: failures fell from 8% to 0.4%; documented the rollout
Reflection: measure before changing a system under pressure`,
        },
        tip:
          'A failure story is strongest when the result includes what you changed afterwards, not just the original mistake.',
      },
    ],
  },
]

export const ALL_LESSONS = LEARNING_CATEGORIES.flatMap((category) =>
  category.lessons.map((lesson) => ({
    ...lesson,
    categoryId: category.id,
    categoryTitle: category.title,
    categoryColor: category.color,
  })),
)

export const ALL_LESSON_IDS = ALL_LESSONS.map((lesson) => lesson.id)

export function getCategoryById(id) {
  return LEARNING_CATEGORIES.find((category) => category.id === id) || null
}

export function getLessonById(categoryId, lessonId) {
  const category = getCategoryById(categoryId)
  if (!category) return null
  const lesson = category.lessons.find((item) => item.id === lessonId)
  if (!lesson) return null
  return { ...lesson, categoryId, categoryTitle: category.title }
}
