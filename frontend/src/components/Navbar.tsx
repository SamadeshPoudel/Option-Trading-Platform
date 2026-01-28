import { useAssetStore, useTradeStore, type Asset } from "store/useStore"
import { Wallet, TrendingUp, TrendingDown, LogOut } from "lucide-react"
import { SiDelta } from "react-icons/si";
import { useEffect, useRef, useState } from "react";
import { authClient, signIn, signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";


const Navbar = () => {
  const openTrades = useTradeStore(state => state.openTrades) || [];
  const livePrices = useAssetStore(state => state.livePrices);
  const [balance, setBalance] = useState(0)
  const [showUserModal, setShowUserModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    data: session,
  } = authClient.useSession()

  // console.log("checking auth session data:", session);
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowUserModal(false);
      }
    };
    if (showUserModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserModal]);


  const fetchBalance = async (userId?: string) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/balance?userId=${userId}`, {
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
    })
    const data = await res.json();
    console.log("checking userId in fetchBalance", session?.user?.id)
    // console.log("typeOf:", typeof data.data)
    setBalance(Number(data.data) || 0);
  }

  useEffect(() => {

    if (!session?.user?.id) return;
    fetchBalance(session?.user?.id);

    const intervalId = setInterval(() => {
      fetchBalance(session?.user?.id);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [session?.user?.id])


  // Calculate unrealised PnL
  const calculateUnrealisedPnL = () => {
    if (openTrades.length === 0) return { value: 0, isValid: true };

    let totalPnL = 0;
    let allPricesAvailable = true;

    for (const trade of openTrades) {
      const asset = trade.asset as Asset;
      const currentPrice = trade.type === "buy"
        ? livePrices[asset]?.bid
        : livePrices[asset]?.ask;
      const openPrice = Number(trade.openPrice) / 10000;

      if (!currentPrice || !trade.quantity) {
        allPricesAvailable = false;
        continue;
      }

      const pnl = trade.type === "buy"
        ? (currentPrice - openPrice) * trade.quantity
        : (openPrice - currentPrice) * trade.quantity;

      totalPnL += pnl;
    }

    return { value: totalPnL, isValid: allPricesAvailable };
  };

  const { value: unrealisedPnL, isValid } = calculateUnrealisedPnL();
  const isPositive = unrealisedPnL >= 0;
  const pnlColor = isPositive ? "text-emerald-400" : "text-red-400";

  const handleLogout = async () => {
    await signOut();
    setShowUserModal(false);
  };

  return (
    <nav className="flex justify-between items-center bg-[#0a0a0d] text-white px-4 h-14 flex-shrink-0 border-b border-[#1a1a1f]">
      {/* Left: Logo */}
      <div className="flex items-center">
        <SiDelta className="size-32" />
      </div>

      {/* Right: PnL, Balance, Profile */}
      <div className="flex items-center gap-3">

        {/* Unrealised PnL */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg `}>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Unrealised
            </span>
          </div>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className={`text-sm font-semibold ${pnlColor}`}>
            {!isValid ? (
              "--"
            ) : (
              <>
                {isPositive ? "+" : ""}${unrealisedPnL.toFixed(2)}
              </>
            )}

          </span>

        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#2a2a30]" />

        {/* Balance */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Wallet className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 tracking-wider leading-none">
              Net Balance
            </span>
            <span className="text-sm font-semibold text-yellow-400">
              {/* ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} */}
              ${(Number(balance / 10000).toFixed(2))}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#2a2a30]" />


        {/* User Profile with Modal */}
        {session?.user ? (
          <div className="relative" ref={modalRef}>
            {/* User Avatar Button */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-[#1a1a1f] px-2 py-1.5 rounded-lg transition-colors"
              onClick={() => setShowUserModal(!showUserModal)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="font-semibold text-sm text-white">
                  {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
            </div>
            {/* User Modal Dropdown */}
            {showUserModal && (
              <div className="absolute right-0 top-12 w-64 bg-[#0a0a0d] border border-[#2a2a30] rounded-lg shadow-xl z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#2a2a30]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-white">
                        {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">
                        {session.user.name ?? "User"}
                      </span>
                      <span className="text-xs text-gray-400 truncate max-w-[160px]">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Logout Button */}
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="cursor-pointer bg-[#1a1a1f] border-[#2a2a30] text-gray-200 hover:bg-[#252530] hover:border-[#3a3a45] hover:text-white transition-all duration-200 gap-2"
            onClick={() => signIn.social({
              provider: "google",
              callbackURL: "http://localhost:5173"
            })}
          >
            <FcGoogle className="w-4 h-4" />
            Sign in
          </Button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
