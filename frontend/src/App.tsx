import Chart from "./components/CandlestickChart"
import { HourMinuteDay } from "./components/HourMinuteDay"
import OrderPanel from "./components/OrderPanel"
import { OrderTable } from "./components/OrderTable"

function App() {

  return(
    <div className="h-screen bg-[#0E0F14] flex flex-col overflow-hidden">
      {/* navbar */}
      <nav className="flex justify-between bg-black p-2 py-3 flex-shrink-0">
        <div>
          LOGO
        </div>
        <div>
          pnl and other stuffs
        </div>
      </nav>

      {/* body */}
      <div className="flex p-2 gap-2 flex-1 overflow-hidden min-h-0">
        {/* left */}
        <div className="flex flex-col flex-[3] gap-0 overflow-hidden min-h-0">
          
          {/* chart controls*/}
          <div className="flex-shrink-0 pb-1">
            <HourMinuteDay />
          </div>
          
          {/* chart - takes more space, no gap from above */}
          <div className="flex-[3] min-h-0 overflow-hidden">
            <Chart />
          </div>

          {/* order table - flex 1 part with small top gap */}
          <div className="flex-[1.5] min-h-0 overflow-hidden mt-1">
            <OrderTable />
          </div>
        </div>

        {/* right */}
        <div className="flex-1 overflow-hidden min-h-0">
          <OrderPanel />
        </div>
      </div>
    </div>
  )
}

export default App