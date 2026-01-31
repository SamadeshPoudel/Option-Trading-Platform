# Frontend Client

The **Frontend** is a modern, high-performance single-page application (SPA) built with **React** and **Vite**. It provides the user interface for the Option Trading Platform, featuring real-time charts, live price updates, and instant trade execution.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Radix UI (Headless accessible components)
- **State Management**: Zustand
- **Charting**: Lightweight Charts (TradingView)
- **Auth**: Better Auth (React Client)
- **Icons**: Lucide React + React Icons

## Architecture & Data Flow

### 1. State Management (Zustand)
The application uses **Zustand** for global state, split into three logical stores in `store/useStore.ts`:
- **`useAssetStore`**: Manages the currently selected asset (SOL/BTC/ETH) and the `livePrices` map for PnL calculations.
- **`useTradeStore`**: Manages the list of open and closed positions.
- **`useChartStore`**: Controls the chart's timeframe (1m, 5m, etc.) and view state.

### 2. Real-Time Data Streams

The frontend maintains **two separate WebSocket connections** for different purposes:

#### A. Market Prices (Poller Service)
- **Location**: `components/PriceBoardDropdown.tsx`
- **Source**: Connects to the **Poller** service (`VITE_WS_BASE_URL`).
- **Function**: Subscribes to the `selectedSymbol` AND any assets involved in open positions.
- **Flow**:
  1.  Receives `PRICE_UPDATE` events.
  2.  Updates the `livePrices` dictionary in the Zustand store.
  3.  **BuyTab** uses this for the "Buy Price" display.
  4.  **OrderTable** uses this to calculate Unrealized PnL in real-time.

#### B. Candlestick Chart (External/Backpack)
- **Location**: `components/CandlestickChart.tsx`
- **Source**: Connects directly to **Backpack Exchange** via proxy or direct WS (`VITE_WS_BACKPACK_API`).
- **Function**: Streams live kline (candlestick) data for the chart.
- **Feature**: Supports "Endless Scrolling" — requesting historical HTTP data as the user scrolls back in time.

### 3. Authentication
- Implements **Google OAuth** via `better-auth`.
- Session persistence allows users to refresh the page without losing their login state.
- **Protected UI**: The "Order Table" and "Trade" buttons utilize `session.user` to make authenticated API requests.

## Key Components

- **`CandlestickChart`**: A complex wrapper around Lightweight Charts. Handles resizing, infinite loading history, and merging live socket updates with historical data.
- **`OrderPanel`** (`BuyTab`/`SellTab`): The trading interface.
  - Auto-calculates **Quantity** based on Margin + Leverage.
  - Validates user balance before submission.
- **`OrderTable`**:
  - Displays **Open Positions**.
  - **Live PnL**: Calculated broadly as `(CurrentPrice - EntryPrice) * Quantity`.
  - **Auto-Subscription**: Automatically tells the global WebSocket to subscribe to assets for all open trades, ensuring PnL updates even if you aren't viewing that asset's chart.

## Setup & Development

**Install Dependencies:**
```bash
bun install
```

**Environment Variables (.env):**
```env
VITE_BACKEND_BASE_URL=http://localhost:5000   # HTTP Server
VITE_WS_BASE_URL=ws://localhost:8080          # Poller WS
VITE_FRONTEND_URL=http://localhost:5173       # This App
```

**Run Development Server:**
```bash
bun run dev
```

**Build for Production:**
```bash
bun run build
```
