# AuraAccess Pro

# Database Design

Versión: 0.1

Estado: En desarrollo

---

# Entidad: Cliente

## Descripción

Representa a una persona registrada en el sistema que puede adquirir productos (membresías), registrar asistencias, realizar pagos y generar un historial dentro de AuraAccess Pro.

El Cliente es la entidad principal del sistema.

---

## Objetivo

Centralizar toda la información relacionada con un cliente para facilitar la operación del negocio y mantener un historial completo.

---

## Campos

| Campo | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| id | UUID | Sí | Identificador único del cliente. |
| nombre | Texto | Sí | Nombre completo. |
| telefono | Texto | Sí | Número telefónico principal. |
| correo | Texto | No | Correo electrónico. |
| fecha_nacimiento | Fecha | No | Fecha de nacimiento. |
| genero | Texto | No | Género del cliente. |
| direccion | Texto | No | Dirección. |
| estado | Texto | Sí | Estado actual del cliente. |
| qr_id | Texto | Sí | Identificador utilizado para generar el QR. |
| fecha_registro | Fecha | Sí | Fecha de alta en el sistema. |

---

## Contacto de Emergencia

| Campo | Tipo | Obligatorio |
|--------|------|-------------|
| nombre | Texto | Sí |
| parentesco | Texto | No |
| telefono | Texto | Sí |

---

## Información Médica Relevante

| Campo | Tipo | Obligatorio |
|--------|------|-------------|
| condiciones | Texto | No |
| restricciones | Texto | No |
| alergias | Texto | No |
| observaciones | Texto | No |

---

## Estados del Cliente

- Prospecto
- Activo
- Congelado
- Vencido
- Suspendido
- Inactivo

---

## Relaciones

Cliente

↓

Tiene muchas Membresías

↓

Tiene muchas Asistencias

↓

Tiene muchos Pagos

↓

Tiene muchos Eventos

---

## Reglas del Negocio

- Un cliente nunca se elimina físicamente.
- El QR debe ser único.
- El teléfono no debe repetirse (salvo autorización del administrador).
- Todo cliente debe tener un estado.
- Todo cliente genera un historial de eventos.

---

## Operaciones Permitidas

- Registrar
- Buscar
- Editar
- Desactivar
- Reactivar
- Generar QR
- Reenviar QR
- Consultar Historial

# Tabla: clients

| Campo | Tipo | Descripción |
|--------|------|-------------|
| id | INTEGER | Llave interna |
| clientId | TEXT | AU-000001 |
| fullName | TEXT | Nombre completo |
| phone | TEXT | Teléfono |
| email | TEXT | Correo |
| membershipType | TEXT | Tipo de membresía |
| membershipStatus | TEXT | Activa, Vencida, Congelada |
| remainingClasses | INTEGER | Clases restantes |
| startDate | DATE | Inicio |
| endDate | DATE | Fin |
| emergencyContactName | TEXT | Contacto |
| emergencyContactPhone | TEXT | Teléfono |
| medicalNotes | TEXT | Observaciones |
| createdAt | DATETIME | Alta |
| updatedAt | DATETIME | Última modificación |
| isActive | BOOLEAN | Estado |