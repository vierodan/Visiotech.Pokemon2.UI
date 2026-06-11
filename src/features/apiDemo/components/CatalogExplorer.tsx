import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { pokemonApi } from '../../../api/pokemonApi';
import type {
  ApiNumber,
  MyPokemonCatalogContract,
  MyPokemonCatalogQuery,
  PokemonMoveCatalogContract,
  PokemonMoveCatalogQuery,
  PokemonSpeciesCatalogContract,
  PokemonSpeciesCatalogQuery,
} from '../../../api/contracts';
import { createRequestState, type RequestState } from '../types/apiDemo';
import styles from './ApiDemo.module.css';

const defaultMoveFilters: PokemonMoveCatalogQuery = {
  category: '',
  name: '',
  page: 1,
  pageSize: 6,
  type: '',
};

const defaultSpeciesFilters: PokemonSpeciesCatalogQuery = {
  name: '',
  page: 1,
  pageSize: 6,
  type: '',
};

const defaultMyPokemonFilters: MyPokemonCatalogQuery = {
  page: 1,
  pageSize: 6,
};

const toDisplayValue = (value: ApiNumber): string => String(value);

const toCatalogMeta = (page: ApiNumber, pageSize: ApiNumber, totalCount: ApiNumber, totalPages: ApiNumber): string =>
  `Página ${page} · ${pageSize} elementos · ${totalCount} registros · ${totalPages} páginas`;

