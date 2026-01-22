import Chart from "./components/CandlestickChart"
import OrderPanel from "./components/OrderPanel"
import { OrderTable } from "./components/OrderTable"

function App() {

  return(
    <div className=" h-screen bg-[#0E0F14]">
      {/* navbar  */}
      <nav className="flex justify-between bg-amber-300 p-2 py-4">
        <div>
          LOGO
        </div>
        <div>
          pnl and other stuffs
        </div>
      </nav>

      {/* body  */}
      <div className="flex p-2 gap-2">
        {/* left  */}
        <div className="flex flex-col flex-3 gap-2">
          
          {/* chart  */}
          <div className="h-125">
            <Chart duration="30m" startTime={1768651501} />
          </div>

          <OrderTable />
        </div>

        {/* right  */}
        <div className="flex-1">
          <OrderPanel />
        </div>
      </div>
    </div>
  )
}

export default App
