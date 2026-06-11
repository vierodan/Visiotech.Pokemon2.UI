import type {
  BattleContract,
  BattleHistoryContract,
  MyPokemonContract,
  PokemonMoveContract,
  PokemonSpeciesContract,
} from '../../src/api/contracts.js';

export interface SeedConfig {
  apiBaseUrl: string;
  apiBearerToken?: string;
  battles: number;
  moves: number;
  myPokemons: number;
  pageSize: number;
  phaseMax: number;
  phaseMin: number;
  requestPauseMs: number;
  seedTag: string;
  species: number;
}

export interface SeedMovePlan {
  category: string;
  key: string;
  name: string;
  power: number;
  type: string;
}

export interface SeedSpeciesPlan {
  baseStats: {
    attack: number;
    defense: number;
    health: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  desiredMoveNames: string[];
  key: string;
  name: string;
  types: string[];
}

export interface SeedMyPokemonPlan {
  currentHealthPoints: number;
  equippedMoveNames: string[];
  key: string;
  level: number;
  speciesName: string;
  totalHealthPoints: number;
}

export interface SeedBattlePlan {
  desiredPhaseCount: number;
  firstMyPokemonKey: string;
  key: string;
  secondMyPokemonKey: string;
}

export interface EntitySeedStats {
  created: number;
  failed: number;
  reused: number;
  skipped: number;
  target: number;
  updated: number;
}

export interface BattlesSeedStats {
  created: number;
  failed: number;
  target: number;
}

export interface PhasesSeedStats {
  created: number;
  failed: number;
  skipped: number;
  target: number;
}

export interface SeedSummary {
  battles: BattlesSeedStats;
  learnableMovesLinks: EntitySeedStats;
  moves: EntitySeedStats;
  myPokemons: EntitySeedStats;
  notes: string[];
  phases: PhasesSeedStats;
  pokemons: EntitySeedStats;
}

export interface SeededMovesResult {
  byName: Map<string, PokemonMoveContract>;
  all: PokemonMoveContract[];
}

export interface SeededPokemonsResult {
  all: PokemonSpeciesContract[];
  byName: Map<string, PokemonSpeciesContract>;
  learnableMoveNamesBySpeciesName: Map<string, string[]>;
}

export interface SeededMyPokemonsResult {
  all: MyPokemonContract[];
  byKey: Map<string, MyPokemonContract>;
}

export interface SeededBattlesResult {
  battles: BattleContract[];
  histories: BattleHistoryContract[];
}
