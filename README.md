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

Los datos compartidos se guardan en la fila `hogar` de Supabase. Los usuarios deben iniciar sesión con una cuenta creada desde Supabase Auth; la app no ofrece registro público.

La migración `20261101201500_secure_household_data.sql` crea `household_members` y restringe el acceso a los usuarios autenticados que figuran como miembros del hogar. Antes de activar la app protegida:

1. Crea las dos cuentas desde Supabase Dashboard → Authentication → Users.
2. Ejecuta la migración en Supabase SQL Editor. Esta revoca el acceso anónimo a `household_data`.
3. Consulta los UUID de ambos usuarios en Authentication → Users e insértalos en `household_members`, con `member_id` `jhojan` o `luisa`.
4. En Authentication → Settings, desactiva el registro público.
5. Despliega esta versión de la app.

La clave publicable de Supabase puede estar en el frontend. No incluyas nunca la clave `service_role` ni contraseñas en el código o en variables `VITE_*`.

Las fotos de facturas permanecen en IndexedDB de cada navegador y no se sincronizan entre dispositivos. Los datos presupuestarios sí se comparten entre las dos cuentas autorizadas.

El proyecto gratuito de Supabase puede pausarse después de siete días de baja actividad. Los límites de Render y Supabase pueden cambiar; consulta sus paneles antes del despliegue.
