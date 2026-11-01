# Presupuesto del hogar

Aplicación web (PWA) para que Jhojan y Luisa administren el presupuesto mensual del hogar: saldo, gastos con fotos de factura, gastos fijos, categorías con límite y balance de pareja.

## Cómo ejecutar

```bash
npm install
npm run dev      # desarrollo
npm run build    # compilación de producción
npm run preview  # probar la versión compilada
```

## Estructura

- `src/state/` contexto global de la app (`AppContext.tsx` provee, `appContext.ts` expone el hook `useApp`).
- `src/services/storageService.ts` datos de la app en localStorage (clave `hogar.datos.v1`).
- `src/services/photoService.ts` fotos de facturas en IndexedDB (base `hogar-fotos`). Los gastos solo guardan los ids de sus fotos.
- `src/utils/` lógica pura: presupuesto, gastos fijos, fechas, dinero, compresión de imágenes.
- `src/screens/` pantallas (Inicio, Gastos). Las demás pestañas son marcadores de posición.
- `src/components/` piezas compartidas (layout, selector de usuario, ajustes, visor de fotos).
- `public/` manifest, service worker (`sw.js`) e icono.

## Datos y privacidad

Todo se guarda solo en este dispositivo: los datos en localStorage y las fotos en IndexedDB. Si se borra el almacenamiento del navegador, se pierde la información.

## Reemplazar el almacenamiento por una API o Supabase

Toda la lectura y escritura de datos pasa por `storageService` (datos) y `photoService` (fotos). Para sincronizar a los dos usuarios, reemplaza la implementación de esos dos módulos manteniendo sus funciones; el resto de la app no cambia. Con Supabase, las fotos se pueden guardar en Storage y el gasto guardar sus URLs o ids.

## PWA

- Instalable desde el navegador (manifest en `public/manifest.webmanifest`).
- El service worker (`public/sw.js`) se registra solo en producción y guarda en caché la app para uso sin conexión básico.
