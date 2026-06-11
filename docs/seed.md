# Seed por API

## Objetivo

El script de `scripts/` existe para poblar el backend con datos de prueba realistas usando la propia API HTTP del proyecto, no acceso directo a base de datos ni automatizacion de navegador.

Esto tiene varias ventajas:

- valida el contrato real de la API
- permite repetir la carga de datos de forma controlada
- deja un conjunto de datos reconocible para probar la UI
- evita el coste y la fragilidad de Selenium o Playwright para cargas masivas

En este proyecto, el entrypoint del seed es:

```bash
scripts/seed.ts
```

Y el comando de `npm` que lo ejecuta es:

```bash
npm run seed
```

Internamente ese comando lanza TypeScript directamente con `tsx`, sin necesidad de compilar el script a JavaScript antes.

## Que hace exactamente

El seed genera y sincroniza datos en este orden:

1. `moves`
2. `pokemons`
3. `pokemons/{id}/learnable-moves`
4. `my-pokemons`
5. `battles`
6. `battles/{id}/phases`

Ese orden no es casual:

- primero se crean los movimientos, porque los pokemon los referencian
- despues se crean las especies de pokemon
- luego se sincronizan los movimientos aprendibles de cada especie
- despues se crean los `my-pokemons`, que dependen de especies y movimientos
- al final se crean batallas y fases, que dependen de `my-pokemons`

El script no inventa datos arbitrarios en runtime sin estructura. Genera nombres y combinaciones deterministas con prefijos de seed para que el dataset sea facil de reconocer, por ejemplo:

- `seed-move-electric-001`
- `seed-species-fire-002`
- `seed-my-pokemon-014`

Eso ayuda a:

- distinguir rapidamente datos de prueba frente a datos manuales
- re-ejecutar el seed sin duplicar todo a ciegas
- depurar problemas en UI o backend con entidades reconocibles

## Como iniciarlo

### Requisitos previos

Antes de ejecutar el script, necesitas:

1. tener instaladas las dependencias del frontend
2. tener el backend arrancado y accesible por HTTP
3. conocer la URL base real de la API
4. si la API esta protegida, disponer de un Bearer token valido

Instalacion:

```bash
npm install
```

Ejecucion basica:

```bash
npm run seed
```

Ejecucion indicando la URL base de la API:

```bash
API_BASE_URL=http://localhost:5090 npm run seed
```

Ejemplo apuntando a otro puerto:

```bash
API_BASE_URL=http://localhost:5091 npm run seed
```

Ejemplo con autenticacion Bearer:

```bash
API_BASE_URL=http://localhost:5090 API_BEARER_TOKEN=tu_token npm run seed
```

Ejemplo aumentando volumen:

```bash
API_BASE_URL=http://localhost:5090 SEED_MOVES=40 SEED_SPECIES=20 SEED_MY_POKEMONS=80 SEED_BATTLES=25 npm run seed
```

## Variables de entorno

El script lee estas variables:

| Variable | Default | Descripcion |
| --- | --- | --- |
| `API_BASE_URL` | `http://localhost:5090` | URL base de la API |
| `API_BEARER_TOKEN` | vacio | Token Bearer opcional para APIs protegidas |
| `SEED_TAG` | `seed` | Prefijo semantico para nombres generados |
| `SEED_MOVES` | `20` | Numero objetivo de movimientos |
| `SEED_SPECIES` | `12` | Numero objetivo de especies pokemon |
| `SEED_MY_POKEMONS` | `40` | Numero objetivo de instancias `my-pokemons` |
| `SEED_BATTLES` | `10` | Numero objetivo de batallas a crear |
| `SEED_PHASES_MIN` | `3` | Numero minimo de fases por batalla |
| `SEED_PHASES_MAX` | `5` | Numero maximo de fases por batalla |
| `SEED_PAGE_SIZE` | `100` | Tamano de pagina usado al listar recursos paginados |
| `SEED_REQUEST_PAUSE_MS` | `0` | Pausa opcional entre requests |

### Validaciones que aplica el script

El script falla al inicio si detecta configuracion incoherente. Por ejemplo:

- cantidades negativas o cero donde se esperan enteros positivos
- `SEED_PHASES_MIN` mayor que `SEED_PHASES_MAX`
- valores no numericos en variables que deben ser enteras

Esto esta hecho para fallar rapido y evitar ejecuciones parciales ambiguas.

## Flujo completo de ejecucion

La ejecucion real de `scripts/seed.ts` sigue este flujo:

1. carga y valida configuracion
2. crea el cliente HTTP
3. prepara el objeto de resumen final
4. genera en memoria el plan de movimientos
5. genera en memoria el plan de especies
6. genera en memoria el plan de batallas
7. sincroniza `moves`
8. sincroniza `pokemons`
9. genera el plan de `my-pokemons` a partir de especies y movimientos ya creados
10. sincroniza `my-pokemons`
11. crea las batallas
12. crea las fases de batalla
13. imprime un resumen consolidado

Es importante entender que primero se genera un plan y despues se ejecuta. Esto facilita que la logica del seed sea mas predecible y facil de extender.

