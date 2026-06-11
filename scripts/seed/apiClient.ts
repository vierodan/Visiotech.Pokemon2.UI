import type {
  BattleContract,
  BattleHistoryContract,
  BattlePhaseExecutionContract,
  CreateBattleRequestContract,
  CreateMyPokemonRequestContract,
  CreatePokemonMoveRequestContract,
  CreatePokemonSpeciesRequestContract,
  HttpValidationProblemDetailsContract,
  MyPokemonCatalogContract,
  MyPokemonContract,
  PokemonLearnableMovesContract,
  PokemonMoveCatalogContract,
  PokemonMoveContract,
  PokemonMoveSharedSpeciesContract,
  PokemonSpeciesCatalogContract,
  PokemonSpeciesContract,
  ProblemDetailsContract,
  UpdateMyPokemonRequestContract,
  UpdatePokemonLearnableMovesRequestContract,
  UpdatePokemonMoveRequestContract,
  UpdatePokemonSpeciesRequestContract,
} from '../../src/api/contracts.js';
import type { SeedConfig } from './types.js';

type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;

export class SeedApiError extends Error {
  public readonly payload: HttpValidationProblemDetailsContract | ProblemDetailsContract | string | null;
  public readonly status: number;

  constructor(status: number, message: string, payload: HttpValidationProblemDetailsContract | ProblemDetailsContract | string | null) {
    super(message);
    this.name = 'SeedApiError';
    this.payload = payload;
    this.status = status;
  }
}

const pause = async (ms: number): Promise<void> => {
  if (ms <= 0) {
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const parseResponse = async (
  response: Response,
): Promise<HttpValidationProblemDetailsContract | ProblemDetailsContract | string | null | unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
    return response.json();
  }

  return response.text();
};

export class SeedApiClient {
  private readonly apiBaseUrl: string;
  private readonly apiBearerToken?: string;
  private readonly requestPauseMs: number;

  constructor(config: SeedConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.apiBearerToken = config.apiBearerToken;
    this.requestPauseMs = config.requestPauseMs;
  }

  public async createBattle(body: CreateBattleRequestContract): Promise<BattleContract> {
    return this.post<BattleContract>('/api/v1/battles', body);
  }

  public async createMove(body: CreatePokemonMoveRequestContract): Promise<PokemonMoveContract> {
    return this.post<PokemonMoveContract>('/api/v1/moves', body);
  }

  public async createMyPokemon(body: CreateMyPokemonRequestContract): Promise<MyPokemonContract> {
    return this.post<MyPokemonContract>('/api/v1/my-pokemons', body);
  }

  public async createPokemon(body: CreatePokemonSpeciesRequestContract): Promise<PokemonSpeciesContract> {
    return this.post<PokemonSpeciesContract>('/api/v1/pokemons', body);
  }

  public async deleteMove(id: string): Promise<void> {
    await this.delete(`/api/v1/moves/${id}`);
  }

  public async deleteMyPokemon(id: string): Promise<void> {
    await this.delete(`/api/v1/my-pokemons/${id}`);
  }

  public async deletePokemon(id: string): Promise<void> {
    await this.delete(`/api/v1/pokemons/${id}`);
  }

  public async executeBattlePhase(
    battleId: string,
    body: { attackerMyPokemonId: string; moveId: string },
  ): Promise<BattlePhaseExecutionContract> {
    return this.post<BattlePhaseExecutionContract>(`/api/v1/battles/${battleId}/phases`, body);
  }

  public async getBattle(id: string): Promise<BattleContract> {
    return this.get<BattleContract>(`/api/v1/battles/${id}`);
  }

  public async getBattleHistory(id: string): Promise<BattleHistoryContract> {
    return this.get<BattleHistoryContract>(`/api/v1/battles/${id}/phases`);
  }

  public async getMove(id: string): Promise<PokemonMoveContract> {
    return this.get<PokemonMoveContract>(`/api/v1/moves/${id}`);
  }

  public async getMoveSharedSpecies(id: string): Promise<PokemonMoveSharedSpeciesContract> {
    return this.get<PokemonMoveSharedSpeciesContract>(`/api/v1/moves/${id}/pokemon-species`);
  }

  public async getMoves(query: QueryParams): Promise<PokemonMoveCatalogContract> {
    return this.get<PokemonMoveCatalogContract>('/api/v1/moves', query);
  }

