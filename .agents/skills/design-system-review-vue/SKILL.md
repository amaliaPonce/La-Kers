---
name: design-system-review-vue
description: Revisión de design system/UI consistency para frontend Vue (componentes, tokens, estados, a11y, responsive). Usar cuando se pida design system review, UI audit, accesibilidad o coherencia visual.
license: MIT
metadata:
  upstream_sources:
    - "carmahhawwari/ui-design-brain (principios y anti-patterns generales)"
---

# Design System Review (Vue)

## Objetivo

Elevar consistencia visual y de interacción en un SaaS: tokens claros, componentes reutilizables, estados completos, y accesibilidad práctica.

## Alcance

- Componentes UI base: botones, inputs, selects, modales, tablas, banners, toasts.
- Patrones de layout: páginas de auth, dashboard, formularios, empty states.
- Estados: loading, disabled, error, success, empty, permission denied.

## Checklist de revisión

### 1) Tokens y consistencia

- Definir/confirmar un set de tokens (aunque sea implícito):
  - spacing scale, typography scale, radius, shadows, colors (semantic).
- Evitar “valores mágicos” repetidos: consolidar en variables/clases utilitarias.

### 2) Componentización (Vue)

- Identificar duplicación en:
  - botones primarios/secundarios, inputs, cards, secciones.
- Promover componentes base con API estable (props coherentes).

### 3) Estados y feedback

- Formularios:
  - errores inline por campo + error resumen si aplica.
  - estados de submit: loading/disabled, prevención de doble submit.
- Acciones destructivas:
  - confirmación, undo si aplica, mensajes claros.

### 4) Accesibilidad (mínimo SaaS)

- Focus visible consistente.
- Labels asociados a inputs; mensajes de error accesibles.
- Keyboard nav en menús/modales; focus trap en modal.
- Contraste mínimo y tamaños táctiles razonables.

### 5) Responsive y densidad

- Revisar breakpoints:
  - navegación, tablas (stack/collapse), formularios largos.
- Evitar overflow horizontal en mobile.

## Salida requerida

- Lista priorizada de mejoras:
  - **Quick wins** (1–2 archivos, alto impacto).
  - **Refactors** (crear 1–3 componentes base).
  - **Deuda** (tokens/temas, documentación).
- Señalar inconsistencias con ejemplos concretos (pantalla/componente).

