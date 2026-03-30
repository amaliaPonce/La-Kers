# LA-KERS PRO Communications

## 1. Resumen ejecutivo

LA-KERS necesita una mensajería profesional y trazable, no un chat informal. La recomendación es introducir un dominio `communications` separado de `incidents`, `payments` y `documents`, pero conectado con `units` y `tenant_persons`.

Decisión principal:

- Primera versión robusta: conversaciones estructuradas, mensajes con categoría/prioridad, adjuntos, cierre/reapertura, audit log, notificaciones y SSE.
- Restricción actual del producto: hoy solo existe autenticación para propietarios mediante Clerk. Por eso la implementación dejada en el backend queda preparada para multi-actor, pero la mensajería bidireccional real con inquilino autenticado requiere introducir identidad propia para inquilinos o un portal autenticado.

## 2. Arquitectura recomendada

### Propuesta

- Dominio independiente `communications`
- Persistencia en Postgres/Supabase
- API REST para CRUD operativo
- SSE para tiempo real en primera versión
- Tabla de auditoría y notificaciones desacopladas
- Reglas de acceso por ownership y relación contractual

### Entidades principales

- `organizations`
- `users`
- `organization_memberships`
- `properties`
- `units`
- `leases`
- `communication_conversations`
- `communication_conversation_participants`
- `communication_messages`
- `communication_message_attachments`
- `communication_message_reads`
- `communication_notifications`
- `communication_settings`
- `communication_audit_log`

### Relaciones

- una `organization` tiene muchos `users`, `properties`, `units`, `leases` y `conversations`
- un `property` puede tener muchas `units`
- una `unit` puede tener muchos `leases` históricos
- una `conversation` puede ser:
  - `GENERAL`: sin unidad ni contrato
  - `PROPERTY`: vinculada a una `unit`
  - `LEASE`: vinculada a `unit` + `lease`
- una `conversation` tiene muchos `participants`
- una `conversation` tiene muchos `messages`
- un `message` tiene cero o muchos `attachments`
- un `message` tiene cero o muchos `reads`

### Recomendación práctica para LA-KERS hoy

El código actual usa `units.owner_id` y `tenant_persons` como base de ownership. Por eso la implementación inicial se apoya en:

- `owner_id` como partición principal
- `unit_id` como vínculo inmobiliario
- `lease_id = tenant_persons.id` como contrato efectivo

Alternativa:

- introducir ya `organizations`, `properties`, `users` y `memberships` como fuente única de verdad
- ventaja: mejor multi-tenant desde día uno
- coste: refactor amplio del producto actual

Recomendación:

- mantener `owner_id` como partición operativa ahora
- diseñar el módulo para migrar después a `organization_id`

## 3. Modelo de datos

### Modelo objetivo recomendado

#### `users`

- `id uuid pk`
- `organization_id uuid fk`
- `clerk_user_id text unique`
- `role enum('OWNER','TENANT','ADMIN','STAFF')`
- `status enum('ACTIVE','INVITED','SUSPENDED')`
- `full_name text`
- `email text`
- `phone text`
- `created_at timestamptz`
- `updated_at timestamptz`

Índices:

- `organization_id`
- `role`
- `clerk_user_id unique`
- `email`

#### `organizations`

- `id uuid pk`
- `name text`
- `slug text unique`
- `status enum('ACTIVE','SUSPENDED')`
- `created_at timestamptz`
- `updated_at timestamptz`

Índices:

- `slug unique`
- `status`

#### `properties`

- `id uuid pk`
- `organization_id uuid fk`
- `owner_user_id uuid fk`
- `name text`
- `address text`
- `city text`
- `postal_code text`
- `country_code text`
- `created_at timestamptz`
- `updated_at timestamptz`

Índices:

- `organization_id`
- `owner_user_id`

#### `units`

- `id uuid pk`
- `property_id uuid fk`
- `owner_id text`
- `name text`
- `status enum('AVAILABLE','OCCUPIED','RESERVED')`
- `monthly_rent numeric`
- `created_at timestamptz`

Índices:

- `property_id`
- `owner_id`
- `status`

#### `leases`

