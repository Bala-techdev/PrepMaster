# PrepMaster Placement Preparation Platform Analysis

## Scope and assessment basis

This document analyzes the existing PrepMaster repository as it currently exists. It does not
change application code, database migrations, dependencies, or runtime behavior.

The repository is a two-application monorepo:

- Frontend: `Frontend/PrepMasterApp`
- Backend: `Backend/codingPlatfom/codingPlatfom`

The implementation uses React/Vite and JavaScript on the frontend, and Java 21/Spring Boot/JPA/
Spring Security/Flyway/MySQL on the backend. The backend has Hibernate schema validation enabled;
Flyway owns schema evolution.

## 1. Existing architecture

### Frontend

The frontend is a React SPA with:

- Vite build tooling and npm scripts (`dev`, `build`, `lint`, `preview`).
- React Router routes defined in `src/App.jsx`.
- Public authentication routes for login and registration.
- Protected routes wrapped by `ProtectedRoute`, `AuthProvider`, `AppDataProvider`, and
  `AppLayout`.
- Page-level components in `src/pages`.
- Reusable shell, form, feedback, progress, and navigation components in `src/components`.
- Axios service modules in `src/api`, using a shared Axios client and configurable
  `VITE_API_BASE_URL`.
- Account-backed server state in `AppDataContext`.
- Local UI/preferences/prototype state in `AppStateContext`, browser storage helpers, and
  theme utilities.
- CSS-based styling and design tokens in page/component stylesheets and `src/index.css`.

Current protected routes include:

`/dashboard`, `/daily-plan`, `/practice`, `/practice/:problemId`, `/mock-interview`, `/progress`,
`/learn`, nested learning/topic routes, `/community`, nested discussion routes, `/profile`, and
`/settings`.

### Backend

The backend follows a conventional layered Spring architecture:

```text
REST controllers
    -> application services
        -> Spring Data repositories
            -> JPA entities
```

Supporting packages provide request/response DTOs, mappers, validation, exception handling,
security, JWT configuration, and application configuration.

Key characteristics:

- Java 21 and Spring Boot 4.
- Spring MVC REST controllers.
- Spring Data JPA and Hibernate.
- MySQL runtime database.
- Flyway migrations in `src/main/resources/db/migration`.
- `spring.jpa.hibernate.ddl-auto=validate`.
- Stateless OAuth2 resource-server JWT authentication.
- BCrypt password hashing.
- CORS configured for local frontend ports 5173 and 5180.
- H2 test configuration and JUnit/Spring integration tests.

### Database

The six migrations currently cover:

1. Users.
2. User profile, settings, and streaks.
3. Learning LMS, DSA questions, daily plans, progress, activity, and achievements.
4. Seed learning content and DSA questions.
5. Mock interview templates, sessions, questions, answers, focus events, and results.
6. Community posts/comments/likes and notifications, plus notification and achievement
   extensions.

## 2. Existing implemented features

### Authentication and account management

- Registration and login APIs.
- BCrypt password storage.
- Account status checks.
- JWT access tokens with subject, issuer, email, issue time, and expiry.
- Frontend token persistence, session restoration, logout, expiry handling, and centralized
  unauthorized-session handling.
- User profile and settings APIs.
- Theme, notification, and preference controls.

### Learning and DSA preparation

- Learning categories, topics, resources, tags, and questions.
- Searchable/filterable/paginated DSA question catalog.
- Difficulty and topic classification.
- Constraints, examples, expected time/space complexity, practice URLs, and tags.
- Seeded learning curriculum and DSA content.
- Question detail pages and solved-question tracking.
- Frontend learning, category, topic, practice, and problem-detail pages.

### Personalized preparation workflow

- Daily plan generation and retrieval.
- Ordered daily-plan tasks and task completion.
- User-specific plan/task ownership checks.
- XP awards, levels, streaks, activity history, and category progress.
- Achievement definitions and user achievement state.
- Progress summaries for weekly, monthly, category, activity, and solved-question views.
- Leaderboard backend service/API.

### Mock interviews

- User-owned mock-interview templates.
- Interview categories and difficulty options.
- Session creation, active-session lookup, session retrieval, and timed expiry handling.
- Answer persistence, including answer text/code and language fields.
- Focus consent and focus-event tracking.
- Completion and cancellation.
- Result, history, and performance APIs.
- Frontend timed mock-interview workflow and result/history views.

### Community and engagement

- Community post listing, detail, creation, update, deletion, likes, comments, and activity.
- Community rate limiting.
- Notifications, unread count, mark-read, and mark-all-read APIs.
- Responsive application shell, sidebar, topbar, mobile navigation, empty/error/loading states,
  progress cards, activity heatmap, and reusable modal/feedback components.

