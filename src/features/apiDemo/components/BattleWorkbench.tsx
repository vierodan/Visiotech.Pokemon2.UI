import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage, getApiErrorStatus } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { getLastResponseStatus } from '../../../api/httpClient';
import { pokemonApi } from '../../../api/pokemonApi';
import type {
  BattleContract,
  BattleHistoryContract,
  BattlePhaseExecutionContract,
  CreateBattleRequestContract,
  MyPokemonCatalogContract,
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
import { EndpointCallout } from './EndpointCallout';
import { EndpointStepTitle } from './EndpointStepTitle';
import { TestingGuide } from './TestingGuide';
import { endpointDocs } from './endpointDocs';

interface CreateBattleFormState {
  firstMyPokemonId: string;
  secondMyPokemonId: string;
}

interface ExecutePhaseFormState {
  attackerMyPokemonId: string;
  moveId: string;
}

const defaultCreateBattleForm: CreateBattleFormState = {
  firstMyPokemonId: '',
  secondMyPokemonId: '',
};

const defaultExecutePhaseForm: ExecutePhaseFormState = {
  attackerMyPokemonId: '',
  moveId: '',
};

const setLoading = <T,>(setter: React.Dispatch<React.SetStateAction<RequestState<T>>>): void => {
  setter((current) => setRequestLoading(current));
};

export function BattleWorkbench(): JSX.Element {
  const battleIdOptionsId = 'battle-id-options';
  const [referencesState, setReferencesState] = useState<RequestState<MyPokemonCatalogContract>>(
    createRequestState<MyPokemonCatalogContract>(),
  );
  const [createBattleForm, setCreateBattleForm] = useState<CreateBattleFormState>(defaultCreateBattleForm);
  const [executePhaseForm, setExecutePhaseForm] = useState<ExecutePhaseFormState>(defaultExecutePhaseForm);
  const [battleId, setBattleId] = useState<string>('');

  const [battleCreateState, setBattleCreateState] = useState<RequestState<BattleContract>>(
    createRequestState<BattleContract>(),
  );
  const [battleDetailState, setBattleDetailState] = useState<RequestState<BattleContract>>(
    createRequestState<BattleContract>(),
  );
  const [battleHistoryState, setBattleHistoryState] = useState<RequestState<BattleHistoryContract>>(
    createRequestState<BattleHistoryContract>(),
  );
  const [phaseExecutionState, setPhaseExecutionState] = useState<RequestState<BattlePhaseExecutionContract>>(
    createRequestState<BattlePhaseExecutionContract>(),
  );
  const normalizedBattleId = battleId.trim();

  const refreshMyPokemons = async (): Promise<void> => {
    setReferencesState((current) => setRequestLoading(current));

    try {
      const data = await pokemonApi.getMyPokemons({ page: 1, pageSize: 100 });
      setReferencesState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setReferencesState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void refreshMyPokemons();
  }, []);

  const myPokemons = useMemo(() => referencesState.data?.items ?? [], [referencesState.data?.items]);
  const knownBattles = useMemo(() => {
    const battleMap = new Map<string, BattleContract>();

    const registerBattle = (battle: BattleContract | null | undefined): void => {
      if (!battle) {
        return;
      }

      battleMap.set(battle.id, battle);
    };

    registerBattle(battleCreateState.data);
    registerBattle(battleDetailState.data);
    registerBattle(phaseExecutionState.data?.battle);

    return Array.from(battleMap.values());
  }, [battleCreateState.data, battleDetailState.data, phaseExecutionState.data]);

  const knownBattleIds = useMemo(() => {
    const ids = new Set<string>();

    knownBattles.forEach((battle) => {
      ids.add(battle.id);
    });

    if (battleHistoryState.data?.battleId) {
      ids.add(battleHistoryState.data.battleId);
    }

    if (battleId.trim()) {
      ids.add(battleId.trim());
    }

    return Array.from(ids);
  }, [battleHistoryState.data?.battleId, battleId, knownBattles]);

  useEffect(() => {
    if (myPokemons.length === 0) {
      return;
    }

    setCreateBattleForm((current) => ({
      firstMyPokemonId: current.firstMyPokemonId || myPokemons[0].id,
      secondMyPokemonId: current.secondMyPokemonId || (myPokemons[1] ?? myPokemons[0]).id,
    }));
    setExecutePhaseForm((current) => ({
      attackerMyPokemonId: current.attackerMyPokemonId || myPokemons[0].id,
      moveId: current.moveId || myPokemons[0].equippedMoves[0]?.id || '',
    }));
  }, [myPokemons]);

  const selectedAttacker =
    myPokemons.find((item) => item.id === executePhaseForm.attackerMyPokemonId.trim()) ?? null;

  const attackerMoves = useMemo(() => selectedAttacker?.equippedMoves ?? [], [selectedAttacker]);

  useEffect(() => {
    if (attackerMoves.length === 0) {
      setExecutePhaseForm((current) => ({
        ...current,
        moveId: '',
      }));
      return;
    }

    const stillValid = attackerMoves.some((move) => move.id === executePhaseForm.moveId);

    if (!stillValid) {
      setExecutePhaseForm((current) => ({
        ...current,
        moveId: attackerMoves[0].id,
      }));
    }
  }, [attackerMoves, executePhaseForm.moveId]);

  const loadBattleById = async (id: string): Promise<void> => {
    const nextBattleId = id.trim();

    if (!nextBattleId) {
      return;
    }

    setLoading(setBattleDetailState);

    try {
      const data = await pokemonApi.getBattle(nextBattleId);
      setBattleDetailState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setBattleDetailState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const createBattle = async (): Promise<void> => {
    setLoading(setBattleCreateState);

    try {
      const body: CreateBattleRequestContract = {
        firstMyPokemonId: createBattleForm.firstMyPokemonId,
        secondMyPokemonId: createBattleForm.secondMyPokemonId,
      };
      const data = await pokemonApi.createBattle(body);
      const httpStatus = getLastResponseStatus();
      setBattleCreateState(createRequestSuccess(data, httpStatus));
      setBattleDetailState(createRequestSuccess(data, httpStatus));
      setBattleId(data.id);
    } catch (error) {
      setBattleCreateState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const loadBattle = async (): Promise<void> => {
    await loadBattleById(normalizedBattleId);
  };

  const loadBattleHistory = async (): Promise<void> => {
    if (!normalizedBattleId) {
      return;
    }

    setLoading(setBattleHistoryState);

    try {
      const data = await pokemonApi.getBattleHistory(normalizedBattleId);
      setBattleHistoryState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setBattleHistoryState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  const executeBattlePhase = async (): Promise<void> => {
    if (!normalizedBattleId) {
      return;
    }

    setLoading(setPhaseExecutionState);

    try {
      const data = await pokemonApi.executeBattlePhase(normalizedBattleId, executePhaseForm);
      const httpStatus = getLastResponseStatus();
      setPhaseExecutionState(createRequestSuccess(data, httpStatus));
      setBattleDetailState(createRequestSuccess(data.battle, httpStatus));
    } catch (error) {
      setPhaseExecutionState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
    }
  };

  if (!hasConfiguredApi) {
    return (
      <div className={styles.noticeBox}>
        <strong>Conecta la API primero</strong>
        <p>Este panel activa el flujo de batallas cuando la configuración del backend está disponible.</p>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.panelEyebrow}>Batallas</p>
          <h3 className={styles.panelTitle}>Creación, estado, historial y fases</h3>
        </div>
      </div>

      <div className={styles.endpointFlow}>
        <datalist id={battleIdOptionsId}>
          {knownBattleIds.map((knownBattleId) => (
            <option key={knownBattleId} value={knownBattleId} />
          ))}
        </datalist>

        <section className={styles.endpointStep}>
          <EndpointStepTitle path="/api/v1/my-pokemons" title="Cargar instancias jugables disponibles" />
          <TestingGuide
            steps={[
              'Pulsa Recargar my-pokemons y comprueba que hay al menos dos instancias con movimientos equipados.',
              'Crea una batalla con POST /battles y copia o reutiliza el id de batalla que devuelve la respuesta.',
              'Usa GET /battles/{id} o GET /battles/{id}/phases para consultar estado e historial.',
              'Selecciona attackerMyPokemonId y moveId válidos y ejecuta POST /battles/{id}/phases para avanzar la batalla.',
            ]}
            hint="La respuesta de creación y de ejecución de fase te va dejando el id de batalla y el siguiente atacante para continuar el flujo."
          />
          <p className={styles.endpointStepMeta}>Primero carga las instancias jugables para poder crear y ejecutar batallas.</p>
          <EndpointCallout {...endpointDocs.battleLoadMyPokemons} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton
              onClick={() => void refreshMyPokemons()}
              requests={[{ method: 'GET', path: '/api/v1/my-pokemons' }]}
            />
          </div>
          <ApiResultView
            idleMessage="Este panel necesita my-pokemons válidos con movimientos equipados para probar batallas."
            state={referencesState}
            successMessage="Catálogo de my-pokemons cargado."
          />
        </section>

        <form
          className={styles.endpointStep}
          onSubmit={(event) => {
            event.preventDefault();
            void createBattle();
          }}
        >
          <EndpointStepTitle path="/api/v1/battles" title="Crear batalla" />
          <EndpointCallout {...endpointDocs.battleCreate} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton requests={[{ method: 'POST', path: '/api/v1/battles' }]} type="submit" />
          </div>
          <div className={styles.endpointStepFields}>
            <label className={styles.field}>
              <span className={styles.label}>firstMyPokemonId</span>
              <select
                className={styles.select}
                value={createBattleForm.firstMyPokemonId}
                onChange={(event) =>
                  setCreateBattleForm((current) => ({
                    ...current,
                    firstMyPokemonId: event.target.value,
                  }))
                }
              >
                {myPokemons.map((pokemon) => (
                  <option key={pokemon.id} value={pokemon.id}>
                    {pokemon.species.name} · {pokemon.id}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>secondMyPokemonId</span>
              <select
                className={styles.select}
                value={createBattleForm.secondMyPokemonId}
                onChange={(event) =>
                  setCreateBattleForm((current) => ({
                    ...current,
                    secondMyPokemonId: event.target.value,
                  }))
                }
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
            idleMessage="Crea una batalla con exactamente dos my-pokemons."
            state={battleCreateState}
            successMessage="Batalla creada."
          />
        </form>

        <section className={styles.endpointStep}>
          <EndpointStepTitle path="/api/v1/battles/{id}" title="Consultar estado de batalla" />
          <EndpointCallout {...endpointDocs.battleDetail} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton
              onClick={() => void loadBattle()}
              requests={[{ method: 'GET', path: `/api/v1/battles/${battleId}` }]}
            />
          </div>
          <div className={styles.endpointStepFields}>
            <label className={styles.field}>
              <span className={styles.label}>id de batalla</span>
              <input
                className={styles.input}
                list={battleIdOptionsId}
                type="text"
                value={battleId}
                onChange={(event) => setBattleId(event.target.value)}
                placeholder="Pega o selecciona un id de batalla"
              />
            </label>
          </div>
          <ApiResultView
            idleMessage="Consulta el estado actual de una batalla concreta."
            state={battleDetailState}
            successMessage="Estado de batalla."
          />
        </section>

        <section className={styles.endpointStep}>
          <EndpointStepTitle path="/api/v1/battles/{id}/phases" title="Consultar historial de fases" />
          <EndpointCallout {...endpointDocs.battleHistory} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton
              onClick={() => void loadBattleHistory()}
              requests={[{ method: 'GET', path: `/api/v1/battles/${battleId}/phases` }]}
            />
          </div>
          <div className={styles.endpointStepFields}>
            <label className={styles.field}>
              <span className={styles.label}>id de batalla</span>
              <input
                className={styles.input}
                list={battleIdOptionsId}
                type="text"
                value={battleId}
                onChange={(event) => setBattleId(event.target.value)}
                placeholder="Pega o selecciona un id de batalla"
              />
            </label>
          </div>
          <ApiResultView
            idleMessage="Consulta el historial ordenado de fases."
            state={battleHistoryState}
            successMessage="Historial de batalla."
          />
        </section>

        <form
          className={styles.endpointStep}
          onSubmit={(event) => {
            event.preventDefault();
            void executeBattlePhase();
          }}
        >
          <EndpointStepTitle path="/api/v1/battles/{id}/phases" title="Ejecutar fase de batalla" />
          <EndpointCallout {...endpointDocs.battleExecute} />
          <div className={styles.endpointStepAction}>
            <ApiActionButton
              requests={[{ method: 'POST', path: `/api/v1/battles/${battleId}/phases` }]}
              type="submit"
            />
          </div>
          <div className={styles.endpointStepFields}>
            <label className={styles.field}>
              <span className={styles.label}>id de batalla</span>
              <input
                className={styles.input}
                list={battleIdOptionsId}
                type="text"
                value={battleId}
                onChange={(event) => setBattleId(event.target.value)}
                placeholder="Pega o selecciona un id de batalla"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>attackerMyPokemonId</span>
              <input
                className={styles.input}
                type="text"
                value={executePhaseForm.attackerMyPokemonId}
                onChange={(event) =>
                  setExecutePhaseForm((current) => ({
                    ...current,
                    attackerMyPokemonId: event.target.value,
                  }))
                }
                placeholder="Pega el attackerMyPokemonId"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>moveId</span>
              <select
                className={styles.select}
                value={executePhaseForm.moveId}
                onChange={(event) =>
                  setExecutePhaseForm((current) => ({
                    ...current,
                    moveId: event.target.value,
                  }))
                }
                disabled={attackerMoves.length === 0}
              >
                {attackerMoves.length > 0 ? (
                  attackerMoves.map((move) => (
                    <option key={move.id} value={move.id}>
                      {move.name} · {move.id}
                    </option>
                  ))
                ) : (
                  <option value="">El atacante no tiene movimientos equipados</option>
                )}
              </select>
            </label>
          </div>
          <ApiResultView
            idleMessage="Ejecuta la siguiente fase usando attackerMyPokemonId y moveId."
            state={phaseExecutionState}
            successMessage="Fase ejecutada."
          />
        </form>
      </div>
    </div>
  );
}