## Arquitectura interna del script

La carpeta `scripts/seed/` esta separada por responsabilidades:

### `scripts/seed.ts`

Es el entrypoint. Orquesta la ejecucion completa y llama a los modulos especializados en el orden correcto.

### `scripts/seed/config.ts`

Lee variables de entorno, asigna defaults y valida la configuracion. Aqui vive la definicion operativa del seed.

### `scripts/seed/apiClient.ts`

Implementa el cliente HTTP base del seed. Sus responsabilidades principales son:

- construir URLs a partir de `API_BASE_URL`
- adjuntar `Authorization: Bearer ...` cuando existe token
- enviar peticiones `GET`, `POST`, `PUT` y `DELETE`
- parsear respuestas JSON
- interpretar respuestas de error
- lanzar una excepcion de dominio (`SeedApiError`) cuando la API devuelve un estado no exitoso
- soportar pausas entre requests si se configura `SEED_REQUEST_PAUSE_MS`

Ademas incorpora helpers de listados paginados para poder recorrer recursos existentes antes de decidir si se crean, actualizan o reutilizan.

### `scripts/seed/generators.ts`

Genera los datos planeados antes de hacer llamadas reales. No persiste nada por si mismo.

Aqui se definen:

- nombres estables
- combinaciones de tipos
- estadisticas base
- relaciones entre movimientos y especies
- asignacion de movimientos equipados en `my-pokemons`
- emparejamientos de batallas

### `scripts/seed/orchestrators/*.ts`

Cada orquestador se encarga de una parte concreta del dominio:

- `moves.ts`
- `pokemons.ts`
- `myPokemons.ts`
- `battles.ts`

La idea es aislar las reglas de sincronizacion de cada endpoint y evitar meter toda la logica en un unico fichero grande.

### `scripts/seed/logging.ts`

Centraliza la salida por consola y la construccion del resumen final.

### `scripts/seed/types.ts`

Contiene los tipos TypeScript del seed:

- configuracion
- planes de datos
- contratos internos del cliente
- estructura del resumen

## Comportamiento por endpoint

### 1. `moves`

El seed:

- consulta los movimientos ya existentes
- busca coincidencias por nombre exacto
- si no existe, crea el movimiento
- si existe con el mismo nombre pero algun campo diferente, lo actualiza
- si ya coincide con el estado esperado, lo reutiliza

Esto hace que `moves` sea practicamente idempotente desde el punto de vista funcional.

Resultado esperado al repetir el seed:

- la primera vez suele crear
- las siguientes veces normalmente reutiliza o actualiza solo si ha cambiado el plan del script

### 2. `pokemons`

Con las especies ocurre un patron muy parecido:

- lista especies existentes
- localiza una coincidencia por nombre
- crea si no existe
- actualiza si existe pero sus atributos no coinciden con el plan
- reutiliza si ya esta correcta

Los atributos sincronizados incluyen la informacion necesaria para que la especie quede alineada con el dataset esperado por la demo.

### 3. `pokemons/{id}/learnable-moves`

Despues de crear o localizar las especies, el seed sincroniza sus movimientos aprendibles.

Puntos importantes:

- calcula el conjunto de movimientos deseado para cada especie
- consulta los movimientos aprendibles actuales
- ajusta la relacion para que coincida con el plan del seed
- preserva en lo posible movimientos ajenos al seed que no deban tocarse

En otras palabras, el script no se limita a crear especies: tambien deja preparada la parte funcional necesaria para que la UI pueda interactuar con ellas de manera creible.

### 4. `my-pokemons`

Esta parte tiene mas cuidado porque las batallas alteran estado mutable, especialmente la vida actual.

El seed trabaja asi:

- lista `my-pokemons` existentes
- intenta primero encontrar una coincidencia exacta por firma funcional
- si no la encuentra, intenta reutilizar una entidad de la misma especie
- si existe una entidad compatible pero desalineada por cambios previos, la restaura con `PUT`
- si no encuentra nada reutilizable, crea un nuevo `my-pokemon`

Esto es importante porque una batalla previa puede haber dejado un pokemon con menos HP. Si el seed solo comprobara igualdad estricta, acabaria creando duplicados con demasiada facilidad.

Por eso esta fase no solo "crea datos": tambien "repara" o "recompone" el dataset base para que las siguientes pruebas partan de un estado razonable.

### 5. `battles`

Las batallas son intencionadamente aditivas.

El script crea nuevas batallas usando parejas de `my-pokemons` sembrados. No aplica una estrategia fuerte de deduplicacion como en `moves` o `pokemons`.

La razon es sencilla:

- una batalla es un evento
- no suele existir una clave funcional natural tan clara como el nombre de un movimiento
- reusar batallas antiguas puede introducir ambiguedad en el historial y en el estado final

Consecuencia practica:

- cada ejecucion del seed puede crear mas batallas

Esto no es un bug, es una decision de diseno.

### 6. `battles/{id}/phases`

Para cada batalla creada, el script intenta ejecutar entre `SEED_PHASES_MIN` y `SEED_PHASES_MAX` fases.

