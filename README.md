# 🎨 Proyect-UI

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" alt="Version 0.1.0" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Passing" />
  <img src="https://img.shields.io/badge/platform-Web%20%7C%20Desktop-8A2BE2?style=flat-square" alt="Platform: Web & Desktop" />
  <img src="https://img.shields.io/badge/license-Private-red?style=flat-square" alt="License: Private" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Tauri-2-FFC131?style=flat-square&logo=tauri" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" />
</p>

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Tauri 2  
**Plataforma:** Web (IndexedDB) / Desktop (Tauri + SQLite)  
**Licencia:** Privado

---

> Editor visual drag-and-drop para maquetar interfaces con componentes de múltiples Design Systems open-source. Arrastra, configura y exporta código React listo para producción.

---

## ✨ Funcionalidades

### 🖱️ Editor Visual

- **Drag & Drop** con Craft.js — arrastra componentes al lienzo, reordena, anida
- **Layout de 3 paneles:** Palette (izquierda), Canvas (centro), Inspector (derecha)
- **19 componentes nativos:** Container, Button, Text, Heading, Image, Input, Card, Modal, Navigation, Checkbox, Select, Textarea, Divider, Avatar, Badge, Alert, Radio, Toggle, DatePicker
- **16 plantillas prediseñadas:** Hero, Pricing, Features Grid, Testimonial, Footer, Login, Contact, FAQ, Team, Stats, Newsletter, Cookie Consent, Timeline, Logo Cloud, CTA, Portfolio
- **Modos responsive:** Desktop / Tablet / Mobile con drag handles y snap
- **Zoom y grid overlay** en el canvas
- **Copy/Paste/Duplicate** de componentes (Ctrl+C / Ctrl+V / Ctrl+D) con feedback visual toast

### 🎯 Design Systems Multiples

- **Selector dinámico** de Design System en la Palette
- **4 plugins integrados** con 61 componentes en total:
  - **Ant Design 5.x** — 19 componentes
  - **Radix UI / Shadcn** — 14 componentes
  - **Chakra UI 3.x** — 14 componentes
  - **Carbon DS 12.x** — 14 componentes
- **Lazy loading** — cada DS se carga bajo demanda (chunks separados)
- **Código generado** con imports correctos del DS activo

### 💾 Persistencia

- **Auto-save** a localStorage con debounce (1s)
- **Auto-guardado de borradores** a DB cada 5s con indicador visual
- **Snapshots de historial** cada 10s
- **IndexedDB** via Dexie.js (modo navegador)
- **SQLite** via Tauri plugin (modo escritorio)
- **Export/Import** de respaldos completos como JSON

### 📦 Exportación y Deploy

- **Exportar código React** (JSX/TSX) con imports del DS activo
- **Deploy modal** — ZIP descargable con package.json + instrucciones Vercel
- **Preview interactivo** con device switcher, zoom y toolbar

### 🎛️ UX

- **Dark mode** completo con transiciones suaves
- **Historial** de cambios con búsqueda y filtros
- **Gestión de proyectos** (CRUD, búsqueda, tags, drag & drop, import/export)
- **Atajos de teclado:** Ctrl+Z (undo), Ctrl+Shift+Z (redo), Ctrl+H (historial), `/` (buscar)
- **Indicador de "no guardado"** con estado ámbar pulsante
- **EditorLoader** con skeleton y spinner
- **Virtualización de canvas** con CSS containment + React.memo

---

## 🏗️ Arquitectura