### Resume scanner prototype

`src/pages/ResumeScanner.jsx` exists as a UI prototype with:

- Job-description textarea.
- PDF selection and drag-and-drop UI.
- Simulated 78% match score.
- Hardcoded matched and missing keyword pills.
- Static recommendation text.

It is not currently routed from `App.jsx`, linked in navigation, connected to an API, backed by
resume storage/parsing, or powered by an AI service.

## 3. Missing features

The following Placement Prep Hub capabilities are not present or are only represented by static
or local UI:

### AI capabilities

- No LLM/provider integration or provider abstraction.
- No prompt templates, model configuration, token/cost tracking, retries, or rate limits.
- No AI chatbot or contextual placement-preparation assistant.
- No AI-generated explanations, hints, question generation, or answer evaluation.
- No adaptive learning or AI-generated skill-gap roadmap.
- No AI interview feedback or behavioral-answer coaching.
- No AI resume tailoring or job-description-to-resume analysis.
- No embeddings, vector search, retrieval-augmented generation, or document chunking.

### Placement/job workflow

- No company catalog, job listing, role, hiring-drive, or eligibility model.
- No job matching or saved-job workflow.
- No application tracker, application statuses, reminders, or placement calendar.
- No company-specific preparation plans or role-specific question sets.
- No resume versions, resume history, export, or tailoring workflow.
- No recruiter/employer-facing workflow.

### Resume processing

- No secure file upload endpoint or object storage integration.
- No PDF text extraction/OCR.
- No structured resume parsing.
- No persisted resume metadata, extracted skills, or document versioning.
- No real match-scoring algorithm or explainable scoring breakdown.

### Code execution

The repository has DSA content and mock-interview code-answer storage, but no code execution
platform:

- No submission endpoint.
- No test-case model or execution-result model.
- No compiler/runtime integration.
- No sandbox/container isolation.
- No language registry, resource limits, verdicts, compile errors, or execution metrics.
- No plagiarism/security scanning.

### Administration

- No admin controller, service, repository, or admin UI.
- No role field/authority mapping on users.
- No content moderation or approval flow.
- No user management, achievement management, analytics administration, or audit trail.
- Learning write endpoints are authenticated but not restricted to administrators.

### Account/security product gaps

- No refresh-token rotation or revocation.
- No logout token invalidation on the backend.
- No password reset or email verification.
- No social login or MFA.
- No API versioning or generated OpenAPI contract was found.

## 4. Features requiring modification

The existing architecture should be extended rather than replaced.

### Frontend changes

1. Add a routed Placement Hub entry and page, reusing `AppLayout`, existing page-state
   primitives, authentication, theme, and API client.
2. Convert the resume scanner from hardcoded simulation to a service-backed workflow.
3. Add an AI assistant surface that consumes a backend API rather than calling an LLM directly
   from the browser.
4. Add placement-specific pages for jobs, applications, company preparation, and AI roadmap
   results.
5. Extend `AppDataContext` only for shared placement data; keep feature-local transient state in
   feature components/hooks.
6. Move mock-interview API imports consistently to `mockInterviewService.js`; avoid duplicating
   API functions in `client.js`.
7. Decide whether community and interview data are server-authoritative. The current mixture of
   browser-local and backend state should be normalized before adding cross-device placement
   workflows.
8. Expose the existing leaderboard service through a route/page if leaderboard functionality is
   part of the Placement Hub.

### Backend changes

1. Add placement-domain controllers/services/repositories/DTOs using the existing package
   conventions.
2. Add an AI gateway service with a provider-neutral interface, timeouts, structured responses,
   usage limits, and explicit failure handling.
3. Add resume upload, parsing, analysis, and recommendation orchestration.
4. Add job/company/application domain services and ownership checks.
5. Add role/authority support before implementing admin endpoints.
6. Restrict learning content mutations and future moderation endpoints to an explicit admin
   authority.
7. Add asynchronous processing where PDF parsing or AI calls could exceed normal HTTP timeouts.
8. Add integration tests for ownership, authorization, AI failures, upload validation, and
   persistence.

## 5. Database changes required

These are proposed additions, not changes to apply in this analysis phase.

### Core placement tables

- `companies`: company identity, slug, sector, locations, website, active status.
- `job_roles` or `job_postings`: title, company, description, required skills, experience,
  location, employment type, source, active/closing dates.
- `user_saved_jobs`: user/job relationship and saved timestamp.
- `job_applications`: user/job relationship, status, notes, applied date, next action, reminder
  date, and timestamps.
- `placement_plans`: user/job/role-specific preparation plan metadata.
- `placement_plan_items`: ordered links to learning topics, DSA questions, mock interviews, or
  recommendations.

