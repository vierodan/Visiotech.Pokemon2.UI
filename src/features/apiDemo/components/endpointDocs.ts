import type { EndpointCalloutProps } from './EndpointCallout';

const pokemonTypes =
  'Bug, Dark, Dragon, Electric, Fairy, Fighting, Fire, Flying, Ghost, Grass, Ground, Ice, Normal, Poison, Psychic, Rock, Steel y Water.';
const moveCategories = 'Physical, Special y Status.';

export const endpointDocs: Record<string, EndpointCalloutProps> = {
  systemInfo: {
    description: 'Comprueba que el host backend está vivo y que la UI realmente está hablando con la API esperada.',
    fields: ['No necesita body ni parámetros. Solo lanza GET /api/v1/system.'],
    response: [
      'Devuelve service, environment, version y generatedAtUtc.',
      'Sirve como verificación técnica rápida antes de probar el resto del contrato.',
    ],
  },
  catalogMoves: {
    description: 'Consulta el catálogo paginado de movimientos y permite filtrar por datos funcionales.',
    fields: [
      'name: filtro opcional por nombre.',
      `type: filtro opcional. Tipos válidos: ${pokemonTypes}`,
      `category: filtro opcional. Categorías válidas: ${moveCategories}`,
      'page y pageSize: paginación; deben ser mayores que 0.',
    ],
    response: [
      'Devuelve items, page, pageSize, totalCount y totalPages.',
      'Cada item incluye id, name, type, category y power.',
    ],
  },
  catalogSpecies: {
    description: 'Consulta el catálogo paginado de especies base del MVP.',
    fields: [
      'name: filtro opcional por nombre.',
      `type: filtro opcional. Tipos válidos: ${pokemonTypes}`,
      'page y pageSize: paginación; deben ser mayores que 0.',
    ],
    response: [
      'Devuelve items, page, pageSize, totalCount y totalPages.',
      'Cada especie incluye id, name, types y baseStats completos.',
    ],
  },
  catalogMyPokemons: {
    description: 'Lista las instancias jugables creadas a partir de las especies base.',
    fields: ['page y pageSize: paginación; deben ser mayores que 0.'],
    response: [
      'Devuelve items, page, pageSize, totalCount y totalPages.',
      'Cada item incluye id, especie base, level, currentHealthPoints, totalHealthPoints y equippedMoves.',
    ],
  },
  loadReferences: {
    description: 'Recarga las referencias base que usa la UI para poblar combos y relaciones entre recursos.',
    fields: ['No requiere campos manuales. La UI consulta moves, pokemons y my-pokemons con pageSize 100.'],
    response: [
      'Sincroniza en memoria las listas de movimientos, especies e instancias jugables.',
      'Permite que el resto de botones pueda trabajar con ids reales.',
    ],
  },
  moveCreate: {
    description: 'Da de alta un movimiento del catálogo para aprendizaje, daño y combate.',
    fields: [
      'name: obligatorio, único y con longitud máxima de 100.',
      `type: obligatorio. Valores válidos: ${pokemonTypes}`,
      `category: obligatoria. Valores válidos: ${moveCategories}`,
      'power: en Physical o Special debe ser mayor que 0; en Status debe ser 0.',
    ],
    response: ['Devuelve 201 Created con el movimiento creado: id, name, type, category y power.'],
  },
  moveDetail: {
    description: 'Consulta el detalle canónico de un movimiento concreto del catálogo.',
    fields: ['move id: debe existir en el catálogo de movimientos.'],
    response: ['Devuelve 200 OK con id, name, type, category y power del movimiento seleccionado.'],
  },
  moveSharedSpecies: {
    description: 'Muestra que especies tienen un movimiento dado como aprendible.',
    fields: ['move id: debe existir y tener relaciones aprendibles asociadas si quieres ver resultados.'],
    response: [
      'Devuelve el id y nombre del movimiento.',
      'Incluye la lista de pokemonSpecies que pueden aprenderlo.',
    ],
  },
  moveUpdate: {
    description: 'Modifica un movimiento existente del catálogo sin cambiar su identificador.',
    fields: [
      'El id viaja en la URL y debe existir.',
      'name: obligatorio y único dentro del catálogo.',
      `type: obligatorio. El combo admite estos valores: ${pokemonTypes}`,
      `category: obligatoria. El combo admite estos valores: ${moveCategories}`,
      'power: en Physical o Special debe ser mayor que 0; en Status debe ser 0.',
    ],
    response: ['Devuelve 200 OK con el movimiento actualizado.'],
  },
  moveDelete: {
    description: 'Elimina físicamente un movimiento cuando no rompe integridad de datos.',
    fields: ['move id: debe existir.'],
    rules: [
      'Se rechaza si el movimiento está referenciado por learnable moves, equipped moves o histórico de combate.',
    ],
    response: ['Devuelve 204 No Content si el borrado es válido.'],
  },
  speciesCreate: {
    description: 'Crea una especie base del catálogo Pokémon.',
    fields: [
      'name: obligatorio y único.',
      `types: entre 1 y 2 tipos, sin duplicados. Valores válidos: ${pokemonTypes}`,
      'health, attack, defense, specialAttack, specialDefense y speed: todos deben ser mayores que 0.',
    ],
    response: ['Devuelve 201 Created con id, name, types y baseStats completos de la especie creada.'],
  },
  speciesDetail: {
    description: 'Consulta el detalle canónico de una especie base.',
    fields: ['pokemon id: debe existir en el catálogo de especies.'],
    response: ['Devuelve 200 OK con id, name, types y baseStats de la especie seleccionada.'],
  },
  speciesLearnableGet: {
    description: 'Consulta el conjunto de movimientos que una especie puede aprender.',
    fields: ['pokemon id: debe existir.'],
    response: [
      'Devuelve pokemonSpeciesId, pokemonSpeciesName y la colección de moves aprendibles.',
      'La fuente de verdad es la relación especie -> learnable moves.',
    ],
  },
  speciesUpdate: {
    description: 'Actualiza los datos canónicos de una especie base.',
    fields: [
      'El id viaja en la URL y debe existir.',
      'name, types y baseStats siguen las mismas reglas que en la creación.',
    ],
    response: ['Devuelve 200 OK con la especie actualizada.'],
  },
  speciesLearnableUpdate: {
    description: 'Añade y retira movimientos aprendibles de una especie base.',
    fields: [
      'addMoveIds: ids de movimientos a añadir.',
      'removeMoveIds: ids de movimientos a retirar.',
    ],
    rules: [
      'Debes enviar al menos un id para añadir o retirar.',
      'No puede haber ids vacíos ni duplicados dentro de la misma colección.',
      'No se puede añadir y retirar el mismo movimiento en la misma petición.',
      'No se puede añadir una relación ya existente ni retirar una inexistente.',
    ],
    response: ['Devuelve 200 OK con pokemonSpeciesId, pokemonSpeciesName y la lista final de moves aprendibles.'],
  },
  speciesDelete: {
    description: 'Elimina una especie base cuando ya no tiene dependencias persistidas.',
    fields: ['pokemon id: debe existir.'],
    rules: ['Se rechaza si la especie está referenciada por my-pokemons u otras relaciones persistidas.'],
    response: ['Devuelve 204 No Content si el borrado se puede completar.'],
  },
  myPokemonCreate: {
    description: 'Crea una instancia jugable a partir de una especie base.',
    fields: [
      'pokemonSpeciesId: debe existir.',
      'level: entero entre 1 y 100.',
      'currentHealthPoints: mayor o igual que 0 y menor o igual que totalHealthPoints.',
      'totalHealthPoints: mayor que 0.',
      'equippedMoveIds: entre 1 y 4 ids, sin duplicados, existentes y aprendibles por la especie.',
    ],
    response: [
      'Devuelve 201 Created con id, especie base completa, nivel, PS y equippedMoves.',
    ],
  },
  myPokemonDetail: {
    description: 'Consulta el detalle de una instancia jugable concreta.',
    fields: ['myPokemon id: debe existir.'],
    response: [
      'Devuelve 200 OK con id, species, level, currentHealthPoints, totalHealthPoints y equippedMoves.',
    ],
  },
  myPokemonEquipped: {
    description: 'Consulta solo los movimientos equipados de una instancia jugable.',
    fields: ['myPokemon id: debe existir.'],
    response: ['Devuelve myPokemonId y la lista moves actualmente equipados por la instancia.'],
  },
  myPokemonUpdate: {
    description: 'Actualiza el nivel, la vida o los movimientos equipados de una instancia jugable.',
    fields: [
      'El id viaja en la URL y debe existir.',
      'level: entero entre 1 y 100.',
      'currentHealthPoints: mayor o igual que 0 y menor o igual que totalHealthPoints.',
      'totalHealthPoints: mayor que 0.',
      'equippedMoveIds: entre 1 y 4 ids, sin duplicados, existentes y aprendibles por la especie.',
    ],
    response: ['Devuelve 200 OK con la instancia jugable actualizada.'],
  },
  myPokemonDelete: {
    description: 'Elimina una instancia jugable cuando no compromete partidas ni histórico persistido.',
    fields: ['myPokemon id: debe existir.'],
    rules: ['Se rechaza si participa en una partida activa o mantiene referencias persistidas de combate.'],
    response: ['Devuelve 204 No Content si el borrado es válido.'],
  },
  damageCalculate: {
    description: 'Calcula el daño que un movimiento causaría desde un atacante a un defensor sin ejecutar una batalla.',
    fields: [
      'attackerMyPokemonId: debe existir, tener PS mayores que 0 y llevar equipado el movimiento indicado.',
      'defenderMyPokemonId: debe existir y tener PS mayores que 0.',
      'moveId: debe existir y no puede ser de categoría Status.',
    ],
    rules: [
      'Physical usa Attack del atacante y Defense del defensor.',
      'Special usa SpecialAttack del atacante y SpecialDefense del defensor.',
      'Se aplica tabla de efectividad y factor aleatorio entero entre 85 y 100.',
    ],
    response: [
      'Devuelve moveType, moveCategory, movePower, stats usados, factor aleatorio, efectividad, damage y PS restantes.',
    ],
  },
  battleLoadMyPokemons: {
    description: 'Recarga las instancias jugables disponibles para crear y ejecutar combates con ids reales.',
    fields: ['No requiere body. Consulta GET /api/v1/my-pokemons con pageSize 100.'],
    response: ['Sincroniza el catálogo local de my-pokemons que usa la sección de batallas.'],
  },
  battleCreate: {
    description: 'Crea una nueva partida entre exactamente dos my-pokemons.',
    fields: [
      'firstMyPokemonId: primer combatiente; debe existir.',
      'secondMyPokemonId: segundo combatiente; debe existir.',
    ],
    rules: [
      'La partida nace con Status = Created, CurrentTurnNumber = 1 y NextAttackerMyPokemonId = firstMyPokemonId.',
    ],
    response: [
      'Devuelve 201 Created con id de batalla, estado, turno, siguiente atacante, combatientes e histórico vacío.',
    ],
  },
  battleDetail: {
    description: 'Consulta el estado actual de una partida de combate.',
    fields: ['battle id: debe existir.'],
    response: [
      'Devuelve id, status, currentTurnNumber, nextAttackerMyPokemonId, winnerMyPokemonId, loserMyPokemonId y combatants.',
    ],
  },
  battleHistory: {
    description: 'Reconstruye las fases ya ejecutadas en una partida.',
    fields: ['battle id: debe existir.'],
    response: [
      'Devuelve battleId y las phases ordenadas por sequenceNumber.',
      'Cada fase incluye atacante, defensor, movimiento, random, efectividad, daño y PS restantes.',
    ],
  },
  battleExecute: {
    description: 'Avanza una partida una fase aplicando un movimiento del atacante actual.',
    fields: [
      'battle id: debe existir y la partida no puede estar finalizada.',
      'attackerMyPokemonId: debe pertenecer a la partida, coincidir con NextAttackerMyPokemonId y tener PS mayores que 0.',
      'moveId: debe estar equipado por el atacante y ser válido para calcular daño.',
    ],
    rules: [
      'La API registra la fase, actualiza los PS del defensor y alterna el siguiente atacante si el combate continúa.',
      'Si el defensor queda a 0 PS, la partida pasa a Finished y se fijan winnerMyPokemonId y loserMyPokemonId.',
    ],
    response: [
      'Devuelve 200 OK con battle actualizado y damageCalculation completo de la fase ejecutada.',
    ],
  },
};
