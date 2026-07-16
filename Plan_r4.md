# Plan R4 — Proyect-UI: Madurez, Testing y Productividad

> Plan integral que consolida el trabajo completado (Plan R2) y define las próximas mejoras hacia un editor profesional con testing, desktop release, UX avanzada y nuevas capacidades.

---

## 📊 Resumen Ejecutivo

**Base completada (Plan R2):** ✅ 22/22 tareas, 5/5 FASEs, 5/5 micro-tareas  
**Meta R4:** Testing automatizado, desktop release estable, mejoras de productividad, multi-página, temas y plugin system.

---

# ✅ COMPLETADO — Plan R2

> Estas FASEs fueron implementadas y validadas en el Plan R2. Se incluyen aquí como línea base del proyecto.

---

## 🎯 FASE R2.1 — Top Bar Profesional ✅

**Objetivo:** Convertir la barra superior en un centro de control tipo Figma/VSCode.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 1.1 | **Breadcrumbs de proyecto**: Mostrar "Proyect-UI / [nombre del proyecto]" con indicador de sincronización DB | `src/components/editor/TopBar.tsx`, `src/hooks/useProjectName.ts` | Pequeño | ✅ |
| 1.2 | **Zoom control en TopBar**: Input numérico discreto + botones +/- en TopBar | `src/components/editor/TopBar.tsx`, `src/components/editor/Canvas.tsx` | Pequeño | ✅ |
| 1.3 | **Reorganizar botonera**: Agrupar acciones por contexto (View/Project/Actions/Settings) | `src/components/editor/TopBar.tsx` | Pequeño | ✅ |
| 1.4 | **Tooltips mejorados**: Atajos de teclado visibles en tooltips | `src/components/editor/TopBar.tsx` | Pequeño | ✅ |

---

## 🎯 FASE R2.2 — Panel Izquierdo con Pestañas (Layers + Components) ✅

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 2.1 | **Refactorizar Palette → LeftPanel** con tabs Layers/Components | `src/components/editor/LeftPanel.tsx` | Medio | ✅ |
| 2.2 | **LayerTree jerárquico DOM** con iconos por tipo e indentación | `src/components/editor/LayerTree.tsx` | Grande | ✅ |
| 2.3 | **Interacciones en Layers**: hover highlight, drag & drop reorder, delete | `src/components/editor/LayerTree.tsx`, `src/app/globals.css` | Medio | ✅ |
| 2.4 | **Buscador inteligente** con atajo '/' y filtro por nombre | `src/components/editor/LeftPanel.tsx` | Medio | ✅ |
| 2.5 | **Indicador visual de búsqueda**: badge + resultados + "No components found" | `src/components/editor/LeftPanel.tsx` | Pequeño | ✅ |

---

## 🎯 FASE R2.3 — Canvas Estilo Figma ✅

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 3.1 | **Dot grid Figma-style**: Cuadrícula (24px spacing, 1.2px dots) | `Canvas.tsx`, `globals.css` | Pequeño | ✅ |
| 3.2 | **Artboard flotante**: Sombra 3-capas, borde sutil, hover elevate | `Canvas.tsx`, `globals.css` | Pequeño | ✅ |
| 3.3 | **Guías inteligentes**: Hook useSmartGuides + SVG overlay | `useSmartGuides.ts`, `Canvas.tsx` | Grande | ✅ |
| 3.4 | **Transiciones zoom/viewport**: canvas-viewport-transition | `Canvas.tsx`, `globals.css` | Pequeño | ✅ |

---

## 🎯 FASE R2.4 — Inspector con Pestañas (Props + Styles + Live Code) ✅

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 4.1 | **Tabs Props/Styles** en Inspector con indicador activo | `Inspector.tsx` | Medio | ✅ |
| 4.2 | **StylePanel Tailwind visual**: Spacing, Colors, Typography, Size/Effects | `StylePanel.tsx`, `StyleInput.tsx` | Grande | ✅ |
| 4.3 | **Live Code Panel**: Cajón colapsable con syntax highlighting custom | `LiveCodePanel.tsx` | Medio | ✅ |
| 4.4 | **Sincronización Live Code**: useRef + debounce 500ms + refresh 2s | `LiveCodePanel.tsx` | Medio | ✅ |

