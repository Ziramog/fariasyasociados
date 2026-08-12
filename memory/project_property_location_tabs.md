---
name: PropertyLocationTabs component
description: Tabbed map and Street View component for property detail page
type: project
---

## PropertyLocationTabs component

New component at `components/PropertyLocationTabs.jsx`. Client component with two tabs:
- **Mapa** tab: Mapbox map with marker, uses `react-map-gl`
- **Street View** tab: Google Maps embed iframe

Geocoding:
- Cities in Córdoba province are hardcoded in `knownCities` object (Alta Gracia, Córdoba, Villa Carlos Paz, etc.)
- Falls back to Nominatim (OpenStreetMap) for unknown addresses
- Sticky loading spinner while coords resolve

**Why:** Provides both map and street-level view of property location.
**How to apply:** Embedded in `PropertyDetails.jsx` under the "Ubicación" section.
