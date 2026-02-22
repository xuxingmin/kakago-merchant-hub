

# Plan: Refactor Raw Materials to Grid Card Layout

## Goal
Change the raw materials ("原材料") section to use the same grid card UI style as the packaging materials ("包材") section -- small cards in a 3-column grid with name, status badge, value, and progress bar.

## Changes

### File: `src/pages/InventoryPage.tsx`

Replace the current raw materials list layout (divider-separated rows) with:

- Wrap in a `Card` with `glass-card p-3` (same as packaging section)
- Use `grid grid-cols-3 gap-1.5` layout
- Each item rendered as a small card (`p-1.5 rounded bg-secondary/30`) containing:
  - Top row: item name (10px) + status badge (outline, colored border/text)
  - Value row: current (bold) / max + unit
  - Thin progress bar at bottom (color-coded by status)
- Remove the icon display since the grid cards don't use icons (matching the packaging style)

This makes both sections visually identical in structure, just with different data.

