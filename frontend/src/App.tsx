import Chart from "./components/CandlestickChart"

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
          <div className="history bg-green-500 h-40">
          open positions
          </div>
        </div>

        {/* right  */}
        <div className="flex-1 bg-blue-400">
          order panel
        </div>
      </div>
    </div>
  )
}

export default App
