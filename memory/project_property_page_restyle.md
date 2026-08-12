---
name: Property detail page restyle
description: Updated property detail page layout with gallery, sticky sidebar, and new card styling
type: project
---

## Property detail page restyle

Changes to `app/properties/[id]/page.jsx`:
- Removed `PropertyHeaderImage` and `PropertyImages`, added `PropertyGallery`
- Page background changed to warm off-white `bg-[#E8E6E0]`
- New layout: full-width gallery at top, then content grid (lg:col-span-[1fr_380px])
- Sidebar is sticky (`lg:sticky lg:top-24 lg:self-start`)
- Back button repositioned inside content area with updated styling

Changes to `components/PropertyDetails.jsx`:
- Cards restyled: `rounded-2xl`, `border border-[var(--color-border)]`, `shadow-[0_2px_8px_rgba(0,0,0,0.06)]`
- Replaced older `rounded-lg shadow-md` pattern

**Why:** Modernized the property detail view with cleaner cards and cohesive gallery.
**How to apply:** These are the current active styles on the property detail page.
