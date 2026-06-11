# Visiotech Frontend Demo

Skeleton inicial de una SPA con React + Vite + TypeScript preparada para crecer como demo técnica profesional y futura integración con una API externa.

## Stack

- React
- Vite
- TypeScript
- CSS Modules + estilos globales
- ESLint con configuración básica para TypeScript y React hooks

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Variables de entorno

Duplica `.env.example` como `.env` y ajusta la URL del backend:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

Si `VITE_API_BASE_URL` no está definida, la demo usa datos mock para que la aplicación siga siendo funcional mientras el backend aún no existe.

## Estructura

```text
src/
  api/
    apiConfig.ts
    httpClient.ts
  assets/
    brandMark.svg
  components/
    layout/
      AppShell.tsx
      AppShell.module.css
      Header.tsx
      Header.module.css
      MainContent.tsx
      MainContent.module.css
    shared/
      SectionCard.tsx
      SectionCard.module.css
  features/
    demo/
      components/
        DemoApiPanel.tsx
        DemoApiPanel.module.css
      hooks/
        useDemoPreview.ts
      services/
        demoService.ts
      types/
        demo.ts
  pages/
    HomePage.tsx
    HomePage.module.css
  styles/
    globals.css
  App.tsx
  main.tsx
  vite-env.d.ts
```

## Arquitectura

- `api/`: configuración y cliente HTTP reutilizable, con punto preparado para inyectar token Bearer más adelante.
- `features/`: verticales funcionales listas para crecer sin mezclar lógica de dominio con layout.
- `components/layout/`: estructura visual global de la aplicación.
- `components/shared/`: primitivas reutilizables entre páginas y features.
- `pages/`: entry points de pantallas de la SPA.

## Integración futura con backend

La capa HTTP ya expone `get`, `post`, `put` y `delete` con tipado genérico y soporte para query params, JSON y cabecera `Authorization` cuando se configure un token.

Pasos siguientes recomendados:

1. Añadir endpoints reales en `features/*/services`.
2. Definir modelos de respuesta por feature en `types/`.
3. Incorporar tests unitarios y de integración cuando empiece la lógica de negocio.
4. Añadir router si la SPA crece a varias páginas reales.

