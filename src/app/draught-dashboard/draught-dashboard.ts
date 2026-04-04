import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.vectorgrid';

@Component({
  selector: 'draught-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './draught-dashboard.html',
  styleUrl: './draught-dashboard.css',
})
export class DraughtDashboard implements AfterViewInit {
  private map: L.Map | undefined;
  private selectedMarker: L.Marker | undefined;

  selectedLocation: { lat: number; lng: number } | null = null;
  selectedProvinceName: string | null = null;
  mouseLocation: { lat: number; lng: number } | null = null;
  currentZoom: number = 6;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Initialize map centered roughly on Vietnam
    this.map = L.map('vietnamMap', {
      minZoom: 5,
      maxZoom: 9,
    }).setView([16, 112], 5);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ).addTo(this.map);

    // Fetch local GeoJSON
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
            // Display province labels
            const provinceName = (
              feature.properties ? feature.properties.ten_tinh : null
            ) as string;
            if (provinceName) {
              const overrides: Record<string, [number, number]> = {
                'Quảng Ninh': [21.03, 107.28],
                'TP. Hồ Chí Minh': [10.8, 106.65],
                'An Giang': [10.52, 105.12],
                'Cà Mau': [9.18, 105.15],
              };

              if (overrides[provinceName]) {
                // Targeted Bounding Box Logic for MultiPolygons
                let bestPos = (layer as any).getBounds().getCenter();

                if (feature.geometry.type === 'MultiPolygon') {
                  const parts = (layer as any).getLatLngs() as any[][][];
                  let maxArea = -1;

                  parts.forEach((part) => {
                    // Get bounds of just this specific landmass (part[0] is the outer ring)
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
                  .addTo(this.map!);
              } else if ((layer as any).getBounds) {
                // For everyone else, maintain the standard Leaflet centering
                layer.bindTooltip(provinceName, {
                  permanent: true,
                  direction: 'center',
                  className: 'vietnam-province-label',
                });
              }
            }

            layer.on('click', (e: L.LeafletMouseEvent) => {
              // Prevent map click from firing
              L.DomEvent.stopPropagation(e);
              this.updateSelection(e.latlng, provinceName);
            });
          },
        }).addTo(this.map!);
      });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.updateSelection(e.latlng);
    });

    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      this.mouseLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
      this.cdr.detectChanges();
    });

    this.map.on('mouseout', () => {
      this.mouseLocation = null;
      this.cdr.detectChanges();
    });

    this.map.on('zoomend moveend', () => {
      this.currentZoom = this.map!.getZoom();
      console.log('Current Zoom Level:', this.currentZoom);
      this.cdr.detectChanges();
    });
  }

  private updateSelection(latlng: L.LatLng, provinceName: string | null = null): void {
    this.selectedLocation = { lat: latlng.lat, lng: latlng.lng };
    this.selectedProvinceName = provinceName;

    if (this.selectedMarker) {
      this.selectedMarker.setLatLng(latlng);
    } else {
      this.selectedMarker = L.marker(latlng).addTo(this.map!);
    }

    // Trigger Angular change detection manually because Leaflet runs outside Angular's Zone.
    this.cdr.detectChanges();
  }
}
