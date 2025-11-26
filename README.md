# Event Ticket Booking System

This project implements a Node.js Express server for booking event tickets with:

- In-memory concurrency-safe store for event state (fast operations)
- Persistence of order records to SQLite via Knex migrations
- RESTful API endpoints for initialize, book, cancel, and status
- Unit and integration tests (Jest + Supertest)

## Quickstart

Requirements: Node.js 18+ (or Node.js LTS), npm

1. Install dependencies

```powershell
npm install
```

2. Run migrations (creates `dev.sqlite3` for development)

```powershell
npm run migrate
```

3. Start the server

```powershell
npm start
```

The server listens on port 3000 by default.

## API

All endpoints accept and return JSON.

1) POST /initialize

Initialize a new event with available tickets.

Request body:

{
  "eventId": "string",
  "tickets": number
}

Response: 200

{
  "eventId": "string",
  "tickets": number
}

2) POST /book

Book a ticket for a user. If tickets are sold out, the user is added to the waiting list.

Request body:

{
  "eventId": "string",
  "userId": "string"
}

Response: 200

When assigned:
{
  "assigned": true
}

When placed on waiting list:
{
  "assigned": false
}

3) POST /cancel

Cancel a user's booking or waiting-list entry. If a ticket becomes available and the waiting list is non-empty, the next user is automatically assigned.

Request body:

{
  "eventId": "string",
  "userId": "string"
}

Response: 200

{
  "reassignedTo": "string|null"
}

4) GET /status/:eventId

Retrieve current event status.

Response: 200

{
  "eventId": "string",
  "total": number,
  "available": number,
  "waitingList": number
}

## Testing

Run the test suite (uses in-memory SQLite DB for tests):

```powershell
npm test
```

## Design notes

- The service uses a per-event mutex (async-mutex) so booking/cancellation are safe under concurrency without a global lock.
- Orders are persisted to an `orders` table (status: `booked`, `waiting`, `cancelled`) for audit/history.
- The in-memory store keeps runtime state for performance; persistence is used for order records only.


## Basic authentication

The `POST /initialize` and `POST /cancel` endpoints are protected by simple HTTP Basic Auth. By default the credentials are:

- user: `admin`
- pass: `password`

To change, set environment variables before starting the server:

```powershell
$env:ADMIN_USER = 'youruser'; $env:ADMIN_PASS = 'yourpass'; npm start
```

The basic auth is disabled automatically when running tests (NODE_ENV=test).

## Token-based authentication

You can exchange admin Basic Auth credentials for a JWT token by POSTing to `/auth/token` with Basic Auth headers. The returned token should be used as a Bearer token for protected endpoints.

Example (PowerShell):

```powershell
# Get a token using Basic Auth
$token = (Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/token -Headers @{ Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('admin:password')) }).token
# Use token to call protected endpoint
Invoke-RestMethod -Method Post -Uri http://localhost:3000/initialize -Body (@{eventId='ev1'; tickets=5} | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Authorization = 'Bearer ' + $token }
```

Configure the JWT secret and expiration with env vars:

```powershell
$env:AUTH_SECRET = 'change-me'; $env:TOKEN_EXP = '1h'; npm start
```

## Web UI

A small web UI is available at <code>/ui</code>. It provides forms to initialize events (admin), book tickets, cancel bookings and check event status.

Start the server and open http://localhost:3000/ui in your browser.

