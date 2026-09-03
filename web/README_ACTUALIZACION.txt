# Aura Wellness Studio — Web actualizada

Incluye:
- index.html
- styles.css
- assets optimizados con las imágenes proporcionadas
- logo conservado desde el HTML original
- servicios: Spinning, Sculpt, GAP, Masajes, Faciales, Pilates, Barre, Uñas, Pestañas y Nutrióloga
- horario de clases
- Instagram y WhatsApp
- ubicación con Google Maps

## Cómo reemplazar en el servidor

1. Haz respaldo de la versión actual.
2. Sustituye `index.html`, `styles.css` y la carpeta `assets/` por los de este paquete.
3. Reinicia Node.

### Si ejecutas Node directamente desde la carpeta del proyecto

```powershell
cd C:\Users\netom\Desktop\AuraAccess-Pro
# detener el proceso actual si está abierto:
Ctrl + C
node server/app.js
```

### Si usas npm

```powershell
cd C:\Users\netom\Desktop\AuraAccess-Pro
Ctrl + C
npm start
```

Si `npm start` no existe en `package.json`, usa:

```powershell
node server/app.js
```

## Limpieza de caché / PWA

Después de publicar los cambios:
- En Chrome/Edge móvil, abre la página y haz recarga completa.
- Si la PWA sigue mostrando la versión anterior, elimina los datos/caché del sitio y vuelve a instalar/abrir la PWA.
- No cambies el service worker a menos que sea necesario; el frontend actual puede estar cacheado.

## Datos actuales

Instagram:
https://www.instagram.com/auracuidatuenergia/

WhatsApp:
55 3079 0958

Google Maps:
https://maps.app.goo.gl/9vzfnySHWZ6XLGWG9

Dirección:
Conjunto Lirios Centro de Negocios,
Av. Constitución Manzana 39, Ensueños,
54740 Cuautitlán Izcalli, Méx.
