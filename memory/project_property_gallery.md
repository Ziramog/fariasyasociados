---
name: PropertyGallery component
description: Full-width image gallery with photoswipe lightbox on property detail page
type: project
---

## PropertyGallery component

New component at `components/PropertyGallery.jsx`. Uses `react-photoswipe-gallery` for lightbox.
- Full-width dark background section with max-w-[1400px] container
- Main image with 16:9 / 21:9 aspect ratio, rounded-2xl
- Expand icon overlay on hover
- Image counter badge (e.g. "1 / 5")
- Thumbnail strip below — click to change active image and open lightbox
- Active thumbnail has brand ring highlight
- Dark theme (#1C1C1A background)

**Why:** Replaced older `PropertyHeaderImage` + `PropertyImages` pattern with single cohesive gallery.
**How to apply:** Used on `app/properties/[id]/page.jsx` as main visual element.
