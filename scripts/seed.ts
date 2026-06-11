import { createSeedConfig } from './seed/config.js';
import { SeedApiClient } from './seed/apiClient.js';
import { generateBattlePlans, generateMovePlans, generateMyPokemonPlans, generateSpeciesPlans } from './seed/generators.js';
import { createSeedSummary, logPlan, logSummary } from './seed/logging.js';
import { seedBattlesAndPhases } from './seed/orchestrators/battles.js';
import { seedMoves } from './seed/orchestrators/moves.js';
import { seedMyPokemons } from './seed/orchestrators/myPokemons.js';
import { seedPokemons } from './seed/orchestrators/pokemons.js';

const main = async (): Promise<void> => {
  const config = createSeedConfig();
  const summary = createSeedSummary(config);
  const client = new SeedApiClient(config);

  console.log('[seed] Starting seed execution');
  logPlan(config);

  const movePlans = generateMovePlans(config);
  const speciesPlans = generateSpeciesPlans(config, movePlans);
  const battlePlans = generateBattlePlans(config);

  const seededMoves = await seedMoves(client, config, movePlans, summary);
  const seededPokemons = await seedPokemons(client, config, speciesPlans, seededMoves, summary);
  const myPokemonPlans = generateMyPokemonPlans(config, speciesPlans, seededPokemons.learnableMoveNamesBySpeciesName);
  const seededMyPokemons = await seedMyPokemons(client, config, myPokemonPlans, seededMoves, seededPokemons, summary);

  await seedBattlesAndPhases(client, config, battlePlans, seededMyPokemons, summary);

  logSummary(summary);
};

try {
  await main();
} catch (error) {
  console.error('[seed] Fatal error');
  console.error(error);
  process.exitCode = 1;
}
