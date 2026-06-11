import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage, getApiErrorStatus } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { getLastResponseStatus } from '../../../api/httpClient';
import { pokemonApi } from '../../../api/pokemonApi';
import type {
  CreateMyPokemonRequestContract,
  CreatePokemonMoveRequestContract,
  CreatePokemonSpeciesRequestContract,
  MyPokemonContract,
  MyPokemonEquippedMovesContract,
  PokemonBaseStatsContract,
  PokemonLearnableMovesContract,
  PokemonMoveContract,
  PokemonMoveSharedSpeciesContract,
  PokemonSpeciesContract,
  UpdateMyPokemonRequestContract,
  UpdatePokemonLearnableMovesRequestContract,
  UpdatePokemonMoveRequestContract,
  UpdatePokemonSpeciesRequestContract,
} from '../../../api/contracts';
import {
  createRequestError,
  createRequestState,
  createRequestSuccess,
  setRequestLoading,
  type RequestState,
} from '../types/apiDemo';
import { ApiResultView } from './ApiResultView';
import styles from './ApiDemo.module.css';
import { ApiActionButton } from './ApiActionButton';
import { moveCategoryOptions, pokemonTypeOptions } from './domainOptions';
import { EndpointCallout } from './EndpointCallout';
import { EndpointStepTitle } from './EndpointStepTitle';
import { MultiValuePicker } from './MultiValuePicker';
import { TestingGuide } from './TestingGuide';
import { endpointDocs } from './endpointDocs';

interface ReferenceData {
  moves: PokemonMoveContract[];
  myPokemons: MyPokemonContract[];
  species: PokemonSpeciesContract[];
}

interface MoveFormState {
  category: string;
  name: string;
  power: string;
  type: string;
}

interface SpeciesFormState {
  attack: string;
  defense: string;
  health: string;
  name: string;
  specialAttack: string;
  specialDefense: string;
  speed: string;
  typesText: string;
}

interface MyPokemonFormState {
  currentHealthPoints: string;
  equippedMoveIds: string[];
  level: string;
  pokemonSpeciesId: string;
  totalHealthPoints: string;
}

interface MyPokemonUpdateFormState {
  currentHealthPoints: string;
  equippedMoveIds: string[];
  level: string;
  totalHealthPoints: string;
}

const defaultMoveForm: MoveFormState = {
  category: '',
  name: '',
  power: '40',
  type: '',
};

const defaultSpeciesForm: SpeciesFormState = {
  attack: '50',
  defense: '50',
  health: '50',
  name: '',
  specialAttack: '50',
  specialDefense: '50',
  speed: '50',
  typesText: '',
};

const defaultMyPokemonForm: MyPokemonFormState = {
  currentHealthPoints: '100',
  equippedMoveIds: [],
  level: '10',
  pokemonSpeciesId: '',
  totalHealthPoints: '100',
};

const defaultMyPokemonUpdateForm: MyPokemonUpdateFormState = {
  currentHealthPoints: '100',
  equippedMoveIds: [],
  level: '10',
  totalHealthPoints: '100',
};

const defaultLearnableMovesForm: UpdatePokemonLearnableMovesRequestContract = {
  addMoveIds: [],
  removeMoveIds: [],
};

const toNumber = (value: string): number => Number(value) || 0;

const parseTypes = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const buildBaseStats = (form: SpeciesFormState): PokemonBaseStatsContract => ({
  attack: toNumber(form.attack),
  defense: toNumber(form.defense),
  health: toNumber(form.health),
  specialAttack: toNumber(form.specialAttack),
  specialDefense: toNumber(form.specialDefense),
  speed: toNumber(form.speed),
});

const setLoading = <T,>(setter: React.Dispatch<React.SetStateAction<RequestState<T>>>): void => {
  setter((current) => setRequestLoading(current));
};

