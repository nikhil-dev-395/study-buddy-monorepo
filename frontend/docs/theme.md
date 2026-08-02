# Design System

## 1. Color Palette (Dark & High Contrast)

### Base Background
- Deep black and dark zinc neutrals for a premium dark interface.
- **Tailwind:** `bg-black`, `bg-zinc-900`

### Borders & Separators
- Low-contrast dark gray borders create depth without harsh visual lines.
- **Tailwind:** `border-zinc-800/80`, `border-zinc-700/50`

### Typography
- **Primary Headings:** Crisp white for maximum readability.
  - `text-zinc-100`
- **Body Text:** Medium gray for comfortable reading.
  - `text-zinc-300`
- **Metadata & Labels:** Muted gray to reduce visual hierarchy.
  - `text-zinc-400`, `text-zinc-500`

### Primary Accent
- Emerald green communicates activity, success, and positive actions.
- Used for:
  - Active status indicators
  - Subject tags
  - Primary CTA buttons
- **Tailwind:** `emerald-500`, `emerald-400`

---

## 2. Glassmorphism & Elevation

### Translucent Surfaces
Cards use semi-transparent dark backgrounds combined with backdrop blur to create a modern frosted-glass appearance.

- **Tailwind:**
  - `bg-zinc-900/70`
  - `backdrop-blur-md`

### Soft Shadows
Muted ambient shadows provide subtle elevation while preserving the dark aesthetic.

- **Tailwind:**
  - `shadow-lg`
  - `shadow-zinc-900/50`

---

## 3. Geometry & Micro-Interactions

### Rounded Geometry
Large border radii create a friendly, modern, and mobile-first visual language.

- **Tailwind:**
  - `rounded-2xl`
  - `rounded-full`

### Interactive Feedback
Interactive components respond with subtle animations for a tactile experience.

- Border highlight on hover
- Gentle glow transitions
- Slight press-down scaling on click

**Tailwind:**
- `hover:border-zinc-700`
- `active:scale-95`

### Micro Badges
Compact pill-shaped badges and monospace ID chips improve scanability for technical information.

- **Tailwind:**
  - `font-mono`
  - `text-[10px]`
  - `rounded-full`