- usar `tenant_persons` actual como lease/contract en LA-KERS v1
- futuro ideal:
  - `id uuid pk`
  - `unit_id uuid fk`
  - `tenant_user_id uuid fk nullable`
  - `tenant_person_id uuid fk nullable`
  - `start_date date`
  - `end_date date`
  - `status enum('ACTIVE','ARCHIVED','DRAFT')`
  - `created_at timestamptz`
  - `updated_at timestamptz`

Índices:

- `unit_id`
- `tenant_user_id`
- `status`

#### `communication_conversations`

- `id uuid pk`
- `organization_id uuid nullable`
- `owner_id text`
- `scope_type enum('GENERAL','PROPERTY','LEASE')`
- `unit_id uuid fk nullable`
- `lease_id uuid fk nullable`
- `category enum('INCIDENCE','PAYMENT','CONTRACT','MAINTENANCE','DOCUMENTATION','GENERAL_NOTICE','QUESTION','URGENT')`
- `priority enum('low','normal','high','urgent')`
- `status enum('OPEN','CLOSED')`
- `subject text`
- `opened_by_actor_type enum('OWNER','TENANT','ADMIN','SYSTEM')`
- `opened_by_actor_ref text`
- `closed_at timestamptz nullable`
- `closed_by_actor_type text nullable`
- `closed_by_actor_ref text nullable`
- `reopened_at timestamptz nullable`
- `last_message_at timestamptz nullable`
- `last_message_preview text nullable`
- `last_message_author_label text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Índices:

- `owner_id`
- `status`
- `category`
- `priority`
- `unit_id`
- `lease_id`
- `(owner_id, last_message_at desc)`

#### `communication_conversation_participants`

- `id uuid pk`
- `conversation_id uuid fk`
- `actor_type enum('OWNER','TENANT','ADMIN','SYSTEM')`
- `actor_ref text`
- `tenant_person_id uuid fk nullable`
- `display_name text`
- `participant_role enum('OWNER','TENANT','ADMIN','WATCHER')`
- `can_read boolean`
- `can_write boolean`
- `can_close boolean`
- `notification_email text nullable`
- `last_read_message_id uuid fk nullable`
- `last_read_at timestamptz nullable`
- `created_at timestamptz`

Índices:

- `conversation_id`
- `(actor_type, actor_ref)`
- `tenant_person_id`
- `unique(conversation_id, actor_type, actor_ref)`

#### `communication_messages`

- `id uuid pk`
- `conversation_id uuid fk`
- `sender_participant_id uuid fk`
- `message_type enum('USER','SYSTEM','NOTE')`
- `visibility enum('EXTERNAL','INTERNAL')`
- `body text`
- `body_format enum('plain_text')`
- `category enum nullable`
- `priority enum nullable`
- `metadata jsonb nullable`
- `edited_at timestamptz nullable`
- `created_at timestamptz`

Índices:

- `(conversation_id, created_at desc)`
- `sender_participant_id`
- `visibility`
- `priority`

#### `communication_message_attachments`

- `id uuid pk`
- `message_id uuid fk`
- `attachment_type enum('FILE','LINK','DOCUMENT')`
- `name text`
- `mime_type text nullable`
- `storage_path text nullable`
- `url text`
- `size_bytes bigint nullable`
- `checksum text nullable`
- `created_at timestamptz`

Índices:

- `message_id`
- `attachment_type`

#### `communication_message_reads`

- `id uuid pk`
- `message_id uuid fk`
- `participant_id uuid fk`
- `read_at timestamptz`

Índices:

- `message_id`
- `(participant_id, read_at desc)`
- `unique(message_id, participant_id)`

#### `communication_notifications`

- `id uuid pk`
- `owner_id text`
- `conversation_id uuid fk nullable`
- `message_id uuid fk nullable`
- `recipient_actor_type enum('OWNER','TENANT','ADMIN','SYSTEM')`
- `recipient_actor_ref text`
- `channel enum('IN_APP','EMAIL')`
- `notification_type enum('NEW_CONVERSATION','NEW_MESSAGE','URGENT_MESSAGE','REMINDER','CONVERSATION_REOPENED','CONVERSATION_CLOSED')`
- `status enum('PENDING','SENT','READ','FAILED','CANCELED')`
- `title text`
- `body text`
- `dedupe_key text nullable`
- `scheduled_at timestamptz nullable`
- `sent_at timestamptz nullable`
- `read_at timestamptz nullable`
- `metadata jsonb nullable`
- `created_at timestamptz`

Índices:

- `(owner_id, created_at desc)`
- `(recipient_actor_type, recipient_actor_ref, status)`
- `dedupe_key unique where not null`

#### `communication_settings`

- `id uuid pk`
- `owner_id text`
- `actor_type enum('OWNER','TENANT','ADMIN')`
- `actor_ref text`
- `email_enabled boolean`
- `urgent_email_enabled boolean`
- `digest_enabled boolean`
- `digest_frequency enum('instant','daily','weekly')`
- `quiet_hours_start time nullable`
- `quiet_hours_end time nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Índices:

- `owner_id`
- `unique(owner_id, actor_type, actor_ref)`

## 4. Reglas de negocio

- un inquilino solo puede iniciar conversación con el propietario vinculado a su `lease` o `unit`
- un propietario solo puede escribir a inquilinos asociados a sus propiedades
- un admin de organización puede ver y moderar conversaciones de su organización
- no se permite acceso cruzado entre `owner_id` u organizaciones
- `GENERAL` solo para avisos o consultas no ligadas a unidad/contrato
- `PROPERTY` para contexto inmueble/unidad
- `LEASE` para pagos, contrato, renovaciones, incumplimientos y trazabilidad contractual
- `INTERNAL` solo visible para owner/admin
- `EXTERNAL` visible para participantes externos
- solo participantes con `can_write=true` pueden responder
- solo participantes con `can_close=true` pueden cerrar/reabrir
- toda acción relevante genera `audit_log`
- los mensajes no se borran físicamente salvo política legal; se archivan o se marcan

## 5. Casos de uso cubiertos

- inquilino abre incidencia:
  - crea conversación `scope_type=LEASE` o `PROPERTY`
  - `category=INCIDENCE`
  - `priority=normal|high`
- propietario responde:
  - crea `message` en conversación existente
- aviso general del propietario:
  - conversación `GENERAL_NOTICE`, `scope_type=GENERAL` o `PROPERTY`
- conversación por propiedad:
  - `scope_type=PROPERTY`, `unit_id` obligatorio
- conversación por contrato:
  - `scope_type=LEASE`, `unit_id` y `lease_id` obligatorios
- leído/no leído:
  - `communication_message_reads`
  - `last_read_at` por participante
- prioridad:
  - `low`, `normal`, `high`, `urgent`
- categoría:
  - `INCIDENCE`, `PAYMENT`, `CONTRACT`, `MAINTENANCE`, `DOCUMENTATION`, `GENERAL_NOTICE`, `QUESTION`, `URGENT`
- adjuntos:
  - archivo, enlace, documento
- cerrar/reabrir:
  - `status`, `closed_at`, `reopened_at`
- historial:
  - no se pisa contenido
  - `audit_log` registra las transiciones

## 6. Diseño de API REST

### Principios

- rutas agrupadas bajo `/communications`
- auth obligatoria
- PRO obligatorio
- filtros pensados para inbox profesional

### Endpoints

#### `POST /communications/conversations`

- auth: propietario autenticado; futuro tenant/admin
- crea conversación estructurada

Request:

```json
{
  "subject": "Humedad en baño principal",
  "tenantPersonId": "lease_or_tenant_id",
  "unitId": "unit_uuid",
  "leaseId": "tenant_person_uuid",
  "scopeType": "LEASE",
  "category": "INCIDENCE",
  "priority": "high",
  "initialMessage": "Se ha detectado una fuga detrás del lavabo.",
  "visibility": "EXTERNAL",
  "attachments": [
    {
      "type": "LINK",
      "name": "Fotos incidencia",
      "url": "https://..."
    }
  ]
}
```

Responde `201` con detalle completo de conversación.

Errores:

- `400` validación
- `401` auth
- `402` plan
- `403` ownership
- `409` lease/unit inconsistente

#### `GET /communications/conversations`

Query params:

- `unitId`
- `leaseId`
- `status`
- `category`
- `priority`
- `unreadOnly=true|false`
- `limit`
- `offset`

Responde:

```json
{
  "items": [
    {
      "id": "conversation_uuid",
      "subject": "Humedad en baño principal",
      "status": "OPEN",
      "category": "INCIDENCE",
      "priority": "high",
      "scopeType": "LEASE",
      "unitId": "unit_uuid",
      "leaseId": "lease_uuid",
      "unreadCount": 2,
      "lastMessageAt": "2026-03-27T10:15:00.000Z",
      "lastMessagePreview": "Adjunto fotos y vídeo.",
      "lastMessageAuthor": "Inquilino",
      "participants": [
        {
          "actorType": "OWNER",
          "actorRef": "user_123",
          "displayName": "Propietario",
          "participantRole": "OWNER"
        }
      ],
      "createdAt": "2026-03-27T09:00:00.000Z",
      "closedAt": null
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "returned": 1
  }
}
```

#### `GET /communications/conversations/:conversationId`

- devuelve conversación + mensajes + adjuntos + estado de lectura del actor actual
- `404` si no pertenece al tenant/owner/org

#### `POST /communications/conversations/:conversationId/messages`

Request:

```json
{
  "body": "Recibido. Coordinamos visita mañana a las 10:00.",
  "visibility": "EXTERNAL",
  "category": "MAINTENANCE",
  "priority": "normal"
}
```

- `201` con detalle actualizado
- `409` si la conversación está cerrada

#### `POST /communications/messages/read`

Request:

```json
{
  "conversationId": "conversation_uuid"
}
```

Alternativa:

```json
{
  "conversationId": "conversation_uuid",
  "messageIds": ["message_1", "message_2"]
}
```

Respuesta:

```json
{
  "updated": 2
}
```

#### `POST /communications/conversations/:conversationId/close`

- cierra conversación
- `403` si el actor no puede cerrar

#### `POST /communications/conversations/:conversationId/reopen`

- reabre conversación

#### `POST /communications/attachments/links`

- adjunta un recurso existente a un mensaje ya creado

#### `GET /communications/messages/unread`

- devuelve conversaciones con no leídos para construir bandeja priorizada

#### `GET /communications/conversations/open-count`

Respuesta:

```json
{
  "openCount": 8
}
```

## 7. Tiempo real y notificaciones

### Evaluación

- Polling:
  - simple pero ineficiente
- Long polling:
  - complejidad extra sin suficiente ventaja
- WebSockets:
  - potente pero sobredimensionado para esta primera versión
- SSE:
  - mejor equilibrio para LA-KERS hoy
  - el proyecto ya usa SSE en dashboard
  - unidireccional desde servidor es suficiente para inbox y badges

### Recomendación

- primera versión: SSE + fallback polling
- endpoint: `GET /communications/stream`

Eventos:

- `connected`
- `conversation-created`
- `message-created`
- `messages-read`
- `conversation-closed`
- `conversation-reopened`

Payload ejemplo:

```json
{
  "at": "2026-03-27T10:25:00.000Z",
  "source": "communications.message.created",
  "conversationId": "conversation_uuid",
  "messageId": "message_uuid"
}
```

Reconexión:

- `retry: 5000`
- en frontend, `EventSource`
- si falla, reintentar con backoff simple 5s
- refrescar listado al recuperar foco

Sincronización de unread counts:

- cada evento fuerza `GET /communications/conversations?limit=...`
- opcionalmente `GET /communications/conversations/open-count`
- fallback polling cada 60-120s si SSE cae

## 8. Seguridad

- auth:
  - Clerk para propietarios hoy
  - futuro portal tenant/admin con identidad propia
- autorización:
  - ownership por `owner_id`
  - validación `tenant_persons.units.owner_id = authUserId`
- aislamiento multi-tenant:
  - nunca buscar por `id` sin filtrar por `owner_id` u organización
- anti-acceso indebido:
  - no confiar en `tenantPersonId`, `unitId`, `leaseId` sin validar relación