export function CatalogExplorer(): JSX.Element {
  const [moveFilters, setMoveFilters] = useState<PokemonMoveCatalogQuery>(defaultMoveFilters);
  const [speciesFilters, setSpeciesFilters] = useState<PokemonSpeciesCatalogQuery>(defaultSpeciesFilters);
  const [myPokemonFilters, setMyPokemonFilters] = useState<MyPokemonCatalogQuery>(defaultMyPokemonFilters);

  const [moveState, setMoveState] = useState<RequestState<PokemonMoveCatalogContract>>(
    createRequestState<PokemonMoveCatalogContract>(),
  );
  const [speciesState, setSpeciesState] = useState<RequestState<PokemonSpeciesCatalogContract>>(
    createRequestState<PokemonSpeciesCatalogContract>(),
  );
  const [myPokemonState, setMyPokemonState] = useState<RequestState<MyPokemonCatalogContract>>(
    createRequestState<MyPokemonCatalogContract>(),
  );

  const loadMoves = async (query: PokemonMoveCatalogQuery): Promise<void> => {
    setMoveState((current) => ({
      ...current,
      error: null,
      status: 'loading',
    }));

    try {
      const data = await pokemonApi.getMoves(query);

      setMoveState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setMoveState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadSpecies = async (query: PokemonSpeciesCatalogQuery): Promise<void> => {
    setSpeciesState((current) => ({
      ...current,
      error: null,
      status: 'loading',
    }));

    try {
      const data = await pokemonApi.getPokemons(query);

      setSpeciesState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setSpeciesState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadMyPokemons = async (query: MyPokemonCatalogQuery): Promise<void> => {
    setMyPokemonState((current) => ({
      ...current,
      error: null,
      status: 'loading',
    }));

    try {
      const data = await pokemonApi.getMyPokemons(query);

      setMyPokemonState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setMyPokemonState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void (async () => {
      setMoveState({
        data: null,
        error: null,
        status: 'loading',
      });

      try {
        const data = await pokemonApi.getMoves(defaultMoveFilters);

        setMoveState({
          data,
          error: null,
          status: 'success',
        });
      } catch (error) {
        setMoveState({
          data: null,
          error: getApiErrorMessage(error),
          status: 'error',
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void (async () => {
      setSpeciesState({
        data: null,
        error: null,
        status: 'loading',
      });

      try {
        const data = await pokemonApi.getPokemons(defaultSpeciesFilters);

        setSpeciesState({
          data,
          error: null,
          status: 'success',
        });
      } catch (error) {
        setSpeciesState({
          data: null,
          error: getApiErrorMessage(error),
          status: 'error',
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void (async () => {
      setMyPokemonState({
        data: null,
        error: null,
        status: 'loading',
      });

      try {
        const data = await pokemonApi.getMyPokemons(defaultMyPokemonFilters);

        setMyPokemonState({
          data,
          error: null,
          status: 'success',
        });
      } catch (error) {
        setMyPokemonState({
          data: null,
          error: getApiErrorMessage(error),
          status: 'error',
        });
      }
    })();
  }, []);

  const renderState = (status: RequestState<unknown>['status'], error: string | null, isEmpty: boolean): JSX.Element | null => {
    if (!hasConfiguredApi) {
      return (
        <div className={styles.noticeBox}>
          <strong>Pendiente de configuración</strong>
          <p>La consulta real se activará cuando exista `VITE_API_BASE_URL`.</p>
        </div>
      );
    }

    if (status === 'loading') {
      return (
        <div className={styles.noticeBox}>
          <strong>Cargando datos...</strong>
          <p>Consultando la API para este recurso.</p>
        </div>
      );
    }

    if (status === 'error' && error) {
      return (
        <div className={styles.errorBox}>
          <strong>Error de consulta</strong>
          <p>{error}</p>
        </div>
      );
    }

    if (status === 'success' && isEmpty) {
      return (
        <div className={styles.noticeBox}>
          <strong>Respuesta vacía</strong>
          <p>La petición ha sido correcta, pero no hay elementos para los filtros actuales.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.catalogGrid}>
      <section className={styles.resourceCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.panelEyebrow}>GET /api/v1/moves</p>
            <h3 className={styles.panelTitle}>Catálogo de movimientos</h3>
          </div>
          <button className={styles.secondaryButton} type="button" onClick={() => void loadMoves(moveFilters)}>
            Recargar
          </button>
        </div>

        <form
          className={styles.filterForm}
          onSubmit={(event) => {
            event.preventDefault();
            void loadMoves(moveFilters);
          }}
        >
          <label className={styles.field}>
            <span className={styles.label}>name</span>
            <input
              className={styles.input}
              type="text"
              value={moveFilters.name ?? ''}
              onChange={(event) => setMoveFilters((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>type</span>
            <input
              className={styles.input}
              type="text"
              value={moveFilters.type ?? ''}
              onChange={(event) => setMoveFilters((current) => ({ ...current, type: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>category</span>
            <input
              className={styles.input}
              type="text"
              value={moveFilters.category ?? ''}
              onChange={(event) => setMoveFilters((current) => ({ ...current, category: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>page</span>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={moveFilters.page ?? 1}
              onChange={(event) =>
                setMoveFilters((current) => ({ ...current, page: Number(event.target.value) || 1 }))
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>pageSize</span>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={moveFilters.pageSize ?? 6}
              onChange={(event) =>
                setMoveFilters((current) => ({ ...current, pageSize: Number(event.target.value) || 6 }))
              }
            />
          </label>
          <button className={styles.primaryButton} type="submit">
            Aplicar filtros
          </button>
        </form>

        {renderState(
          moveState.status,
          moveState.error,
          moveState.status === 'success' && (moveState.data?.items.length ?? 0) === 0,
        )}

        {moveState.status === 'success' && moveState.data && moveState.data.items.length > 0 ? (
          <>
            <p className={styles.catalogMeta}>
              {toCatalogMeta(
                moveState.data.page,
                moveState.data.pageSize,
                moveState.data.totalCount,
                moveState.data.totalPages,
              )}
            </p>
            <div className={styles.itemGrid}>
              {moveState.data.items.map((move) => (
                <article className={styles.itemCard} key={move.id}>
                  <div className={styles.itemHeader}>
                    <strong>{move.name}</strong>
                    <span className={styles.itemBadge}>{move.category}</span>
                  </div>
                  <p className={styles.itemText}>Tipo: {move.type}</p>
                  <p className={styles.itemText}>Power: {toDisplayValue(move.power)}</p>
                  <code className={styles.inlineCode}>{move.id}</code>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className={styles.resourceCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.panelEyebrow}>GET /api/v1/pokemons</p>
            <h3 className={styles.panelTitle}>Catálogo de especies base</h3>
          </div>
          <button className={styles.secondaryButton} type="button" onClick={() => void loadSpecies(speciesFilters)}>
            Recargar
          </button>
        </div>

        <form
          className={styles.filterForm}
          onSubmit={(event) => {
            event.preventDefault();
            void loadSpecies(speciesFilters);
          }}
        >
          <label className={styles.field}>
            <span className={styles.label}>name</span>
            <input
              className={styles.input}
              type="text"
              value={speciesFilters.name ?? ''}
              onChange={(event) => setSpeciesFilters((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>type</span>
            <input
              className={styles.input}
              type="text"
              value={speciesFilters.type ?? ''}
              onChange={(event) => setSpeciesFilters((current) => ({ ...current, type: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>page</span>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={speciesFilters.page ?? 1}
              onChange={(event) =>
                setSpeciesFilters((current) => ({ ...current, page: Number(event.target.value) || 1 }))
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>pageSize</span>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={speciesFilters.pageSize ?? 6}
              onChange={(event) =>
                setSpeciesFilters((current) => ({ ...current, pageSize: Number(event.target.value) || 6 }))
              }
            />
          </label>
          <button className={styles.primaryButton} type="submit">
            Aplicar filtros
          </button>
        </form>

        {renderState(
          speciesState.status,
          speciesState.error,
          speciesState.status === 'success' && (speciesState.data?.items.length ?? 0) === 0,
        )}

        {speciesState.status === 'success' && speciesState.data && speciesState.data.items.length > 0 ? (
          <>
            <p className={styles.catalogMeta}>
              {toCatalogMeta(
                speciesState.data.page,
                speciesState.data.pageSize,
                speciesState.data.totalCount,
                speciesState.data.totalPages,
              )}
            </p>
            <div className={styles.itemGrid}>
              {speciesState.data.items.map((pokemon) => (
                <article className={styles.itemCard} key={pokemon.id}>
                  <div className={styles.itemHeader}>
                    <strong>{pokemon.name}</strong>
                    <span className={styles.itemBadge}>{pokemon.types.join(', ')}</span>
                  </div>
                  <p className={styles.itemText}>
                    HP {toDisplayValue(pokemon.baseStats.health)} · ATK {toDisplayValue(pokemon.baseStats.attack)} · DEF{' '}
                    {toDisplayValue(pokemon.baseStats.defense)}
                  </p>
                  <p className={styles.itemText}>
                    SPA {toDisplayValue(pokemon.baseStats.specialAttack)} · SPD{' '}
                    {toDisplayValue(pokemon.baseStats.specialDefense)} · SPE {toDisplayValue(pokemon.baseStats.speed)}
                  </p>
                  <code className={styles.inlineCode}>{pokemon.id}</code>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className={styles.resourceCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.panelEyebrow}>GET /api/v1/my-pokemons</p>
            <h3 className={styles.panelTitle}>Instancias jugables</h3>
          </div>
          <button className={styles.secondaryButton} type="button" onClick={() => void loadMyPokemons(myPokemonFilters)}>
            Recargar
          </button>
        </div>

        <form
          className={styles.filterForm}
          onSubmit={(event) => {
            event.preventDefault();
            void loadMyPokemons(myPokemonFilters);
          }}
        >
          <label className={styles.field}>
            <span className={styles.label}>page</span>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={myPokemonFilters.page ?? 1}
              onChange={(event) =>
                setMyPokemonFilters((current) => ({ ...current, page: Number(event.target.value) || 1 }))
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>pageSize</span>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={myPokemonFilters.pageSize ?? 6}
              onChange={(event) =>
                setMyPokemonFilters((current) => ({ ...current, pageSize: Number(event.target.value) || 6 }))
              }
            />
          </label>
          <button className={styles.primaryButton} type="submit">
            Aplicar filtros
          </button>
        </form>

        {renderState(
          myPokemonState.status,
          myPokemonState.error,
          myPokemonState.status === 'success' && (myPokemonState.data?.items.length ?? 0) === 0,
        )}

        {myPokemonState.status === 'success' && myPokemonState.data && myPokemonState.data.items.length > 0 ? (
          <>
            <p className={styles.catalogMeta}>
              {toCatalogMeta(
                myPokemonState.data.page,
                myPokemonState.data.pageSize,
                myPokemonState.data.totalCount,
                myPokemonState.data.totalPages,
              )}
            </p>
            <div className={styles.itemGrid}>
              {myPokemonState.data.items.map((myPokemon) => (
                <article className={styles.itemCard} key={myPokemon.id}>
                  <div className={styles.itemHeader}>
                    <strong>{myPokemon.species.name}</strong>
                    <span className={styles.itemBadge}>Lv. {toDisplayValue(myPokemon.level)}</span>
                  </div>
                  <p className={styles.itemText}>
                    HP: {toDisplayValue(myPokemon.currentHealthPoints)} / {toDisplayValue(myPokemon.totalHealthPoints)}
                  </p>
                  <p className={styles.itemText}>
                    Moves:{' '}
                    {myPokemon.equippedMoves.length > 0
                      ? myPokemon.equippedMoves.map((move) => move.name).join(', ')
                      : 'sin movimientos equipados'}
                  </p>
                  <code className={styles.inlineCode}>{myPokemon.id}</code>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

