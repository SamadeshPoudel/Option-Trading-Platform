# HTTP Server

The **HTTP Server** is the entry point for frontend client interactions in the Option Trading Platform. It handles user authentication, trade execution, and account management (balance, orders).

## Key Features

### 1. Security & Authentication
- **Better Auth**: Implements secure authentication using `better-auth` with Google OAuth provider.
- **Session Management**: Uses PostgreSQL (via Prisma Adapter) to persist user sessions.
- **Middleware**: `requireAuth` middleware protects sensitive routes by validating sessions from request headers.
- **Rate Limiting**: Protects against abuse using `express-rate-limit`.
  - **Trust Proxy**: Configured (`app.set('trust proxy', 1)`) to work correctly behind Docker/Nginx reverse proxies.
  - **Limits**: Authenticated trade routes are limited to **20 requests per minute** per IP.
  - **CORS**: Configured to allow requests from the frontend (`http://localhost:5173` in dev, `https://delta.samadesh.com` in prod).

### 2. Trade Execution Flow
The server uses an asynchronous, event-driven architecture with Redis Streams to handle high-throughput trading:

1.  **Order Creation** (`POST /api/trade/create`):
    - Validates payload (Asset, Type, Margin, Leverage) using **Zod**.
    - Publishes the order to the `trade` Redis Stream.
    - **Long Polling Response**: Instead of immediately returning, it subscribes to a Redis channel (unique `orderId`) and waits for the **Engine** to process the order.
    - **Timeout**: If the Engine doesn't respond within 5 seconds, it returns a timeout error to prevent hanging requests.

2.  **Order Closing** (`POST /api/trade/close`):
    - Similar flow: Validates `orderId`, pushes `CLOSE_ORDER` event to Redis Stream, and waits for confirmation.

### 3. Data Fetching
- **Balance & Open Orders**:
    - Fetches real-time data by requesting it from the Engine via Redis Stream.
    - Uses the same request-response pattern: Push request -> Subscribe to response channel -> Return data to frontend.
- **Historical Data**:
    - Proxies requests to **Backpack Exchange API** to fetch candlestick (K-line) data for charts, avoiding CORS issues on the frontend.

## API Routes

| Method | Endpoint | Description | Auth Required | Rate Limited |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/trade/create` | Open a new option trade | ✅ | ✅ |
| `POST` | `/api/trade/close` | Close an existing position | ✅ | ✅ |
| `GET` | `/api/balance` | Get user wallet balance | ✅ | ❌ |
| `GET` | `/api/open-orders` | Get active positions | ✅ | ❌ |
| `GET` | `/api/closed-orders` | Get trade history (from DB) | ✅ | ❌ |
| `GET` | `/api/candles` | Proxy for market chart data | ❌ | ❌ |
| `GET` | `/health` | Server health check | ❌ | ❌ |

## Setup & Running

**Prerequisites:**
- Redis (for streams/pubsub)
- PostgreSQL (for auth/data persistence)

**Install Dependencies:**
```bash
bun install
```

**Run Database Migrations:**
```bash
bunx prisma generate
bunx prisma migrate dev
```

**Start the Server:**
```bash
bun run index.ts
```
