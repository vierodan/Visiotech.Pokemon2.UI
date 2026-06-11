# Pokemon2 UI

Demo UI en React + Vite + TypeScript para consumir la API de Visiotech Pokémon.

## Requisitos previos para la ejecución de la UI

Antes de arrancar la interfaz, conviene dejar preparado el backend y cargar datos de prueba para que la UI pueda consultar catálogos, listar `my-pokemons` y ejecutar simulaciones reales.

### 1. Arrancar previamente la API

La UI necesita que la API esté disponible por HTTP. El backend documenta ambos modos en `../backend/README.md`.

#### Opción A. API con Postgres

Modo recomendado cuando se quiere trabajar con persistencia real.

Desde la carpeta `backend/`:

```bash
cp .env.example .env
docker compose up -d
dotnet run --project src/Host/Visiotech.Pokemon.Host
```

Por defecto, la API queda accesible en:

```txt
http://localhost:5090
```

#### Opción B. API en modo InMemory

Modo útil para desarrollo rápido local sin levantar PostgreSQL.

La API debe arrancarse en `Development` con el proveedor `InMemory`:

```bash
ASPNETCORE_ENVIRONMENT=Development Persistence__Provider=InMemory dotnet run --project src/Host/Visiotech.Pokemon.Host
```

Este modo solo está permitido en `Development`.

### 2. Ejecutar el script siguiendo las instrucciones de `docs/seed.md`

Una vez que la API esté levantada, ejecuta el seed del frontend para poblar el backend usando la propia API HTTP.

Instala dependencias si todavía no lo has hecho:

```bash
npm install
```

Ejecuta el seed:

```bash
npm run seed
```

Si la API no está en el puerto por defecto, indica la URL base explícitamente:

```bash
API_BASE_URL=http://localhost:5091 npm run seed
```

La guía completa del seed, incluyendo variables soportadas y ejemplos adicionales, está en [docs/seed.md](docs/seed.md).

## Instrucciones para arrancar la UI

Configura la URL base de la API en `.env.local`:

```bash
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:5090
```

En desarrollo local, se recomienda usar `VITE_API_BASE_URL=/api` y dejar que Vite haga proxy hacia la API real para evitar problemas de CORS.

Después, arranca la aplicación:

```bash
npm run dev
```

Comandos útiles de validación:

```bash
npm run lint
npm run build
```
