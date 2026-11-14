-- Phase 4: starter learning content.
--
-- Data (not schema) so that a fresh development or test database can actually
-- generate a daily plan and show practice questions. Rows are inserted through
-- slug lookups rather than hard-coded ids, which keeps the migration portable
-- between MySQL 8 and H2 (MODE=MySQL) and safe with AUTO_INCREMENT.

INSERT INTO learning_categories (name, slug, active, created_at, updated_at) VALUES
    ('Data Structures & Algorithms', 'data-structures-algorithms', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Java & Object-Oriented Programming', 'java-oop', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('System Design Foundations', 'system-design-foundations', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Arrays & Hashing', 'arrays-hashing',
       'Store what you have already seen so lookup becomes constant time.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'data-structures-algorithms';

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Strings & Sliding Window', 'strings-sliding-window',
       'Maintain a moving range instead of recomputing every substring.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'data-structures-algorithms';

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Stacks & Queues', 'stacks-queues',
       'Choose last-in-first-out or first-in-first-out based on the ordering the problem needs.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'data-structures-algorithms';

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Trees & Graphs', 'trees-graphs',
       'Traverse connected structures with depth-first or breadth-first search.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'data-structures-algorithms';

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Java Fundamentals', 'java-fundamentals',
       'Collections, equality, immutability and the language details interviews probe.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'java-oop';

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Object-Oriented Design', 'object-oriented-design',
       'Model behaviour with interfaces, composition and clear responsibilities.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'java-oop';

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Scalability & Load Balancing', 'scalability-load-balancing',
       'Understand horizontal scaling, stateless services and traffic distribution.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'system-design-foundations';

INSERT INTO learning_topics (category_id, name, slug, description, active, created_at, updated_at)
SELECT id, 'Caching & Data Stores', 'caching-data-stores',
       'Trade consistency for latency with caches, indexes and read replicas.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_categories WHERE slug = 'system-design-foundations';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'Hash map fundamentals',
       'How key/value storage converts repeated membership checks into expected constant-time lookups.',
       'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'arrays-hashing';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'Sliding window pattern',
       'A guide to expanding and contracting a contiguous range while keeping the answer up to date.',
       'https://roadmap.sh/datastructures-and-algorithms', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'strings-sliding-window';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'Stack and queue overview',
       'The two fundamental ordering strategies and the operations each supports.',
       'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Deque.html', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'stacks-queues';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'Graph traversal primer',
       'Depth-first and breadth-first traversal, visited sets and complexity.',
       'https://roadmap.sh/computer-science', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'trees-graphs';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'Java collections framework',
       'Choose the right collection and understand the equality contract behind hash-based types.',
       'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collection.html', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'java-fundamentals';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'SOLID principles',
       'Five design guidelines for code that stays understandable as requirements change.',
       'https://martinfowler.com/articles/designDead.html', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'object-oriented-design';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'Scalability basics',
       'Stateless services, horizontal scaling and the role of load balancers.',
       'https://martinfowler.com/articles/microservices.html', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'scalability-load-balancing';

INSERT INTO learning_resources (topic_id, title, description, resource_url, active, created_at, updated_at)
SELECT id, 'Caching strategies',
       'Cache-aside, write-through and invalidation trade-offs.',
       'https://aws.amazon.com/caching/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'caching-data-stores';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Two Sum',
       'Given an array of integers and a target, return the indices of two values that add up to the target. Each input has exactly one solution and an element cannot be used twice.',
       'EASY', '2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
Exactly one valid answer exists.',
       'Input: nums = [2,7,11,15], target = 9
Output: [0,1]',
       'O(n)', 'O(n)', 'https://leetcode.com/problems/two-sum/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'arrays-hashing';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Best Time to Buy and Sell Stock',
       'Given daily prices, choose one day to buy and a later day to sell to maximise profit. Return zero when no profit is possible.',
       'EASY', '1 <= prices.length <= 10^5
0 <= prices[i] <= 10^4',
       'Input: prices = [7,1,5,3,6,4]
Output: 5',
       'O(n)', 'O(1)', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'arrays-hashing';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Product of Array Except Self',
       'Return an array where each position contains the product of every other value. Do not use division.',
       'MEDIUM', '2 <= nums.length <= 10^5
-30 <= nums[i] <= 30',
       'Input: nums = [1,2,3,4]
Output: [24,12,8,6]',
       'O(n)', 'O(1) extra space', 'https://leetcode.com/problems/product-of-array-except-self/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'arrays-hashing';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Longest Substring Without Repeating Characters',
       'Return the length of the longest contiguous substring that contains no repeated characters.',
       'MEDIUM', '0 <= s.length <= 5 * 10^4
s contains ASCII characters.',
       'Input: s = "abcabcbb"
Output: 3',
       'O(n)', 'O(min(n, alphabet))', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'strings-sliding-window';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Valid Palindrome',
       'Ignore non-alphanumeric characters and case, then decide whether the string reads the same forwards and backwards.',
       'EASY', '1 <= s.length <= 2 * 10^5',
       'Input: s = "A man, a plan, a canal: Panama"
Output: true',
       'O(n)', 'O(1)', 'https://leetcode.com/problems/valid-palindrome/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'strings-sliding-window';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Group Anagrams',
       'Group strings that are anagrams of one another. Return the groups in any order.',
       'MEDIUM', '1 <= strs.length <= 10^4
0 <= strs[i].length <= 100',
       'Input: ["eat","tea","tan","ate","nat","bat"]
Output: [["eat","tea","ate"],["tan","nat"],["bat"]]',
       'O(n * k log k)', 'O(n * k)', 'https://leetcode.com/problems/group-anagrams/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'strings-sliding-window';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Valid Parentheses',
       'Determine whether a string of brackets is valid: every opening bracket must close with the same type in the correct order.',
       'EASY', '1 <= s.length <= 10^4
s contains only bracket characters.',
       'Input: "()[]{}"
Output: true',
       'O(n)', 'O(n)', 'https://leetcode.com/problems/valid-parentheses/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'stacks-queues';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Min Stack',
       'Design a stack that supports push, pop, top and retrieving the minimum element in constant time.',
       'MEDIUM', '-2^31 <= val <= 2^31 - 1
Methods are called only on a non-empty stack when required.',
       'push(-2), push(0), push(-3), getMin() -> -3, pop(), top() -> 0',
       'O(1) per operation', 'O(n)', 'https://leetcode.com/problems/min-stack/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'stacks-queues';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Daily Temperatures',
       'For each day, return how many days must pass before a warmer temperature. Return zero when no warmer day exists.',
       'MEDIUM', '1 <= temperatures.length <= 10^5
30 <= temperatures[i] <= 100',
       'Input: [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]',
       'O(n)', 'O(n)', 'https://leetcode.com/problems/daily-temperatures/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'stacks-queues';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Maximum Depth of Binary Tree',
       'Return the number of nodes on the longest path from the root down to a leaf.',
       'EASY', '0 <= number of nodes <= 10^4
-100 <= Node.val <= 100',
       'Input: root = [3,9,20,null,null,15,7]
Output: 3',
       'O(n)', 'O(h)', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'trees-graphs';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Binary Tree Level Order Traversal',
       'Return the values in each level of a binary tree, from left to right and top to bottom.',
       'MEDIUM', '0 <= number of nodes <= 2000
-1000 <= Node.val <= 1000',
       'Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]',
       'O(n)', 'O(n)', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'trees-graphs';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Number of Islands',
       'Given a grid of water and land, count the connected groups of land. Connections are horizontal and vertical only.',
       'MEDIUM', '1 <= rows, columns <= 300
grid values are 0 or 1.',
       'Input: [[1,1,0],[1,0,0],[0,0,1]]
Output: 2',
       'O(rows * columns)', 'O(rows * columns)', 'https://leetcode.com/problems/number-of-islands/', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'trees-graphs';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Implement equals and hashCode',
       'Explain why Java requires equals and hashCode to agree, then implement both for a value object with two fields.',
       'MEDIUM', 'The class must remain immutable.
Equal objects must produce equal hash codes.',
       'Two objects with the same fields must be equal and share a hash code. Changing a field must produce a different value object.',
       'O(1)', 'O(1)', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'java-fundamentals';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Interface vs Abstract Class',
       'Compare interfaces and abstract classes in Java and choose one for a payment provider abstraction.',
       'EASY', 'Consider multiple inheritance of type, shared state and default methods.',
       'A payment provider contract needs several unrelated implementations. Explain which abstraction you would choose and why.',
       'Not applicable', 'Not applicable', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'java-fundamentals';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Immutable Class Design',
       'Design an immutable Java class that holds a list of tags and explain how defensive copying protects its invariants.',
       'MEDIUM', 'All fields must be final.
No mutable internal state may escape.',
       'A caller mutates the list passed to the constructor. The created object must not change.',
       'O(n) for defensive copies', 'O(n)', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'object-oriented-design';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Design a URL Shortener',
       'Design a service that maps long URLs to short codes, redirects visitors and handles collisions.',
       'MEDIUM', 'Reads vastly outnumber writes.
Short codes must be unique.',
       'A request for a short code returns a redirect to the original URL. Analytics should be optional.',
       'Not applicable', 'Not applicable', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'scalability-load-balancing';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Scale a Read-Heavy API',
       'A read-heavy API is approaching its database limit. Describe caching, replication and load-balancing options in priority order.',
       'HARD', 'Reads are 100x more frequent than writes.
Data may be slightly stale for a short period.',
       'Traffic doubles overnight. Explain which bottleneck you measure first and how you would keep latency stable.',
       'Not applicable', 'Not applicable', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'scalability-load-balancing';

INSERT INTO dsa_questions (topic_id, title, description, difficulty, constraints_text, examples_text,
                           expected_time_complexity, expected_space_complexity, practice_url, active, created_at, updated_at)
SELECT id, 'Design a Rate Limiter',
       'Design a rate limiter that protects an API from abuse while allowing legitimate bursts.',
       'MEDIUM', 'Limits are applied per user and per endpoint.
The solution must work across multiple application instances.',
       'A user sending 100 requests per second should be rejected after the configured limit while normal traffic continues.',
       'Not applicable', 'Not applicable', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM learning_topics WHERE slug = 'caching-data-stores';

INSERT INTO achievements (code, name, description) VALUES
    ('FIRST_TASK', 'First step', 'Complete your first daily plan task.'),
    ('STREAK_7', 'Seven-day streak', 'Keep a seven-day learning streak alive.'),
    ('XP_1000', 'Thousand XP club', 'Earn 1000 XP from completed tasks.'),
    ('CATEGORY_EXPLORER', 'Category explorer', 'Complete a task in more than one learning category.'),
    ('CONSISTENT_LEARNER', 'Consistent learner', 'Record activity on ten different days.');
