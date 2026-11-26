export const ACTION_BUDGET = 2;
export const ACTIONS = {
  fire: { label: "Tir principal", cost: 1, category: "offense" },
  "double-fire": { label: "Double salve", cost: 2, category: "offense" },
  evasion: { label: "Manœuvre d’esquive", cost: 1, category: "defense" },
  "shield-boost": { label: "Renforcer les boucliers", cost: 1, category: "defense" },
  scan: { label: "Analyse tactique", cost: 1, category: "utility" },
} as const;
export type ActionId = keyof typeof ACTIONS;
export function validateOrders(input: readonly unknown[]): { orders: ActionId[]; spent: number } {
  if (!Array.isArray(input) || input.length > ACTION_BUDGET) throw new Error("Invalid orders");
  const orders: ActionId[] = [];
  let spent = 0;
  for (const id of input) {
    if (typeof id !== "string" || !Object.hasOwn(ACTIONS, id)) throw new Error("Unknown action");
    const action = id as ActionId;
    if (orders.includes(action)) throw new Error("Duplicate action");
    spent += ACTIONS[action].cost;
    if (spent > ACTION_BUDGET) throw new Error("Action budget exceeded");
    orders.push(action);
  }
  return { orders, spent };
}
