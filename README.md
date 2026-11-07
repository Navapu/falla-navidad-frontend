# Nadal Trifàsics 2026 · Frontend

Frontend responsive de la votación navideña de la Falla Maestro Bellver – Mariano Ribera.

## Desarrollo

1. Copia `.env.example` a `.env`.
2. Define `VITE_API_URL` con la URL de la API, terminada en `/api`.
3. Ejecuta `npm install` y `npm run dev`.

## Vercel

Importa este repositorio en Vercel. El framework se detectará como Vite. Añade:

- `VITE_API_URL=https://tu-backend.vercel.app/api`

Después añade la URL definitiva de este frontend a `CORS_ORIGINS` en el proyecto backend y vuelve a desplegarlo.
