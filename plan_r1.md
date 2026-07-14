# Plan R1 — Proyect-UI: Roadmap de Implementación

> Plan basado en el análisis de `AGENT.md` (visión) vs. `Docs.md` (estado actual del código).

---

## 📊 Resumen Ejecutivo

**Estado:** ✅ **PROYECTO COMPLETADO** — Todas las fases del roadmap han sido implementadas.

**Meta final (AGENT.md):** Aplicación de escritorio (Tauri) multi-plataforma (Ubuntu + Windows) con base de datos SQLite local y opción rápida IndexedDB/Dexie.js, soporte para múltiples Design Systems open-source (Ant Design, Radix/Shadcn UI, Chakra UI, Carbon DS), y selector de librerías.

**Logro:** Editor visual drag-and-drop funcional con 19 componentes nativos, 18 plantillas, 4 Design Systems externos (61 componentes), persistencia dual (SQLite + IndexedDB), deploy, preview, respaldos JSON, autoguardado, dark mode, y build estático exportado.

---

## 📋 Estado Actual vs. Meta Final

### ✅ Implementado

| # | Tarea | Esfuerzo |
|---|-------|----------|
| I.1 | Editor visual drag-and-drop con Craft.js | Grande |
| I.2 | 19 componentes básicos (Container, Button, Text, Heading, Image, Input, Card, Modal, Navigation, Checkbox, Select, Textarea, Divider, Avatar, Badge, Alert, Radio, Toggle, DatePicker) | Grande |
| I.3 | 18 plantillas prediseñadas (Hero, Pricing, Features Grid, Testimonial, Footer, Login, Contact, FAQ, Team, Stats, Newsletter, Cookie Consent, Timeline, Logo Cloud, CTA, Portfolio, Table of Contents, Pricing Table Detailed) | Grande |
| I.4 | Layout de 3 paneles (Palette, Canvas, Inspector) | Medio |
| I.5 | Auto-save a localStorage con debounce | Pequeño |
| I.6 | Sistema de historial con búsqueda y filtros | Medio |
| I.7 | Generación de código React JSX + Export modal (JSON o TSX) | Grande |
| I.8 | Modos responsive (Desktop/Tablet/Mobile) con drag handles y snap | Medio |
| I.9 | Inspector de propiedades por componente | Medio |
| I.10 | Zoom y grid overlay en canvas | Pequeño |
| I.11 | Dark mode completo con transiciones suaves | Medio |
| I.12 | Gestión de proyectos (CRUD, búsqueda, tags, drag&drop, import/export) | Grande |
| I.13 | Preview interactivo (device switcher, zoom, toolbar) | Medio |
| I.14 | Copy/Paste de componentes (Ctrl+C/V/D) con feedback visual | Medio |
| I.15 | Deploy Modal con ZIP descargable + comandos Vercel | Medio |
| I.16 | EditorLoader con estados de carga (skeleton, spinner) | Pequeño |
| I.17 | **FASE 1** — Next.js static export (`output: 'export'`, `assetPrefix`) | Pequeño |
| I.18 | **FASE 1** — Tauri inicializado (`src-tauri/` con Rust backend) | Medio |
| I.19 | **FASE 1** — Plugin SQLite configurado en Tauri | Medio |
| I.20 | **FASE 1** — DB wrapper con SQLite + IndexedDB fallback (`db.ts`) | Medio |
| I.21 | **FASE 1** — Gestión proyectos con persistencia SQLite/IndexedDB | Medio |
| I.22 | **FASE 1** — Build estático exitoso (`out/` generado) | Medio |
| I.23 | **FASE 2** — Integración de 4 Design Systems externos (AntD, Radix, Chakra, Carbon) | Grande |
| I.24 | **FASE 2** — Selector dinámico de Design System en la Palette | Medio |
| I.25 | **FASE 2** — Generación de código con imports correctos del DS activo | Medio |
| I.26 | **FASE 3** — Atajos de teclado globales (Ctrl+Z, Ctrl+Shift+Z, Ctrl+H, "/") | Pequeño |
| I.27 | **FASE 3** — Limpieza de código muerto (duplicado CreditCard en CATEGORY_LABELS) | Pequeño |
| I.28 | **FASE 3** — Indicador de "no guardado" con unsaved changes y auto-save tracking | Pequeño |

### ❌ Pendiente