### Resume and analysis tables

- `resumes`: user, storage key, original filename, content type, size, checksum, status, and
  timestamps.
- `resume_versions`: parsed text/structured snapshot and version status.
- `resume_skills`: normalized extracted skills and confidence.
- `resume_analyses`: resume, job/role, score, status, model metadata, and failure details.
- `resume_analysis_keywords`: matched/missing/related keywords with evidence and confidence.

Raw resumes should be stored in object storage or a controlled file service; the database should
retain metadata and a non-sensitive storage reference rather than large binary content.

### AI and observability tables

- `ai_prompts` or versioned prompt templates.
- `ai_requests`: user, feature, provider/model, status, latency, token usage, and cost metadata.
- `ai_recommendations`: recommendation type, source analysis, structured payload, and lifecycle.
- Optional `document_chunks` and `document_embeddings` only if semantic retrieval is required.

AI request logs must not persist secrets or unnecessary resume/PII content.

### Schema rules

- Add a new Flyway migration for each coherent schema change.
- Preserve existing tables and IDs.
- Add foreign keys, ownership indexes, status constraints, and uniqueness constraints.
- Keep Hibernate at `ddl-auto=validate`.
- Define retention/deletion behavior for resumes, parsed text, AI requests, and embeddings.

## 6. New dependencies required

No new dependency is required for the existing application or for this analysis document.

For implementation, prefer the smallest dependency set:

### Backend candidates

- An HTTP client already supported by the Spring stack for provider calls, or Spring's configured
  HTTP client.
- A PDF text-extraction library such as Apache PDFBox if parsing is performed in the backend.
- An object-storage SDK only if uploads are stored outside the application filesystem.
- A provider SDK only after selecting the AI provider and confirming licensing, data handling,
  and operational requirements.
- A database migration only through Flyway, not Hibernate generation.

### Frontend

The existing React, Axios, router, icon, and CSS stack is sufficient initially. Avoid adding a
second state-management library or an AI SDK to the browser. The browser should call the secured
backend API.

## 7. New API endpoints required

All endpoints should follow current `/api/...` conventions, use authenticated user identity from
the JWT, and enforce ownership at the service/repository layer.

### Placement and jobs

```text
GET    /api/placement/overview
GET    /api/placement/recommendations
GET    /api/companies
GET    /api/companies/{companyId}
GET    /api/jobs
GET    /api/jobs/{jobId}
POST   /api/jobs/{jobId}/save
DELETE /api/jobs/{jobId}/save
GET    /api/applications
POST   /api/applications
PUT    /api/applications/{applicationId}
DELETE /api/applications/{applicationId}
```

### Resume and analysis

```text
POST   /api/resumes
GET    /api/resumes
GET    /api/resumes/{resumeId}
DELETE /api/resumes/{resumeId}
POST   /api/resumes/{resumeId}/analyses
GET    /api/resumes/{resumeId}/analyses/{analysisId}
```

For long-running parsing/AI work, return a job/analysis resource with `PENDING`, `RUNNING`,
`COMPLETED`, and `FAILED` states. Do not expose provider credentials or raw provider payloads.

### AI assistant and preparation

```text
POST   /api/ai/chat
POST   /api/ai/explanations
POST   /api/ai/interview-feedback
GET    /api/placement/roadmap
POST   /api/placement/roadmap/rebuild
```

These endpoints need request-size limits, per-user rate limits, structured DTO validation, and
explicit fallback/error responses.

### Administration

```text
GET    /api/admin/users
PATCH  /api/admin/users/{userId}/status
GET    /api/admin/content
POST   /api/admin/companies
POST   /api/admin/jobs
PATCH  /api/admin/jobs/{jobId}
DELETE /api/admin/jobs/{jobId}
GET    /api/admin/ai/usage
GET    /api/admin/audit-events
```

Admin endpoints should be added only after authorities are modeled and mapped correctly.

## 8. Security considerations

### Existing strengths

- Stateless JWT resource-server configuration.
- BCrypt password encoder.
- Authenticated-by-default routes.
- CORS allowlist rather than wildcard origins.
- User ownership queries in several repositories.
- JWT secret and database credentials are environment-configurable.
- Validation-only Hibernate schema mode.

### Required hardening before Placement Hub work

1. Remove reliance on the default JWT secret in deployed environments and fail fast when
   `JWT_SECRET` is absent or not sufficiently strong outside an explicitly local profile.
2. Add a user role/authority model and map authorities into the JWT authentication context.
   The current `hasRole("ADMIN")` matcher has no corresponding user role or authority mapping.
3. Restrict current learning write endpoints to administrators or a deliberate content-manager
   authority.
