import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"

interface InputProps{
    label:string,
    input:number,
    symbol:string
}
const InputCard = ({label, input, symbol}:InputProps) => {

  return (
    <div>
        <p> {label}</p>
        <Card className=" text-white h-12 py-0 bg-[#202127] m-2">
        <CardContent className="flex justify-between items-center h-full p-4">
            {/* <p className="text-2xl">{input}</p> */}
            {/* <input></input> */}
            <Input />
            <p className="text-2xl">{symbol}</p>
        </CardContent>
        </Card>
        </div>
  )
}

export default InputCard