---

## 🎯 FASE R2.5 — Mejoras Visuales Globales ✅

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 5.1 | **Fade-in del editor**: animate-fade-in en EditorArea | `EditorArea.tsx` | Pequeño | ✅ |
| 5.2 | **Colores DS en selector**: rojo=AntD, azul=Shadcn, teal=Chakra, índigo=Carbon | `LeftPanel.tsx` | Pequeño | ✅ |
| 5.3 | **Tooltips unificados** con atajos de teclado | `Tooltip.tsx` | Medio | ✅ |
| 5.4 | **Paneles colapsables responsive**: Ctrl+B/I, auto-collapse <1024px, localStorage | `EditorArea.tsx` | Medio | ✅ |

---

### 📋 Micro-tareas Técnicas (Completadas)

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| M.1 | Hook `useProjectName` | `src/hooks/useProjectName.ts` | Pequeño | ✅ |
| M.2 | Hook `useSmartGuides` | `src/hooks/useSmartGuides.ts` | Grande | ✅ |
| M.3 | `LeftPanel` con sistema de tabs | `src/components/editor/LeftPanel.tsx` | Medio | ✅ |
| M.4 | `StyleInput` reutilizable | `src/components/ui/StyleInput.tsx` | Medio | ✅ |
| M.5 | Highlighter custom Live Code | `src/components/editor/LiveCodePanel.tsx` | Pequeño | ✅ |

---

### 🧪 Validación Plan R2

| Check | Resultado |
|-------|-----------|
| Test visual FASE 1-2 | ✅ 9/9 tests |
| Test visual FASE 3-5 | ✅ 8/8 tests |
| `next build` | ✅ Export exitoso |
| `next lint` | ✅ 0 errors, 0 warnings |

---

# 🆕 NUEVO — Plan R4

---

## 🎯 FASE R4.1 — Testing y Calidad de Código

**Objetivo:** Agregar cobertura de tests unitarios, de integración y visuales para garantizar estabilidad.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 1.1 | **Configurar infraestructura de testing**: Jest + React Testing Library + Playwright | `jest.config.js`, `jest.setup.ts`, `package.json` | Medio | ✅ |
| 1.2 | **Unit tests para hooks**: useProjectName, useSmartGuides, useClipboard, useDexieDB | `src/hooks/__tests__/*.test.ts` | Medio | ✅ |
| 1.3 | **Unit tests para utilidades**: codeGenerator, db-backup, projectManager, utils | `src/lib/__tests__/*.test.ts` | Medio | ⬜ |
| 1.4 | **Component tests para UI**: Tooltip, StyleInput, LayerTree, LeftPanel | `src/components/**/__tests__/*.test.tsx` | Grande | ⬜ |
| 1.5 | **Integration tests para editor**: drag & drop, DS selector, export code, backup flow | `e2e/editor.spec.ts` | Grande | ⬜ |
| 1.6 | **Visual regression tests**: Playwright screenshot diff | `e2e/visual.spec.ts` | Medio | ⬜ |
| 1.7 | **Configurar CI para tests**: GitHub Actions ejecuta tests en cada PR | `.github/workflows/test.yml` | Pequeño | ⬜ |

---

## 🎯 FASE R4.2 — Desktop Release (Tauri)

**Objetivo:** Solucionar el build de Tauri y publicar releases para Linux y Windows.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 2.1 | **Actualizar Rust toolchain** a 1.88+ para compatibilidad con dependencias | `rust-toolchain.toml` | Pequeño | ✅ |
| 2.2 | **Pin de versiones compatibles** con `cargo update` para dependencias problemáticas | `src-tauri/Cargo.toml`, `Cargo.lock` | Medio | ✅ |
| 2.3 | **Auto-updater Tauri**: Configurar plugin de actualizaciones automáticas | `src-tauri/tauri.conf.json`, `src/hooks/useUpdateChecker.ts` | Grande | ✅ |
| 2.4 | **Optimizar bundle size**: Tree-shaking, compresión, lazy loading agresivo | `src/app/layout.tsx`, `next.config.ts` | Medio | ⬜ |
| 2.5 | **Menú de aplicación**: File, Edit, View, Help con atajos nativos | `src-tauri/src/lib.rs`, `src/hooks/useTauriMenu.ts` | Medio | ⬜ |
| 2.6 | **Probar build en Ubuntu** (.deb/.AppImage) y publicar release | GitHub Actions + Release workflow | Medio | ✅ |

