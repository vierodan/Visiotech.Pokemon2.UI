import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { pokemonApi } from '../../../api/pokemonApi';
import type {
  BattleContract,
  BattleHistoryContract,
  BattlePhaseExecutionContract,
  CreateBattleRequestContract,
  MyPokemonCatalogContract,
  MyPokemonContract,
} from '../../../api/contracts';
import { createRequestState, type RequestState } from '../types/apiDemo';
import { ApiResultView } from './ApiResultView';
import styles from './ApiDemo.module.css';
import { TestingGuide } from './TestingGuide';

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
  setter((current) => ({
    ...current,
    error: null,
    status: 'loading',
  }));
};

export function BattleWorkbench(): JSX.Element {
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

  const refreshMyPokemons = async (): Promise<void> => {
    setReferencesState((current) => ({
      ...current,
      error: null,
      status: 'loading',
    }));

    try {
      const data = await pokemonApi.getMyPokemons({ page: 1, pageSize: 100 });
      setReferencesState({
        data,
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

    void refreshMyPokemons();
  }, []);

  const myPokemons = useMemo(() => referencesState.data?.items ?? [], [referencesState.data?.items]);

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

  const selectedAttacker: MyPokemonContract | null =
    myPokemons.find((item) => item.id === executePhaseForm.attackerMyPokemonId) ?? null;

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

  const createBattle = async (): Promise<void> => {
    setLoading(setBattleCreateState);

    try {
      const body: CreateBattleRequestContract = {
        firstMyPokemonId: createBattleForm.firstMyPokemonId,
        secondMyPokemonId: createBattleForm.secondMyPokemonId,
      };
      const data = await pokemonApi.createBattle(body);
      setBattleCreateState({
        data,
        error: null,
        status: 'success',
      });
      setBattleId(data.id);
      setExecutePhaseForm((current) => ({
        ...current,
        attackerMyPokemonId: data.nextAttackerMyPokemonId ?? current.attackerMyPokemonId,
      }));
    } catch (error) {
      setBattleCreateState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadBattle = async (): Promise<void> => {
    if (!battleId.trim()) {
      return;
    }

    setLoading(setBattleDetailState);

    try {
      const data = await pokemonApi.getBattle(battleId.trim());
      setBattleDetailState({
        data,
        error: null,
        status: 'success',
      });
      setExecutePhaseForm((current) => ({
        ...current,
        attackerMyPokemonId: data.nextAttackerMyPokemonId ?? current.attackerMyPokemonId,
      }));
    } catch (error) {
      setBattleDetailState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const loadBattleHistory = async (): Promise<void> => {
    if (!battleId.trim()) {
      return;
    }

    setLoading(setBattleHistoryState);

    try {
      const data = await pokemonApi.getBattleHistory(battleId.trim());
      setBattleHistoryState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setBattleHistoryState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  const executeBattlePhase = async (): Promise<void> => {
    if (!battleId.trim()) {
      return;
    }

    setLoading(setPhaseExecutionState);

    try {
      const data = await pokemonApi.executeBattlePhase(battleId.trim(), executePhaseForm);
      setPhaseExecutionState({
        data,
        error: null,
        status: 'success',
      });
      setBattleDetailState({
        data: data.battle,
        error: null,
        status: 'success',
      });
      setExecutePhaseForm((current) => ({
        ...current,
        attackerMyPokemonId: data.battle.nextAttackerMyPokemonId ?? current.attackerMyPokemonId,
      }));
    } catch (error) {
      setPhaseExecutionState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
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
      <TestingGuide
        steps={[
          'Pulsa Recargar my-pokemons y comprueba que hay al menos dos instancias con movimientos equipados.',
          'Crea una batalla con POST /battles y copia o reutiliza el battle id que devuelve la respuesta.',
          'Usa GET /battles/{id} o GET /battles/{id}/phases para consultar estado e historial.',
          'Selecciona attackerMyPokemonId y moveId validos y ejecuta POST /battles/{id}/phases para avanzar la batalla.',
        ]}
        hint="La respuesta de creacion y de ejecucion de fase te va dejando el battle id y el siguiente atacante para continuar el flujo."
      />

      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.panelEyebrow}>Battles</p>
          <h3 className={styles.panelTitle}>Creación, estado, historial y fases</h3>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={() => void refreshMyPokemons()}>
          Recargar my-pokemons
        </button>
      </div>

      <ApiResultView
        idleMessage="Este panel necesita my-pokemons válidos con movimientos equipados para probar batallas."
        state={referencesState}
        successMessage="Catálogo de my-pokemons cargado."
      />

      <form
        className={styles.operationGrid}
        onSubmit={(event) => {
          event.preventDefault();
          void createBattle();
        }}
      >
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
        <button className={styles.primaryButton} type="submit">
          POST /battles
        </button>
      </form>

      <div className={styles.helperRow}>
        <label className={styles.field}>
          <span className={styles.label}>battle id</span>
          <input
            className={styles.input}
            type="text"
            value={battleId}
            onChange={(event) => setBattleId(event.target.value)}
            placeholder="uuid de la batalla"
          />
        </label>
        <button className={styles.secondaryButton} type="button" onClick={() => void loadBattle()}>
          GET /battles/{'{id}'}
        </button>
        <button className={styles.secondaryButton} type="button" onClick={() => void loadBattleHistory()}>
          GET /battles/{'{id}'}/phases
        </button>
      </div>

      <form
        className={styles.operationGrid}
        onSubmit={(event) => {
          event.preventDefault();
          void executeBattlePhase();
        }}
      >
        <label className={styles.field}>
          <span className={styles.label}>attackerMyPokemonId</span>
          <select
            className={styles.select}
            value={executePhaseForm.attackerMyPokemonId}
            onChange={(event) =>
              setExecutePhaseForm((current) => ({
                ...current,
                attackerMyPokemonId: event.target.value,
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
        <button className={styles.primaryButton} type="submit">
          POST /battles/{'{id}'}/phases
        </button>
      </form>

      <div className={styles.dualColumn}>
        <ApiResultView
          idleMessage="Crea una batalla con exactamente dos my-pokemons."
          state={battleCreateState}
          successMessage="Batalla creada."
        />
        <ApiResultView
          idleMessage="Consulta el estado actual de una batalla concreta."
          state={battleDetailState}
          successMessage="Estado de batalla."
        />
      </div>

      <div className={styles.dualColumn}>
        <ApiResultView
          idleMessage="Consulta el historial ordenado de fases."
          state={battleHistoryState}
          successMessage="Historial de batalla."
        />
        <ApiResultView
          idleMessage="Ejecuta la siguiente fase usando attackerMyPokemonId y moveId."
          state={phaseExecutionState}
          successMessage="Fase ejecutada."
        />
      </div>
    </div>
  );
}
