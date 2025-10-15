import 'dotenv/config';
import { db } from './db/index.js';
import { users, rooms, roomMembers, posts, answers, votes } from './db/schema.js';
import { markdownToText } from './util/markdown.js';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const [user1, user2, user3] = await db.insert(users).values([
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'bob@example.com',
      name: 'Bob Smith',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'charlie@example.com',
      name: 'Charlie Brown',
    },
  ]).returning();

  console.log('✅ Created users');

  // Create demo room
  const [room] = await db.insert(rooms).values({
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Introduction to Algorithms',
    slug: 'intro-to-algos',
    createdBy: user1.id,
  }).returning();

  console.log('✅ Created room');

  // Add room members
  await db.insert(roomMembers).values([
    { userId: user1.id, roomId: room.id, role: 'owner' },
    { userId: user2.id, roomId: room.id, role: 'member' },
    { userId: user3.id, roomId: room.id, role: 'member' },
  ]);

  console.log('✅ Added room members');

  // Create demo posts
  const postData = [
    {
      id: '00000000-0000-0000-0000-000000000100',
      title: 'How do I implement binary search?',
      bodyMarkdown: `I'm trying to understand binary search but I'm having trouble with the implementation.

Here's what I have so far:

~~~python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
~~~

Is this correct? What am I missing?`,
      authorId: user2.id,
    },
    {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Time complexity of merge sort',
      bodyMarkdown: `Can someone explain why merge sort has O(n log n) time complexity?

I understand that:
- We divide the array in half each time (log n levels)
- At each level, we merge n elements

But I'm not sure how to prove this mathematically.`,
      authorId: user1.id,
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      title: 'Best way to implement a hash table',
      bodyMarkdown: `I need to implement a hash table for my project. What's the best approach?

Considerations:
- Need to handle collisions
- Should be efficient for both insertions and lookups
- Will store string keys with integer values

Any recommendations for collision resolution strategies?`,
      authorId: user3.id,
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      title: 'Understanding Big O notation',
      bodyMarkdown: `I'm struggling with Big O notation. Can someone give me a simple explanation?

For example:
- O(1) - constant time
- O(n) - linear time
- O(n²) - quadratic time

How do I determine the Big O of my algorithms?`,
      authorId: user2.id,
    },
    {
      id: '00000000-0000-0000-0000-000000000104',
      title: 'Dynamic programming: Fibonacci sequence',
      bodyMarkdown: `I'm learning dynamic programming and starting with the Fibonacci sequence.

Naive recursive approach:
~~~python
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)
~~~

This has exponential time complexity. How can I optimize it using dynamic programming?`,
      authorId: user1.id,
    },
  ];

  const createdPosts = await db.insert(posts).values(
    postData.map(post => ({
      ...post,
      roomId: room.id,
      bodyText: markdownToText(post.bodyMarkdown),
    }))
  ).returning();

  console.log('✅ Created posts');

  // Create answers for some posts
  const answerData = [
    {
      postId: createdPosts[0].id,
      bodyMarkdown: `Your binary search implementation looks correct! Here are a few things to note:

1. **Correctness**: Your logic is sound - you're properly updating the search space by half each iteration.

2. **Edge cases**: Make sure your array is sorted before calling this function.

3. **Integer overflow**: In languages like C++, you might want to use \`mid = left + (right - left) / 2\` to avoid overflow.

4. **Alternative approach**: You could also use recursion if you prefer:

~~~python
def binary_search_recursive(arr, target, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)
~~~

Your implementation is O(log n) time complexity, which is optimal!`,
      authorId: user1.id,
    },
    {
      postId: createdPosts[0].id,
      bodyMarkdown: `Great question! Your implementation is actually correct.

One small optimization you could consider is using bit shifting for the division:

~~~python
mid = (left + right) >> 1
~~~

But for most practical purposes, your current implementation is perfectly fine and very readable.`,
      authorId: user3.id,
    },
    {
      postId: createdPosts[1].id,
      bodyMarkdown: `Great question! Let me break down the O(n log n) complexity for merge sort:

## The Analysis

**Divide Phase**:
- We split the array in half each time
- This creates log₂(n) levels of recursion

**Conquer Phase**:
- At each level, we need to merge all elements
- Level 0: merge n elements
- Level 1: merge n/2 + n/2 = n elements
- Level 2: merge n/4 + n/4 + n/4 + n/4 = n elements
- And so on...

**Total Work**:
- log₂(n) levels × n work per level = O(n log n)

## Visual Example
For an array of size 8:
~~~
Level 0: [8 elements] → merge 8 elements
Level 1: [4,4] → merge 4+4=8 elements
Level 2: [2,2,2,2] → merge 2+2+2+2=8 elements
Level 3: [1,1,1,1,1,1,1,1] → merge 1+1+...+1=8 elements
~~~

Each level does O(n) work, and there are O(log n) levels!`,
      authorId: user2.id,
    },
    {
      postId: createdPosts[4].id,
      bodyMarkdown: `Excellent question! Here's how to optimize the Fibonacci sequence using dynamic programming:

## Memoization Approach
~~~python
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]
~~~

## Tabulation Approach
~~~python
def fib_tab(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
~~~

## Space-Optimized Version
~~~python
def fib_optimized(n):
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for i in range(2, n + 1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr
    return prev1
~~~

**Time Complexity**: O(n) instead of O(2^n)
**Space Complexity**: O(1) for the optimized version!`,
      authorId: user3.id,
    },
  ];

  const createdAnswers = await db.insert(answers).values(
    answerData.map(answer => ({
      ...answer,
      authorId: answer.authorId,
      bodyText: markdownToText(answer.bodyMarkdown),
    }))
  ).returning();

  console.log('✅ Created answers');

  // Create some random votes
  const voteData = [
    // Votes on posts
    { userId: user1.id, entityType: 'post' as const, entityId: createdPosts[0].id, value: 1 },
    { userId: user2.id, entityType: 'post' as const, entityId: createdPosts[0].id, value: 1 },
    { userId: user3.id, entityType: 'post' as const, entityId: createdPosts[1].id, value: 1 },
    { userId: user1.id, entityType: 'post' as const, entityId: createdPosts[2].id, value: 1 },
    { userId: user2.id, entityType: 'post' as const, entityId: createdPosts[4].id, value: 1 },

    // Votes on answers
    { userId: user2.id, entityType: 'answer' as const, entityId: createdAnswers[0].id, value: 1 },
    { userId: user3.id, entityType: 'answer' as const, entityId: createdAnswers[0].id, value: 1 },
    { userId: user1.id, entityType: 'answer' as const, entityId: createdAnswers[1].id, value: 1 },
    { userId: user1.id, entityType: 'answer' as const, entityId: createdAnswers[2].id, value: 1 },
    { userId: user2.id, entityType: 'answer' as const, entityId: createdAnswers[3].id, value: 1 },
  ];

  await db.insert(votes).values(voteData);

  console.log('✅ Created votes');

  console.log('🎉 Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`   - 3 users`);
  console.log(`   - 1 room (intro-to-algos)`);
  console.log(`   - 5 posts`);
  console.log(`   - 4 answers`);
  console.log(`   - 10 votes`);
}

seed().catch(console.error);