El numero real puede ser menor porque:

- la batalla puede terminar antes
- puede no haber un atacante siguiente valido
- el flujo del backend puede cerrar el combate antes del maximo planeado

El seed usa los movimientos equipados del atacante de forma ciclica para ir construyendo fases plausibles.

## Idempotencia y repeticion segura

La propiedad mas importante del seed no es "que nunca cree nada repetido", sino "que pueda ejecutarse varias veces sin destruir el entorno ni generar caos innecesario".

Por eso conviene distinguir entre recursos:

### Recursos practicamente idempotentes

- `moves`
- `pokemons`
- `pokemons/{id}/learnable-moves`
- gran parte de `my-pokemons`

En estos casos el seed intenta:

- reutilizar
- actualizar solo si hace falta
- restaurar estado mutable cuando procede

### Recursos deliberadamente aditivos

- `battles`
- `battles/{id}/phases`

En estos casos cada ejecucion puede aumentar volumen historico.

## Que dataset genera

Por defecto, el script intenta dejar el sistema con esta carga:

- `20` movimientos
- `12` especies pokemon
- `40` `my-pokemons`
- `10` batallas
- `3` a `5` fases por batalla

Ese volumen esta pensado para:

- tener variedad visual en la UI
- poder probar listados y detalle
- validar flujos basicos de dominio
- no disparar tiempos de seed excesivos en local

## Resumen de consola

Al terminar, el seed muestra un resumen por dominio. Ese resumen suele incluir contadores como:

- `created`
- `updated`
- `reused`
- `skipped`
- `failed`
- `target`

Interpretacion recomendada:

- `created`: entidades nuevas insertadas
- `updated`: entidades existentes alineadas con el plan actual
- `reused`: entidades ya correctas que no necesitaron cambios
- `skipped`: casos donde no era posible o necesario actuar
- `failed`: operaciones que devolvieron error
- `target`: objetivo total configurado para ese bloque

## Casos de uso recomendados

### Caso 1. Inicializar un entorno local vacio

Uso recomendado:

```bash
API_BASE_URL=http://localhost:5090 npm run seed
```

Objetivo:

- poblar el backend rapidamente
- dejar la UI con datos suficientes para demo y pruebas manuales

### Caso 2. Regenerar el entorno despues de hacer pruebas de batallas

Uso recomendado:

```bash
API_BASE_URL=http://localhost:5090 npm run seed
```

Efecto esperado:

- `my-pokemons` quedaran restaurados o realineados si su estado habia cambiado
- las batallas anteriores no se borran
- se anadiran nuevas batallas

### Caso 3. Generar mas volumen para probar listados

Uso recomendado:

```bash
API_BASE_URL=http://localhost:5090 SEED_MOVES=60 SEED_SPECIES=30 SEED_MY_POKEMONS=150 SEED_BATTLES=50 npm run seed
```

Utilidad:

- comprobar paginacion
- probar rendimiento visual
- validar estados de carga y listados largos

## Limitaciones conocidas

### No limpia la base de datos

El script no esta pensado para vaciar el entorno ni para dejar una foto exacta de base de datos desde cero. Su objetivo es sembrar y sincronizar de forma segura a nivel de API.

Si necesitas un reseteo duro del entorno, eso deberia resolverse en el backend o en la infraestructura de base de datos.

### Las batallas se acumulan

Esto es esperable y debe tenerse en cuenta en demos largas o suites repetidas.

### Depende del contrato real de la API

Si cambian rutas, payloads o validaciones del backend, el seed puede dejar de funcionar hasta adaptarse.

### No sustituye a tests E2E

Su finalidad es poblar datos por API. Luego la UI puede validarse manualmente o con tests E2E, pero el seed no pretende reemplazar esa capa.

## Troubleshooting

### Error de conexion

Revisa:

- que el backend este arrancado
- que `API_BASE_URL` apunte al puerto correcto
- que la API sea accesible desde tu maquina

### Error 401 o 403

Revisa:

- si el backend exige autenticacion
- si `API_BEARER_TOKEN` esta informado
- si el token sigue vigente

### El seed se ejecuta pero no veo datos en la UI

Revisa:

- si la UI y el seed apuntan a la misma API
- si la UI usa la misma base URL que el seed
- si la UI filtra o pagina los datos

### Se crean demasiadas batallas al repetir

Eso es normal con el diseno actual. Si mas adelante se necesita una estrategia distinta, habria que decidir una politica explicita para:

- deduplicar batallas
- archivarlas
- borrarlas antes de sembrar

## Recomendacion operativa

La forma recomendada de trabajo es esta:

1. arrancar el backend
2. ejecutar `npm run seed`
3. arrancar la UI
4. validar en la UI que los datos aparecen y que los flujos funcionan
5. repetir el seed cuando quieras restaurar una base razonable de datos de prueba

## En una frase

Este seed no es un simple generador aleatorio: es una herramienta de inicializacion y sincronizacion por API pensada para dejar un entorno local util, repetible y demostrable para la UI.
