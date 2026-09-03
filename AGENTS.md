# FLOWMANAGER — AGENTS.md

## 1. Contexto del proyecto

FlowManager es un sistema de administración para estudios, inicialmente orientado a estudios de Pilates, diseñado con arquitectura modular para poder comercializarse posteriormente.

Objetivos actuales:
- Aproximadamente 80% funcional para el 15 de agosto de 2026.
- 100% funcional para el 25 de agosto de 2026.
- Priorizar funcionalidad completa y estable sobre detalles visuales secundarios.
- Mantener una arquitectura preparada para la futura app de clientas, app de coaches, escáner QR y página web.

## 2. Stack

Frontend:
- HTML
- CSS
- JavaScript Vanilla
- SPA ligera
- Sin framework frontend

Backend:
- Node.js
- Express
- CommonJS

Base de datos:
- SQLite

Control de versiones:
- Git
- GitHub

## 3. Arquitectura principal

Respetar este flujo:

Frontend Feature/Module
→ Service
→ Express Route
→ Controller
→ SQLite
→ JSON
→ actualización del DOM

La arquitectura frontend utiliza:
- Router
- FeatureManager
- Module
- ModuleFactory
- Modules por dominio
- Services por dominio
- Componentes UI reutilizables

No saltarse capas sin una razón técnica clara.

## 4. Reglas obligatorias

### No duplicar

NO crear:
- pantallas duplicadas
- formularios duplicados
- servicios duplicados
- componentes duplicados
- lógica duplicada

Antes de crear algo nuevo, buscar si ya existe una implementación reutilizable.

### Componentes

Preferir componentes reutilizables.

Si una UI puede utilizarse en más de una pantalla, considerar convertirla en componente.

### Separación de responsabilidades

Mantener separadas:
- UI
- lógica de interfaz
- servicios/API
- lógica de negocio
- acceso a datos

No colocar SQL en frontend.

No colocar `fetch` directamente en componentes visuales si existe un Service correspondiente.

### CSS

No hardcodear colores cuando exista una variable CSS apropiada.

Utilizar las variables definidas por el sistema de tema.

## 5. Compatibilidad

Antes de modificar un archivo:
1. Leerlo y entender su contexto.
2. Buscar quién lo utiliza.
3. Revisar dependencias relacionadas.
4. Identificar efectos secundarios.
5. Proponer los archivos que serán modificados.

No asumir que un archivo está aislado.

## 6. Regla de cambios

Por defecto:
- Analizar primero.
- Explicar la solución.
- Enumerar archivos afectados.
- Esperar aprobación antes de realizar cambios importantes.

No crear archivos innecesarios.

No eliminar archivos antiguos simplemente porque parezcan no utilizados.

No introducir una arquitectura nueva si la actual puede resolver correctamente el problema.

## 7. Git y seguridad

NO ejecutar operaciones destructivas de Git sin aprobación explícita.

NO hacer:
- `git reset --hard`
- `git clean -fd`
- borrar ramas
- sobrescribir cambios del usuario
- eliminar archivos sin aprobación

No modificar el repositorio fuera del alcance de la tarea.

No instalar dependencias sin aprobación.

## 8. Calidad

Mantener el estilo existente.

Preferir soluciones simples y mantenibles.

No introducir frameworks o librerías nuevas si no son necesarias.

No sobrearquitecturizar funcionalidades sencillas.

No cambiar grandes partes del proyecto para resolver un problema localizado.

## 9. Reservaciones y horarios

Las reservaciones dependen de:
- clientes
- membresías
- vigencia
- clases disponibles
- actividades
- horarios
- capacidad

Las reglas críticas deben validarse en backend.

Los horarios son recurrentes y están ligados a actividades.

Las futuras mejoras de reservaciones deben contemplar:
- navegación por semanas
- navegación por meses
- selección de fechas
- fechas compatibles con los días activos del horario
- reservas múltiples
- vigencia de membresía
- límite de clases
- capacidad disponible
- prevención de reservas duplicadas

## 10. Reglas de reservación

No permitir reservar si:
- el cliente no existe
- está inactivo
- no tiene membresía
- la membresía no está activa
- la membresía aún no inició
- la membresía expiró
- no tiene clases disponibles
- el horario está inactivo
- la actividad está inactiva
- el horario está lleno

Las validaciones críticas deben existir en backend aunque también existan en frontend.

## 11. Problemas conocidos

Estos problemas están identificados y forman parte del roadmap. NO corregirlos automáticamente mientras se trabaja en otra funcionalidad:

- Falta un ejecutor visible de migraciones SQLite.
- Revisar `PRAGMA foreign_keys`.
- Revisar generadores de IDs por posibles colisiones.
- Revisar concurrencia/transacciones al validar cupos.
- Revisar transacciones en asistencia y descuento de clases.
- Corregir correctamente la representación de membresías ilimitadas.
- Revisar expiración de membresías.
- Revisar cambio de membresía de un cliente y datos derivados.
- El dashboard todavía no representa ingresos reales porque no existe módulo de pagos.
- No existe autenticación/autorización completa.
- Existe código legado; no eliminarlo sin revisar dependencias.

## 12. Forma de trabajo

El usuario quiere aprender programación mientras desarrolla FlowManager.

Para modificaciones importantes:
1. Explicar brevemente el problema.
2. Indicar archivos que se modificarán.
3. Explicar la lógica de la solución.
4. Mostrar o describir claramente el cambio.
5. Evitar explicaciones innecesariamente largas.
6. Avanzar tarea por tarea.

## 13. Prioridad

Priorizar:
1. Funcionalidad crítica.
2. Integridad de datos.
3. Backend y reglas de negocio.
4. Integración frontend/backend.
5. Experiencia de usuario.
6. Pulido visual.

No detener funcionalidades críticas por detalles visuales secundarios.

## 14. Regla principal

Antes de programar:
> Entender la arquitectura existente y reutilizar lo que ya existe.

Antes de crear:
> Buscar si ya existe.

Antes de eliminar:
> Comprobar dependencias y pedir aprobación.

Antes de modificar:
> Explicar el alcance.

Antes de finalizar:
> Probar que la funcionalidad existente no se haya roto.
