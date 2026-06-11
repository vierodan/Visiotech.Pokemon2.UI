import type { BattleContract, BattleHistoryContract, MyPokemonContract } from '../../../src/api/contracts.js';
import type { SeedApiClient } from '../apiClient.js';
import type { SeedBattlePlan, SeedConfig, SeedSummary, SeededMyPokemonsResult } from '../types.js';

const pickMoveId = (pokemon: MyPokemonContract, phaseIndex: number): string | null => {
  if (pokemon.equippedMoves.length === 0) {
    return null;
  }

  return pokemon.equippedMoves[phaseIndex % pokemon.equippedMoves.length]?.id ?? null;
};

export const seedBattlesAndPhases = async (
  client: SeedApiClient,
  config: SeedConfig,
  plans: SeedBattlePlan[],
  seededMyPokemons: SeededMyPokemonsResult,
  summary: SeedSummary,
): Promise<{ battles: BattleContract[]; histories: BattleHistoryContract[] }> => {
  const battles: BattleContract[] = [];
  const histories: BattleHistoryContract[] = [];

  summary.notes.push(
    'Battles and phases are intentionally additive. The API contract does not expose a battle catalog or a functional identifier that allows safe global reuse across runs.',
  );
  summary.phases.target = plans.reduce((total, plan) => total + plan.desiredPhaseCount, 0);

  for (const plan of plans) {
    const firstMyPokemon = seededMyPokemons.byKey.get(plan.firstMyPokemonKey);
    const secondMyPokemon = seededMyPokemons.byKey.get(plan.secondMyPokemonKey);

    if (!firstMyPokemon || !secondMyPokemon) {
      summary.battles.failed += 1;
      summary.phases.skipped += plan.desiredPhaseCount;
      console.error(`[seed:battles] missing my-pokemon references for ${plan.key}`);
      continue;
    }

    try {
      let battle = await client.createBattle({
        firstMyPokemonId: firstMyPokemon.id,
        secondMyPokemonId: secondMyPokemon.id,
      });

      battles.push(battle);
      summary.battles.created += 1;
      console.log(`[seed:battles] created ${plan.key} -> ${battle.id}`);

      for (let phaseIndex = 0; phaseIndex < plan.desiredPhaseCount; phaseIndex += 1) {
        if (!battle.nextAttackerMyPokemonId) {
          summary.phases.skipped += plan.desiredPhaseCount - phaseIndex;
          console.log(`[seed:battles] battle ${battle.id} ended before reaching desired phases`);
          break;
        }

        const attacker =
          seededMyPokemons.all.find((pokemon) => pokemon.id === battle.nextAttackerMyPokemonId) ?? null;

        if (!attacker) {
          summary.phases.failed += 1;
          console.error(`[seed:battles] attacker not found for battle ${battle.id}`);
          continue;
        }

        const moveId = pickMoveId(attacker, phaseIndex);

        if (!moveId) {
          summary.phases.failed += 1;
          console.error(`[seed:battles] attacker ${attacker.id} has no equipped moves`);
          continue;
        }

        const execution = await client.executeBattlePhase(battle.id, {
          attackerMyPokemonId: attacker.id,
          moveId,
        });

        battle = execution.battle;
        summary.phases.created += 1;
        console.log(`[seed:battles] executed phase ${phaseIndex + 1} for ${battle.id}`);
      }

      const history = await client.getBattleHistory(battle.id);
      histories.push(history);
    } catch (error) {
      summary.battles.failed += 1;
      summary.phases.failed += plan.desiredPhaseCount;
      console.error(`[seed:battles] failed ${plan.key}`);
      console.error(error);
    }
  }

  if (plans.length > 0 && config.phaseMin > 0) {
    summary.notes.push(
      'Battle phases can stop before the configured maximum when the backend marks a battle as finished or no attacker is available.',
    );
  }

  return { battles, histories };
};