- rate limits:
  - global + específico en `/communications`
- anti-spam:
  - max longitud mensaje
  - throttling por actor
  - bloqueo de duplicados mediante `dedupe_key` para notificaciones
- sanitización:
  - texto plano
  - strip HTML
  - eliminar control chars
- adjuntos:
  - whitelist de mime types
  - tamaño máximo
  - escaneo antivirus si se habilita upload directo
- auditoría:
  - creación, respuesta, lectura, cierre, reapertura, adjuntos
- PII:
  - evitar exponer emails completos si no hace falta en frontend
  - aplicar retención y anonimización similar a `tenant_persons`

## 9. Plan básico vs PRO

### Básico

- bandeja simple owner-only
- mensajes sin adjuntos
- sin prioridades
- sin categorías avanzadas
- sin SLA
- sin historial completo para reporting

### PRO

- conversaciones estructuradas por propiedad o contrato
- categorías profesionales
- prioridades y urgencia
- adjuntos y enlaces
- cierre/reapertura
- audit trail
- notificaciones in-app y email
- SSE en tiempo real
- filtros avanzados
- base para portal de inquilino
- automatizaciones futuras

Justificación del upgrade:

- reduce incidencias no trazadas
- mejora cobros y documentación
- centraliza pruebas y comunicación contractual
- permite reporting operativo y compliance

## 10. Estructura de código recomendada

```text
backend/src/modules/communications/
  controller.ts
  dto.ts
  policies.ts
  realtime.ts
  repository.ts
  service.ts
  types.ts
  validators.ts
backend/src/routes/communications.ts
sql/20260327_pro_communications.sql
```

### Responsabilidad por capa

- `controller`: HTTP + códigos + mapping de request/response
- `validators`: normalización y validación
- `policies`: ownership, plan PRO, reglas actor
- `repository`: acceso a Supabase
- `service`: orquestación de negocio
- `realtime`: SSE y eventos
- `dto/types`: contratos estables para frontend/API

## 11. Ejemplos de implementación

### DTOs

Ya implementados en:

- `backend/src/modules/communications/dto.ts`

### Modelos/contratos

Ya implementados en:

- `backend/src/modules/communications/types.ts`

### Middleware/autorización

El módulo reutiliza auth global y resuelve actor actual como `OWNER` mientras no exista identidad de inquilino.

Para futuro:

- extender `authMiddleware` con `actorType`, `organizationId`, `tenantPersonId`

### Servicio crear conversación

- valida plan PRO
- valida ownership de unidad y lease
- crea conversación
- crea participantes
- crea mensaje inicial
- registra notificaciones
- escribe audit log

### Servicio enviar mensaje

- exige acceso del actor a la conversación
- impide escribir en conversación cerrada
- crea mensaje
- actualiza cursor de lectura del emisor
- dispara notificaciones a otros participantes

### Servicio marcar leído

- exige acceso
- escribe en `communication_message_reads`
- actualiza `last_read_message_id`

## 12. Alternativas discutibles

### WebSockets vs SSE

Recomendación:

- SSE ahora

Alternativa:

- WebSocket si más adelante hay presencia, typing, múltiples paneles o push bidireccional complejo

### Participantes genéricos vs `users` estrictos

Recomendación:

- participantes con `actor_type + actor_ref` en la implementación inicial

Alternativa:

- forzar FK a `users`

Tradeoff:

- `users` es más limpio a largo plazo
- `actor_ref` permite convivir con el estado actual del producto sin refactor masivo

### Mensajería ligada siempre a contrato

Recomendación:

- soportar `GENERAL`, `PROPERTY` y `LEASE`

Alternativa:

- obligar siempre `LEASE`

Tradeoff:

- perderías avisos generales y conversaciones previas a firma

## 13. Evolución futura

- plantillas de mensajes
- respuestas rápidas
- automatizaciones por categoría y SLA
- clasificación automática con IA
- resumen automático de hilos
- traducción
- integración con tickets/incidencias
- portal del inquilino
- portal del propietario con inbox consolidado
- score de urgencia y detección de riesgo contractual
