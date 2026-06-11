# Visiotech Frontend Demo

Demo UI en React + Vite + TypeScript para consumir la API documentada en `backend/visiotech-pokemon-api-v1.json`.

## Configuración

La app usa `VITE_API_BASE_URL` desde `.env.local`.

```bash
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:5090
```

En desarrollo local la recomendación es usar `/api` como base URL y dejar que Vite haga proxy hacia el backend real. Así evitamos problemas de CORS en navegador aunque Postman funcione correctamente.

Si en otro entorno no necesitas proxy, `VITE_API_BASE_URL` también puede apuntar a una URL absoluta.

## Ejecución

```bash
npm install
npm run dev
```

Para validar compilación y lint:

```bash
npm run lint
npm run build
```

## Qué demuestra la UI

- `GET /api/v1/system` para comprobar conectividad y metadatos del host.
- `GET /api/v1/moves`, `GET /api/v1/pokemons` y `GET /api/v1/my-pokemons` con los filtros soportados por contrato.
- `POST /api/v1/damage-calculations` usando IDs reales de `my-pokemons` y `equippedMoves`.

## Estructura relevante

- `src/api/`: configuración, cliente HTTP, parsing de errores y servicios tipados.
- `src/features/apiDemo/`: componentes de la demo conectada al backend.
- `src/pages/HomePage.tsx`: composición principal de la experiencia.

## Nota sobre autenticación

El contrato actual no declara `securitySchemes`, pero el cliente HTTP ya permite adjuntar un Bearer token temporal desde la UI por si el backend evoluciona en esa dirección.