4. Validate upload MIME type, extension, size, PDF structure, filename, and content scanning.
5. Store uploads outside the web root with generated storage keys and authorization checks.
6. Redact resume text, tokens, passwords, provider responses, and personal data from logs.
7. Protect AI endpoints with authentication, quotas, rate limits, request-size limits, and
   abuse monitoring.
8. Enforce ownership for resumes, analyses, jobs saved by users, applications, chat history, and
   recommendations.
9. Add retention and deletion controls for resumes and AI-derived data.
10. Use provider-side data controls appropriate for personal resumes and job applications.
11. Add audit events for admin changes, content changes, and sensitive document operations.
12. Consider refresh-token rotation, revocation, password reset, email verification, and MFA as
    separate account-security initiatives.

## 9. Integration risks

### High risk

- **AI privacy and cost:** resumes and job descriptions contain personal data; uncontrolled
  prompts can leak data and create unpredictable provider costs.
- **Unimplemented authorization:** admin route matching exists, but roles/authorities do not.
- **File processing:** PDF parsing can be CPU/memory intensive and unsafe if handled synchronously
  or without size/content limits.
- **Missing code execution isolation:** adding code execution without a hardened sandbox would
  create a severe remote-code-execution risk.
- **State inconsistency:** browser-local community/interview state and backend state can diverge
  across devices and sessions.

### Medium risk

- **Schema growth:** placement, resume, AI, and job tables introduce many relationships and
  retention requirements; migrations must be staged and indexed.
- **Long-running requests:** AI and document processing may exceed the current synchronous REST
  request model.
- **Provider coupling:** direct provider SDK usage would make model replacement and testing
  difficult.
- **API contract drift:** there is no generated OpenAPI contract; frontend and backend DTO changes
  require coordinated tests.
- **Existing static seed data:** local fallback data can mask missing backend integrations during
  development.
- **Bundle size:** the production frontend already emits a chunk above Vite's 500 kB warning
  threshold; adding feature screens should avoid importing large client SDKs.

### Lower risk

- Existing layered architecture is suitable for incremental placement modules.
- Existing authentication, Axios normalization, Flyway workflow, DTO conventions, and test
  setup provide reusable foundations.
- Existing mock-interview and progress domains can be linked from placement plans rather than
  duplicated.

## 10. Recommended implementation order

### Phase 0: baseline and contracts

1. Preserve the current application and document API/domain ownership.
2. Add/confirm frontend and backend integration tests for existing flows.
3. Define placement-domain DTOs and API error/status conventions.
4. Add OpenAPI documentation or equivalent contract tests.

### Phase 1: security and platform foundations

1. Implement explicit user roles and JWT authority mapping.
2. Restrict admin/content mutations.
3. Add upload limits, storage abstraction, rate limiting, audit events, and retention policies.
4. Add provider-neutral AI gateway interfaces and configuration validation.

### Phase 2: placement data model

1. Add companies, jobs, saved jobs, applications, and placement-plan migrations.
2. Implement ownership-aware services/repositories and CRUD APIs.
3. Add frontend pages using existing layout, auth, API client, and feedback components.

### Phase 3: resume workflow

1. Add secure resume upload and metadata/version APIs.
2. Add PDF extraction and structured resume parsing.
3. Add job-description and keyword analysis with deterministic baseline scoring.
4. Replace the disconnected `ResumeScanner.jsx` simulation with the real asynchronous API.

### Phase 4: AI augmentation

1. Add AI-powered recommendations behind the provider abstraction.
2. Add prompt versioning, usage/cost telemetry, retries, timeouts, and redaction.
3. Add AI explanations, roadmap generation, resume tailoring, and interview feedback.
4. Add evaluation fixtures and deterministic fallback behavior for provider outages.

### Phase 5: company preparation and tracking

1. Add company-specific preparation plans linked to existing learning, DSA, and mock-interview
   entities.
2. Add application tracking, reminders, placement overview, and notifications.
3. Add recruiter/admin content workflows after authority enforcement is complete.

### Phase 6: advanced capabilities

1. Add semantic search/RAG only when keyword and structured retrieval are insufficient.
2. Add adaptive learning recommendations based on existing progress and interview results.
3. Add code execution only as a separately threat-modeled, sandboxed subsystem.
4. Add production observability, load testing, privacy review, and disaster-recovery procedures.

## Baseline verification

At analysis time:

- Frontend production build passes.
- Frontend lint completes with existing warning-level findings.
- Backend Maven tests pass.
- Backend compilation passes.

The backend requires a reachable MySQL instance and environment-specific configuration for a
normal application startup. Existing tests use the separate H2 test configuration.

