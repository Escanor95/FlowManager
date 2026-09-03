# FlowManager PWA — Cliente + Coach

Versión móvil de Aura Wellness con la misma funcionalidad establecida para cliente y coach, conservando la estética crema/dorado.

## Incluye
- Login JWT.
- Cliente: inicio, perfil, membresía, reservas, cancelación, historial de reservas, asistencias y QR.
- Coach: inicio, perfil, clases asignadas, agenda, reservas personales, historial y QR de coach.
- Manifest PWA.
- Iconos 192x192 y 512x512.
- Icono vectorial `icons/icon.svg`.
- Service Worker para cache básica del App Shell.

## Estructura
```text
pwa/
├── index.html
├── manifest.json
├── sw.js
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   └── pwa.css
└── js/
    ├── api.js
    ├── auth.js
    └── app.js
```

## Probar desde un celular en la misma red

1. Coloca esta carpeta `pwa/` dentro de la carpeta pública que sirve tu servidor.
2. Inicia FlowManager en la PC:

```bash
node server/app.js
```

3. En Windows abre CMD y ejecuta:

```bash
ipconfig
```

4. Busca `Dirección IPv4`, por ejemplo `192.168.1.25`.
5. En el celular, conectado a la misma red Wi-Fi, abre:

```text
http://192.168.1.25:3000/pwa/
```

No uses `localhost` en el celular: `localhost` apunta al propio teléfono.

## Importante sobre instalación PWA

La aplicación funciona como sitio móvil por HTTP en una red local. Para que Chrome/Safari permita todas las funciones de instalación de una PWA y el Service Worker en un teléfono, lo recomendable es servirla mediante HTTPS.

Para una prueba rápida de interfaz y funcionalidad, la URL de la red local es suficiente. Para una instalación PWA real, usa HTTPS con un dominio o certificado válido.

## Icono

El manifest utiliza:
- `icons/icon-192.png` para accesos directos y dispositivos compatibles.
- `icons/icon-512.png` para instalaciones y pantallas de mayor resolución.
- `icons/icon.svg` como fuente vectorial editable.

La paleta del icono sigue la PWA actual: crema, dorado y café, sin introducir colores nuevos.
