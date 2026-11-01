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

Los datos del hogar se guardan en la fila `hogar` de Supabase. La app requiere iniciar sesión con una cuenta creada desde Supabase Auth; no ofrece registro público. Las dos cuentas autorizadas se vinculan a `household_members`, y las políticas RLS permiten leer y actualizar el hogar solo a esos usuarios.

Para activar la protección sin perder los datos:

1. En Supabase Dashboard → Authentication → Settings, desactiva los registros públicos.
2. Crea las dos cuentas desde Authentication → Users y copia sus UUID.
3. Ejecuta `supabase/migrations/20261101201500_secure_household_data.sql` en SQL Editor. Esta migración retira el acceso anónimo.
4. Inmediatamente después, vincula las cuentas con el hogar:
   ```sql
   INSERT INTO public.household_members (user_id, household_id, member_id)
   VALUES
     ('<UUID_JHOJAN>', 'hogar', 'jhojan'),
     ('<UUID_LUISA>', 'hogar', 'luisa');
   ```
5. Despliega esta versión de la app en Render. Mientras Render publica la versión con inicio de sesión, la versión anterior no podrá acceder a la tabla protegida.

La clave publicable de Supabase puede estar en el frontend. No incluyas nunca la clave `service_role` ni contraseñas en el código o en variables `VITE_*`.

Las fotos de facturas permanecen en IndexedDB de cada navegador y no se sincronizan entre dispositivos. Los datos presupuestarios sí se comparten entre las dos cuentas autorizadas.

El proyecto gratuito de Supabase puede pausarse después de siete días de baja actividad. Los límites de Render y Supabase pueden cambiar; consulta sus paneles antes del despliegue.