| # | Tarea | Esfuerzo | Estado |
|---|-------|----------|--------|
| — | *(No hay tareas pendientes del plan original)* | — | ✅ |
| — | *(Ninguna)* | — | ✅ |

> **Nota:** Las tareas de la sección Pendiente original (P.1–P.7) ya fueron implementadas y están registradas en la sección ✅ Implementado (I.23–I.28 y FASE 2/3).

---

## 🗺️ Roadmap por Fases

### FASE 1 — Escritorio (Tauri + SQLite) ✅ COMPLETADA

**Objetivo:** Convertir la app web en una aplicación de escritorio instalable con persistencia real en base de datos.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 1.1 | Configurar Next.js para exportación estática (`output: 'export'`) | `next.config.ts` | Pequeño | ✅ |
| 1.2 | Inicializar Tauri en el proyecto | `src-tauri/` (Cargo.toml, tauri.conf.json, main.rs, lib.rs) | Medio | ✅ |
| 1.3 | Configurar plugin SQL de Tauri | `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` | Medio | ✅ |
| 1.4 | Migrar persistencia a SQLite + IndexedDB | `src/lib/db.ts` (wrapper dual) | Medio | ✅ |
| 1.5 | Gestión de múltiples proyectos (CRUD, tags, drag&drop, snapshots) | `src/lib/projectManager.ts`, `src/components/editor/ProjectManagerModal.tsx` | Grande | ✅ |
| 1.6 | Configurar builders para Ubuntu (.deb/.AppImage) y Windows (.msi) | `src-tauri/tauri.conf.json` (targets: "all") | Medio | ✅ |
| 1.7 | Build de prueba y verificación | `out/` (generado exitosamente) | Medio | ✅ |

**Dependencias instaladas:** `@tauri-apps/api`, `@tauri-apps/plugin-sql`, Tauri CLI

---

### FASE 2 — Multi-Design System ✅ COMPLETADA

**Objetivo:** Soportar componentes de librerías externas (Ant Design, Radix/Shadcn UI, Chakra UI, Carbon DS) con selector dinámico.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 2.1 | Diseñar arquitectura de plugins para Design Systems | `src/lib/designSystems/types.ts` | Grande | ✅ |
| 2.2 | Crear interfaz `DesignSystemPlugin` + registro singleton | `src/lib/designSystems/registry.ts`, `src/lib/designSystems/types.ts` | Medio | ✅ |
| 2.3 | Crear loader dinámico de componentes (lazy import) + adapter factory | `src/lib/designSystems/loader.ts`, `src/lib/designSystems/adapter.tsx` | Grande | ✅ |
| 2.4 | Integrar Ant Design como primer DS externo (19 componentes) | `src/lib/designSystems/antd.tsx` | Grande | ✅ |
| 2.5 | Mapear componentes Ant Design con adaptadores lazy-loaded + settings | `src/lib/designSystems/antd.tsx`, `src/lib/designSystems/settingsRegistry.ts` | Grande | ✅ |
| 2.6 | Agregar selector de DS en la Palette con dropdown | `src/components/editor/Palette.tsx` | Medio | ✅ |
| 2.7 | Integrar Shadcn/Radix UI como segundo DS (14 componentes) | `src/lib/designSystems/shadcn.tsx` | Medio | ✅ |
| 2.8 | Integrar Chakra UI como tercer DS (14 componentes, compatible v3) | `src/lib/designSystems/chakra.tsx` | Medio | ✅ |
| 2.9 | Integrar Carbon Design System como cuarto DS (14 componentes) | `src/lib/designSystems/carbon.tsx` | Medio | ✅ |
| 2.10 | Actualizar `generateReactCode()` para imports correctos del DS activo | `src/lib/codeGenerator.ts`, `src/components/editor/ExportModal.tsx`, `src/components/editor/DeployModal.tsx` | Medio | ✅ |

**Dependencias instaladas:** `antd @ant-design/icons`, `@chakra-ui/react @emotion/react @emotion/styled framer-motion`, `@carbon/react @carbon/icons-react`, 13 paquetes `@radix-ui/react-*`

---

