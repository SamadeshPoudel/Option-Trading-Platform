# Trading Engine

The **Engine** is the core logic unit of the Option Trading Platform. It handles all trading operations, including order placement, execution, PnL calculations, position management, and auto-liquidation. It is designed as a single-threaded, high-performance in-memory matching engine.

## Core Architecture

The engine operates entirely **in-memory** for maximum speed, using native JavaScript maps to store state. It communicates with other services asynchronously via **Redis Streams** and **Pub/Sub**.

### 1. In-Memory State
- **`userBalance`**: A `Map<string, number>` storing wallet balances for each user.
- **`openOrders`**: A `Map<string, Trade[]>` storing active positions for each user.
- **`latestPrice`**: A `Map<string, Price>` storing the most recent market price for assets (updated by the Poller).

### 2. Event-Driven Loop (Redis Streams)
The engine listens to the `trade` Redis Stream and processes events sequentially:

- **`CREATE_ORDER`**:
    - Checks if the user has sufficient balance.
    - Locks the margin amount (deducts from balance).
    - access `latestPrice` to determine the entry price.
    - Creates a new position object with leverage and open price.
    - Publishes the success/failure result to a Redis channel (ID: `orderId`).

- **`CLOSE_ORDER`**:
    - Locates the order in the `openOrders` map.
    - Calculates **PnL** (Profit and Loss) based on the difference between `openPrice` and current market price.
    - Credited Amount = `Margin + PnL`.
    - Updates the user's balance and removes the order from the list.

- **`PRICE_UPDATE`**:
    - Updates the `latestPrice` map.
    - **Crucial**: Triggers the **Liquidation Engine** to check all open positions against the new price.

- **`CHECK_BALANCE` / `CHECK_OPEN_ORDERS`**:
    - Returns the current state of a user's account.
    - *Note*: New users are automatically initialized with a demo balance of **5000** units.

### 3. Liquidation Engine 
Every time a price update is received, the engine checks every open position to ensure it remains solvent.
- **Formula**: `changePercentage > (90 / leverage)`
- If a position's loss exceeds **90%** of the margin (adjusted for leverage), it is **automatically liquidated**.
- The position is forcibly closed at the current market price to prevent the user from going into negative balance.

### 4. Persistence & Crash Recovery 
Since the state is in-memory, a crash would normally wipe out all user balances and positions. To prevent this, the engine implements a **Snapshot System**:
- **`takeSnapshot`**: Every **3 seconds**, the entire `userBalance` and `openOrders` maps are serialized and saved to `snapshot.json`.
- **`loadSnapshot`**: On startup, the engine reads `snapshot.json` and restores the state, ensuring continuity.

## Setup & Running

**Prerequisites:**
- Redis (must be running on `REDIS_URL` or default localhost:6379)

**Install Dependencies:**
```bash
bun install
```

**Run the Engine:**
```bash
bun run index.ts
```

## 🔄 Data Flow Example (Long Position)
1. **User** requests a **10x Long** on SOL at $100.
2. **Engine** calculates exposure and locks margin.
3. Market price drops to **$91**.
4. **Poller** sends `PRICE_UPDATE` ($91).
5. **Engine** calculates:
   - Price drop = 9%
   - Loss with 10x leverage = 90%
   - **Result**: Liquidation condition met. Order closed immediately.
