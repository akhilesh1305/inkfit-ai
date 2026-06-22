# Custom Cursor Debug Guide

This document explains what was broken in the InkFit AI Cosmos cursor, how it was fixed, and how to troubleshoot future issues.

## What Was Broken

### Root cause: React mount race (critical)

The cursor used a **conditional render + single `useEffect` init** pattern that guaranteed failure:

1. First render: `active === false` → component returned `null` → **no cursor DOM existed**
2. `useEffect` ran: called `setActive(true)` **and** added `cosmos-cursor-active` to `<html>` (hiding the native cursor)
3. Same effect tried to read `rootRef` / `canvasRef` → **both were `null`** because JSX had not mounted yet
4. Effect returned early — **no `mousemove` listeners, no `requestAnimationFrame` loop**
5. Re-render mounted the cursor DOM, but the effect **did not re-run** (deps were only `[reducedMotion]`)
6. **Result:** native cursor hidden, custom cursor never tracked the mouse → **invisible cursor**

### Secondary issues

| Issue | Impact |
|-------|--------|
| `document` `mouseleave` set `opacity: 0` | Cursor could stay hidden after leaving/re-entering the window |
| `cursor: none` applied before successful init | If init failed, users had no visible cursor at all |
| Touch detection too aggressive (`maxTouchPoints > 0`) | Disabled cursor on touchscreen laptops that use a mouse |
| z-index `99998` / `99999` | Could sit behind high z-index modals |
| No fallback path | Init failures left the app with no cursor |
| No debug logging | Hard to diagnose in production |

## How It Was Fixed

### 1. Two-phase initialization

```
pending → ready → active
         ↓
      fallback (native cursor restored)
```

- **Phase 1:** Detect touch devices; set `mode = "ready"` and **always render** the cursor layer (refs attach to DOM).
- **Phase 2:** `useEffect` depends on `[mode, reducedMotion]`. When `mode === "ready"`, refs exist → engine initializes → `mode = "active"`.
- `cosmos-cursor-active` is added **only after** successful init (refs + canvas context).

### 2. Portal to `document.body`

The cursor is rendered with `createPortal(..., document.body)` so it escapes nested stacking contexts and stays on top of page content.

### 3. Fallback mode

If refs or canvas context are missing:

- `cosmos-cursor-active` is **not** left applied
- `cosmos-cursor-fallback` is added
- Component unmounts the custom layer
- Native browser cursor is restored

### 4. CSS hardening

- Layer z-index: **999999**
- Explicit `opacity: 1`, `visibility: visible` on layer and orb
- `pointer-events: none` on layer and root
- `transform: translate(-50%, -50%)` on `.cosmos-cursor-body` for centering
- Mobile: `@media (hover: none), (pointer: coarse)` hides the layer

### 5. Touch detection

Uses **primary touch** only:

```ts
matchMedia("(hover: none)").matches && matchMedia("(pointer: coarse)").matches
```

Touchscreen laptops with a mouse still get the custom cursor.

### 6. `prefers-reduced-motion`

- Disables canvas particles, orbit animations, and Framer Motion loops
- Orb still follows the mouse (LERP uses faster factor)
- `cosmos-cursor-reduced` class reduces glow intensity

### 7. Debug logging

Logs are prefixed with `[InkFit Cursor]` and enabled when:

- `NODE_ENV === "development"`, or
- `NEXT_PUBLIC_DEBUG_CURSOR=true` in `.env.local`

**Always logged (even in production):** fallback errors via `cursorError`.

## Console messages to expect

| Message | Meaning |
|---------|---------|
| `Component mounted (client)` | React client hydration complete |
| `Environment OK — rendering cursor layer` | Not a primary touch device |
| `Cursor engine initialized` | Refs + canvas OK, native cursor hidden |
| `First mouse position applied` | Mouse tracking started |
| `Mouse position update` (×3) | Position events flowing |
| `Cursor rendered successfully` | rAF loop running, orb visible |
| `Falling back to native cursor` | Init failed — check `reason` in log |

## How to troubleshoot

### Cursor still invisible

1. Open DevTools → Console. Filter by `InkFit Cursor`.
2. Check `<html>` classes:
   - `cosmos-cursor-active` → custom cursor should show
   - `cosmos-cursor-fallback` → init failed; native cursor should show
   - Neither → touch mode or component not mounted
3. Inspect DOM: search for `.cosmos-cursor-layer` on `body`.
4. Verify `.cosmos-orb` computed styles: `opacity` should be `1`, not `0`.
5. Confirm `layout.tsx` includes `<InkCursor />`.

### Native cursor hidden but no custom orb

This was the original bug. If it recurs:

- Ensure `cosmos-cursor-active` is **not** added before refs exist
- Ensure init `useEffect` re-runs when DOM mounts (depends on `mode === "ready"`)

### Cursor behind modals

- Layer must use `z-index: 999999` and portal to `body`
- Check if a parent creates a stacking context with higher effective z-index

### Cursor disabled on laptop

- Old bug: `navigator.maxTouchPoints > 0` disabled cursor
- Fixed: only `(hover: none) and (pointer: coarse)` disables

### Performance / jank

- Canvas orbiters run only when `prefers-reduced-motion` is off
- rAF loop is cancelled on unmount
- `mousemove` uses `{ passive: true }`

## Key files

| File | Role |
|------|------|
| `src/components/cursor/InkCursor.tsx` | Main cursor component + engine |
| `src/components/cursor/cosmos-cursor.css` | Styles, z-index, mobile rules |
| `src/lib/cursor/cursor-env.ts` | Touch/motion detection, HTML class helpers |
| `src/lib/cursor/cursor-debug.ts` | Console logging utilities |
| `src/app/layout.tsx` | Mounts `<InkCursor />` globally |

## Enable verbose logging in production

Add to Vercel env or `.env.local`:

```
NEXT_PUBLIC_DEBUG_CURSOR=true
```

Redeploy, open the site, move the mouse, and verify the log sequence above.

## Quick manual test checklist

- [ ] Desktop: custom orb follows mouse smoothly
- [ ] Hover button: orb scales up, label may appear
- [ ] Click: burst particles (if motion not reduced)
- [ ] Open modal: cursor still visible on top
- [ ] Phone/tablet: native cursor, no custom layer
- [ ] `prefers-reduced-motion: reduce`: orb visible, minimal animation
- [ ] Break init (disable JS canvas): fallback restores native cursor
