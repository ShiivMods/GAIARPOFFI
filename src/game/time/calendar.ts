export type GameDate = {year:number;month:number};

// Pure state transition: React may invoke an updater twice in development.
// No nested state setters or side effects are allowed here.
export function nextGameMonth(date:GameDate):GameDate {
  return date.month === 12
    ? {year:date.year+1,month:1}
    : {year:date.year,month:date.month+1};
}
