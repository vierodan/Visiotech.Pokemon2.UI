import type { MyPokemonContract } from '../../../src/api/contracts.js';
import type { SeedApiClient } from '../apiClient.js';
import type {
  SeedConfig,
  SeedMyPokemonPlan,
  SeedSummary,
  SeededMovesResult,
  SeededMyPokemonsResult,
  SeededPokemonsResult,
} from '../types.js';

const createSignature = (speciesName: string, level: number, currentHealthPoints: number, totalHealthPoints: number, moveNames: string[]): string =>
  [
    speciesName,
    level,
    currentHealthPoints,
    totalHealthPoints,
    [...moveNames].sort().join('|'),
  ].join('::');

const createExistingSignature = (pokemon: MyPokemonContract): string =>
  createSignature(
    pokemon.species.name,
    Number(pokemon.level),
    Number(pokemon.currentHealthPoints),
    Number(pokemon.totalHealthPoints),
    pokemon.equippedMoves.map((move) => move.name),
  );

const removeFromSpeciesBucket = (bucket: MyPokemonContract[] | undefined, pokemonId: string): void => {
  if (!bucket) {
    return;
  }

  const index = bucket.findIndex((pokemon) => pokemon.id === pokemonId);

  if (index >= 0) {
    bucket.splice(index, 1);
  }
};

export const seedMyPokemons = async (
  client: SeedApiClient,
  config: SeedConfig,
  plans: SeedMyPokemonPlan[],
  seededMoves: SeededMovesResult,
  seededPokemons: SeededPokemonsResult,
  summary: SeedSummary,
): Promise<SeededMyPokemonsResult> => {
  console.log('[seed:my-pokemons] Loading existing catalog');

  const existingMyPokemons = await client.listAllMyPokemons(config.pageSize);
  const availableBySignature = new Map<string, MyPokemonContract[]>();
  const availableBySpecies = new Map<string, MyPokemonContract[]>();

  for (const pokemon of existingMyPokemons) {
    const signature = createExistingSignature(pokemon);
    const bucket = availableBySignature.get(signature) ?? [];
    bucket.push(pokemon);
    availableBySignature.set(signature, bucket);

    const speciesBucket = availableBySpecies.get(pokemon.species.name) ?? [];
    speciesBucket.push(pokemon);
    availableBySpecies.set(pokemon.species.name, speciesBucket);
  }

  const resultByKey = new Map<string, MyPokemonContract>();

  for (const plan of plans) {
    const signature = createSignature(
      plan.speciesName,
      plan.level,
      plan.currentHealthPoints,
      plan.totalHealthPoints,
      plan.equippedMoveNames,
    );
    const reusableBucket = availableBySignature.get(signature) ?? [];
    const species = seededPokemons.byName.get(plan.speciesName);

    if (!species) {
      summary.myPokemons.failed += 1;
      console.error(`[seed:my-pokemons] species not found for ${plan.key}: ${plan.speciesName}`);
      continue;
    }

    try {
      const reusablePokemon = reusableBucket.shift();

      if (reusablePokemon) {
        removeFromSpeciesBucket(availableBySpecies.get(plan.speciesName), reusablePokemon.id);
        resultByKey.set(plan.key, reusablePokemon);
        summary.myPokemons.reused += 1;
        console.log(`[seed:my-pokemons] reused ${plan.key} (${plan.speciesName})`);
        continue;
      }

      const equippedMoveIds = plan.equippedMoveNames
        .map((moveName) => seededMoves.byName.get(moveName)?.id)
        .filter((value): value is string => Boolean(value));
      const speciesBucket = availableBySpecies.get(plan.speciesName) ?? [];
      const mutablePokemon = speciesBucket.shift();

      if (mutablePokemon) {
        const updatedPokemon = await client.updateMyPokemon(mutablePokemon.id, {
          currentHealthPoints: plan.currentHealthPoints,
          equippedMoveIds,
          level: plan.level,
          totalHealthPoints: plan.totalHealthPoints,
        });

        resultByKey.set(plan.key, updatedPokemon);
        summary.myPokemons.updated += 1;
        console.log(`[seed:my-pokemons] restored ${plan.key} (${plan.speciesName})`);
        continue;
      }

      const createdPokemon = await client.createMyPokemon({
        currentHealthPoints: plan.currentHealthPoints,
        equippedMoveIds,
        level: plan.level,
        pokemonSpeciesId: species.id,
        totalHealthPoints: plan.totalHealthPoints,
      });

      resultByKey.set(plan.key, createdPokemon);
      summary.myPokemons.created += 1;
      console.log(`[seed:my-pokemons] created ${plan.key} (${plan.speciesName})`);
    } catch (error) {
      summary.myPokemons.failed += 1;
      console.error(`[seed:my-pokemons] failed ${plan.key}`);
      console.error(error);
    }
  }

  return {
    all: Array.from(resultByKey.values()),
    byKey: resultByKey,
  };
};
