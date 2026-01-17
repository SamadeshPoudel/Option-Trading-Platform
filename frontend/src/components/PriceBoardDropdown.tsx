import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PriceBoardDropdown = () => {
  return (
   <DropdownMenu>
  <DropdownMenuTrigger className="bg-[#202127] p-2 m-2 rounded-sm cursor-pointer h-12">
    <div className="flex justify-between text-m text-white font-semibold">
      <p className="">SOL_USDC</p>
      <p>150</p>
    </div>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
  )
}

export default PriceBoardDropdown
