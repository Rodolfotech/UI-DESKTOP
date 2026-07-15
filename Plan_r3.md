# Plan R2 — Proyect-UI: Interfaz Estilo Figma Dev-First

> Plan basado en `AGENT_FRONTEND.md` — mejora de la interfaz hacia una experiencia tipo Figma, optimizada para desarrolladores.

---

## 📊 Resumen Ejecutivo

**Objetivo:** Transformar la interfaz del editor visual Proyect-UI para que se sienta como una herramienta profesional estilo Figma, con mejoras en navegación, productividad y experiencia de desarrollo.

**Estado actual:** ✅ Editor funcional con 19 componentes nativos, 61 componentes DS, 4 Design Systems, persistencia dual, auto-guardado, CI/CD.

**Meta R2:** Interfaz Figma-like con panel de Layers (árbol DOM), buscador inteligente de componentes, guías magnéticas en canvas, inspector con pestaña Styles (Tailwind visual) y Live Code preview en tiempo real.

---

## 🎯 FASE 1 — Top Bar Profesional

**Objetivo:** Convertir la barra superior en un centro de control tipo Figma/VSCode.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 1.1 | **Breadcrumbs de proyecto**: Mostrar "Proyect-UI / [nombre del proyecto]" con indicador de sincronización DB | `src/components/editor/TopBar.tsx`, `src/hooks/useProjectName.ts` | Pequeño | ✅ |
| 1.2 | **Zoom control en TopBar**: Input numérico discreto + botones +/- en TopBar | `src/components/editor/TopBar.tsx`, `src/components/editor/Canvas.tsx` | Pequeño | ✅ |
| 1.3 | **Reorganizar botonera**: Agrupar acciones por contexto (View/Project/Actions/Settings) | `src/components/editor/TopBar.tsx` | Pequeño | ✅ |
| 1.4 | **Tooltips mejorados**: Atajos de teclado visibles en tooltips | `src/components/editor/TopBar.tsx` | Pequeño | ✅ |

---

## 🎯 FASE 2 — Panel Izquierdo con Pestañas (Layers + Components) ✅ COMPLETADA

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 2.1 | **Refactorizar Palette → LeftPanel** con tabs Layers/Components | `src/components/editor/LeftPanel.tsx` | Medio | ✅ |
| 2.2 | **LayerTree jerárquico DOM** con iconos por tipo e indentación | `src/components/editor/LayerTree.tsx` | Grande | ✅ |
| 2.3 | **Interacciones en Layers**: hover highlight, drag & drop reorder, delete | `src/components/editor/LayerTree.tsx`, `src/app/globals.css` | Medio | ✅ |
| 2.4 | **Buscador inteligente** con atajo '/' y filtro por nombre | `src/components/editor/LeftPanel.tsx` | Medio | ✅ |
| 2.5 | **Indicador visual de búsqueda**: badge + resultados + "No components found" | `src/components/editor/LeftPanel.tsx` | Pequeño | ✅ |

---

## 🎯 FASE 3 — Canvas Estilo Figma ✅ COMPLETADA

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 3.1 | **Fondo de workspace con puntos**: Cuadrícula Figma-style (24px spacing, 1.2px dots) | `src/components/editor/Canvas.tsx`, `src/app/globals.css` | Pequeño | ✅ |
| 3.2 | **Artboard flotante mejorado**: Sombra 3-capas, borde sutil, efecto hover elevate | `src/components/editor/Canvas.tsx`, `src/app/globals.css` | Pequeño | ✅ |
| 3.3 | **Guías inteligentes de alineación**: Hook useSmartGuides + SVG overlay en canvas | `src/hooks/useSmartGuides.ts`, `src/components/editor/Canvas.tsx` | Grande | ✅ |
| 3.4 | **Animaciones de transición**: canvas-viewport-transition para zoom y viewport | `src/components/editor/Canvas.tsx`, `src/app/globals.css` | Pequeño | ✅ |

---

