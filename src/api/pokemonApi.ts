import { httpClient } from './httpClient';
import type {
  BattleContract,
  BattleHistoryContract,
  BattlePhaseExecutionContract,
  CalculateMoveDamageRequestContract,
  CreateBattleRequestContract,
  CreateMyPokemonRequestContract,
  CreatePokemonMoveRequestContract,
  CreatePokemonSpeciesRequestContract,
  ExecuteBattlePhaseRequestContract,
  MoveDamageCalculationContract,
  MyPokemonCatalogContract,
  MyPokemonCatalogQuery,
  MyPokemonContract,
  MyPokemonEquippedMovesContract,
  PokemonLearnableMovesContract,
  PokemonMoveCatalogContract,
  PokemonMoveCatalogQuery,
  PokemonMoveContract,
  PokemonMoveSharedSpeciesContract,
  PokemonSpeciesCatalogContract,
  PokemonSpeciesCatalogQuery,
  PokemonSpeciesContract,
  SystemInfoContract,
  UpdateMyPokemonRequestContract,
  UpdatePokemonLearnableMovesRequestContract,
  UpdatePokemonMoveRequestContract,
  UpdatePokemonSpeciesRequestContract,
} from './contracts';

export const pokemonApi = {
  calculateMoveDamage: (body: CalculateMoveDamageRequestContract): Promise<MoveDamageCalculationContract> =>
    httpClient.post<MoveDamageCalculationContract>('/api/v1/damage-calculations', body),

  createBattle: (body: CreateBattleRequestContract): Promise<BattleContract> =>
    httpClient.post<BattleContract>('/api/v1/battles', body),
  createMove: (body: CreatePokemonMoveRequestContract): Promise<PokemonMoveContract> =>
    httpClient.post<PokemonMoveContract>('/api/v1/moves', body),
  createMyPokemon: (body: CreateMyPokemonRequestContract): Promise<MyPokemonContract> =>
    httpClient.post<MyPokemonContract>('/api/v1/my-pokemons', body),
  createPokemon: (body: CreatePokemonSpeciesRequestContract): Promise<PokemonSpeciesContract> =>
    httpClient.post<PokemonSpeciesContract>('/api/v1/pokemons', body),

  deleteMove: (id: string): Promise<null> => httpClient.delete<null>(`/api/v1/moves/${id}`),
  deleteMyPokemon: (id: string): Promise<null> => httpClient.delete<null>(`/api/v1/my-pokemons/${id}`),
  deletePokemon: (id: string): Promise<null> => httpClient.delete<null>(`/api/v1/pokemons/${id}`),

  executeBattlePhase: (battleId: string, body: ExecuteBattlePhaseRequestContract): Promise<BattlePhaseExecutionContract> =>
    httpClient.post<BattlePhaseExecutionContract>(`/api/v1/battles/${battleId}/phases`, body),

  getBattle: (id: string): Promise<BattleContract> => httpClient.get<BattleContract>(`/api/v1/battles/${id}`),
  getBattleHistory: (id: string): Promise<BattleHistoryContract> =>
    httpClient.get<BattleHistoryContract>(`/api/v1/battles/${id}/phases`),

  getMove: (id: string): Promise<PokemonMoveContract> => httpClient.get<PokemonMoveContract>(`/api/v1/moves/${id}`),
  getMoveSharedSpecies: (id: string): Promise<PokemonMoveSharedSpeciesContract> =>
    httpClient.get<PokemonMoveSharedSpeciesContract>(`/api/v1/moves/${id}/pokemon-species`),
  getMoves: (query: PokemonMoveCatalogQuery): Promise<PokemonMoveCatalogContract> =>
    httpClient.get<PokemonMoveCatalogContract>('/api/v1/moves', { query }),

  getMyPokemon: (id: string): Promise<MyPokemonContract> => httpClient.get<MyPokemonContract>(`/api/v1/my-pokemons/${id}`),
  getMyPokemons: (query: MyPokemonCatalogQuery): Promise<MyPokemonCatalogContract> =>
    httpClient.get<MyPokemonCatalogContract>('/api/v1/my-pokemons', { query }),
  getMyPokemonEquippedMoves: (id: string): Promise<MyPokemonEquippedMovesContract> =>
    httpClient.get<MyPokemonEquippedMovesContract>(`/api/v1/my-pokemons/${id}/equipped-moves`),

  getPokemon: (id: string): Promise<PokemonSpeciesContract> =>
    httpClient.get<PokemonSpeciesContract>(`/api/v1/pokemons/${id}`),
  getPokemonLearnableMoves: (id: string): Promise<PokemonLearnableMovesContract> =>
    httpClient.get<PokemonLearnableMovesContract>(`/api/v1/pokemons/${id}/learnable-moves`),
  getPokemons: (query: PokemonSpeciesCatalogQuery): Promise<PokemonSpeciesCatalogContract> =>
    httpClient.get<PokemonSpeciesCatalogContract>('/api/v1/pokemons', { query }),

  getSystemInfo: (): Promise<SystemInfoContract> => httpClient.get<SystemInfoContract>('/api/v1/system'),

  updateMove: (id: string, body: UpdatePokemonMoveRequestContract): Promise<PokemonMoveContract> =>
    httpClient.put<PokemonMoveContract>(`/api/v1/moves/${id}`, body),
  updateMyPokemon: (id: string, body: UpdateMyPokemonRequestContract): Promise<MyPokemonContract> =>
    httpClient.put<MyPokemonContract>(`/api/v1/my-pokemons/${id}`, body),
  updatePokemon: (id: string, body: UpdatePokemonSpeciesRequestContract): Promise<PokemonSpeciesContract> =>
    httpClient.put<PokemonSpeciesContract>(`/api/v1/pokemons/${id}`, body),
  updatePokemonLearnableMoves: (
    id: string,
    body: UpdatePokemonLearnableMovesRequestContract,
  ): Promise<PokemonLearnableMovesContract> =>
    httpClient.put<PokemonLearnableMovesContract>(`/api/v1/pokemons/${id}/learnable-moves`, body),
};