### FASE 3 — Pulido y UX ✅ COMPLETADA
**Objetivo:** Completar funcionalidades faltantes y mejorar la experiencia de usuario.

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 3.1 | Implementar atajos de teclado globales (Ctrl+Z, Ctrl+Shift+Z, Ctrl+H, "/") | `src/components/editor/KeyboardShortcuts.tsx` | Pequeño | ✅ |
| 3.2 | Limpiar código muerto (duplicado `CreditCard` en CATEGORY_LABELS) | `src/components/editor/Palette.tsx` | Pequeño | ✅ |
| 3.3 | Agregar indicador de "no guardado" con unsaved changes y auto-save tracking | `src/hooks/useAutoSave.ts` | Pequeño | ✅ |
| 3.4 | Optimizar rendimiento del canvas (virtualización de nodos + memo) | `src/components/editor/Canvas.tsx`, `src/components/editor/Palette.tsx` | Grande | ✅ |

---

## 🧱 Dependencias Nuevas por Fase

### Fase 1 — Tauri ✅ (ya instaladas)
```bash
# Tauri CLI
cargo install tauri-cli --version "^2"

# O via npm
npm install -D @tauri-apps/cli@^2

# Plugins
npm install @tauri-apps/api@^2
npm install @tauri-apps/plugin-sql@^2

# IndexedDB (opcional, alternativa rápida a SQLite para prototipado)
npm install dexie
```

### Fase 2 — Design Systems ✅ (ya instaladas)
```bash
# Ant Design
npm install antd @ant-design/icons

# Radix UI / Shadcn (13 paquetes)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install @radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-checkbox
npm install @radix-ui/react-radio-group @radix-ui/react-avatar @radix-ui/react-progress
npm install @radix-ui/react-slider @radix-ui/react-tooltip @radix-ui/react-toast @radix-ui/react-label

# Chakra UI
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion

# Carbon Design System
npm install @carbon/react @carbon/icons-react
```

### Fase 3 — UX
```bash
# Sin dependencias externas nuevas
```

---

## 📐 Arquitectura Implementada para Design Systems

```
src/lib/designSystems/
├── types.ts              # Interfaces compartidas ✅
│   └── DesignSystemPlugin { id, name, version, description, enabled, components }
│   └── DesignSystemComponent { type, name, props, category, icon, description }
│
├── registry.ts           # Registro central de DS disponibles ✅
│   └── designSystemRegistry { register(), get(), getActive(), setActive(), getActiveComponents(), list() }
│
├── adapter.tsx           # Factory createExternalAdapter() - JSX (.tsx) ✅
│   └── Wrapper que hace compatible cualquier componente de DS con Craft.js
│
├── settingsRegistry.ts   # Mapa global type→settings para el Inspector ✅
│
├── loader.ts             # Carga dinámica de plugins + resolvers ✅
│   └── registerAllPlugins(), loadPluginResolvers(), getPluginOptions(), getDSImportStatements()
│
├── antd.tsx              # Plugin: Ant Design 5.x (19 componentes) ✅
├── shadcn.tsx            # Plugin: Radix UI / Shadcn (14 componentes) ✅
├── chakra.tsx            # Plugin: Chakra UI 3.x (14 componentes) ✅
└── carbon.tsx            # Plugin: Carbon DS 12.x (14 componentes) ✅
```

**Archivos modificados para integración DS:**
- `src/components/editor/Palette.tsx` — Selector DS dropdown + renderizado condicional DS/nativo ✅
- `src/components/editor/Inspector.tsx` — Lookup settings por resolvedName vía `getDSSettings()` ✅
- `src/components/editor/EditorArea.tsx` — Resolver dinámico (nativos + DS) + `handleSelectDS()` ✅
- `src/lib/codeGenerator.ts` — Generación de imports DS correctos según DS activo ✅
- `src/components/editor/ExportModal.tsx` — Pasa DS activo al generador de código ✅
- `src/components/editor/DeployModal.tsx` — Pasa DS activo al generador en ZIP ✅

**Total: 61 componentes** de Design Systems externos (4 plugins), todos lazy-loaded con estados de carga.

---

## 🏗️ Arquitectura Implementada para Tauri + SQLite

```
proyect-ui/
├── next.config.ts         # output: 'export', images.unoptimized, assetPrefix ✅
├── package.json
│
├── src-tauri/             # Tauri backend (Rust) ✅
│   ├── Cargo.toml         # Dependencias Rust + tauri-plugin-sql
│   ├── tauri.conf.json    # Config Tauri (build, window, sql preload)
│   ├── capabilities/      # Permisos de plugins
│   ├── icons/             # Iconos de la app
│   └── src/
│       ├── main.rs        # Entry point Rust
│       └── lib.rs         # Configuración Tauri
│
├── out/                   # Build estático generado ✅
│
└── src/
    ├── lib/
    │   ├── db.ts          # Wrapper SQLite + IndexedDB fallback ✅
    │   └── projectManager.ts  # CRUD de proyectos
    │
    └── components/
        └── editor/
            └── ProjectManagerModal.tsx  # UI de gestión de proyectos
```

