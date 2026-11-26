export type RulesSection = 'general' | 'gaia'
export const rulesTabs = [
  { id: 'general', label: 'Règlement général' },
  { id: 'gaia', label: 'Informations spécifiques à GAIARP' },
] as const

// Contenu fourni par la conception le 26 novembre 2026.
// Les règles générales seront rédigées séparément.
export const specificTopics = [
  { id: 'categories-rp', title: 'Les différentes catégories de RP' },
  { id: 'connaissances', title: 'Ce que sait votre personnage' },
  { id: 'combats', title: 'Les combats et les systèmes associés' },
  { id: 'consequences', title: 'Conséquences et fil rouge' },
  { id: 'fin-histoire', title: 'L’histoire peut-elle se terminer ?' },
  { id: 'nouveautes', title: 'Ajouts, systèmes, factions et espèces jouables' },
  { id: 'communaute', title: 'La communauté et le rôle du staff' },
] as const
