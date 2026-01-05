export interface Trade{
    action?:string,
    userId:string,
    orderId:string,
    asset:string,
    openPrice:number,
    quantity:number,
    margin:number,
    leverage:number,
    type:"buy"|"sell",
    status:"open"|"closed",
    reqStatus:"success"|"failed"
}