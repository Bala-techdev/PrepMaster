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
