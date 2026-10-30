# PrepMaster backend

## Run locally

Use Java 21 and run:

```powershell
.\mvnw.cmd spring-boot:run
```

The application uses MySQL by default. Set `DB_URL`, `DB_USERNAME`, and
`DB_PASSWORD` for the database, and set `JWT_SECRET` to a random value of at
least 32 bytes. `JWT_EXPIRATION_SECONDS` defaults to 900 seconds. The
development fallback JWT secret is not suitable for deployment.

Tests use the separate in-memory H2 configuration:

```powershell
.\mvnw.cmd clean test
```

## Authentication API

### Register

`POST /api/auth/register`

```json
{
  "displayName": "Alice Stone",
  "email": "alice@example.com",
  "password": "StrongPass1"
}
```

Passwords must be 8-72 characters and contain upper-case, lower-case, and
numeric characters. Email addresses are trimmed and normalized to lower case.

### Login

`POST /api/auth/login`

```json
{
  "email": "alice@example.com",
  "password": "StrongPass1"
}
```

Both successful authentication endpoints return:

```json
{
  "tokenType": "Bearer",
  "accessToken": "<signed JWT>",
  "expiresIn": 900,
  "expiresAt": "2026-10-30T12:17:00Z",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "username": "alice",
    "displayName": "Alice Stone",
    "status": "ACTIVE"
  }
}
```

Send the token to protected APIs as:

```text
Authorization: Bearer <accessToken>
```

`GET /api/users/me` is a protected example endpoint. Only the authentication
endpoints, `GET /api/health` (when added), and CORS preflight requests are
public.

## Phase 3 LMS API

Flyway migration `V3__create_learning_lms.sql` creates the learning catalog,
daily plans, completion ledger, progress/activity records, and achievement
foundation. Hibernate remains in `ddl-auto=validate` mode.

All endpoints below require the same `Authorization: Bearer <accessToken>`
header unless noted.

### Learning content

* `GET /api/learning/categories`
* `POST|PUT|DELETE /api/learning/categories[/{id}]`
* `GET /api/learning/categories/{categoryId}/topics`
* `POST /api/learning/topics`
* `GET /api/learning/topics/{topicId}/resources`
* `POST /api/learning/resources`
* `POST /api/learning/tags`
* `GET /api/learning/questions?difficulty=MEDIUM&topicId=1&page=0&size=20`
* `POST /api/learning/questions`

Example question request:

```json
{
  "topicId": 1,
  "title": "Two Sum",
  "description": "Find two indices whose values add to the target.",
  "difficulty": "EASY",
  "constraints": "n <= 100000",
  "examples": "nums=[2,7], target=9",
  "expectedTimeComplexity": "O(n)",
  "expectedSpaceComplexity": "O(n)",
  "practiceUrl": "https://example.com/two-sum",
  "tagIds": []
}
```

### Daily plans and progress

`POST /api/plans/daily` generates or returns the authenticated user's plan for
the current date in the user's configured timezone:

```json
{"taskCount": 3, "categoryIds": [1, 2]}
```

Use `GET /api/plans/{id}` to retrieve tasks and
`POST /api/plans/tasks/{taskId}/complete` to complete an available task.
Tasks begin as `AVAILABLE` or `LOCKED`; completing a task unlocks only the
next task. Completion is idempotent and returns:

```json
{"taskId": 10, "completedAt": "2026-10-30T12:30:00Z", "xpAwarded": 25}
```

Progress endpoints are `GET /api/progress`,
`GET /api/progress/activity?from=2026-10-01&to=2026-10-30`,
`GET /api/progress/categories`, `/weekly`, and `/monthly`.
`GET /api/achievements` exposes the achievement foundation. XP is calculated
server-side (easy 10, medium 25, hard 50); level is derived from total XP,
and streaks use the user's timezone. A missed calendar day resets the current
streak to one on the next activity while preserving the longest streak.
