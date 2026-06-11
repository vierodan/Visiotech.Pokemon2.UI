import { useEffect, useState } from 'react';
import { getApiErrorMessage, getApiErrorStatus } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { getLastResponseStatus } from '../../../api/httpClient';
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
import {
  createRequestError,
  createRequestState,
  createRequestSuccess,
  setRequestLoading,
  type RequestState,
} from '../types/apiDemo';
import styles from './ApiDemo.module.css';
import { ApiActionButton } from './ApiActionButton';
import { moveCategoryOptions, pokemonTypeOptions } from './domainOptions';
import { EndpointCallout } from './EndpointCallout';
import { EndpointStepTitle } from './EndpointStepTitle';
import { TestingGuide } from './TestingGuide';
import { endpointDocs } from './endpointDocs';

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
    setMoveState((current) => setRequestLoading(current));

    try {
      const data = await pokemonApi.getMoves(query);

      setMoveState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setMoveState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadSpecies = async (query: PokemonSpeciesCatalogQuery): Promise<void> => {
    setSpeciesState((current) => setRequestLoading(current));

    try {
      const data = await pokemonApi.getPokemons(query);

      setSpeciesState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setSpeciesState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadMyPokemons = async (query: MyPokemonCatalogQuery): Promise<void> => {
    setMyPokemonState((current) => setRequestLoading(current));

    try {
      const data = await pokemonApi.getMyPokemons(query);

      setMyPokemonState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setMyPokemonState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void loadMoves(defaultMoveFilters);
    void loadSpecies(defaultSpeciesFilters);
    void loadMyPokemons(defaultMyPokemonFilters);
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
        <form
          className={styles.endpointStep}
          onSubmit={(event) => {
            event.preventDefault();
            void loadMoves(moveFilters);
          }}
        >
          <EndpointStepTitle path="/api/v1/moves" title="Catálogo de movimientos" />
          <TestingGuide
            steps={[
              'Escribe filtros opcionales en name, type o category.',
              'Ajusta page y pageSize si quieres paginar resultados.',
              'Pulsa Ejecutar y revisa abajo las cards devueltas por GET /api/v1/moves.',
            ]}
          />
          <EndpointCallout {...endpointDocs.catalogMoves} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton requests={[{ method: 'GET', path: '/api/v1/moves', query: moveFilters }]} type="submit" />
          </div>
          <div className={styles.endpointStepFields}>
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
              <select
                className={styles.select}
                value={moveFilters.type ?? ''}
                onChange={(event) => setMoveFilters((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="">Todos los tipos</option>
                {pokemonTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>category</span>
              <select
                className={styles.select}
                value={moveFilters.category ?? ''}
                onChange={(event) => setMoveFilters((current) => ({ ...current, category: event.target.value }))}
              >
                <option value="">Todas las categorías</option>
                {moveCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
          </div>
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
        </form>
      </section>

      <section className={styles.resourceCard}>
        <form
          className={styles.endpointStep}
          onSubmit={(event) => {
            event.preventDefault();
            void loadSpecies(speciesFilters);
          }}
        >
          <EndpointStepTitle path="/api/v1/pokemons" title="Catálogo de especies base" />
          <TestingGuide
            steps={[
              'Filtra especies por name o type si quieres acotar el catálogo.',
              'Pulsa Ejecutar para lanzar GET /api/v1/pokemons.',
              'Comprueba abajo los tipos, stats base e ids de las especies recibidas.',
            ]}
          />
          <EndpointCallout {...endpointDocs.catalogSpecies} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton
              requests={[{ method: 'GET', path: '/api/v1/pokemons', query: speciesFilters }]}
              type="submit"
            />
          </div>
          <div className={styles.endpointStepFields}>
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
              <select
                className={styles.select}
                value={speciesFilters.type ?? ''}
                onChange={(event) => setSpeciesFilters((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="">Todos los tipos</option>
                {pokemonTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
          </div>
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
        </form>
      </section>

      <section className={styles.resourceCard}>
        <form
          className={styles.endpointStep}
          onSubmit={(event) => {
            event.preventDefault();
            void loadMyPokemons(myPokemonFilters);
          }}
        >
          <EndpointStepTitle path="/api/v1/my-pokemons" title="Instancias jugables" />
          <TestingGuide
            steps={[
              'Ajusta page y pageSize para consultar las instancias jugables.',
              'Pulsa Ejecutar para lanzar GET /api/v1/my-pokemons.',
              'Revisa abajo cada instancia, su especie, su nivel y sus movimientos equipados.',
            ]}
          />
          <EndpointCallout {...endpointDocs.catalogMyPokemons} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton
              requests={[{ method: 'GET', path: '/api/v1/my-pokemons', query: myPokemonFilters }]}
              type="submit"
            />
          </div>
          <div className={styles.endpointStepFields}>
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
          </div>
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
        </form>
      </section>
    </div>
  );
}
