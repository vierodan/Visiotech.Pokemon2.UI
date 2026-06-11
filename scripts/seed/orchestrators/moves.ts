import type { PokemonMoveContract } from '../../../src/api/contracts.js';
import type { SeedApiClient } from '../apiClient.js';
import type { SeedConfig, SeedMovePlan, SeedSummary, SeededMovesResult } from '../types.js';

const moveDiffers = (plan: SeedMovePlan, move: PokemonMoveContract): boolean =>
  move.category !== plan.category || move.name !== plan.name || Number(move.power) !== plan.power || move.type !== plan.type;

export const seedMoves = async (
  client: SeedApiClient,
  config: SeedConfig,
  plans: SeedMovePlan[],
  summary: SeedSummary,
): Promise<SeededMovesResult> => {
  console.log('[seed:moves] Loading existing catalog');

  const existingMoves = await client.listAllMoves(config.pageSize);
  const moveByName = new Map(existingMoves.map((move) => [move.name, move]));

  for (const plan of plans) {
    const existingMove = moveByName.get(plan.name);

    try {
      if (!existingMove) {
        const createdMove = await client.createMove({
          category: plan.category,
          name: plan.name,
          power: plan.power,
          type: plan.type,
        });

        moveByName.set(plan.name, createdMove);
        summary.moves.created += 1;
        console.log(`[seed:moves] created ${plan.name}`);
        continue;
      }

      if (moveDiffers(plan, existingMove)) {
        const updatedMove = await client.updateMove(existingMove.id, {
          category: plan.category,
          name: plan.name,
          power: plan.power,
          type: plan.type,
        });

        moveByName.set(plan.name, updatedMove);
        summary.moves.updated += 1;
        console.log(`[seed:moves] updated ${plan.name}`);
        continue;
      }

      summary.moves.reused += 1;
      console.log(`[seed:moves] reused ${plan.name}`);
    } catch (error) {
      summary.moves.failed += 1;
      console.error(`[seed:moves] failed ${plan.name}`);
      console.error(error);
    }
  }

  return {
    all: Array.from(moveByName.values()),
    byName: moveByName,
  };
};

