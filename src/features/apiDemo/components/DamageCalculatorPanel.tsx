import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { pokemonApi } from '../../../api/pokemonApi';
import type { ApiNumber, MoveDamageCalculationContract, MyPokemonCatalogContract } from '../../../api/contracts';
import { createRequestState, type RequestState } from '../types/apiDemo';
import styles from './ApiDemo.module.css';

interface DamageFormState {
  attackerMyPokemonId: string;
  defenderMyPokemonId: string;
  moveId: string;
}

const defaultFormState: DamageFormState = {
  attackerMyPokemonId: '',
  defenderMyPokemonId: '',
  moveId: '',
};

const toDisplayValue = (value: ApiNumber | number | string): string => String(value);

export function DamageCalculatorPanel(): JSX.Element {
  const [catalogState, setCatalogState] = useState<RequestState<MyPokemonCatalogContract>>(
    createRequestState<MyPokemonCatalogContract>(),
  );
  const [calculationState, setCalculationState] = useState<RequestState<MoveDamageCalculationContract>>(
    createRequestState<MoveDamageCalculationContract>(),
  );
  const [formState, setFormState] = useState<DamageFormState>(defaultFormState);

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void (async () => {
      setCatalogState({
        data: null,
        error: null,
        status: 'loading',
      });

      try {
        const data = await pokemonApi.getMyPokemons({ page: 1, pageSize: 20 });

        setCatalogState({
          data,
          error: null,
          status: 'success',
        });
      } catch (error) {
        setCatalogState({
          data: null,
          error: getApiErrorMessage(error),
          status: 'error',
        });
      }
    })();
  }, []);

  useEffect(() => {
    const items = catalogState.data?.items ?? [];

    if (items.length === 0) {
      setFormState(defaultFormState);
      return;
    }

    const attacker = items[0];
    const defender = items[1] ?? items[0];
    const defaultMoveId = attacker.equippedMoves[0]?.id ?? '';

    setFormState((current) => ({
      attackerMyPokemonId: current.attackerMyPokemonId || attacker.id,
      defenderMyPokemonId: current.defenderMyPokemonId || defender.id,
      moveId: current.moveId || defaultMoveId,
    }));
  }, [catalogState.data]);

  const selectedAttacker =
    catalogState.data?.items.find((pokemon) => pokemon.id === formState.attackerMyPokemonId) ?? null;

  const attackerMoves = selectedAttacker?.equippedMoves ?? [];

  useEffect(() => {
    const nextAttackerMoves = selectedAttacker?.equippedMoves ?? [];

    if (nextAttackerMoves.length === 0) {
      setFormState((current) => ({
        ...current,
        moveId: '',
      }));
      return;
    }

    const hasSelectedMove = nextAttackerMoves.some((move) => move.id === formState.moveId);

    if (!hasSelectedMove) {
      setFormState((current) => ({
        ...current,
        moveId: nextAttackerMoves[0].id,
      }));
    }
  }, [formState.moveId, selectedAttacker]);

  const handleCalculation = async (): Promise<void> => {
    setCalculationState((current) => ({
      ...current,
      error: null,
      status: 'loading',
    }));

    try {
      const data = await pokemonApi.calculateMoveDamage(formState);

      setCalculationState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setCalculationState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  return (
    <div className={styles.stack}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.panelEyebrow}>POST /api/v1/damage-calculations</p>
          <h3 className={styles.panelTitle}>Calculadora de daño</h3>
        </div>
        <span className={styles.infoPill}>Usa IDs reales de `my-pokemons` y `equippedMoves`</span>
      </div>

      {!hasConfiguredApi ? (
        <div className={styles.noticeBox}>
          <strong>Conecta primero la API</strong>
          <p>Sin `VITE_API_BASE_URL` no es posible ejecutar la simulación real.</p>
        </div>
      ) : null}

      {catalogState.status === 'loading' ? (
        <div className={styles.noticeBox}>
          <strong>Cargando referencias...</strong>
          <p>Preparando atacantes, defensores y movimientos equipados.</p>
        </div>
      ) : null}

      {catalogState.status === 'error' && catalogState.error ? (
        <div className={styles.errorBox}>
          <strong>No se pudieron cargar los `my-pokemons`</strong>
          <p>{catalogState.error}</p>
        </div>
      ) : null}

      {catalogState.status === 'success' && (catalogState.data?.items.length ?? 0) === 0 ? (
        <div className={styles.noticeBox}>
          <strong>No hay instancias jugables</strong>
          <p>El contrato exige IDs de `my-pokemons`, así que este panel necesita datos previos en backend.</p>
        </div>
      ) : null}

      {catalogState.status === 'success' && catalogState.data && catalogState.data.items.length > 0 ? (
        <>
          <form
            className={styles.calculationForm}
            onSubmit={(event) => {
              event.preventDefault();
              void handleCalculation();
            }}
          >
            <label className={styles.field}>
              <span className={styles.label}>attackerMyPokemonId</span>
              <select
                className={styles.select}
                value={formState.attackerMyPokemonId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    attackerMyPokemonId: event.target.value,
                  }))
                }
              >
                {catalogState.data.items.map((pokemon) => (
                  <option key={pokemon.id} value={pokemon.id}>
                    {pokemon.species.name} · {pokemon.id}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>defenderMyPokemonId</span>
              <select
                className={styles.select}
                value={formState.defenderMyPokemonId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    defenderMyPokemonId: event.target.value,
                  }))
                }
              >
                {catalogState.data.items.map((pokemon) => (
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
                value={formState.moveId}
                onChange={(event) =>
                  setFormState((current) => ({
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

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={!formState.attackerMyPokemonId || !formState.defenderMyPokemonId || !formState.moveId}
            >
              Calcular daño
            </button>
          </form>

          {calculationState.status === 'loading' ? (
            <div className={styles.noticeBox}>
              <strong>Calculando daño...</strong>
              <p>Ejecutando la lógica del backend con los IDs seleccionados.</p>
            </div>
          ) : null}

          {calculationState.status === 'error' && calculationState.error ? (
            <div className={styles.errorBox}>
              <strong>Error al calcular daño</strong>
              <p>{calculationState.error}</p>
            </div>
          ) : null}

          {calculationState.status === 'success' && calculationState.data ? (
            <div className={styles.resultCard}>
              <div className={styles.resultGrid}>
                <div>
                  <span className={styles.resultLabel}>Movimiento</span>
                  <strong>
                    {calculationState.data.moveName} · {calculationState.data.moveType} ·{' '}
                    {calculationState.data.moveCategory}
                  </strong>
                </div>
                <div>
                  <span className={styles.resultLabel}>Daño final</span>
                  <strong>{toDisplayValue(calculationState.data.damage)}</strong>
                </div>
                <div>
                  <span className={styles.resultLabel}>Vida restante del defensor</span>
                  <strong>{toDisplayValue(calculationState.data.defenderRemainingHealthPoints)}</strong>
                </div>
                <div>
                  <span className={styles.resultLabel}>Efectividad total</span>
                  <strong>{toDisplayValue(calculationState.data.totalEffectiveness)}</strong>
                </div>
              </div>

              <div className={styles.breakdown}>
                <p className={styles.breakdownTitle}>Detalle técnico</p>
                <ul className={styles.breakdownList}>
                  <li>
                    Potencia base: {toDisplayValue(calculationState.data.movePower)} · Random factor:{' '}
                    {toDisplayValue(calculationState.data.randomFactor)}
                  </li>
                  <li>
                    Stat ofensivo: {calculationState.data.offensiveStat} ({toDisplayValue(calculationState.data.offensiveStatValue)})
                  </li>
                  <li>
                    Stat defensivo: {calculationState.data.defensiveStat} ({toDisplayValue(calculationState.data.defensiveStatValue)})
                  </li>
                  <li>
                    Base damage: {toDisplayValue(calculationState.data.baseDamage)} · Raw damage:{' '}
                    {toDisplayValue(calculationState.data.rawDamage)}
                  </li>
                  <li>
                    Breakdown:{' '}
                    {calculationState.data.effectivenessBreakdown
                      .map((item) => `${item.defenderType} x${item.multiplier}`)
                      .join(', ')}
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
