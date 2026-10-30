/* Sample practice problems. These are static descriptions only: the
   prototype does not execute or judge submitted code. */

export const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Array',
    summary: 'Return the indices of two numbers that add up to a target.',
    description:
      'Given an array of integers and a target value, return the indices of the two numbers that add up to the target. Each input has exactly one solution and the same element cannot be used twice.',
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9.',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'The first element cannot be reused, so 3 + 3 is invalid.',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'Exactly one valid answer exists.',
    ],
    hints: [
      'The brute-force solution checks every pair in O(n²). What information are you recomputing?',
      'For each number, the value you need is target - number. A hash map can answer that lookup in O(1).',
      'Store values you have already seen, then check for the complement before inserting the current value.',
    ],
    approach:
      'Iterate once while keeping a map from value to index. For each number, check whether its complement is already in the map. If it is, return both indices; otherwise record the current value and continue.',
    complexity: 'Time O(n) · Space O(n)',
    starterCode: `function twoSum(nums, target) {
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
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'String',
    summary: 'Find the length of the longest substring with unique characters.',
    description:
      'Given a string, return the length of the longest substring that contains no repeated characters. A substring must be contiguous.',
    examples: [
      {
        input: '"abcabcbb"',
        output: '3',
        explanation: 'The longest valid substring is "abc".',
      },
      {
        input: '"bbbbb"',
        output: '1',
        explanation: 'Only one character can appear before a repeat.',
      },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of ASCII characters.'],
    hints: [
      'When the right edge advances into a duplicate, the left edge does not need to restart from zero.',
      'Track the last index of each character and move the left edge past it.',
    ],
    approach:
      'Maintain a window [left, right]. Store the most recent index of each character. When a duplicate appears at or after left, move left to one past its previous index. Track the maximum window size.',
    complexity: 'Time O(n) · Space O(min(n, alphabet))',
    starterCode: `function lengthOfLongestSubstring(s) {
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
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    summary: 'Check whether brackets are opened and closed in the right order.',
    description:
      'Given a string containing only (), [] and {}, determine whether the brackets are valid. Every opening bracket must close with the same type, in the correct order.',
    examples: [
      {
        input: '"()[]{}"',
        output: 'true',
        explanation: 'Every pair closes immediately.',
      },
      {
        input: '"(]"',
        output: 'false',
        explanation: 'The closing bracket does not match the open one.',
      },
    ],
    constraints: ['1 <= s.length <= 10^4', 's contains only bracket characters.'],
    hints: [
      'The most recently opened bracket must close first. Which data structure models that?',
      'Push opening brackets, then check the top of the stack for every closing bracket.',
    ],
    approach:
      'Scan the string. Push opening brackets onto a stack. For a closing bracket, the stack must be non-empty and its top must be the matching opener. At the end the stack must be empty.',
    complexity: 'Time O(n) · Space O(n)',
    starterCode: `function isValid(s) {
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
  {
    id: 'sliding-window-maximum',
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    topic: 'Array',
    summary: 'Report the maximum value in every window of size k.',
    description:
      'Given an array and a window size k, return the maximum value for each window as it slides from left to right.',
    examples: [
      {
        input: 'nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3',
        output: '[3, 3, 5, 5, 6, 7]',
        explanation: 'Each value is the maximum of the current three-element window.',
      },
    ],
    constraints: ['1 <= nums.length <= 10^5', '1 <= k <= nums.length'],
    hints: [
      'A monotonic deque keeps candidates in decreasing order.',
      'Remove indices that fall outside the window before reading the front.',
    ],
    approach:
      'Store indices in a deque whose values decrease from front to back. Remove out-of-window indices and smaller values before inserting the next index. The front is the maximum for each window.',
    complexity: 'Time O(n) · Space O(k)',
    starterCode: `function maxSlidingWindow(nums, k) {
  const deque = []
  const result = []

  for (let i = 0; i < nums.length; i += 1) {
    while (deque.length && deque[0] <= i - k) deque.shift()
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop()
    deque.push(i)
    if (i >= k - 1) result.push(nums[deque[0]])
  }

  return result
}`,
  },
  {
    id: 'three-sum',
    title: '3Sum',
    difficulty: 'Medium',
    topic: 'Array',
    summary: 'Find unique triplets that sum to zero.',
    description:
      'Given an integer array, return all unique triplets [a, b, c] such that a + b + c = 0. The result must not contain duplicate triplets.',
    examples: [
      {
        input: 'nums = [-1, 0, 1, 2, -1, -4]',
        output: '[[-1, -1, 2], [-1, 0, 1]]',
        explanation: 'These are the only distinct triplets that sum to zero.',
      },
    ],
    constraints: ['3 <= nums.length <= 3000', 'Duplicate values may appear.'],
    hints: [
      'Sorting makes duplicates easy to skip.',
      'Fix one value, then solve a two-pointer two-sum problem on the remainder.',
    ],
    approach:
      'Sort the array. Fix each index as the first value, skip duplicates, then use two pointers to find pairs that complete the sum. Skip duplicate values for the left pointer as well.',
    complexity: 'Time O(n²) · Space O(1) excluding output',
    starterCode: `function threeSum(nums) {
  nums.sort((a, b) => a - b)
  const result = []

  for (let i = 0; i < nums.length - 2; i += 1) {
    if (i > 0 && nums[i] === nums[i - 1]) continue
    let left = i + 1
    let right = nums.length - 1

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]])
        while (left < right && nums[left] === nums[left + 1]) left += 1
        while (left < right && nums[right] === nums[right - 1]) right -= 1
        left += 1
        right -= 1
      } else if (sum < 0) {
        left += 1
      } else {
        right -= 1
      }
    }
  }

  return result
}`,
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    summary: 'Reverse a singly linked list in one pass.',
    description:
      'Given the head of a singly linked list, reverse the list and return the new head.',
    examples: [
      {
        input: '1 -> 2 -> 3 -> 4 -> null',
        output: '4 -> 3 -> 2 -> 1 -> null',
        explanation: 'Every next pointer is redirected to the previous node.',
      },
    ],
    constraints: ['0 <= number of nodes <= 5000'],
    hints: [
      'Keep references to the previous, current and next node.',
      'Save next before overwriting current.next.',
    ],
    approach:
      'Walk the list with three pointers. Point current.next at previous, then advance previous and current. The new head is the final previous pointer.',
    complexity: 'Time O(n) · Space O(1)',
    starterCode: `function reverseList(head) {
  let previous = null
  let current = head

  while (current) {
    const next = current.next
    current.next = previous
    previous = current
    current = next
  }

  return previous
}`,
  },
  {
    id: 'merge-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: 'Linked List',
    summary: 'Merge two sorted lists into a single sorted list.',
    description:
      'Given the heads of two sorted linked lists, splice them into one sorted list and return its head.',
    examples: [
      {
        input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]',
        output: '[1, 1, 2, 3, 4, 4]',
        explanation: 'Values are merged in non-decreasing order.',
      },
    ],
    constraints: ['0 <= list length <= 50', 'Both lists are sorted ascending.'],
    hints: [
      'Use a dummy head to avoid special-casing the first node.',
      'When one list is exhausted, attach the remainder of the other.',
    ],
    approach:
      'Compare the front nodes of both lists, attach the smaller one to the merged tail, and advance that list. Once one list is empty, append the rest of the other. A dummy node simplifies the tail pointer.',
    complexity: 'Time O(n + m) · Space O(1)',
    starterCode: `function mergeTwoLists(list1, list2) {
  const dummy = { val: 0, next: null }
  let tail = dummy

  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1
      list1 = list1.next
    } else {
      tail.next = list2
      list2 = list2.next
    }
    tail = tail.next
  }

  tail.next = list1 || list2
  return dummy.next
}`,
  },
  {
    id: 'level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    topic: 'Tree',
    summary: 'Return node values grouped by depth.',
    description:
      'Given the root of a binary tree, return the values level by level from top to bottom, grouping each level in its own array.',
    examples: [
      {
        input: 'root = [3, 9, 20, null, null, 15, 7]',
        output: '[[3], [9, 20], [15, 7]]',
        explanation: 'Each nested array contains exactly one tree level.',
      },
    ],
    constraints: ['0 <= number of nodes <= 2000'],
    hints: [
      'A queue processes nodes in breadth-first order.',
      'Record the queue length before processing each level.',
    ],
    approach:
      'Use a queue seeded with the root. For each level, read the current queue size, dequeue that many nodes, collect their values and enqueue their children.',
    complexity: 'Time O(n) · Space O(n)',
    starterCode: `function levelOrder(root) {
  if (!root) return []
  const result = []
  const queue = [root]

  while (queue.length) {
    const level = []
    const size = queue.length

    for (let i = 0; i < size; i += 1) {
      const node = queue.shift()
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(level)
  }

  return result
}`,
  },
  {
    id: 'balanced-binary-tree',
    title: 'Balanced Binary Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    summary: 'Check whether a tree is height-balanced.',
    description:
      'A binary tree is height-balanced when, for every node, the heights of its left and right subtrees differ by at most one.',
    examples: [
      {
        input: 'root = [3, 9, 20, null, null, 15, 7]',
        output: 'true',
        explanation: 'Every subtree differs in height by at most one.',
      },
    ],
    constraints: ['0 <= number of nodes <= 5000'],
    hints: [
      'Returning the height from each subtree avoids recomputing it.',
      'Use a sentinel such as -1 to signal an imbalance early.',
    ],
    approach:
      'Post-order traverse the tree. Each call returns the subtree height, or -1 when an imbalance is found. Short-circuit once a child reports -1.',
    complexity: 'Time O(n) · Space O(h)',
    starterCode: `function isBalanced(root) {
  function height(node) {
    if (!node) return 0
    const left = height(node.left)
    if (left === -1) return -1
    const right = height(node.right)
    if (right === -1) return -1
    if (Math.abs(left - right) > 1) return -1
    return Math.max(left, right) + 1
  }

  return height(root) !== -1
}`,
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    summary: 'Count the distinct ways to reach the top.',
    description:
      'You can climb one or two steps at a time. Given n steps, return the number of distinct ways to reach the top.',
    examples: [
      {
        input: 'n = 3',
        output: '3',
        explanation: 'The sequences are 1+1+1, 1+2 and 2+1.',
      },
    ],
    constraints: ['1 <= n <= 45'],
    hints: [
      'The number of ways to reach step n depends only on the previous two steps.',
      'Only the last two values are needed, so the array can be replaced with two variables.',
    ],
    approach:
      'This is a Fibonacci recurrence: ways(n) = ways(n - 1) + ways(n - 2). Iterate from the base cases while keeping two rolling values.',
    complexity: 'Time O(n) · Space O(1)',
    starterCode: `function climbStairs(n) {
  let previous = 1
  let current = 1

  for (let step = 2; step <= n; step += 1) {
    const next = previous + current
    previous = current
    current = next
  }

  return current
}`,
  },
  {
    id: 'java-encapsulation',
    title: 'Encapsulation: Bank Account',
    difficulty: 'Medium',
    topic: 'Java OOP',
    summary: 'Protect state behind validated methods.',
    description:
      'Design a BankAccount class with a private balance. Deposits and withdrawals must validate their input, and the balance should be readable but not directly writable. Explain why a public setBalance method would weaken the invariant.',
    examples: [
      {
        input: 'account.deposit(50); account.withdraw(20);',
        output: 'balance = 30',
        explanation: 'Every mutation passes through validation.',
      },
    ],
    constraints: [
      'Balance must never become negative.',
      'Deposits and withdrawals must reject non-positive amounts.',
      'No public field or setter may bypass validation.',
    ],
    hints: [
      'Make the field private and expose a read-only getter.',
      'Validate before mutating so a failed operation leaves state unchanged.',
      'Explain invariants in terms of the public API, not just the field.',
    ],
    approach:
      'Keep the balance private and final where possible. Route all changes through deposit and withdraw methods that validate amounts, reject overdrafts and update the field only after checks pass. Expose getBalance without a setter.',
    complexity: 'OOP design · constant-time operations',
    starterCode: `public final class BankAccount {
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
  {
    id: 'url-shortener',
    title: 'Design a URL Shortener',
    difficulty: 'Hard',
    topic: 'System Design',
    summary: 'Design short links, redirects and analytics at scale.',
    description:
      'Design a service that maps long URLs to short codes. Cover the API, code generation, storage, redirect latency, caching, abuse prevention and analytics. State your assumptions before choosing components.',
    examples: [
      {
        input: 'POST /links { "url": "https://example.com/a/long/path" }',
        output: '{ "shortUrl": "https://sho.rt/aB3xK9" }',
        explanation: 'The short code is unique and resolvable.',
      },
    ],
    constraints: [
      'Reads vastly outnumber writes.',
      'Redirects should stay fast under heavy load.',
      'Codes must not collide.',
      'The design must tolerate cache and node failures.',
    ],
    hints: [
      'Estimate write and read volume before choosing storage.',
      'Base62-encoded counters and random codes trade off predictability against collision handling.',
      'A cache in front of the lookup path removes most database reads.',
    ],
    approach:
      'Clarify requirements, estimate traffic and storage, then define APIs. Generate collision-resistant Base62 codes, store the mapping with the code as the key, and serve redirects through a cache. Add rate limiting, expiry and asynchronous analytics so the redirect path stays small.',
    complexity: 'Design exercise · discuss latency, availability and scale',
    starterCode: `POST /api/links
  body: { url, expiresAt? }
  response: { code, shortUrl }

GET /:code
  response: 302 Location: longUrl
  response: 404 when unknown or expired

GET /api/links/:code/stats
  response: { clicks, lastAccessedAt, referrers }`,
  },
]

export const PROBLEM_IDS = PROBLEMS.map((problem) => problem.id)

export const PROBLEM_TOPICS = [
  ...new Set(PROBLEMS.map((problem) => problem.topic)),
].sort()

export const PROBLEM_DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export function getProblemById(id) {
  return PROBLEMS.find((problem) => problem.id === id) || null
}
