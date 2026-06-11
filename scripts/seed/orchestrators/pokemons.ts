import type { PokemonSpeciesContract } from '../../../src/api/contracts.js';
import type { SeedApiClient } from '../apiClient.js';
import type { SeedConfig, SeedSpeciesPlan, SeedSummary, SeededMovesResult, SeededPokemonsResult } from '../types.js';

const areArraysEqual = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((item, index) => item === right[index]);

const speciesDiffers = (plan: SeedSpeciesPlan, pokemon: PokemonSpeciesContract): boolean =>
  pokemon.name !== plan.name ||
  !areArraysEqual(pokemon.types, plan.types) ||
  Number(pokemon.baseStats.attack) !== plan.baseStats.attack ||
  Number(pokemon.baseStats.defense) !== plan.baseStats.defense ||
  Number(pokemon.baseStats.health) !== plan.baseStats.health ||
  Number(pokemon.baseStats.specialAttack) !== plan.baseStats.specialAttack ||
  Number(pokemon.baseStats.specialDefense) !== plan.baseStats.specialDefense ||
  Number(pokemon.baseStats.speed) !== plan.baseStats.speed;

const createSeedMoveNameSet = (moves: SeededMovesResult): Set<string> => new Set(moves.byName.keys());

const toMoveIds = (moveNames: string[], moves: SeededMovesResult): string[] =>
  moveNames
    .map((moveName) => moves.byName.get(moveName)?.id)
    .filter((value): value is string => Boolean(value));

export const seedPokemons = async (
  client: SeedApiClient,
  config: SeedConfig,
  plans: SeedSpeciesPlan[],
  seededMoves: SeededMovesResult,
  summary: SeedSummary,
): Promise<SeededPokemonsResult> => {
  console.log('[seed:pokemons] Loading existing catalog');

  const existingPokemons = await client.listAllPokemons(config.pageSize);
  const pokemonByName = new Map(existingPokemons.map((pokemon) => [pokemon.name, pokemon]));
  const seedMoveNames = createSeedMoveNameSet(seededMoves);
  const learnableMoveNamesBySpeciesName = new Map<string, string[]>();

  for (const plan of plans) {
    const existingPokemon = pokemonByName.get(plan.name);

    try {
      let pokemon = existingPokemon;

      if (!pokemon) {
        pokemon = await client.createPokemon({
          baseStats: plan.baseStats,
          name: plan.name,
          types: plan.types,
        });

        summary.pokemons.created += 1;
        console.log(`[seed:pokemons] created ${plan.name}`);
      } else if (speciesDiffers(plan, pokemon)) {
        pokemon = await client.updatePokemon(existingPokemon.id, {
          baseStats: plan.baseStats,
          name: plan.name,
          types: plan.types,
        });

        summary.pokemons.updated += 1;
        console.log(`[seed:pokemons] updated ${plan.name}`);
      } else {
        summary.pokemons.reused += 1;
        console.log(`[seed:pokemons] reused ${plan.name}`);
      }

      pokemonByName.set(plan.name, pokemon);

      const desiredMoveNames = plan.desiredMoveNames.filter((moveName) => seededMoves.byName.has(moveName));
      const currentLearnableMoves = await client.getPokemonLearnableMoves(pokemon.id);
      const currentSeedMoveIds = currentLearnableMoves.moves
        .filter((move) => seedMoveNames.has(move.name))
        .map((move) => move.id);
      const desiredMoveIds = toMoveIds(desiredMoveNames, seededMoves);
      const addMoveIds = desiredMoveIds.filter((moveId) => !currentSeedMoveIds.includes(moveId));
      const removeMoveIds = currentSeedMoveIds.filter((moveId) => !desiredMoveIds.includes(moveId));

      learnableMoveNamesBySpeciesName.set(plan.name, desiredMoveNames);

      if (addMoveIds.length === 0 && removeMoveIds.length === 0) {
        summary.learnableMovesLinks.skipped += 1;
        console.log(`[seed:pokemons] learnable-moves already synced for ${plan.name}`);
        continue;
      }

      await client.updatePokemonLearnableMoves(pokemon.id, {
        addMoveIds,
        removeMoveIds,
      });

      summary.learnableMovesLinks.updated += 1;
      console.log(
        `[seed:pokemons] synced learnable-moves for ${plan.name} (+${addMoveIds.length} / -${removeMoveIds.length})`,
      );
    } catch (error) {
      summary.pokemons.failed += 1;
      summary.learnableMovesLinks.failed += 1;
      console.error(`[seed:pokemons] failed ${plan.name}`);
      console.error(error);
    }
  }

  return {
    all: Array.from(pokemonByName.values()),
    byName: pokemonByName,
    learnableMoveNamesBySpeciesName,
  };
};