  public async getMyPokemon(id: string): Promise<MyPokemonContract> {
    return this.get<MyPokemonContract>(`/api/v1/my-pokemons/${id}`);
  }

  public async getMyPokemons(query: QueryParams): Promise<MyPokemonCatalogContract> {
    return this.get<MyPokemonCatalogContract>('/api/v1/my-pokemons', query);
  }

  public async getMyPokemonEquippedMoves(id: string): Promise<MyPokemonContract> {
    return this.get<MyPokemonContract>(`/api/v1/my-pokemons/${id}`);
  }

  public async getPokemon(id: string): Promise<PokemonSpeciesContract> {
    return this.get<PokemonSpeciesContract>(`/api/v1/pokemons/${id}`);
  }

  public async getPokemonLearnableMoves(id: string): Promise<PokemonLearnableMovesContract> {
    return this.get<PokemonLearnableMovesContract>(`/api/v1/pokemons/${id}/learnable-moves`);
  }

  public async getPokemons(query: QueryParams): Promise<PokemonSpeciesCatalogContract> {
    return this.get<PokemonSpeciesCatalogContract>('/api/v1/pokemons', query);
  }

  public async listAllMoves(pageSize: number): Promise<PokemonMoveContract[]> {
    return this.paginate<PokemonMoveContract, PokemonMoveCatalogContract>((page) =>
      this.getMoves({ page, pageSize }),
    );
  }

  public async listAllMyPokemons(pageSize: number): Promise<MyPokemonContract[]> {
    return this.paginate<MyPokemonContract, MyPokemonCatalogContract>((page) =>
      this.getMyPokemons({ page, pageSize }),
    );
  }

  public async listAllPokemons(pageSize: number): Promise<PokemonSpeciesContract[]> {
    return this.paginate<PokemonSpeciesContract, PokemonSpeciesCatalogContract>((page) =>
      this.getPokemons({ page, pageSize }),
    );
  }

  public async updateMove(id: string, body: UpdatePokemonMoveRequestContract): Promise<PokemonMoveContract> {
    return this.put<PokemonMoveContract>(`/api/v1/moves/${id}`, body);
  }

  public async updateMyPokemon(id: string, body: UpdateMyPokemonRequestContract): Promise<MyPokemonContract> {
    return this.put<MyPokemonContract>(`/api/v1/my-pokemons/${id}`, body);
  }

  public async updatePokemon(id: string, body: UpdatePokemonSpeciesRequestContract): Promise<PokemonSpeciesContract> {
    return this.put<PokemonSpeciesContract>(`/api/v1/pokemons/${id}`, body);
  }

  public async updatePokemonLearnableMoves(
    id: string,
    body: UpdatePokemonLearnableMovesRequestContract,
  ): Promise<PokemonLearnableMovesContract> {
    return this.put<PokemonLearnableMovesContract>(`/api/v1/pokemons/${id}/learnable-moves`, body);
  }

  private buildHeaders(): Headers {
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    if (this.apiBearerToken) {
      headers.set('Authorization', `Bearer ${this.apiBearerToken}`);
    }

    return headers;
  }

  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(path.replace(/^\//, ''), `${this.apiBaseUrl}/`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async delete(path: string): Promise<void> {
    await this.request('DELETE', path);
  }

  private async get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('GET', path, query);
  }

  private async paginate<TItem, TPage extends { items: TItem[]; totalPages: number | string }>(
    loader: (page: number) => Promise<TPage>,
  ): Promise<TItem[]> {
    const items: TItem[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await loader(page);
      items.push(...result.items);
      totalPages = Number(result.totalPages);
      page += 1;
    } while (page <= totalPages);

    return items;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, undefined, body);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, undefined, body);
  }

  private async request<T>(method: string, path: string, query?: QueryParams, body?: unknown): Promise<T> {
    const response = await fetch(this.buildUrl(path, query), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: this.buildHeaders(),
      method,
    });

    const payload = await parseResponse(response);
    await pause(this.requestPauseMs);

    if (!response.ok) {
      const message =
        typeof payload === 'string'
          ? payload
          : (payload as ProblemDetailsContract | HttpValidationProblemDetailsContract | null)?.detail ||
            (payload as ProblemDetailsContract | HttpValidationProblemDetailsContract | null)?.title ||
            `HTTP ${response.status}`;

      throw new SeedApiError(
        response.status,
        message,
        (payload as HttpValidationProblemDetailsContract | ProblemDetailsContract | string | null) ?? null,
      );
    }

    return payload as T;
  }
}
