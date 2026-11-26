// Rules ported from GaiaRP/src/features/combat/combatRules.ts.
export type Durability = Readonly<{ current: number; max: number }>;
export type Defenses = Readonly<{ shield: Durability; armor: Durability; hull: Durability }>;

function assertDurability(value: Durability) {
  if (!Number.isFinite(value.current) || !Number.isFinite(value.max) ||
      value.max < 0 || value.current < 0 || value.current > value.max) {
    throw new Error("Invalid durability");
  }
}
function boundedIntegrity(integrity: number) {
  if (!Number.isFinite(integrity)) throw new Error("Invalid integrity");
  return Math.max(0, Math.min(100, integrity));
}
export function integrityPercent(value: Durability) {
  assertDurability(value);
  return value.max === 0 ? 0 : Math.round(value.current / value.max * 100);
}
export function propulsionPerformance(integrity: number) {
  const value = boundedIntegrity(integrity);
  if (value === 0) return { speedMultiplier: 0, evasionMultiplier: 0, label: "Arrêt" };
  if (value <= 20) return { speedMultiplier: .5, evasionMultiplier: .3, label: "Critique" };
  if (value <= 65) return { speedMultiplier: .75, evasionMultiplier: .9, label: "Dégradée" };
  return { speedMultiplier: 1, evasionMultiplier: 1, label: "Nominale" };
}
export function armamentPerformance(integrity: number) {
  const value = boundedIntegrity(integrity);
  if (value === 0) return { damageMultiplier: 0, label: "Désactivé" };
  if (value <= 20) return { damageMultiplier: .5, label: "Critique" };
  if (value <= 65) return { damageMultiplier: .75, label: "Dégradé" };
  return { damageMultiplier: 1, label: "Nominal" };
}
export function applyStandardDamage(damage: number, defenses: Defenses) {
  if (!Number.isFinite(damage) || damage < 0) throw new Error("Invalid damage");
  const { shield, armor, hull } = defenses;
  [shield, armor, hull].forEach(assertDurability);
  const shieldDamage = Math.min(shield.current, damage);
  const armorDamage = Math.min(armor.current, damage - shieldDamage);
  const hullDamage = Math.min(hull.current, damage - shieldDamage - armorDamage);
  return {
    shield: { ...shield, current: shield.current - shieldDamage },
    armor: { ...armor, current: armor.current - armorDamage },
    hull: { ...hull, current: hull.current - hullDamage },
    destroyed: hull.current - hullDamage <= 0,
    absorbed: { shield: shieldDamage, armor: armorDamage, hull: hullDamage },
  };
}
