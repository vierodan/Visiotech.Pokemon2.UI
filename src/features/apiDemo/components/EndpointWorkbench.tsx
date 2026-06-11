import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
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
import { createRequestState, type RequestState } from '../types/apiDemo';
import { ApiResultView } from './ApiResultView';
import styles from './ApiDemo.module.css';
import { TestingGuide } from './TestingGuide';

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

const readSelectedValues = (element: HTMLSelectElement): string[] =>
  Array.from(element.selectedOptions).map((option) => option.value);

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
  setter((current) => ({
    ...current,
    error: null,
    status: 'loading',
  }));
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
    setReferencesState((current) => ({
      ...current,
      error: null,
      status: 'loading',
    }));

    try {
      const [moves, species, myPokemons] = await Promise.all([
        pokemonApi.getMoves({ page: 1, pageSize: 100 }),
        pokemonApi.getPokemons({ page: 1, pageSize: 100 }),
        pokemonApi.getMyPokemons({ page: 1, pageSize: 100 }),
      ]);

      setReferencesState({
        data: {
          moves: moves.items,
          myPokemons: myPokemons.items,
          species: species.items,
        },
        error: null,
        status: 'success',
      });
    } catch (error) {
      setReferencesState({
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
      setMoveMutationState({
        data,
        error: null,
        status: 'success',
      });
      await refreshReferences();
    } catch (error) {
      setMoveMutationState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const runSpeciesMutation = async (requestFactory: () => Promise<PokemonSpeciesContract | null>): Promise<void> => {
    setLoading(setSpeciesMutationState);

    try {
      const data = await requestFactory();
      setSpeciesMutationState({
        data,
        error: null,
        status: 'success',
      });
      await refreshReferences();
    } catch (error) {
      setSpeciesMutationState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const runMyPokemonMutation = async (requestFactory: () => Promise<MyPokemonContract | null>): Promise<void> => {
    setLoading(setMyPokemonMutationState);

    try {
      const data = await requestFactory();
      setMyPokemonMutationState({
        data,
        error: null,
        status: 'success',
      });
      await refreshReferences();
    } catch (error) {
      setMyPokemonMutationState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadMoveDetail = async (): Promise<void> => {
    if (!selectedMoveId) {
      return;
    }

    setLoading(setMoveDetailState);

    try {
      const data = await pokemonApi.getMove(selectedMoveId);
      setMoveDetailState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setMoveDetailState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadMoveSharedSpecies = async (): Promise<void> => {
    if (!selectedMoveId) {
      return;
    }

    setLoading(setMoveSharedSpeciesState);

    try {
      const data = await pokemonApi.getMoveSharedSpecies(selectedMoveId);
      setMoveSharedSpeciesState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setMoveSharedSpeciesState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadSpeciesDetail = async (): Promise<void> => {
    if (!selectedSpeciesId) {
      return;
    }

    setLoading(setSpeciesDetailState);

    try {
      const data = await pokemonApi.getPokemon(selectedSpeciesId);
      setSpeciesDetailState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setSpeciesDetailState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadLearnableMoves = async (): Promise<void> => {
    if (!selectedSpeciesId) {
      return;
    }

    setLoading(setLearnableMovesState);

    try {
      const data = await pokemonApi.getPokemonLearnableMoves(selectedSpeciesId);
      setLearnableMovesState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setLearnableMovesState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadMyPokemonDetail = async (): Promise<void> => {
    if (!selectedMyPokemonId) {
      return;
    }

    setLoading(setMyPokemonDetailState);

    try {
      const data = await pokemonApi.getMyPokemon(selectedMyPokemonId);
      setMyPokemonDetailState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setMyPokemonDetailState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadEquippedMoves = async (): Promise<void> => {
    if (!selectedMyPokemonId) {
      return;
    }

    setLoading(setEquippedMovesState);

    try {
      const data = await pokemonApi.getMyPokemonEquippedMoves(selectedMyPokemonId);
      setEquippedMovesState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setEquippedMovesState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
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
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.panelEyebrow}>Cobertura completa</p>
          <h3 className={styles.panelTitle}>CRUD, detalles y relaciones</h3>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={() => void refreshReferences()}>
          Recargar referencias
        </button>
      </div>

      <ApiResultView
        idleMessage="La demo carga listas de referencia para poblar selects y poder probar relaciones y updates."
        state={referencesState}
        successMessage="Referencias sincronizadas."
      />

      <details className={styles.detailsCard} open>
        <summary className={styles.detailsSummary}>Moves · POST, GET detail, PUT, DELETE y shared species</summary>
        <div className={styles.detailsContent}>
          <TestingGuide
            steps={[
              'Rellena name, type, category y power y pulsa POST /moves para crear un movimiento.',
              'Selecciona un move id del desplegable y usa GET /moves/{id} para ver su detalle.',
              'Con ese mismo id, prueba GET /moves/{id}/pokemon-species para ver especies asociadas.',
              'Modifica los campos inferiores y pulsa PUT /moves/{id} para actualizar, o DELETE /moves/{id} para borrar.',
            ]}
          />

          <form
            className={styles.operationGrid}
            onSubmit={(event) => {
              event.preventDefault();
              void runMoveMutation(async () => {
                const data = await pokemonApi.createMove(buildMoveBody(moveCreateForm));
                setSelectedMoveId(data.id);
                return data;
              });
            }}
          >
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
              <input
                className={styles.input}
                type="text"
                value={moveCreateForm.type}
                onChange={(event) => setMoveCreateForm((current) => ({ ...current, type: event.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>category</span>
              <input
                className={styles.input}
                type="text"
                value={moveCreateForm.category}
                onChange={(event) => setMoveCreateForm((current) => ({ ...current, category: event.target.value }))}
              />
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
            <button className={styles.primaryButton} type="submit">
              POST /moves
            </button>
          </form>

          <div className={styles.helperRow}>
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
            <button className={styles.secondaryButton} type="button" onClick={() => void loadMoveDetail()}>
              GET /moves/{'{id}'}
            </button>
            <button className={styles.secondaryButton} type="button" onClick={() => void loadMoveSharedSpecies()}>
              GET /moves/{'{id}'}/pokemon-species
            </button>
            <button
              className={styles.dangerButton}
              type="button"
              onClick={() =>
                void runMoveMutation(async () => {
                  await pokemonApi.deleteMove(selectedMoveId);
                  return null;
                })
              }
            >
              DELETE /moves/{'{id}'}
            </button>
          </div>

          <form
            className={styles.operationGrid}
            onSubmit={(event) => {
              event.preventDefault();
              void runMoveMutation(() => pokemonApi.updateMove(selectedMoveId, buildMoveBody(moveUpdateForm)));
            }}
          >
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
              <input
                className={styles.input}
                type="text"
                value={moveUpdateForm.type}
                onChange={(event) => setMoveUpdateForm((current) => ({ ...current, type: event.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>category</span>
              <input
                className={styles.input}
                type="text"
                value={moveUpdateForm.category}
                onChange={(event) => setMoveUpdateForm((current) => ({ ...current, category: event.target.value }))}
              />
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
            <button className={styles.primaryButton} type="submit">
              PUT /moves/{'{id}'}
            </button>
          </form>

          <div className={styles.dualColumn}>
            <ApiResultView
              idleMessage="Crea, actualiza o elimina un movimiento del catálogo."
              state={moveMutationState}
              successMessage="Operación de movimiento completada."
              emptyMessage="La operación DELETE devolvió 204 No Content."
            />
            <ApiResultView
              idleMessage="Consulta el detalle o las especies asociadas al movimiento seleccionado."
              state={moveDetailState}
              successMessage="Detalle del movimiento."
            />
          </div>

          <ApiResultView
            idleMessage="Prueba la relación GET /api/v1/moves/{id}/pokemon-species."
            state={moveSharedSpeciesState}
            successMessage="Especies que comparten este movimiento."
          />
        </div>
      </details>

      <details className={styles.detailsCard}>
        <summary className={styles.detailsSummary}>Pokemons · POST, GET detail, PUT, DELETE y learnable moves</summary>
        <div className={styles.detailsContent}>
          <TestingGuide
            steps={[
              'Crea una especie base rellenando name, types y stats y pulsando POST /pokemons.',
              'Selecciona un pokemon id y prueba GET /pokemons/{id} para consultar el detalle.',
              'Usa GET /pokemons/{id}/learnable-moves para revisar los movimientos aprendibles actuales.',
              'Actualiza los datos con PUT /pokemons/{id} o cambia addMoveIds/removeMoveIds para probar learnable-moves.',
            ]}
          />

          <form
            className={styles.operationWideGrid}
            onSubmit={(event) => {
              event.preventDefault();
              void runSpeciesMutation(async () => {
                const data = await pokemonApi.createPokemon(buildSpeciesBody(speciesCreateForm));
                setSelectedSpeciesId(data.id);
                return data;
              });
            }}
          >
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
            <button className={styles.primaryButton} type="submit">
              POST /pokemons
            </button>
          </form>

          <div className={styles.helperRow}>
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
            <button className={styles.secondaryButton} type="button" onClick={() => void loadSpeciesDetail()}>
              GET /pokemons/{'{id}'}
            </button>
            <button className={styles.secondaryButton} type="button" onClick={() => void loadLearnableMoves()}>
              GET /pokemons/{'{id}'}/learnable-moves
            </button>
            <button
              className={styles.dangerButton}
              type="button"
              onClick={() =>
                void runSpeciesMutation(async () => {
                  await pokemonApi.deletePokemon(selectedSpeciesId);
                  return null;
                })
              }
            >
              DELETE /pokemons/{'{id}'}
            </button>
          </div>

          <form
            className={styles.operationWideGrid}
            onSubmit={(event) => {
              event.preventDefault();
              void runSpeciesMutation(() => pokemonApi.updatePokemon(selectedSpeciesId, buildSpeciesBody(speciesUpdateForm)));
            }}
          >
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
            <button className={styles.primaryButton} type="submit">
              PUT /pokemons/{'{id}'}
            </button>
          </form>

          <form
            className={styles.operationWideGrid}
            onSubmit={(event) => {
              event.preventDefault();
              void (async () => {
                setLoading(setLearnableMovesState);

                try {
                  const data = await pokemonApi.updatePokemonLearnableMoves(selectedSpeciesId, learnableMovesForm);
                  setLearnableMovesState({
                    data,
                    error: null,
                    status: 'success',
                  });
                } catch (error) {
                  setLearnableMovesState({
                    data: null,
                    error: getApiErrorMessage(error),
                    status: 'error',
                  });
                }
              })();
            }}
          >
            <label className={styles.field}>
              <span className={styles.label}>addMoveIds</span>
              <select
                className={styles.multiSelect}
                multiple
                value={learnableMovesForm.addMoveIds ?? []}
                onChange={(event) =>
                  setLearnableMovesForm((current) => ({
                    ...current,
                    addMoveIds: readSelectedValues(event.currentTarget),
                  }))
                }
              >
                {moves.map((move) => (
                  <option key={move.id} value={move.id}>
                    {move.name} · {move.id}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>removeMoveIds</span>
              <select
                className={styles.multiSelect}
                multiple
                value={learnableMovesForm.removeMoveIds ?? []}
                onChange={(event) =>
                  setLearnableMovesForm((current) => ({
                    ...current,
                    removeMoveIds: readSelectedValues(event.currentTarget),
                  }))
                }
              >
                {moves.map((move) => (
                  <option key={move.id} value={move.id}>
                    {move.name} · {move.id}
                  </option>
                ))}
              </select>
            </label>
            <button className={styles.primaryButton} type="submit">
              PUT /pokemons/{'{id}'}/learnable-moves
            </button>
          </form>

          <div className={styles.dualColumn}>
            <ApiResultView
              idleMessage="Crea, actualiza o elimina una especie base."
              state={speciesMutationState}
              successMessage="Operación de especie completada."
              emptyMessage="La operación DELETE devolvió 204 No Content."
            />
            <ApiResultView
              idleMessage="Consulta el detalle o los movimientos aprendibles de la especie seleccionada."
              state={speciesDetailState}
              successMessage="Detalle de la especie."
            />
          </div>

          <ApiResultView
            idleMessage="Consulta y actualiza la relación learnable moves."
            state={learnableMovesState}
            successMessage="Respuesta de learnable moves."
          />
        </div>
      </details>

      <details className={styles.detailsCard}>
        <summary className={styles.detailsSummary}>My Pokemons · POST, GET detail, PUT, DELETE y equipped moves</summary>
        <div className={styles.detailsContent}>
          <TestingGuide
            steps={[
              'Selecciona una especie base, define nivel y vida, elige equippedMoveIds y pulsa POST /my-pokemons.',
              'Con una instancia seleccionada, ejecuta GET /my-pokemons/{id} para ver su detalle.',
              'Pulsa GET /my-pokemons/{id}/equipped-moves para comprobar la relacion de movimientos equipados.',
              'Actualiza nivel, vida o equippedMoveIds con PUT /my-pokemons/{id}, o elimina la instancia con DELETE.',
            ]}
          />

          <form
            className={styles.operationWideGrid}
            onSubmit={(event) => {
              event.preventDefault();
              void runMyPokemonMutation(async () => {
                const data = await pokemonApi.createMyPokemon(buildMyPokemonCreateBody(myPokemonCreateForm));
                setSelectedMyPokemonId(data.id);
                return data;
              });
            }}
          >
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
              <select
                className={styles.multiSelect}
                multiple
                value={myPokemonCreateForm.equippedMoveIds}
                onChange={(event) =>
                  setMyPokemonCreateForm((current) => ({
                    ...current,
                    equippedMoveIds: readSelectedValues(event.currentTarget),
                  }))
                }
              >
                {moves.map((move) => (
                  <option key={move.id} value={move.id}>
                    {move.name} · {move.id}
                  </option>
                ))}
              </select>
            </label>
            <button className={styles.primaryButton} type="submit">
              POST /my-pokemons
            </button>
          </form>

          <div className={styles.helperRow}>
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
            <button className={styles.secondaryButton} type="button" onClick={() => void loadMyPokemonDetail()}>
              GET /my-pokemons/{'{id}'}
            </button>
            <button className={styles.secondaryButton} type="button" onClick={() => void loadEquippedMoves()}>
              GET /my-pokemons/{'{id}'}/equipped-moves
            </button>
            <button
              className={styles.dangerButton}
              type="button"
              onClick={() =>
                void runMyPokemonMutation(async () => {
                  await pokemonApi.deleteMyPokemon(selectedMyPokemonId);
                  return null;
                })
              }
            >
              DELETE /my-pokemons/{'{id}'}
            </button>
          </div>

          <form
            className={styles.operationWideGrid}
            onSubmit={(event) => {
              event.preventDefault();
              void runMyPokemonMutation(() =>
                pokemonApi.updateMyPokemon(selectedMyPokemonId, buildMyPokemonUpdateBody(myPokemonUpdateForm)),
              );
            }}
          >
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
              <select
                className={styles.multiSelect}
                multiple
                value={myPokemonUpdateForm.equippedMoveIds}
                onChange={(event) =>
                  setMyPokemonUpdateForm((current) => ({
                    ...current,
                    equippedMoveIds: readSelectedValues(event.currentTarget),
                  }))
                }
              >
                {moves.map((move) => (
                  <option key={move.id} value={move.id}>
                    {move.name} · {move.id}
                  </option>
                ))}
              </select>
            </label>
            <button className={styles.primaryButton} type="submit">
              PUT /my-pokemons/{'{id}'}
            </button>
          </form>

          <div className={styles.dualColumn}>
            <ApiResultView
              idleMessage="Crea, actualiza o elimina instancias jugables."
              state={myPokemonMutationState}
              successMessage="Operación de my-pokemon completada."
              emptyMessage="La operación DELETE devolvió 204 No Content."
            />
            <ApiResultView
              idleMessage="Consulta el detalle o los movimientos equipados de la instancia seleccionada."
              state={myPokemonDetailState}
              successMessage="Detalle de my-pokemon."
            />
          </div>

          <ApiResultView
            idleMessage="Prueba GET /api/v1/my-pokemons/{id}/equipped-moves."
            state={equippedMovesState}
            successMessage="Movimientos equipados."
          />
        </div>
      </details>
    </div>
  );
}
