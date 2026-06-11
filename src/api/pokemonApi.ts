import { httpClient } from './httpClient';
import type {
  CalculateMoveDamageRequestContract,
  MoveDamageCalculationContract,
  MyPokemonCatalogContract,
  MyPokemonCatalogQuery,
  PokemonMoveCatalogContract,
  PokemonMoveCatalogQuery,
  PokemonSpeciesCatalogContract,
  PokemonSpeciesCatalogQuery,
  SystemInfoContract,
} from './contracts';

export const pokemonApi = {
  calculateMoveDamage: (body: CalculateMoveDamageRequestContract): Promise<MoveDamageCalculationContract> =>
    httpClient.post<MoveDamageCalculationContract>('/api/v1/damage-calculations', body),
  getMyPokemons: (query: MyPokemonCatalogQuery): Promise<MyPokemonCatalogContract> =>
    httpClient.get<MyPokemonCatalogContract>('/api/v1/my-pokemons', { query }),
  getMoves: (query: PokemonMoveCatalogQuery): Promise<PokemonMoveCatalogContract> =>
    httpClient.get<PokemonMoveCatalogContract>('/api/v1/moves', { query }),
  getPokemons: (query: PokemonSpeciesCatalogQuery): Promise<PokemonSpeciesCatalogContract> =>
    httpClient.get<PokemonSpeciesCatalogContract>('/api/v1/pokemons', { query }),
  getSystemInfo: (): Promise<SystemInfoContract> => httpClient.get<SystemInfoContract>('/api/v1/system'),
};

