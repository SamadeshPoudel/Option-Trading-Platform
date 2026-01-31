# Poller Service

The **Poller** service is a critical component of the Option Trading Platform. Its primary responsibility is to fetch real-time market data from the **Backpack Exchange**, process it, and broadcast it to both the backend (via Redis) and the frontend (via WebSockets).

## How It Works

### 1. Connecting to Backpack Exchange
The service establishes a WebSocket connection to the Backpack API (`process.env.BACKPACK_API`).
- **On Connect**: It immediately sends a `SUBSCRIBE` message for the following assets:
  - `SOL_USDC`
  - `BTC_USDC`
  - `ETH_USDC`

### 2. Robust Reconnection Logic
To ensure 24/7 reliability in production, the service implements an auto-reconnection mechanism:
- If the WebSocket connection to Backpack is closed (e.g., due to network issues or server resets), the `close` event listener checks this.
- It triggers a `setTimeout` of **3 seconds**.
- After 3 seconds, it recursively calls `connectToBackpack()`, attempting to re-establish the connection.
- This loop continues until the connection is back online, preventing the service from getting stuck in a disconnected state.

### 3. Data Processing & Redis Streaming
When a price update (`bookTicker`) is received:
1. **Spread Calculation**: The service applies a "house spread" to the raw market prices:
   - **Ask Price**: Multiplied by `0.999` (simulating a lower buying price for the platform).
   - **Bid Price**: Multiplied by `1.001` (simulating a higher selling price).
   - Values are truncated to 4 decimal places.
2. **Redis Stream**: The processed payload is added to a Redis Stream named `trade`. This allows the **Engine** service to consume price updates asynchronously for order matching.

### 4. Broadcasting to Frontend (WebSocket Server)
The Poller runs its own WebSocket server on **port 8080** to stream real-time prices directly to the frontend.

#### **Subscription Architecture**
To manage efficient data delivery, it uses a **Subscription Table**:
```typescript
const subscriptionTable = new Map<string, WebSocket[]>()
```
- **Key**: Asset pair name (e.g., "SOL").
- **Value**: Array of connected WebSocket clients interested in that asset.

#### **Client Interaction Flow**:
1. **Connect**: Frontend connects to `ws://<poller-ip>:8080`.
2. **Subscribe**: Client sends a JSON message:
   ```json
   { "action": "SUBSCRIBE", "asset": "SOL" }
   ```
   - The server adds the client's WebSocket instance to the `subscriptionTable` entry for "SOL".
3. **Broadcasting**: When a price update for "SOL" arrives from Backpack:
   - The server looks up "SOL" in the `subscriptionTable`.
   - It iterates through the list of WebSockets and sends the updated payload to each one.
4. **Unsubscribe/Disconnect**:
   - If a client sends an unsubscribe message or disconnects, the server automatically removes their WebSocket from the table to prevent memory leaks and "dead socket" errors.

---

## 🛠️ Setup & Running

**Install Dependencies:**
```bash
bun install
```

**Run the Service:**
```bash
bun run index.ts
```
