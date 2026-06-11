import type { SeedConfig } from './types.js';

const readPositiveInt = (name: string, fallback: number): number => {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer.`);
  }

  return parsedValue;
};

const readNonNegativeInt = (name: string, fallback: number): number => {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error(`Environment variable ${name} must be zero or a positive integer.`);
  }

  return parsedValue;
};

export const createSeedConfig = (): SeedConfig => {
  const phaseMin = readPositiveInt('SEED_PHASES_MIN', 3);
  const phaseMax = readPositiveInt('SEED_PHASES_MAX', 5);

  if (phaseMin > phaseMax) {
    throw new Error('SEED_PHASES_MIN cannot be greater than SEED_PHASES_MAX.');
  }

  return {
    apiBaseUrl: (process.env.API_BASE_URL ?? 'http://localhost:5090').replace(/\/+$/, ''),
    apiBearerToken: process.env.API_BEARER_TOKEN?.trim() || undefined,
    battles: readPositiveInt('SEED_BATTLES', 10),
    moves: readPositiveInt('SEED_MOVES', 20),
    myPokemons: readPositiveInt('SEED_MY_POKEMONS', 40),
    pageSize: readPositiveInt('SEED_PAGE_SIZE', 100),
    phaseMax,
    phaseMin,
    requestPauseMs: readNonNegativeInt('SEED_REQUEST_PAUSE_MS', 0),
    seedTag: process.env.SEED_TAG?.trim() || 'seed',
    species: readPositiveInt('SEED_SPECIES', 12),
  };
};
