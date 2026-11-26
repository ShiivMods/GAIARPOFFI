// Station IDs refer to actual assigned posts, not broad action categories.
// This helper is ready for the equipment-linked action catalog; the current
// prototype does not identify which weapon/post a generic action uses.
export type StationOrder={stationId:string;assignedAccountMemberId?:string};
export function validateStationOrders(actor:{memberId:string;stationId:string;isCaptain:boolean},orders:readonly StationOrder[]){
  if(orders.some(o=>!o.stationId))throw new Error("Missing station");
  if(actor.isCaptain&&new Set(orders.map(o=>o.stationId)).size>1)throw new Error("Captain cannot combine stations");
  for(const order of orders){
    if(order.assignedAccountMemberId&&order.assignedAccountMemberId!==actor.memberId)throw new Error("Station already assigned");
    if(!actor.isCaptain&&order.stationId!==actor.stationId)throw new Error("Forbidden station");
  }
}