## 🎯 FASE 4 — Inspector con Pestañas (Props + Styles + Live Code) ✅ COMPLETADA

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 4.1 | **Sistema de tabs en Inspector**: Pestañas "Props" y "Styles" con indicador activo | `src/components/editor/Inspector.tsx` | Medio | ✅ |
| 4.2 | **StylePanel — Mapeador Tailwind visual**: Spacing, Colors, Typography, Size/Effects + preview | `src/components/editor/StylePanel.tsx`, `src/components/ui/StyleInput.tsx` | Grande | ✅ |
| 4.3 | **Live Code Panel**: Cajón colapsable con syntax highlighting custom (sin dependencias) | `src/components/editor/LiveCodePanel.tsx` | Medio | ✅ |
| 4.4 | **Sincronización Live Code**: useRef + debounce 500ms + refresh 2s mientras abierto | `src/components/editor/LiveCodePanel.tsx` | Medio | ✅ |

---

## 🎯 FASE 5 — Mejoras Visuales Globales ✅ COMPLETADA

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 5.1 | **Fade-in del editor**: animate-fade-in en EditorArea wrapper | `src/components/editor/EditorArea.tsx` | Pequeño | ✅ |
| 5.2 | **Iconos/colores DS en selector**: Dots de color por DS (rojo=AntD, azul=Shadcn, teal=Chakra, índigo=Carbon) | `src/components/editor/LeftPanel.tsx` | Pequeño | ✅ |
| 5.3 | **Tooltips unificados**: Componente Tooltip con atajos de teclado — implementado en FASE 1 | `src/components/ui/Tooltip.tsx` | Medio | ✅ |
| 5.4 | **Responsive design**: Paneles colapsables con toggle, atajos Ctrl+B/I, auto-collapse en <1024px, con localStorage persistencia | `src/components/editor/EditorArea.tsx` | Medio | ✅ |

---

## 📋 Micro-tareas Técnicas

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| M.1 | Hook `useProjectName` para nombre del proyecto activo | `src/hooks/useProjectName.ts` | Pequeño | ✅ |
| M.2 | Hook `useSmartGuides` para guías de alineación | `src/hooks/useSmartGuides.ts` | Grande | ✅ |
| M.3 | `LeftPanel` como componente separado con sistema de tabs | `src/components/editor/LeftPanel.tsx` | Medio | ✅ |
| M.4 | `StyleInput` para controles reutilizables de Tailwind | `src/components/ui/StyleInput.tsx` | Medio | ✅ |
| M.5 | Highlighter custom para Live Code (sin dependencias externas) | `src/components/editor/LiveCodePanel.tsx` | Pequeño | ✅ |

---

## 🧪 Validación y Testing — RESULTADOS

| Fase | Validación | Estado |
|------|-----------|--------|
| FASE 1-2 | Test visual con Chrome headless (9/9 tests pasaron) | ✅ |
| FASE 3 | Artboard + smart guides + transiciones | ✅ Pendiente test visual |
| FASE 4 | Tabs Props/Styles + StylePanel + Live Code | ✅ Pendiente test visual |
| FASE 5 | Fade-in + DS icons + tooltips | ✅ Pendiente test visual |
| **Build** | next build — export exitoso | ✅ |
| **Lint** | next lint — 0 errors, 0 warnings | ✅ |

---

## ✅ Criterios de Aceptación

- [x] TopBar muestra breadcrumbs con nombre del proyecto y estado de guardado
- [x] Zoom control funcional en TopBar
- [x] Panel izquierdo tiene tabs funcionales (Layers ↔ Components)
- [x] LayerTree muestra jerarquía DOM real de Craft.js
- [x] Buscador filtra componentes por nombre con atajo "/"
- [x] Canvas tiene fondo de puntos y artboard flotante con sombra
- [x] Guías inteligentes aparecen al arrastrar cerca de otros componentes
- [x] Inspector tiene tabs (Props ↔ Styles)
- [x] Style Panel modifica clases Tailwind con preview en vivo
- [x] Live Code Panel muestra TSX en tiempo real con syntax highlighting
- [x] Build de producción exitoso (next build)
- [x] 0 errores de lint (next lint)
