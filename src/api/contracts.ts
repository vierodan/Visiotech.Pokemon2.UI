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

export interface MyPokemonEquippedMovesContract {
  moves: PokemonMoveContract[];
  myPokemonId: string;
}

export interface PokemonLearnableMovesContract {
  moves: PokemonMoveContract[];
  pokemonSpeciesId: string;
  pokemonSpeciesName: string;
}

export interface PokemonMoveSharedSpeciesContract {
  pokemonMoveId: string;
  pokemonMoveName: string;
  pokemonSpecies: PokemonSpeciesContract[];
}

export interface CreatePokemonMoveRequestContract {
  category: string | null;
  name: string | null;
  power: number;
  type: string | null;
}

export type UpdatePokemonMoveRequestContract = CreatePokemonMoveRequestContract;

export interface CreatePokemonSpeciesRequestContract {
  baseStats: PokemonBaseStatsContract | null;
  name: string | null;
  types: string[] | null;
}

export type UpdatePokemonSpeciesRequestContract = CreatePokemonSpeciesRequestContract;

export interface CreateMyPokemonRequestContract {
  currentHealthPoints: number;
  equippedMoveIds: string[] | null;
  level: number;
  pokemonSpeciesId: string;
  totalHealthPoints: number;
}

export interface UpdateMyPokemonRequestContract {
  currentHealthPoints: number;
  equippedMoveIds: string[] | null;
  level: number;
  totalHealthPoints: number;
}

export interface UpdatePokemonLearnableMovesRequestContract {
  addMoveIds: string[] | null;
  removeMoveIds: string[] | null;
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

export interface CreateBattleRequestContract {
  firstMyPokemonId: string;
  secondMyPokemonId: string;
}

export interface ExecuteBattlePhaseRequestContract {
  attackerMyPokemonId: string;
  moveId: string;
}

export interface BattleCombatantContract {
  currentHealthPoints: ApiNumber;
  myPokemonId: string;
  slotNumber: ApiNumber;
  totalHealthPoints: ApiNumber;
}

export interface BattlePhaseEffectivenessContract {
  defenderType: string;
  multiplier: number | string;
}

export interface BattlePhaseContract {
  attackerMyPokemonId: string;
  attackerRemainingHealthPoints: ApiNumber;
  damage: ApiNumber;
  defenderMyPokemonId: string;
  defenderRemainingHealthPoints: ApiNumber;
  effectivenessBreakdown: BattlePhaseEffectivenessContract[];
  moveId: string;
  moveName: string;
  randomFactor: ApiNumber;
  sequenceNumber: ApiNumber;
  totalEffectiveness: number | string;
}

export interface BattleHistoryContract {
  battleId: string;
  phases: BattlePhaseContract[];
}

export interface BattleContract {
  combatants: BattleCombatantContract[];
  currentTurnNumber: ApiNumber;
  history: BattlePhaseContract[];
  id: string;
  loserMyPokemonId: string | null;
  nextAttackerMyPokemonId: string | null;
  status: string;
  winnerMyPokemonId: string | null;
}

export interface BattlePhaseExecutionContract {
  battle: BattleContract;
  damageCalculation: MoveDamageCalculationContract;
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