```
proyect-ui/
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout + ThemeProvider
│   │   ├── page.tsx            # Página principal del editor
│   │   └── globals.css         # Estilos globales + Tailwind
│   │
│   ├── components/
│   │   ├── editor/             # Editor core
│   │   │   ├── Canvas.tsx      # Lienzo de Craft.js
│   │   │   ├── Palette.tsx     # Selector DS + componentes disponibles
│   │   │   ├── Inspector.tsx   # Panel de propiedades
│   │   │   ├── EditorArea.tsx  # Layout principal del editor
│   │   │   ├── TopBar.tsx      # Toolbar superior
│   │   │   ├── ExportModal.tsx # Modal de exportación de código
│   │   │   ├── PreviewModal.tsx# Preview interactivo
│   │   │   ├── DeployModal.tsx # Deploy con ZIP
│   │   │   ├── BackupModal.tsx # Respaldos JSON
│   │   │   ├── EditorLoader.tsx# Estados de carga
│   │   │   ├── ClipboardToast.tsx # Feedback visual copy/paste
│   │   │   ├── KeyboardShortcuts.tsx # Atajos de teclado
│   │   │   ├── HistoryTimeline.tsx # Historial de cambios
│   │   │   ├── ProjectManagerModal.tsx # Gestión de proyectos
│   │   │   ├── nodes/          # Componentes nativos (19)
│   │   │   └── templates/      # Plantillas (16)
│   │   ├── ui/                 # Componentes UI reutilizables
│   │   └── ThemeProvider.tsx   # Provider de tema oscuro
│   │
│   ├── hooks/
│   │   ├── useAutoSave.ts      # Auto-save con debounce
│   │   ├── useClipboard.ts     # Copy/paste de nodos
│   │   ├── useDexieDB.ts       # Hook React para Dexie.js
│   │   └── useHistoryTracker.ts# Historial de cambios
│   │
│   └── lib/
│       ├── db.ts               # Wrapper DB (SQLite / IndexedDB)
│       ├── projectManager.ts   # CRUD de proyectos
│       ├── codeGenerator.ts    # Generación de código React
│       ├── db-backup.ts        # Export/import de respaldos JSON
│       ├── dexie-db.ts         # Implementación Dexie.js
│       └── designSystems/      # Plugins de Design Systems
│           ├── types.ts        # Interfaces compartidas
│           ├── registry.ts     # Registro central de DS
│           ├── adapter.tsx     # Factory de wrappers Craft.js
│           ├── loader.ts       # Carga dinámica de plugins
│           ├── settingsRegistry.ts # Settings para Inspector
│           ├── antd.tsx         # Plugin Ant Design
│           ├── shadcn.tsx       # Plugin Radix/Shadcn
│           ├── chakra.tsx       # Plugin Chakra UI
│           └── carbon.tsx       # Plugin Carbon DS
│
├── src-tauri/                  # Backend Tauri (Rust)
│   ├── Cargo.toml              # Dependencias Rust
│   ├── tauri.conf.json         # Configuración Tauri
│   ├── capabilities/           # Permisos de plugins
│   ├── icons/                  # Iconos de la app
│   └── src/                    # Código Rust
│       ├── main.rs
│       └── lib.rs
│
├── .github/workflows/          # CI/CD pipeline
├── plan_r1.md                  # Roadmap detallado
├── AGENT.md                    # Documento de visión
└── package.json                # Dependencias
```

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 15 (App Router, static export) |
| **UI** | React 19 + Tailwind CSS 4 |
| **Editor visual** | Craft.js |
| **Design Systems** | Ant Design, Radix UI, Chakra UI, Carbon DS |
| **Base de datos (web)** | Dexie.js (IndexedDB) |
| **Base de datos (desktop)** | SQLite via Tauri plugin |
| **Escritorio** | Tauri 2 (Rust) |
| **Lenguaje** | TypeScript 5 |
| **Animaciones** | Framer Motion |
| **Íconos** | Lucide React + íconos de cada DS |

---

## 📦 Dependencias Principales

### Core
```bash
next@^15, react@^19, @craftjs/core@^0.2, typescript@^5
```

### Design Systems (4 plugins, ~61 componentes)
```bash
antd @ant-design/icons                            # Ant Design
@radix-ui/react-* (13 paquetes)                   # Radix UI / Shadcn
@chakra-ui/react @emotion/react @emotion/styled   # Chakra UI
@carbon/react @carbon/icons-react                 # Carbon DS
```

### Persistencia
```bash
dexie@^4                                           # IndexedDB (web)
@tauri-apps/plugin-sql@^2                          # SQLite (desktop)
```

### Build & Deploy
```bash
jszip                                              # ZIP descargable
class-variance-authority clsx tailwind-merge        # Utilidades CSS
```

---

## 🛠️ Getting Started

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
# → Abre http://localhost:3000

# 3. Build de producción
npm run build

# 4. Servir build estático
npx serve out
```

### Build Tauri (Escritorio)

```bash
# Requiere Rust instalado
# https://tauri.app/start/prerequisites/

npm install -D @tauri-apps/cli@^2

# Build para Linux (.deb / .AppImage)
npm run tauri build