---

## 🎯 FASE R4.3 — Multi-Página y Navegación

**Objetivo:** Permitir crear múltiples páginas/screens dentro de un proyecto con navegación entre ellas.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 3.1 | **PagesManager**: Panel lateral para crear/renombrar/eliminar páginas | `src/components/editor/PagesManager.tsx`, `src/hooks/usePages.ts` | Grande | ⬜ |
| 3.2 | **Router interno del proyecto**: Switchear entre páginas sin recargar | `src/lib/pageRouter.ts`, `src/components/editor/EditorArea.tsx` | Medio | ⬜ |
| 3.3 | **Page settings**: Meta tags, viewport, background por página | `src/components/editor/PageSettings.tsx`, `src/lib/pageStore.ts` | Medio | ⬜ |
| 3.4 | **Navegación en TopBar**: breadcrumbs con selector de páginas | `src/components/editor/TopBar.tsx` | Pequeño | ⬜ |
| 3.5 | **Duplicar/Exportar página individual** | `src/lib/codeGenerator.ts`, `src/components/editor/ExportModal.tsx` | Medio | ⬜ |

---

## 🎯 FASE R4.4 — Design Tokens y Editor de Temas

**Objetivo:** Permitir crear y aplicar temas personalizados que modifiquen colores, espaciados y tipografías de los componentes.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 4.1 | **ThemeProvider con CSS custom properties**: Sistema de tokens reactivo | `src/components/ThemeProvider.tsx`, `src/lib/themeStore.ts` | Medio | ⬜ |
| 4.2 | **ThemeEditor UI**: Panel visual para modificar colores, spacing, border-radius, fonts | `src/components/editor/ThemeEditor.tsx` | Grande | ⬜ |
| 4.3 | **Presets de temas**: Claro, oscuro, corporativo, minimalista | `src/lib/themePresets.ts` | Pequeño | ⬜ |
| 4.4 | **Exportar/Importar temas** como JSON independiente | `src/lib/themeBackup.ts` | Pequeño | ⬜ |
| 4.5 | **Aplicar tokens a DS externos**: Mapear tokens a AntD/Chakra/Carbon/Radix variables CSS | `src/lib/designSystems/themeAdapter.ts` | Grande | ⬜ |

---

## 🎯 FASE R4.5 — Productividad y UX Avanzada

**Objetivo:** Agregar herramientas de productividad tipo VSCode/Figma para flujo de trabajo más rápido.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 5.1 | **Command Palette** (Ctrl+Shift+P): Búsqueda y ejecución de comandos del editor | `src/components/editor/CommandPalette.tsx`, `src/lib/commandRegistry.ts` | Grande | ⬜ |
| 5.2 | **Atajos de teclado cheatsheet**: Modal con todos los shortcuts disponibles | `src/components/editor/ShortcutsModal.tsx` | Medio | ⬜ |
| 5.3 | **Drag desde sistema de archivos**: Arrastrar imágenes/SVG al canvas | `src/components/editor/Canvas.tsx`, `src/lib/fileDropHandler.ts` | Medio | ⬜ |
| 5.4 | **Auto-layout / Alignment tools**: Botones de alineación (left, center, right, distribute) | `src/components/editor/AlignmentBar.tsx`, `src/hooks/useAlignment.ts` | Medio | ⬜ |
| 5.5 | **Snap-to-grid mejorado**: Toggle grid snapping con configuración de spacing | `src/components/editor/Canvas.tsx`, `src/hooks/useSnapToGrid.ts` | Pequeño | ⬜ |
| 5.6 | **Zoom to fit / Zoom to selection** | `src/components/editor/Canvas.tsx` | Pequeño | ⬜ |
| 5.7 | **Component Groups / Folders** en LayerTree: Agrupar nodos lógicamente | `src/components/editor/LayerTree.tsx` | Medio | ⬜ |

---

## 🎯 FASE R4.6 — Biblioteca de Componentes y Plugins

