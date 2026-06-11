import type { SeedConfig, SeedSummary } from './types.js';

const printStats = (label: string, stats: { created?: number; failed?: number; reused?: number; skipped?: number; target?: number; updated?: number }): void => {
  console.log(
    `  ${label}: target=${stats.target ?? 0} created=${stats.created ?? 0} reused=${stats.reused ?? 0} updated=${stats.updated ?? 0} skipped=${stats.skipped ?? 0} failed=${stats.failed ?? 0}`,
  );
};

export const createSeedSummary = (config: SeedConfig): SeedSummary => ({
  battles: {
    created: 0,
    failed: 0,
    target: config.battles,
  },
  learnableMovesLinks: {
    created: 0,
    failed: 0,
    reused: 0,
    skipped: 0,
    target: config.species,
    updated: 0,
  },
  moves: {
    created: 0,
    failed: 0,
    reused: 0,
    skipped: 0,
    target: config.moves,
    updated: 0,
  },
  myPokemons: {
    created: 0,
    failed: 0,
    reused: 0,
    skipped: 0,
    target: config.myPokemons,
    updated: 0,
  },
  notes: [],
  phases: {
    created: 0,
    failed: 0,
    skipped: 0,
    target: config.battles * config.phaseMin,
  },
  pokemons: {
    created: 0,
    failed: 0,
    reused: 0,
    skipped: 0,
    target: config.species,
    updated: 0,
  },
});

export const logPlan = (config: SeedConfig): void => {
  console.log('[seed] Configuration');
  console.log(`  API_BASE_URL=${config.apiBaseUrl}`);
  console.log(`  SEED_TAG=${config.seedTag}`);
  console.log(`  moves=${config.moves} species=${config.species} my-pokemons=${config.myPokemons}`);
  console.log(`  battles=${config.battles} phases=${config.phaseMin}-${config.phaseMax}`);
};

export const logSummary = (summary: SeedSummary): void => {
  console.log('[seed] Summary');
  printStats('moves', summary.moves);
  printStats('pokemons', summary.pokemons);
  printStats('learnable-moves links', summary.learnableMovesLinks);
  printStats('my-pokemons', summary.myPokemons);
  printStats('battles', summary.battles);
  printStats('phases', summary.phases);

  if (summary.notes.length > 0) {
    console.log('[seed] Notes');
    for (const note of summary.notes) {
      console.log(`  - ${note}`);
    }
  }
};

