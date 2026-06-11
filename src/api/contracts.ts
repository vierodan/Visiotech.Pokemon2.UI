export type ApiNumber = number | string;

export interface ProblemDetailsContract {
  detail?: string | null;
  instance?: string | null;
  status?: ApiNumber | null;
  title?: string | null;
  type?: string | null;
}

export interface HttpValidationProblemDetailsContract extends ProblemDetailsContract {
  errors?: Record<string, string[]>;
}

export interface SystemInfoContract {
  environment: string;
  generatedAtUtc: string;
  service: string;
  version: string;
}

export interface PokemonBaseStatsContract {
  attack: ApiNumber;
  defense: ApiNumber;
  health: ApiNumber;
  specialAttack: ApiNumber;
  specialDefense: ApiNumber;
  speed: ApiNumber;
}

export interface PokemonSpeciesContract {
  baseStats: PokemonBaseStatsContract;
  id: string;
  name: string;
  types: string[];
}

export interface PokemonMoveContract {
  category: string;
  id: string;
  name: string;
  power: ApiNumber;
  type: string;
}

export interface MyPokemonContract {
  currentHealthPoints: ApiNumber;
  equippedMoves: PokemonMoveContract[];
  id: string;
  level: ApiNumber;
  species: PokemonSpeciesContract;
  totalHealthPoints: ApiNumber;
}

export interface PokemonSpeciesCatalogContract {
  items: PokemonSpeciesContract[];
  page: ApiNumber;
  pageSize: ApiNumber;
  totalCount: ApiNumber;
  totalPages: ApiNumber;
}

export interface PokemonMoveCatalogContract {
  items: PokemonMoveContract[];
  page: ApiNumber;
  pageSize: ApiNumber;
  totalCount: ApiNumber;
  totalPages: ApiNumber;
}

export interface MyPokemonCatalogContract {
  items: MyPokemonContract[];
  page: ApiNumber;
  pageSize: ApiNumber;
  totalCount: ApiNumber;
  totalPages: ApiNumber;
}

export interface CalculateMoveDamageRequestContract {
  attackerMyPokemonId: string;
  defenderMyPokemonId: string;
  moveId: string;
}

export interface MoveDamageCalculationEffectivenessContract {
  defenderType: string;
  multiplier: number | string;
}

export interface MoveDamageCalculationContract {
  attackerLevel: ApiNumber;
  attackerMyPokemonId: string;
  baseDamage: number | string;
  damage: ApiNumber;
  defenderCurrentHealthPoints: ApiNumber;
  defenderMyPokemonId: string;
  defenderRemainingHealthPoints: ApiNumber;
  defensiveStat: string;
  defensiveStatValue: ApiNumber;
  effectivenessBreakdown: MoveDamageCalculationEffectivenessContract[];
  moveCategory: string;
  moveId: string;
  moveName: string;
  movePower: ApiNumber;
  moveType: string;
  offensiveStat: string;
  offensiveStatValue: ApiNumber;
  randomFactor: ApiNumber;
  rawDamage: ApiNumber;
  totalEffectiveness: number | string;
}

export interface PokemonSpeciesCatalogQuery {
  [key: string]: string | number | undefined;
  name?: string;
  page?: number;
  pageSize?: number;
  type?: string;
}

export interface PokemonMoveCatalogQuery {
  [key: string]: string | number | undefined;
  category?: string;
  name?: string;
  page?: number;
  pageSize?: number;
  type?: string;
}

export interface MyPokemonCatalogQuery {
  [key: string]: number | undefined;
  page?: number;
  pageSize?: number;
}
