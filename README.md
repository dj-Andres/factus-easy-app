# Factus Easy App

Frontend web para la gestión de documentación electrónica ecuatoriana bajo el estándar SRI.

Este proyecto es una SPA en React + TypeScript para manejar empresas, clientes, productos, transportistas, facturas, notas de crédito, guías de remisión, retenciones y configuración asociada a la emisión de comprobantes.

## Descripción general

Factus Easy está pensado para trabajar que expone el negocio y los endpoints de documentos tributarios. La aplicación:

- autentica usuarios y registra nuevas cuentas,
- selecciona la empresa activa por RUC,
- gestiona catálogos y configuración del contribuyente,
- permite crear y consultar facturas, notas de crédito, guías y retenciones,
- consulta el estado de documentos emitidos,
- mantiene la lógica de multi-tenancy por empresa mediante el `selectedRuc`.

## Stack tecnológico

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS v4
- Flowbite React
- React Router v7
- React Query
- Zustand
- Axios
- Zod + react-hook-form
- oxlint

## Requisitos

- Node.js 18+ (se recomienda 20 LTS)
- npm
- API backend funcionando con la URL configurada en `VITE_API_URL`

## Instalación

1. Clona el repositorio.
2. Instala dependencias:

```bash
npm install
```

3. Crea tu archivo de entorno a partir del ejemplo:

```bash
copy .env.example .env
```

4. Ajusta la URL de la API backend:

```env
VITE_API_URL=http://localhost:3001/api
```

> El proyecto usa `VITE_API_URL` como base de la API. Si el backend corre en otra ruta, cambia ese valor antes de iniciar la app.

## Scripts disponibles

```bash
npm run dev
```
Inicia el servidor de desarrollo de Vite.

```bash
npm run build
```
Compila la aplicación con TypeScript y genera el build de producción.

```bash
npm run lint
```
Ejecuta el linter de la aplicación con `oxlint`.

```bash
npm run preview
```
Sirve la build generada para revisión local.

## Estructura principal

```text
src/
  api/                 # clientes y endpoints REST
  components/          # componentes reutilizables del layout y UI
  config/              # configuración de tours y app
  data/                # datos estáticos como métodos de pago
  hooks/               # hooks de React Query y utilidades
  lib/                 # lógica pura de documentos y utilidades
  pages/               # vistas por módulo (autenticación, catálogos, documentos)
  routes/              # enrutamiento principal con guards
  stores/              # Zustand para autenticación y sesión
  types/               # tipos del backend y modelos de la app
  App.tsx              # bootstrap de la app
  main.tsx             # entrada de la aplicación
```

## Rutas principales

La app usa rutas protegidas y públicas:

- `/login` y `/register` para autenticación
- `/` Dashboard principal
- `/customers` clientes
- `/products` productos
- `/transporters` transportistas
- `/quick-invoices` facturas
- `/quick-credit-notes` notas de crédito
- `/quick-remission-guides` guías de remisión
- `/quick-retentions` retenciones
- `/documents` estado de documentos
- `/settings` configuración general
- `/settings/establishments` establecimientos
- `/settings/emission-points` puntos de emisión
- `/settings/taxes` impuestos SRI
- `/settings/payment-methods` formas de pago
- `/settings/retentions` retenciones de catálogo

## Convenciones del proyecto

- Todo el UI y los textos están en español.
- La autenticación se maneja con Zustand y persistencia local.
- El RUC activo se usa para aislar la información por empresa.
- Los documentos complejos siguen un patrón con `useState` + lógica pura separada por módulo.
- Los formularios usan valores en texto y convierten solo al momento de enviar.
- No hay infraestructura de pruebas configurada en este frontend.

## Requerimientos del backend

Este frontend espera una API con estructura compatible con Laravel, incluyendo:

- autenticación por token JWT/Bearer,
- respuestas con envelopes o errores de validación,
- soporte de multi-tenancy por RUC,
- endpoints para empresas, clientes, productos, transportistas, documentos y configuración tributaria.

## Nota importante

La app no incluye un runner de tests. Actualmente el proyecto cuenta con scripts de desarrollo, build y lint, pero no con `npm test` ni infraestructura de Jest/Vitest.

## Licencia

Este proyecto no define una licencia explícita en el repositorio por el momento.
