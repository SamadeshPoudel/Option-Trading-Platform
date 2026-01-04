export interface CreateOrder{
    action:string,
    userId:string,
    orderId:string,
    asset:string,
    margin:number,
    type:"buy"| "sell",
    leverage:number,
    status:"open"|"close"
}

export interface CloseOrder{
    action:string,
    userId:string,
    orderId:string,
    status:"open"|"close"
}