import type { SeedBattlePlan, SeedConfig, SeedMovePlan, SeedMyPokemonPlan, SeedSpeciesPlan } from './types.js';

const elementalTypes = [
  'electric',
  'fire',
  'water',
  'grass',
  'ice',
  'rock',
  'ground',
  'steel',
  'psychic',
  'dark',
  'dragon',
  'fairy',
  'fighting',
  'poison',
  'flying',
  'bug',
  'ghost',
  'normal',
] as const;

const categories = ['Physical', 'Special'] as const;

const pad = (value: number): string => String(value).padStart(3, '0');
const toTitleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export const generateMovePlans = (config: SeedConfig): SeedMovePlan[] =>
  Array.from({ length: config.moves }, (_, index) => {
    const typeSlug = elementalTypes[index % elementalTypes.length];
    const type = toTitleCase(typeSlug);
    const category = categories[index % categories.length];

    return {
      category,
      key: `move-${pad(index + 1)}`,
      name: `${config.seedTag}-move-${typeSlug}-${pad(index + 1)}`,
      power: 35 + (index % 6) * 15,
      type,
    };
  });

export const generateSpeciesPlans = (config: SeedConfig, movePlans: SeedMovePlan[]): SeedSpeciesPlan[] =>
  Array.from({ length: config.species }, (_, index) => {
    const primaryTypeSlug = elementalTypes[index % elementalTypes.length];
    const primaryType = toTitleCase(primaryTypeSlug);
    const secondaryType =
      index % 3 === 0 ? toTitleCase(elementalTypes[(index + 5) % elementalTypes.length]) : undefined;

    const types = secondaryType && secondaryType !== primaryType ? [primaryType, secondaryType] : [primaryType];
    const matchingMoves = movePlans
      .filter((move) => types.includes(move.type) || move.type === 'normal')
      .slice(0, 4)
      .map((move) => move.name);

    const fallbackMoves = movePlans
      .filter((move) => !matchingMoves.includes(move.name))
      .slice(0, Math.max(0, 4 - matchingMoves.length))
      .map((move) => move.name);

    return {
      baseStats: {
        attack: 48 + (index % 5) * 7,
        defense: 44 + (index % 4) * 8,
        health: 58 + (index % 6) * 9,
        specialAttack: 46 + (index % 6) * 7,
        specialDefense: 42 + (index % 5) * 8,
        speed: 40 + (index % 7) * 9,
      },
      desiredMoveNames: [...matchingMoves, ...fallbackMoves].slice(0, 4),
      key: `species-${pad(index + 1)}`,
      name: `${config.seedTag}-species-${primaryTypeSlug}-${pad(index + 1)}`,
      types,
    };
  });

export const generateMyPokemonPlans = (
  config: SeedConfig,
  speciesPlans: SeedSpeciesPlan[],
  learnableMoveNamesBySpeciesName: Map<string, string[]>,
): SeedMyPokemonPlan[] =>
  Array.from({ length: config.myPokemons }, (_, index) => {
    const speciesPlan = speciesPlans[index % speciesPlans.length];
    const level = 8 + (index % 18);
    const totalHealthPoints = speciesPlan.baseStats.health + level * 3;
    const currentHealthPoints = Math.max(1, totalHealthPoints - ((index % 5) * 9 + (index % 3) * 4));
    const learnableMoveNames = learnableMoveNamesBySpeciesName.get(speciesPlan.name) ?? speciesPlan.desiredMoveNames;
    const equippedMoveNames = Array.from({ length: Math.min(4, learnableMoveNames.length) }, (_, moveIndex) => {
      const offset = (index + moveIndex) % learnableMoveNames.length;
      return learnableMoveNames[offset];
    });

    return {
      currentHealthPoints,
      equippedMoveNames,
      key: `my-pokemon-${pad(index + 1)}`,
      level,
      speciesName: speciesPlan.name,
      totalHealthPoints,
    };
  });

export const generateBattlePlans = (config: SeedConfig): SeedBattlePlan[] =>
  Array.from({ length: config.battles }, (_, index) => {
    const baseIndex = (index * 2) % Math.max(config.myPokemons, 1);
    const secondIndex = (baseIndex + 1) % Math.max(config.myPokemons, 1);

    return {
      desiredPhaseCount: Math.min(config.phaseMax, Math.max(config.phaseMin, config.phaseMin + (index % (config.phaseMax - config.phaseMin + 1)))),
      firstMyPokemonKey: `my-pokemon-${pad(baseIndex + 1)}`,
      key: `battle-${pad(index + 1)}`,
      secondMyPokemonKey: `my-pokemon-${pad(secondIndex + 1)}`,
    };
  });
