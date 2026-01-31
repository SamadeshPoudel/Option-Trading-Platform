# DB Worker

The **DB Worker** is a background microservice responsible for asynchronous data persistence. It decouples high-latency database operations from the high-performance trading engine.

## Architecture & Purpose

In a high-frequency trading platform, writing to a disk-based database (like PostgreSQL) during the critical path of order execution is too slow. The **Engine** operates entirely in-memory for speed.

The **DB Worker** solves the persistence problem by:
1.  Acting as a **Consumer** in a Redis Consumer Group.
2.  Listening to the `engine-response` stream.
3.  Asynchronously writing completed trades to the PostgreSQL database.

This ensures that even if the engine crashes (and its in-memory snapshot is lost/corrupted), the historical trade data is safely stored in the relational database.

## Data Flow

1.  **Engine**: Executes a trade or processes a liquidation.
2.  **Engine**: Publishes the result to `engine-response` Redis stream.
3.  **DB Worker**:
    - Reads the message using `xReadGroup` (ensuring exactly-once processing).
    - Parses the JSON payload.
    - Uses **Prisma ORM** to insert a new record into the `ClosedOrders` table.
    - **ACKs** the message in Redis to confirm successful processing.

## Key Features

- **Reliability**: Uses Redis Consumer Groups (`db-worker-group`) to ensure no message is lost. If the worker crashes mid-process, the unacknowledged message remains pending and will be re-processed upon restart.
- **Scalability**: You can run multiple instances of the DB Worker to increase write throughput without changing the architecture.
- **Tech Stack**:
    - **Runtime**: Bun
    - **Queue**: Redis Streams
    - **ORM**: Prisma (PostgreSQL)

## Setup & Running

**Prerequisites:**
- Redis
- PostgreSQL Database (with schema migrated)

**Install Dependencies:**
```bash
bun install
```

**Generate Prisma Client:**
```bash
bunx prisma generate
```

**Run the Worker:**
```bash
bun run index.ts
```