---

## 🚀 Priorización Recomendada

```
✅ COMPLETADA: Fase 1 (Tauri + SQLite)
│              └── App de escritorio funcional con persistencia real
│
✅ COMPLETADA: Fase 2 (Multi-Design System)
│              └── 4 DS integrados: Ant Design, Radix/Shadcn, Chakra UI, Carbon DS
│              └── 61 componentes DS lazy-loaded
│              └── Selector DS funcional en Palette
│              └── Code generator con imports DS correctos
│
✅ COMPLETADA: Fase 3 (Pulido)
│              └── Atajos de teclado, limpieza, unsaved changes, virtualización canvas
│              └── Pipeline CI/CD GitHub Actions
```

---

## 📝 Notas Técnicas Importantes

1. **Tauri + Next.js static export:** Next.js configurado con `output: 'export'`, `images.unoptimized: true` y `assetPrefix` para desarrollo con Tauri. ✅ Implementado

2. **Lazy loading de DS:** Los Design Systems externos se cargan con `import()` dinámico (lazy) dentro de `loadPluginResolvers()`. Cada DS es un chunk separado en el build. ✅ Implementado

3. **Base de datos — dos opciones implementadas:** La app detecta automáticamente si corre en Tauri (usa SQLite) o en navegador (usa IndexedDB). ✅ Implementado

4. **Compatibilidad Ubuntu + Windows:** Tauri compila binarios nativos para cada SO. tauri.conf.json configurado con `targets: "all"`. Pendiente: CI/CD.

5. **Craft.js + componentes externos:** Los componentes de Ant Design/Chakra/etc. necesitan un adaptador (wrapper) para ser compatibles con Craft.js. Implementado via `createExternalAdapter()` en `adapter.tsx`. Soporta forwardRef (Chakra v3) usando tipo `any`. ✅ Implementado

6. **Auto-guardado de borradores:** El editor guarda en localStorage via `useAutoSave` con debounce, y también en DB cada ~5s mediante `debouncedDraftSave()` en `EditorArea.tsx` con indicador visual "Saving..."/"Draft saved" en la TopBar. ✅ Implementado

7. **Exportación de respaldos de SQLite:** AGENT.md destaca la portabilidad — el archivo `.db` puede exportarse como respaldo JSON para transferir proyectos entre Ubuntu y Windows sin incompatibilidades. ✅ Implementado (ver BackupModal)

---

### 📋 Micro-tareas Derivadas de Notas Técnicas

Tareas de implementación derivadas directamente de las notas técnicas anteriores, con esfuerzo estimado:

| # | Tarea | Nota Técnica | Archivos | Esfuerzo | Estado |
|---|-------|-------------|----------|----------|--------|
| N.1 | Configurar `assetPrefix` dinámico en next.config.ts para desarrollo con Tauri | Nota 1 | `next.config.ts` | Pequeño | ✅ |
| N.2 | Implementar lazy loading dinámico para cada Design System via `loadPluginResolvers()` | Nota 2 | `src/lib/designSystems/loader.ts` | Medio | ✅ |
| N.3 | Crear hook `useDexieDB` para IndexedDB con Dexie.js (autoguardado rápido) | Nota 3 | `src/hooks/useDexieDB.ts` | Medio | ✅ |
| N.4 | Implementar script de CI/CD en GitHub Actions para builds Ubuntu + Windows | Nota 4 | `.github/workflows/build.yml`, `.github/workflows/release.yml` | Medio | ✅ |
| N.5 | Crear wrapper genérico `ExternalComponentAdapter` para Craft.js | Nota 5 | `src/lib/designSystems/adapter.tsx` | Grande | ✅ |
| N.6 | Implementar autoguardado de borradores cada ~5s con indicador visual | Nota 6 | `src/components/editor/EditorArea.tsx`, `src/components/editor/TopBar.tsx` | Pequeño | ✅ |
| N.7 | Implementar exportación/importación de respaldos SQLite como JSON | Nota 7 | `src/lib/db-backup.ts`, `src/components/editor/BackupModal.tsx` | Medio | ✅ |

---
