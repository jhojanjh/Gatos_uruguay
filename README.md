# Presupuesto del hogar

Aplicación web (PWA) para que Jhojan y Luisa administren el presupuesto mensual del hogar. El frontend React se conecta directamente a Supabase para leer y guardar los datos.

## Ejecutar localmente

```bash
npm install
```

Copia `.env.example` a `.env.local` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores del proyecto Supabase. Después:

```bash
npm run dev
```

## Desplegar gratis en Render

El archivo `render.yaml` configura un sitio estático de Render. Para desplegar:

1. Sube esta rama al repositorio de GitHub.
2. En Render, crea un **Blueprint** conectado al repositorio y selecciona `render.yaml`.
3. Cuando Render lo solicite, proporciona `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del proyecto Supabase.
4. Render ejecutará `npm ci && npm run build` y publicará `dist/` en su CDN.

Los sitios estáticos de Render son gratuitos y no se apagan por inactividad. El proyecto Supabase gratuito tiene límites de uso y puede pausarse después de una semana con poca actividad; puedes reactivarlo desde Supabase. Revisa los límites actuales antes de usarlo como servicio permanente.

La clave `anon`/publishable se incluye en el frontend, por diseño; **nunca** uses `service_role` ni una clave secreta en las variables `VITE_*`.

## Datos, privacidad y autenticación

Los datos compartidos se guardan en la tabla Supabase `household_data`. Las fotos de facturas permanecen en IndexedDB de cada navegador y no se sincronizan entre dispositivos.

La app aún no tiene inicio de sesión. El selector de Jhojan y Luisa solo cambia el nombre de usuario que muestra la interfaz. La migración actual permite a cualquier visitante anónimo leer y actualizar el registro `hogar`; por tanto, no publiques ni cargues datos financieros reales hasta configurar Supabase Auth y políticas RLS que limiten el acceso a usuarios autorizados.

El proyecto gratuito de Supabase puede pausarse después de siete días de baja actividad y permite hasta 500 MB de base de datos. Los límites de Render y Supabase pueden cambiar; consulta sus paneles antes del despliegue.