**Objetivo:** Permitir guardar/importar componentes personalizados y extender el editor con plugins de terceros.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 6.1 | **User Component Library**: Guardar configuraciones de componentes como \"mis componentes\" | `src/lib/userComponents.ts`, `src/hooks/useUserComponents.ts` | Grande | ⬜ |
| 6.2 | **Plugin System API**: Interfaz estandarizada para plugins de terceros | `src/lib/pluginSystem.ts`, `src/types/plugin.ts` | Grande | ⬜ |
| 6.3 | **Component Marketplace**: Navegar y descargar componentes de la comunidad | `src/components/editor/Marketplace.tsx` | Extra Grande | ⬜ |
| 6.4 | **Exportar componente individual** como snippet reutilizable | `src/lib/codeGenerator.ts` | Pequeño | ⬜ |
| 6.5 | **Importar componentes desde URL/NPM**: Carga dinámica de paquetes externos | `src/lib/remoteComponentLoader.ts` | Extra Grande | ⬜ |

---

## 🎯 FASE R4.7 — Performance y DevOps

**Objetivo:** Optimizar rendimiento del editor y mejorar la infraestructura de CI/CD.

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 7.1 | **Bundle analysis**: Identificar y eliminar dependencias pesadas | `next.config.ts`, bundle-analyzer | Medio | ⬜ |
| 7.2 | **Code splitting avanzado**: Chunks por página, por DS, por feature | `src/app/page.tsx`, dynamic imports | Medio | ⬜ |
| 7.3 | **Image optimization**: next/image, lazy loading, WebP conversion | `src/components/editor/nodes/Image.tsx` | Pequeño | ⬜ |
| 7.4 | **Virtual scrolling en LayerTree** para proyectos grandes (+100 nodos) | `src/components/editor/LayerTree.tsx` | Medio | ⬜ |
| 7.5 | **PWA / Offline support**: Service worker para modo offline | `public/sw.js`, `next.config.ts` | Grande | ⬜ |
| 7.6 | **Dockerizar la app** para despliegues consistentes | `Dockerfile`, `docker-compose.yml` | Pequeño | ⬜ |
| 7.7 | **Monitoreo de errores**: Integrar Sentry o similar | `src/lib/monitoring.ts`, `src/app/error.tsx` | Medio | ⬜ |

---

## 📋 Micro-tareas Técnicas

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| M.1 | **Refactorizar db.ts** a capas: repository pattern | `src/lib/db/*.ts` | Medio | ⬜ |
| M.2 | **Crear Storybook** para componentes UI | `.storybook/`, `src/stories/` | Grande | ⬜ |
| M.3 | **i18n** con next-intl o similar | `src/i18n/`, `messages/` | Grande | ⬜ |
| M.4 | **Auditoría de accesibilidad** (WCAG 2.1 AA) | Varios componentes | Medio | ⬜ |
| M.5 | **Modo quiosco / presentación**: Fullscreen sin paneles | `src/components/editor/EditorArea.tsx` | Pequeño | ⬜ |

---

## 📊 Priorización Recomendada

| Prioridad | FASE | Justificación |
|-----------|------|--------------|
| 🔴 Alta | FASE R4.1 — Testing | Sin tests, no hay confianza en refactors futuros |
| 🔴 Alta | FASE R4.2 — Desktop Release | El build de Tauri está roto; necesidad principal |
| 🟡 Media | FASE R4.5 — Productividad | Impacto inmediato en experiencia de usuario |
| 🟡 Media | FASE R4.3 — Multi-Página | Feature muy solicitada en editores visuales |
| 🟢 Baja | FASE R4.4 — Temas | Depende de tener DS estables primero |
| 🟢 Baja | FASE R4.6 — Component Library | Feature avanzada, requiere madurez previa |
| 🟢 Baja | FASE R4.7 — Performance | Mejora continua, sin blocker crítico |

---

## 🧪 Criterios de Aceptación (Generales)

- [ ] `npm test` corre todos los tests y pasa ✅
- [ ] `npx tauri build` produce .deb/.AppImage funcionales
- [ ] Multi-página permite crear/navegar/exportar páginas
- [ ] Temas personalizados se aplican a todos los componentes
- [ ] Command Palette permite ejecutar acciones del editor
- [ ] Build de producción exitoso (next build)
- [ ] 0 errores de lint (next lint)
