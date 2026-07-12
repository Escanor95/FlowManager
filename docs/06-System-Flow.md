# AuraAccess Pro

# System Flow

## Flujo de Registro de Asistencia mediante QR

```text
Cliente

↓

Muestra Código QR

↓

Recepcionista escanea el QR desde la PWA

↓

La PWA envía el ID del QR al Servidor

↓

Servidor recibe la solicitud

↓

Buscar Cliente

↓

¿Existe el Cliente?

├──────────── NO ────────────┐
│                            │
│ Registrar Evento           │
│ Tipo: QR Inválido          │
│                            │
│ Mostrar mensaje            │
│ "Cliente no encontrado"    │
│                            │
└──────────── FIN ───────────┘

↓

SI

↓

Recuperar Expediente

↓

Validar Membresía

↓

¿Está Vigente?

├──────────── NO ────────────┐
│                            │
│ Registrar Evento           │
│ Tipo: Membresía Vencida    │
│                            │
│ Mostrar mensaje            │
│ "Acceso denegado"          │
│                            │
└──────────── FIN ───────────┘

↓

SI

↓

Verificar Cooldown

↓

¿Existe un registro en los últimos 30 minutos?

├──────────── SI ────────────┐
│                            │
│ Registrar Evento           │
│ Tipo: Escaneo Repetido     │
│                            │
│ Mostrar Advertencia        │
│                            │
│ "Último registro hace 12 minutos" │
│                            │
│ ¿Registrar nuevamente?     │
│                            │
│ SI ────────────────┐        │
│                    │        │
│ NO ─────── FIN     │        │
└────────────────────┘        │

↓

NO

↓

¿Tipo de Membresía?

↓

¿Es por número de clases?

├──────────── SI ─────────────┐
│                             │
│ Descontar 1 Clase           │
└─────────────────────────────┘

↓

NO

↓

Continuar

↓

Registrar Asistencia

↓

Registrar Evento

Tipo: Asistencia Registrada

↓

Actualizar Dashboard

↓

Actualizar KPIs

↓

Responder a la PWA

↓

Mostrar

"Bienvenido Juan"

↓

FIN
```

---

## Eventos generados

- Asistencia Registrada
- Escaneo Repetido
- Membresía Vencida
- QR Inválido

---

## KPIs afectados

- Asistencias del día
- Escaneos repetidos
- Accesos denegados
- Clientes activos
- Membresías por vencer

---

## ADR relacionados

- ADR-009 Validación Inteligente
- ADR-010 Registro de Eventos
- ADR-011 Validación desde el Servidor