export function EndpointWorkbench(): JSX.Element {
  const [referencesState, setReferencesState] = useState<RequestState<ReferenceData>>(createRequestState<ReferenceData>());

  const [selectedMoveId, setSelectedMoveId] = useState<string>('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const [selectedMyPokemonId, setSelectedMyPokemonId] = useState<string>('');

  const [moveCreateForm, setMoveCreateForm] = useState<MoveFormState>(defaultMoveForm);
  const [moveUpdateForm, setMoveUpdateForm] = useState<MoveFormState>(defaultMoveForm);
  const [speciesCreateForm, setSpeciesCreateForm] = useState<SpeciesFormState>(defaultSpeciesForm);
  const [speciesUpdateForm, setSpeciesUpdateForm] = useState<SpeciesFormState>(defaultSpeciesForm);
  const [myPokemonCreateForm, setMyPokemonCreateForm] = useState<MyPokemonFormState>(defaultMyPokemonForm);
  const [myPokemonUpdateForm, setMyPokemonUpdateForm] = useState<MyPokemonUpdateFormState>(defaultMyPokemonUpdateForm);
  const [learnableMovesForm, setLearnableMovesForm] =
    useState<UpdatePokemonLearnableMovesRequestContract>(defaultLearnableMovesForm);

  const [moveMutationState, setMoveMutationState] = useState<RequestState<PokemonMoveContract | null>>(
    createRequestState<PokemonMoveContract | null>(),
  );
  const [moveDetailState, setMoveDetailState] = useState<RequestState<PokemonMoveContract>>(
    createRequestState<PokemonMoveContract>(),
  );
  const [moveSharedSpeciesState, setMoveSharedSpeciesState] = useState<RequestState<PokemonMoveSharedSpeciesContract>>(
    createRequestState<PokemonMoveSharedSpeciesContract>(),
  );

  const [speciesMutationState, setSpeciesMutationState] = useState<RequestState<PokemonSpeciesContract | null>>(
    createRequestState<PokemonSpeciesContract | null>(),
  );
  const [speciesDetailState, setSpeciesDetailState] = useState<RequestState<PokemonSpeciesContract>>(
    createRequestState<PokemonSpeciesContract>(),
  );
  const [learnableMovesState, setLearnableMovesState] = useState<RequestState<PokemonLearnableMovesContract>>(
    createRequestState<PokemonLearnableMovesContract>(),
  );

  const [myPokemonMutationState, setMyPokemonMutationState] = useState<RequestState<MyPokemonContract | null>>(
    createRequestState<MyPokemonContract | null>(),
  );
  const [myPokemonDetailState, setMyPokemonDetailState] = useState<RequestState<MyPokemonContract>>(
    createRequestState<MyPokemonContract>(),
  );
  const [equippedMovesState, setEquippedMovesState] = useState<RequestState<MyPokemonEquippedMovesContract>>(
    createRequestState<MyPokemonEquippedMovesContract>(),
  );

  const refreshReferences = async (): Promise<void> => {
    setReferencesState((current) => setRequestLoading(current));

    try {
      const [moves, species, myPokemons] = await Promise.all([
        pokemonApi.getMoves({ page: 1, pageSize: 100 }),
        pokemonApi.getPokemons({ page: 1, pageSize: 100 }),
        pokemonApi.getMyPokemons({ page: 1, pageSize: 100 }),
      ]);

      setReferencesState(createRequestSuccess({
        moves: moves.items,
        myPokemons: myPokemons.items,
        species: species.items,
      }, getLastResponseStatus()));
    } catch (error) {
      setReferencesState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void refreshReferences();
  }, []);

  const moves = useMemo(() => referencesState.data?.moves ?? [], [referencesState.data?.moves]);
  const species = useMemo(() => referencesState.data?.species ?? [], [referencesState.data?.species]);
  const myPokemons = useMemo(() => referencesState.data?.myPokemons ?? [], [referencesState.data?.myPokemons]);

  useEffect(() => {
    if (!selectedMoveId && moves[0]) {
      setSelectedMoveId(moves[0].id);
    }
  }, [moves, selectedMoveId]);

  useEffect(() => {
    if (!selectedSpeciesId && species[0]) {
      setSelectedSpeciesId(species[0].id);
      setMyPokemonCreateForm((current) => ({
        ...current,
        pokemonSpeciesId: species[0].id,
      }));
    }
  }, [selectedSpeciesId, species]);

  useEffect(() => {
    if (!selectedMyPokemonId && myPokemons[0]) {
      setSelectedMyPokemonId(myPokemons[0].id);
    }
  }, [myPokemons, selectedMyPokemonId]);

  useEffect(() => {
    const selectedMove = moves.find((item) => item.id === selectedMoveId);

    if (!selectedMove) {
      return;
    }

    setMoveUpdateForm({
      category: selectedMove.category,
      name: selectedMove.name,
      power: String(selectedMove.power),
      type: selectedMove.type,
    });
  }, [moves, selectedMoveId]);

  useEffect(() => {
    const selectedSpecies = species.find((item) => item.id === selectedSpeciesId);

    if (!selectedSpecies) {
      return;
    }

    setSpeciesUpdateForm({
      attack: String(selectedSpecies.baseStats.attack),
      defense: String(selectedSpecies.baseStats.defense),
      health: String(selectedSpecies.baseStats.health),
      name: selectedSpecies.name,
      specialAttack: String(selectedSpecies.baseStats.specialAttack),
      specialDefense: String(selectedSpecies.baseStats.specialDefense),
      speed: String(selectedSpecies.baseStats.speed),
      typesText: selectedSpecies.types.join(', '),
    });
    setLearnableMovesForm(defaultLearnableMovesForm);
  }, [selectedSpeciesId, species]);

  useEffect(() => {
    const selectedMyPokemon = myPokemons.find((item) => item.id === selectedMyPokemonId);

    if (!selectedMyPokemon) {
      return;
    }

    setMyPokemonUpdateForm({
      currentHealthPoints: String(selectedMyPokemon.currentHealthPoints),
      equippedMoveIds: selectedMyPokemon.equippedMoves.map((move) => move.id),
      level: String(selectedMyPokemon.level),
      totalHealthPoints: String(selectedMyPokemon.totalHealthPoints),
    });
  }, [myPokemons, selectedMyPokemonId]);

  const runMoveMutation = async (requestFactory: () => Promise<PokemonMoveContract | null>): Promise<void> => {
    setLoading(setMoveMutationState);

    try {
      const data = await requestFactory();
      setMoveMutationState(createRequestSuccess(data, getLastResponseStatus()));
      await refreshReferences();
    } catch (error) {
      setMoveMutationState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const runSpeciesMutation = async (requestFactory: () => Promise<PokemonSpeciesContract | null>): Promise<void> => {
    setLoading(setSpeciesMutationState);

    try {
      const data = await requestFactory();
      setSpeciesMutationState(createRequestSuccess(data, getLastResponseStatus()));
      await refreshReferences();
    } catch (error) {
      setSpeciesMutationState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const runMyPokemonMutation = async (requestFactory: () => Promise<MyPokemonContract | null>): Promise<void> => {
    setLoading(setMyPokemonMutationState);

    try {
      const data = await requestFactory();
      setMyPokemonMutationState(createRequestSuccess(data, getLastResponseStatus()));
      await refreshReferences();
    } catch (error) {
      setMyPokemonMutationState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadMoveDetail = async (): Promise<void> => {
    if (!selectedMoveId) {
      return;
    }

    setLoading(setMoveDetailState);

    try {
      const data = await pokemonApi.getMove(selectedMoveId);
      setMoveDetailState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setMoveDetailState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadMoveSharedSpecies = async (): Promise<void> => {
    if (!selectedMoveId) {
      return;
    }

    setLoading(setMoveSharedSpeciesState);

    try {
      const data = await pokemonApi.getMoveSharedSpecies(selectedMoveId);
      setMoveSharedSpeciesState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setMoveSharedSpeciesState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadSpeciesDetail = async (): Promise<void> => {
    if (!selectedSpeciesId) {
      return;
    }

    setLoading(setSpeciesDetailState);

    try {
      const data = await pokemonApi.getPokemon(selectedSpeciesId);
      setSpeciesDetailState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setSpeciesDetailState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadLearnableMoves = async (): Promise<void> => {
    if (!selectedSpeciesId) {
      return;
    }

    setLoading(setLearnableMovesState);

    try {
      const data = await pokemonApi.getPokemonLearnableMoves(selectedSpeciesId);
      setLearnableMovesState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setLearnableMovesState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadMyPokemonDetail = async (): Promise<void> => {
    if (!selectedMyPokemonId) {
      return;
    }

    setLoading(setMyPokemonDetailState);

    try {
      const data = await pokemonApi.getMyPokemon(selectedMyPokemonId);
      setMyPokemonDetailState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setMyPokemonDetailState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadEquippedMoves = async (): Promise<void> => {
    if (!selectedMyPokemonId) {
      return;
    }

    setLoading(setEquippedMovesState);

    try {
      const data = await pokemonApi.getMyPokemonEquippedMoves(selectedMyPokemonId);
      setEquippedMovesState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setEquippedMovesState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const buildMoveBody = (form: MoveFormState): CreatePokemonMoveRequestContract | UpdatePokemonMoveRequestContract => ({
    category: form.category.trim(),
    name: form.name.trim(),
    power: toNumber(form.power),
    type: form.type.trim(),
  });

  const buildSpeciesBody = (
    form: SpeciesFormState,
  ): CreatePokemonSpeciesRequestContract | UpdatePokemonSpeciesRequestContract => ({
    baseStats: buildBaseStats(form),
    name: form.name.trim(),
    types: parseTypes(form.typesText),
  });

  const buildMyPokemonCreateBody = (form: MyPokemonFormState): CreateMyPokemonRequestContract => ({
    currentHealthPoints: toNumber(form.currentHealthPoints),
    equippedMoveIds: form.equippedMoveIds,
    level: toNumber(form.level),
    pokemonSpeciesId: form.pokemonSpeciesId,
    totalHealthPoints: toNumber(form.totalHealthPoints),
  });

  const buildMyPokemonUpdateBody = (form: MyPokemonUpdateFormState): UpdateMyPokemonRequestContract => ({
    currentHealthPoints: toNumber(form.currentHealthPoints),
    equippedMoveIds: form.equippedMoveIds,
    level: toNumber(form.level),
    totalHealthPoints: toNumber(form.totalHealthPoints),
  });

  if (!hasConfiguredApi) {
    return (
      <div className={styles.noticeBox}>
        <strong>Configura la API primero</strong>
        <p>Cuando exista `VITE_API_BASE_URL`, este bloque permitirá probar el resto del contrato endpoint por endpoint.</p>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <section className={styles.endpointStep}>
        <EndpointStepTitle
          path={['/api/v1/moves', '/api/v1/pokemons', '/api/v1/my-pokemons']}
          title="Cargar referencias base"
        />
        <EndpointCallout {...endpointDocs.loadReferences} />
        <div className={styles.endpointStepAction}>
          <ApiActionButton
            onClick={() => void refreshReferences()}
            requests={[
              { method: 'GET', path: '/api/v1/moves', query: { page: 1, pageSize: 100 } },
              { method: 'GET', path: '/api/v1/pokemons', query: { page: 1, pageSize: 100 } },
              { method: 'GET', path: '/api/v1/my-pokemons', query: { page: 1, pageSize: 100 } },
            ]}
          />
        </div>
        <ApiResultView
          idleMessage="La demo carga listas de referencia para poblar selectores y poder probar relaciones y actualizaciones."
          state={referencesState}
          successMessage="Referencias sincronizadas."
        />
      </section>

      <details className={styles.detailsCard} open>
        <summary className={styles.detailsSummary}>Movimientos · POST, GET detalle, PUT, DELETE y especies asociadas</summary>
        <div className={styles.detailsContent}>
          <div className={styles.endpointFlow}>
            <form
              className={styles.endpointStep}
              onSubmit={(event) => {
                event.preventDefault();
                void runMoveMutation(async () => {
                  const data = await pokemonApi.createMove(buildMoveBody(moveCreateForm));
                  setSelectedMoveId(data.id);
                  return data;
                });
              }}
            >
              <EndpointStepTitle path="/api/v1/moves" title="Crear movimiento" />
              <TestingGuide
                steps={[
                  'Rellena name, type, category y power y pulsa POST /moves para crear un movimiento.',
                  'Selecciona un move id del desplegable y usa GET /moves/{id} para ver su detalle.',
                  'Con ese mismo id, prueba GET /moves/{id}/pokemon-species para ver especies asociadas.',
                  'Modifica los campos inferiores y pulsa PUT /moves/{id} para actualizar, o DELETE /moves/{id} para borrar.',
                ]}
              />
              <EndpointCallout {...endpointDocs.moveCreate} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton requests={[{ method: 'POST', path: '/api/v1/moves' }]} type="submit" />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>name</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={moveCreateForm.name}
                    onChange={(event) => setMoveCreateForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>type</span>
                  <select
                    className={styles.select}
                    value={moveCreateForm.type}
                    onChange={(event) => setMoveCreateForm((current) => ({ ...current, type: event.target.value }))}
                  >
                    <option value="">Selecciona un tipo</option>
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
                    value={moveCreateForm.category}
                    onChange={(event) => setMoveCreateForm((current) => ({ ...current, category: event.target.value }))}
                  >
                    <option value="">Selecciona una categoría</option>
                    {moveCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>power</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={moveCreateForm.power}
                    onChange={(event) => setMoveCreateForm((current) => ({ ...current, power: event.target.value }))}
                  />
                </label>
              </div>
              <ApiResultView
                idleMessage="Crea un movimiento nuevo en el catálogo."
                state={moveMutationState}
                successMessage="Operación de movimiento completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </form>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/moves/{id}" title="Consultar detalle del movimiento" />
              <EndpointCallout {...endpointDocs.moveDetail} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() => void loadMoveDetail()}
                  requests={[{ method: 'GET', path: `/api/v1/moves/${selectedMoveId}` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>move id</span>
                  <select
                    className={styles.select}
                    value={selectedMoveId}
                    onChange={(event) => setSelectedMoveId(event.target.value)}
                  >
                    {moves.map((move) => (
                      <option key={move.id} value={move.id}>
                        {move.name} · {move.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Consulta el detalle del movimiento seleccionado."
                state={moveDetailState}
                successMessage="Detalle del movimiento."
              />
            </section>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/moves/{id}/pokemon-species" title="Consultar especies asociadas" />
              <EndpointCallout {...endpointDocs.moveSharedSpecies} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() => void loadMoveSharedSpecies()}
                  requests={[{ method: 'GET', path: `/api/v1/moves/${selectedMoveId}/pokemon-species` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>move id</span>
                  <select
                    className={styles.select}
                    value={selectedMoveId}
                    onChange={(event) => setSelectedMoveId(event.target.value)}
                  >
                    {moves.map((move) => (
                      <option key={move.id} value={move.id}>
                        {move.name} · {move.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Prueba la relación GET /api/v1/moves/{id}/pokemon-species."
                state={moveSharedSpeciesState}
                successMessage="Especies que comparten este movimiento."
              />
            </section>

            <form
              className={styles.endpointStep}
              onSubmit={(event) => {
                event.preventDefault();
                void runMoveMutation(() => pokemonApi.updateMove(selectedMoveId, buildMoveBody(moveUpdateForm)));
              }}
            >
              <EndpointStepTitle path="/api/v1/moves/{id}" title="Actualizar movimiento" />
              <EndpointCallout {...endpointDocs.moveUpdate} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton requests={[{ method: 'PUT', path: `/api/v1/moves/${selectedMoveId}` }]} type="submit" />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>name</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={moveUpdateForm.name}
                    onChange={(event) => setMoveUpdateForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>type</span>
                  <select
                    className={styles.select}
                    value={moveUpdateForm.type}
                    onChange={(event) => setMoveUpdateForm((current) => ({ ...current, type: event.target.value }))}
                  >
                    <option value="">Selecciona un tipo</option>
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
                    value={moveUpdateForm.category}
                    onChange={(event) => setMoveUpdateForm((current) => ({ ...current, category: event.target.value }))}
                  >
                    <option value="">Selecciona una categoría</option>
                    {moveCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>power</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={moveUpdateForm.power}
                    onChange={(event) => setMoveUpdateForm((current) => ({ ...current, power: event.target.value }))}
                  />
                </label>
              </div>
              <ApiResultView
                idleMessage="Actualiza el movimiento seleccionado."
                state={moveMutationState}
                successMessage="Operación de movimiento completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </form>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/moves/{id}" title="Eliminar movimiento" />
              <EndpointCallout {...endpointDocs.moveDelete} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() =>
                    void runMoveMutation(async () => {
                      await pokemonApi.deleteMove(selectedMoveId);
                      return null;
                    })
                  }
                  requests={[{ method: 'DELETE', path: `/api/v1/moves/${selectedMoveId}` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>move id</span>
                  <select
                    className={styles.select}
                    value={selectedMoveId}
                    onChange={(event) => setSelectedMoveId(event.target.value)}
                  >
                    {moves.map((move) => (
                      <option key={move.id} value={move.id}>
                        {move.name} · {move.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Elimina el movimiento seleccionado."
                state={moveMutationState}
                successMessage="Operación de movimiento completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </section>
          </div>
        </div>
      </details>

      <details className={styles.detailsCard}>
        <summary className={styles.detailsSummary}>Especies base · POST, GET detalle, PUT, DELETE y movimientos aprendibles</summary>
        <div className={styles.detailsContent}>
          <div className={styles.endpointFlow}>
            <form
              className={styles.endpointStep}
              onSubmit={(event) => {
                event.preventDefault();
                void runSpeciesMutation(async () => {
                  const data = await pokemonApi.createPokemon(buildSpeciesBody(speciesCreateForm));
                  setSelectedSpeciesId(data.id);
                  return data;
                });
              }}
            >
              <EndpointStepTitle path="/api/v1/pokemons" title="Crear especie base" />
              <TestingGuide
                steps={[
                  'Crea una especie base rellenando name, types y stats y pulsando POST /pokemons.',
                  'Selecciona un pokemon id y prueba GET /pokemons/{id} para consultar el detalle.',
                  'Usa GET /pokemons/{id}/learnable-moves para revisar los movimientos aprendibles actuales.',
                  'Actualiza los datos con PUT /pokemons/{id} o cambia addMoveIds/removeMoveIds para probar learnable-moves.',
                ]}
              />
              <EndpointCallout {...endpointDocs.speciesCreate} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton requests={[{ method: 'POST', path: '/api/v1/pokemons' }]} type="submit" />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>name</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={speciesCreateForm.name}
                    onChange={(event) => setSpeciesCreateForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>types (csv)</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={speciesCreateForm.typesText}
                    onChange={(event) => setSpeciesCreateForm((current) => ({ ...current, typesText: event.target.value }))}
                    placeholder="electric, steel"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>health</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesCreateForm.health}
                    onChange={(event) => setSpeciesCreateForm((current) => ({ ...current, health: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>attack</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesCreateForm.attack}
                    onChange={(event) => setSpeciesCreateForm((current) => ({ ...current, attack: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>defense</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesCreateForm.defense}
                    onChange={(event) => setSpeciesCreateForm((current) => ({ ...current, defense: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>specialAttack</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesCreateForm.specialAttack}
                    onChange={(event) =>
                      setSpeciesCreateForm((current) => ({ ...current, specialAttack: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>specialDefense</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesCreateForm.specialDefense}
                    onChange={(event) =>
                      setSpeciesCreateForm((current) => ({ ...current, specialDefense: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>speed</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesCreateForm.speed}
                    onChange={(event) => setSpeciesCreateForm((current) => ({ ...current, speed: event.target.value }))}
                  />
                </label>
              </div>
              <ApiResultView
                idleMessage="Crea una especie base nueva."
                state={speciesMutationState}
                successMessage="Operación de especie completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </form>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/pokemons/{id}" title="Consultar detalle de especie" />
              <EndpointCallout {...endpointDocs.speciesDetail} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() => void loadSpeciesDetail()}
                  requests={[{ method: 'GET', path: `/api/v1/pokemons/${selectedSpeciesId}` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>pokemon id</span>
                  <select
                    className={styles.select}
                    value={selectedSpeciesId}
                    onChange={(event) => setSelectedSpeciesId(event.target.value)}
                  >
                    {species.map((pokemon) => (
                      <option key={pokemon.id} value={pokemon.id}>
                        {pokemon.name} · {pokemon.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Consulta el detalle de la especie seleccionada."
                state={speciesDetailState}
                successMessage="Detalle de la especie."
              />
            </section>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/pokemons/{id}/learnable-moves" title="Consultar movimientos aprendibles" />
              <EndpointCallout {...endpointDocs.speciesLearnableGet} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() => void loadLearnableMoves()}
                  requests={[{ method: 'GET', path: `/api/v1/pokemons/${selectedSpeciesId}/learnable-moves` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>pokemon id</span>
                  <select
                    className={styles.select}
                    value={selectedSpeciesId}
                    onChange={(event) => setSelectedSpeciesId(event.target.value)}
                  >
                    {species.map((pokemon) => (
                      <option key={pokemon.id} value={pokemon.id}>
                        {pokemon.name} · {pokemon.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Consulta los movimientos aprendibles actuales."
                state={learnableMovesState}
                successMessage="Respuesta de movimientos aprendibles."
              />
            </section>

            <form
              className={styles.endpointStep}
              onSubmit={(event) => {
                event.preventDefault();
                void runSpeciesMutation(() => pokemonApi.updatePokemon(selectedSpeciesId, buildSpeciesBody(speciesUpdateForm)));
              }}
            >
              <EndpointStepTitle path="/api/v1/pokemons/{id}" title="Actualizar especie base" />
              <EndpointCallout {...endpointDocs.speciesUpdate} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton requests={[{ method: 'PUT', path: `/api/v1/pokemons/${selectedSpeciesId}` }]} type="submit" />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>name</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={speciesUpdateForm.name}
                    onChange={(event) => setSpeciesUpdateForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>types (csv)</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={speciesUpdateForm.typesText}
                    onChange={(event) => setSpeciesUpdateForm((current) => ({ ...current, typesText: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>health</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesUpdateForm.health}
                    onChange={(event) => setSpeciesUpdateForm((current) => ({ ...current, health: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>attack</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesUpdateForm.attack}
                    onChange={(event) => setSpeciesUpdateForm((current) => ({ ...current, attack: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>defense</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesUpdateForm.defense}
                    onChange={(event) => setSpeciesUpdateForm((current) => ({ ...current, defense: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>specialAttack</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesUpdateForm.specialAttack}
                    onChange={(event) =>
                      setSpeciesUpdateForm((current) => ({ ...current, specialAttack: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>specialDefense</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesUpdateForm.specialDefense}
                    onChange={(event) =>
                      setSpeciesUpdateForm((current) => ({ ...current, specialDefense: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>speed</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={speciesUpdateForm.speed}
                    onChange={(event) => setSpeciesUpdateForm((current) => ({ ...current, speed: event.target.value }))}
                  />
                </label>
              </div>
              <ApiResultView
                idleMessage="Actualiza la especie seleccionada."
                state={speciesMutationState}
                successMessage="Operación de especie completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </form>

            <form
              className={styles.endpointStep}
              onSubmit={(event) => {
                event.preventDefault();
                void (async () => {
                  setLoading(setLearnableMovesState);

                  try {
                    const data = await pokemonApi.updatePokemonLearnableMoves(selectedSpeciesId, learnableMovesForm);
                    setLearnableMovesState(createRequestSuccess(data, getLastResponseStatus()));
                  } catch (error) {
                    setLearnableMovesState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
                  }
                })();
              }}
            >
              <EndpointStepTitle path="/api/v1/pokemons/{id}/learnable-moves" title="Actualizar movimientos aprendibles" />
              <EndpointCallout {...endpointDocs.speciesLearnableUpdate} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  requests={[{ method: 'PUT', path: `/api/v1/pokemons/${selectedSpeciesId}/learnable-moves` }]}
                  type="submit"
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>addMoveIds</span>
                  <MultiValuePicker
                    onChange={(nextValue) =>
                      setLearnableMovesForm((current) => ({
                        ...current,
                        addMoveIds: nextValue,
                      }))
                    }
                    options={moves.map((move) => ({
                      description: move.id,
                      label: move.name,
                      value: move.id,
                    }))}
                    value={learnableMovesForm.addMoveIds ?? []}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>removeMoveIds</span>
                  <MultiValuePicker
                    onChange={(nextValue) =>
                      setLearnableMovesForm((current) => ({
                        ...current,
                        removeMoveIds: nextValue,
                      }))
                    }
                    options={moves.map((move) => ({
                      description: move.id,
                      label: move.name,
                      value: move.id,
                    }))}
                    value={learnableMovesForm.removeMoveIds ?? []}
                  />
                </label>
              </div>
              <ApiResultView
                idleMessage="Actualiza la relación de movimientos aprendibles."
                state={learnableMovesState}
                successMessage="Respuesta de movimientos aprendibles."
              />
            </form>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/pokemons/{id}" title="Eliminar especie base" />
              <EndpointCallout {...endpointDocs.speciesDelete} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() =>
                    void runSpeciesMutation(async () => {
                      await pokemonApi.deletePokemon(selectedSpeciesId);
                      return null;
                    })
                  }
                  requests={[{ method: 'DELETE', path: `/api/v1/pokemons/${selectedSpeciesId}` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>pokemon id</span>
                  <select
                    className={styles.select}
                    value={selectedSpeciesId}
                    onChange={(event) => setSelectedSpeciesId(event.target.value)}
                  >
                    {species.map((pokemon) => (
                      <option key={pokemon.id} value={pokemon.id}>
                        {pokemon.name} · {pokemon.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Elimina la especie seleccionada."
                state={speciesMutationState}
                successMessage="Operación de especie completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </section>
          </div>
        </div>
      </details>

      <details className={styles.detailsCard}>
        <summary className={styles.detailsSummary}>Instancias jugables · POST, GET detalle, PUT, DELETE y movimientos equipados</summary>
        <div className={styles.detailsContent}>
          <div className={styles.endpointFlow}>
            <form
              className={styles.endpointStep}
              onSubmit={(event) => {
                event.preventDefault();
                void runMyPokemonMutation(async () => {
                  const data = await pokemonApi.createMyPokemon(buildMyPokemonCreateBody(myPokemonCreateForm));
                  setSelectedMyPokemonId(data.id);
                  return data;
                });
              }}
            >
              <EndpointStepTitle path="/api/v1/my-pokemons" title="Crear my-pokemon" />
              <TestingGuide
                steps={[
                  'Selecciona una especie base, define nivel y vida, elige equippedMoveIds y pulsa POST /my-pokemons.',
                  'Con una instancia seleccionada, ejecuta GET /my-pokemons/{id} para ver su detalle.',
                  'Pulsa GET /my-pokemons/{id}/equipped-moves para comprobar la relación de movimientos equipados.',
                  'Actualiza nivel, vida o equippedMoveIds con PUT /my-pokemons/{id}, o elimina la instancia con DELETE.',
                ]}
              />
              <EndpointCallout {...endpointDocs.myPokemonCreate} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton requests={[{ method: 'POST', path: '/api/v1/my-pokemons' }]} type="submit" />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>pokemonSpeciesId</span>
                  <select
                    className={styles.select}
                    value={myPokemonCreateForm.pokemonSpeciesId}
                    onChange={(event) =>
                      setMyPokemonCreateForm((current) => ({
                        ...current,
                        pokemonSpeciesId: event.target.value,
                      }))
                    }
                  >
                    {species.map((pokemon) => (
                      <option key={pokemon.id} value={pokemon.id}>
                        {pokemon.name} · {pokemon.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>level</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={myPokemonCreateForm.level}
                    onChange={(event) => setMyPokemonCreateForm((current) => ({ ...current, level: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>currentHealthPoints</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={myPokemonCreateForm.currentHealthPoints}
                    onChange={(event) =>
                      setMyPokemonCreateForm((current) => ({ ...current, currentHealthPoints: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>totalHealthPoints</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={myPokemonCreateForm.totalHealthPoints}
                    onChange={(event) =>
                      setMyPokemonCreateForm((current) => ({ ...current, totalHealthPoints: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>equippedMoveIds</span>
                  <MultiValuePicker
                    onChange={(nextValue) =>
                      setMyPokemonCreateForm((current) => ({
                        ...current,
                        equippedMoveIds: nextValue,
                      }))
                    }
                    options={moves.map((move) => ({
                      description: move.id,
                      label: move.name,
                      value: move.id,
                    }))}
                    value={myPokemonCreateForm.equippedMoveIds}
                  />
                </label>
              </div>
              <ApiResultView
                idleMessage="Crea una instancia jugable nueva."
                state={myPokemonMutationState}
                successMessage="Operación de my-pokemon completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </form>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/my-pokemons/{id}" title="Consultar detalle de my-pokemon" />
              <EndpointCallout {...endpointDocs.myPokemonDetail} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() => void loadMyPokemonDetail()}
                  requests={[{ method: 'GET', path: `/api/v1/my-pokemons/${selectedMyPokemonId}` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>myPokemon id</span>
                  <select
                    className={styles.select}
                    value={selectedMyPokemonId}
                    onChange={(event) => setSelectedMyPokemonId(event.target.value)}
                  >
                    {myPokemons.map((pokemon) => (
                      <option key={pokemon.id} value={pokemon.id}>
                        {pokemon.species.name} · {pokemon.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Consulta el detalle de la instancia seleccionada."
                state={myPokemonDetailState}
                successMessage="Detalle de my-pokemon."
              />
            </section>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/my-pokemons/{id}/equipped-moves" title="Consultar movimientos equipados" />
              <EndpointCallout {...endpointDocs.myPokemonEquipped} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() => void loadEquippedMoves()}
                  requests={[{ method: 'GET', path: `/api/v1/my-pokemons/${selectedMyPokemonId}/equipped-moves` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>myPokemon id</span>
                  <select
                    className={styles.select}
                    value={selectedMyPokemonId}
                    onChange={(event) => setSelectedMyPokemonId(event.target.value)}
                  >
                    {myPokemons.map((pokemon) => (
                      <option key={pokemon.id} value={pokemon.id}>
                        {pokemon.species.name} · {pokemon.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Consulta la relación de movimientos equipados."
                state={equippedMovesState}
                successMessage="Movimientos equipados."
              />
            </section>

            <form
              className={styles.endpointStep}
              onSubmit={(event) => {
                event.preventDefault();
                void runMyPokemonMutation(() =>
                  pokemonApi.updateMyPokemon(selectedMyPokemonId, buildMyPokemonUpdateBody(myPokemonUpdateForm)),
                );
              }}
            >
              <EndpointStepTitle path="/api/v1/my-pokemons/{id}" title="Actualizar my-pokemon" />
              <EndpointCallout {...endpointDocs.myPokemonUpdate} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  requests={[{ method: 'PUT', path: `/api/v1/my-pokemons/${selectedMyPokemonId}` }]}
                  type="submit"
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>level</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={myPokemonUpdateForm.level}
                    onChange={(event) => setMyPokemonUpdateForm((current) => ({ ...current, level: event.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>currentHealthPoints</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={myPokemonUpdateForm.currentHealthPoints}
                    onChange={(event) =>
                      setMyPokemonUpdateForm((current) => ({ ...current, currentHealthPoints: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>totalHealthPoints</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={myPokemonUpdateForm.totalHealthPoints}
                    onChange={(event) =>
                      setMyPokemonUpdateForm((current) => ({ ...current, totalHealthPoints: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>equippedMoveIds</span>
                  <MultiValuePicker
                    onChange={(nextValue) =>
                      setMyPokemonUpdateForm((current) => ({
                        ...current,
                        equippedMoveIds: nextValue,
                      }))
                    }
                    options={moves.map((move) => ({
                      description: move.id,
                      label: move.name,
                      value: move.id,
                    }))}
                    value={myPokemonUpdateForm.equippedMoveIds}
                  />
                </label>
              </div>
              <ApiResultView
                idleMessage="Actualiza la instancia seleccionada."
                state={myPokemonMutationState}
                successMessage="Operación de my-pokemon completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </form>

            <section className={styles.endpointStep}>
              <EndpointStepTitle path="/api/v1/my-pokemons/{id}" title="Eliminar my-pokemon" />
              <EndpointCallout {...endpointDocs.myPokemonDelete} />
              <div className={styles.endpointStepAction}>
                <ApiActionButton
                  onClick={() =>
                    void runMyPokemonMutation(async () => {
                      await pokemonApi.deleteMyPokemon(selectedMyPokemonId);
                      return null;
                    })
                  }
                  requests={[{ method: 'DELETE', path: `/api/v1/my-pokemons/${selectedMyPokemonId}` }]}
                />
              </div>
              <div className={styles.endpointStepFields}>
                <label className={styles.field}>
                  <span className={styles.label}>myPokemon id</span>
                  <select
                    className={styles.select}
                    value={selectedMyPokemonId}
                    onChange={(event) => setSelectedMyPokemonId(event.target.value)}
                  >
                    {myPokemons.map((pokemon) => (
                      <option key={pokemon.id} value={pokemon.id}>
                        {pokemon.species.name} · {pokemon.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ApiResultView
                idleMessage="Elimina la instancia seleccionada."
                state={myPokemonMutationState}
                successMessage="Operación de my-pokemon completada."
                emptyMessage="La operación DELETE devolvió 204 No Content."
              />
            </section>
          </div>
        </div>
      </details>
    </div>
  );
}
