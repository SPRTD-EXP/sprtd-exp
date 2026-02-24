import { colors } from './colors';

export const NICHES = [
  { id: 'football', label: 'FOOTBALL', color: colors.niches.football },
  { id: 'soccer', label: 'SOCCER', color: colors.niches.soccer },
  { id: 'gym', label: 'GYM', color: colors.niches.gym },
  { id: 'barber', label: 'BARBER', color: colors.niches.barber },
  { id: 'cars', label: 'CARS', color: colors.niches.cars },
  { id: 'modeling', label: 'MODELING', color: colors.niches.modeling },
  { id: 'photography', label: 'PHOTOGRAPHY', color: colors.niches.photography },
] as const;

export type NicheId = (typeof NICHES)[number]['id'];

export function getNicheColor(niche: string): string {
  const found = NICHES.find((n) => n.id === niche);
  return found ? found.color : colors.card;
}

export function getNicheLabel(niche: string): string {
  const found = NICHES.find((n) => n.id === niche);
  return found ? found.label : niche.toUpperCase();
}
