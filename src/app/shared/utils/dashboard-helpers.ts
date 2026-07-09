import * as L from 'leaflet';

/**
 * Initializes Leaflet marker default icons to prevent broken images.
 */
export function initLeafletMarkerIcon(): void {
  L.Marker.prototype.options.icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

/**
 * Loads province boundaries GeoJSON, draws them on the map, adds custom tooltips,
 * and sets up click handlers.
 */
export function loadProvinceGeoJson(
  map: L.Map,
  onProvinceClick: (latlng: L.LatLng, provinceName: string) => void,
): void {
  fetch('sausapnhap_tinhthanh_xuattu_gisvn_dungdehienhinhanh.geojson')
    .then((res) => res.json())
    .then((data) => {
      L.geoJSON(data, {
        style: {
          color: '#3b82f6',
          weight: 1.5,
          fillOpacity: 0.05,
        },
        onEachFeature: (feature, layer: L.Layer) => {
          const provinceName = (feature.properties ? feature.properties.ten_tinh : null) as string;
          if (provinceName) {
            const overrides: Record<string, [number, number]> = {
              'Quảng Ninh': [21.03, 107.28],
              'TP. Hồ Chí Minh': [10.8, 106.65],
              'An Giang': [10.52, 105.12],
              'Cà Mau': [9.18, 105.15],
            };

            if (overrides[provinceName]) {
              let bestPos = (layer as any).getBounds().getCenter();

              if (feature.geometry.type === 'MultiPolygon') {
                const parts = (layer as any).getLatLngs() as any[][][];
                let maxArea = -1;

                parts.forEach((part) => {
                  const partBounds = L.latLngBounds(part[0]);
                  const area =
                    Math.abs(partBounds.getNorth() - partBounds.getSouth()) *
                    Math.abs(partBounds.getEast() - partBounds.getWest());

                  if (area > maxArea) {
                    maxArea = area;
                    bestPos = partBounds.getCenter();
                  }
                });
              }

              let circleMarker = L.circleMarker(bestPos, {
                radius: 0,
                opacity: 0,
                fillOpacity: 0,
                interactive: false,
              });
              circleMarker
                .bindTooltip(provinceName, {
                  permanent: true,
                  direction: 'center',
                  className: 'vietnam-province-label',
                })
                .addTo(map);
            } else if ((layer as any).getBounds) {
              layer.bindTooltip(provinceName, {
                permanent: true,
                direction: 'center',
                className: 'vietnam-province-label',
              });
            }
          }

          layer.on('click', (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);
            onProvinceClick(e.latlng, provinceName);
          });
        },
      }).addTo(map);
    });
}

/**
 * Format selectedRefDate as yyyy-MM-dd (specifically yyyy-MM-01) for the API
 */
export function formatRefDate(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

/**
 * Only allow months that exist in availableRefDates
 */
export function isRefDateAvailable(
  date: Date | null | undefined,
  availableRefDates: Date[],
): boolean {
  if (!date) return false;
  return availableRefDates.some(
    (d) => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth(),
  );
}