# Build para Windows (.msi / .exe) — ejecutar en Windows
npm run tauri build
```

---

## 🎯 Estado del Proyecto

```
✅ FASE 1 — Tauri + SQLite (Escritorio)          Completada
✅ FASE 2 — Multi-Design System                  Completada
✅ FASE 3 — Pulido y UX                          Completada
✅ Micro-tareas (N.1–N.7)                        Completadas (7/7)
✅ N.4 — CI/CD script (GitHub Actions)           Completada
```

### 📋 Resumen de Implementación

| Categoría | Tareas | Estado |
|-----------|--------|--------|
| Editor visual + 19 componentes nativos | 12 | ✅ |
| 16 plantillas prediseñadas | 1 | ✅ |
| Multi-Design System (4 plugins, 61 comps.) | 10 | ✅ |
| Tauri + SQLite (escritorio) | 7 | ✅ |
| Pulido UX (atajos, virtualización, etc.) | 4 | ✅ |
| Micro-tareas (backup, autoguardado, etc.) | 6 | ✅ |
| CI/CD pipeline (GitHub Actions + Tauri builds) | 1 | ✅ |

Ver `plan_r1.md` para el detalle completo.

---

## 🧩 Design Systems Integrados

| DS | Componentes | Estado | Carga |
|---|:-----------:|:------:|:-----:|
| **Ant Design** | 19 | ✅ Integrado | Lazy |
| **Radix UI / Shadcn** | 14 | ✅ Integrado | Lazy |
| **Chakra UI** | 14 | ✅ Integrado | Lazy |
| **Carbon DS (IBM)** | 14 | ✅ Integrado | Lazy |
| **Nativos** | 19 | ✅ Siempre disponibles | Eager |

---

## 📐 Decisiones Técnicas

### Persistencia Dual
La app detecta automáticamente si corre en Tauri (SQLite) o navegador (IndexedDB via Dexie.js). Esto permite desarrollo rápido en web y despliegue nativo en escritorio sin cambios de código.

### Lazy Loading de Design Systems
Cada plugin de DS es un chunk separado que se carga con `import()` dinámico. La app arranca solo con los componentes nativos; al seleccionar un DS, se descargan sus adaptadores bajo demanda.

### Exportación de Código
El generador de código (`codeGenerator.ts`) produce componentes React funcionales con los imports correctos del DS activo. Soporta generar JSX y TSX.

### Compatibilidad Multiplataforma
Tauri compila binarios nativos para cada SO desde el mismo código base. La base de datos SQLite se almacena automáticamente en los directorios de datos estándar de cada sistema.

---

## 📋 Changelog

### v0.1.0 (Julio 2026) — Release Inicial

#### 🖱️ Editor Visual (FASE 1)
- Drag & drop con Craft.js — layout de 3 paneles (Palette, Canvas, Inspector)
- 19 componentes nativos: Container, Button, Text, Heading, Image, Input, Card, Modal, Navigation, Checkbox, Select, Textarea, Divider, Avatar, Badge, Alert, Radio, Toggle, DatePicker
- 18 plantillas prediseñadas (Hero, Pricing, Features Grid, Testimonial, Footer, Login, Contact, FAQ, Team, Stats, Newsletter, Cookie Consent, Timeline, Logo Cloud, CTA, Portfolio, Table of Contents, Pricing Table Detailed)
- Modos responsive (Desktop / Tablet / Mobile) con drag handles y snap
- Zoom, grid overlay, dark mode
- Inspector de propiedades por componente
- Copy/Paste/Duplicate (Ctrl+C/V/D) con feedback visual toast

#### 🎯 Multi-Design System (FASE 2)
- Arquitectura de plugins: `types.ts`, `registry.ts`, `adapter.tsx`, `loader.ts`, `settingsRegistry.ts`
- **Ant Design 5.x** — 19 componentes lazy-loaded
- **Radix UI / Shadcn** — 14 componentes lazy-loaded
- **Chakra UI 3.x** — 14 componentes lazy-loaded
- **Carbon DS (IBM) 12.x** — 14 componentes lazy-loaded
- Selector dinámico de DS en la Palette con dropdown
- Generación de código con imports correctos del DS activo

#### 💾 Persistencia
- Wrapper dual SQLite (Tauri) / IndexedDB (navegador) via `db.ts`
- Dexie.js para IndexedDB con hook `useDexieDB`
- Auto-save a localStorage con debounce (1s)
- Auto-guardado de borradores a DB cada 5s con indicador visual
- Snapshots de historial cada 10s con `useHistoryTracker`
- Export/Import de respaldos completos como JSON (`BackupModal`)

#### 📦 Exportación y Deploy
- Generación de código React (JSX/TSX) con `codeGenerator.ts`
- Export modal con vista previa del código
- Deploy modal con ZIP descargable + instrucciones Vercel
- Preview interactivo con device switcher, zoom y toolbar

#### 🎛️ UX y Pulido (FASE 3)
- Atajos de teclado: Ctrl+Z, Ctrl+Shift+Z, Ctrl+H, `/`
- Gestión de proyectos (CRUD, búsqueda, tags, drag & drop, snapshots)
- Indicador de "no guardado" con estado ámbar pulsante
- Virtualización de canvas con CSS containment + React.memo
- EditorLoader con skeleton y spinner
- Limpieza de código muerto

#### 🔧 CI/CD y Escritorio (N.4)
- Tauri v2 scaffold completo (Rust + SQLite plugin)
- GitHub Actions: builds automáticos para Ubuntu (.deb/.AppImage) y Windows (.msi)
- Release workflow: GitHub Releases con artifacts al pushear tag `v*`
- Caching de Rust + npm para builds rápidos

---

## 📄 Licencia

Privado — Proyecto interno de maquetación visual.

---

> Documentación generada el Julio 2026. Ver `plan_r1.md` para el roadmap completo y `AGENT.md` para la visión del proyecto.
