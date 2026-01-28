import Chart from "./components/CandlestickChart"
import { ChartNavbar } from "./components/ChartNavbar"
import Navbar from "./components/Navbar"
import OrderPanel from "./components/OrderPanel"
import { OrderTable } from "./components/OrderTable"
import { authClient } from "./lib/auth-client"
import { useMediaQuery } from "./hooks/useMediaQuery"

function App() {
  const { data: session } = authClient.useSession()
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  return (
    <div className="min-h-screen xl:h-screen bg-[#0E0F14] flex flex-col overflow-y-auto xl:overflow-hidden">
      {/* navbar */}
      <Navbar />

      {/* body */}
      <div className="flex flex-col xl:flex-row p-2 gap-2 flex-1 xl:overflow-hidden min-h-0">
        {/* left - chart and orders */}
        <div className="flex flex-col w-full xl:flex-[3] gap-0 xl:overflow-hidden min-h-0">

          {/* chart controls*/}
          <div className="flex-shrink-0 pb-1">
            <ChartNavbar />
          </div>

          {/* chart - takes more space, no gap from above */}
          <div className="min-h-[250px] xl:min-h-0 xl:flex-[3] overflow-hidden">
            <Chart />
          </div>

          {/* order table - DESKTOP ONLY (conditional render) */}
          {isDesktop && (
            <div className="xl:flex-[1.5] overflow-hidden mt-1">
              <OrderTable />
            </div>
          )}
        </div>

        {/* right - trading panel */}
        <div className="w-full xl:flex-1 xl:overflow-hidden min-h-0">
          <OrderPanel />
        </div>

        {/* order table - MOBILE ONLY (conditional render, only if logged in) */}
        {!isDesktop && session?.user && (
          <div className="min-h-[200px] overflow-hidden mt-2 pb-4">
            <OrderTable />
          </div>
        )}
      </div>
    </div>
  )
}

export default App