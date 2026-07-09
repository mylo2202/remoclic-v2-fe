import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import * as L from 'leaflet';
import 'leaflet.vectorgrid';
import { Chart, registerables } from 'chart.js';
import { MonthPickerHeaderComponent } from '../shared/components/month-picker-header/month-picker-header.component';
import { VI_MONTH_DATE_FORMATS, ViDateAdapter } from '../shared/adapters/vi-date.adapter';
import { PrT2DashboardConfig } from '../models/pr-t2-dashboard-config.model';
import { PR_T2_PRECIPITATION_DASHBOARD_CONFIG } from '../constants/pr-t2-precipitation-dashboard.config';

Chart.register(...registerables);

@Component({
  selector: 'pr-t2-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: ViDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: VI_MONTH_DATE_FORMATS },
  ],
  templateUrl: './pr-t2-dashboard.component.html',
  styleUrl: './pr-t2-dashboard.component.css',
})
export class PrT2Dashboard implements AfterViewInit {
  // defaults to precipitation
  @Input() config: PrT2DashboardConfig = PR_T2_PRECIPITATION_DASHBOARD_CONFIG;

  private map: L.Map | undefined;
  private selectedMarker: L.Marker | undefined;


  /** Unique ID for the canvas element — prevents DOM conflicts when both routes are cached */
  readonly canvasId = `forecastChart-${Math.random().toString(36).slice(2)}`;
  readonly mapId = `vietnamMap-${Math.random().toString(36).slice(2)}`;

  selectedLocation: { lat: number; lng: number } | null = null;
  selectedProvinceName: string | null = null;
  mouseLocation: { lat: number; lng: number } | null = null;
  isMouseOnMap: boolean = false;
  currentZoom: number = 6;
  selectedVariable: number = 1;

  availableRefDates: Date[] = []; // parsed Date objects from API
  selectedRefDate: Date | null = null; // currently selected month
  refDateControl = new FormControl<Date | null>(null);
  isLoadingRefDates: boolean = false;

  /** Reference to the custom header — passed to [calendarHeaderComponent] */
  readonly monthPickerHeader = MonthPickerHeaderComponent;

  /** Only allow months that exist in availableRefDates */
  refDateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    return this.availableRefDates.some(
      (d) => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth(),
    );
  };

  isLoadingForecast: boolean = false;
  private forecastChart: Chart | undefined;
  private lastForecastResponse: any = null;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly injector: Injector,
  ) { }

  ngAfterViewInit() {
    this.initMap();
    this.loadRefDates();
  }

  private loadRefDates(): void {
    if (!this.config.fetchRefDates) {
      this.isLoadingRefDates = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoadingRefDates = true;
    this.config.fetchRefDates(this.injector).subscribe({
      next: (res) => {
        // API returns strings like '2026-05-01'
        this.availableRefDates = res
          .map((date) => new Date(date))
          .filter((date) => !Number.isNaN(date.getTime()));
        // Pre-select the first (latest) available date
        if (this.availableRefDates.length > 0) {
          this.selectedRefDate = this.availableRefDates[0];
          this.refDateControl.setValue(this.selectedRefDate);
        }
        this.isLoadingRefDates = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching ref dates:', err);
        this.isLoadingRefDates = false;
        this.cdr.detectChanges();
      },
    });
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
    this.map = L.map(this.mapId, {
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
      this.isMouseOnMap = true;
      this.cdr.detectChanges();
    });

    this.map.on('mouseout', () => {
      this.isMouseOnMap = false;
      this.cdr.detectChanges();
    });

    this.map.on('zoomend moveend', () => {
      this.currentZoom = this.map!.getZoom();
      console.log('Current Zoom Level:', this.currentZoom);
      this.cdr.detectChanges();
    });
  }

  private updateSelection(latlng: L.LatLng, provinceName: string | null = null): void {
    if (!provinceName) {
      return;
    }

    this.selectedLocation = { lat: latlng.lat, lng: latlng.lng };
    this.selectedProvinceName = provinceName;

    if (this.selectedMarker) {
      this.selectedMarker.setLatLng(latlng);
    } else {
      this.selectedMarker = L.marker(latlng).addTo(this.map!);
    }

    // Trigger Angular change detection manually because Leaflet runs outside Angular's Zone.
    this.cdr.detectChanges();

    // Fetch forecast data whenever selection changes
    this.fetchForecastData(latlng.lat, latlng.lng);
  }

  onVariableRadioChange(value: number): void {
    this.selectedVariable = value;
    if (this.lastForecastResponse) {
      const chartData = this.config.transformData(this.lastForecastResponse, this.selectedVariable);
      this.updateChart(chartData);
    }
  }

  /** Called when user picks a month in the datepicker popup */
  onMonthSelected(date: Date, picker: any): void {
    this.selectedRefDate = date;
    this.refDateControl.setValue(date);
    picker.close();
    if (this.selectedLocation) {
      this.fetchForecastData(this.selectedLocation.lat, this.selectedLocation.lng);
    }
  }

  /** Format selectedRefDate as yyyy-MM-dd for the API */
  private get selectedRefDateForApi(): string | undefined {
    if (!this.selectedRefDate) return undefined;
    const y = this.selectedRefDate.getFullYear();
    const m = String(this.selectedRefDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  }

  private fetchForecastData(lat: number, lng: number): void {
    this.isLoadingForecast = true;
    this.cdr.detectChanges();

    this.config
      .fetchData(this.injector, lat, lng, this.selectedRefDateForApi)
      .subscribe({
        next: (response) => {
          this.lastForecastResponse = response;
          const chartData = this.config.transformData(response, this.selectedVariable);
          this.updateChart(chartData);
          this.isLoadingForecast = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching forecast data:', err);
          this.isLoadingForecast = false;
          this.cdr.detectChanges();
        },
      });
  }


  private updateChart(data: any): void {
    const ctx = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!ctx) return;

    const datasetLabel = data.datasets?.[0]?.label || this.config.yAxisTitle;

    if (this.forecastChart) {
      this.forecastChart.data.labels = data.labels;
      this.forecastChart.data.datasets = data.datasets;
      const yScale = this.forecastChart.options.scales?.['y'] as any;
      if (yScale?.title) {
        yScale.title.text = datasetLabel;
      }
      this.forecastChart.update();
    } else {
      this.forecastChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += this.config.valueFormatter(context.parsed.y);
                  }
                  return label;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: this.config.yAxisMax,
              min: this.config.yAxisMin,
              title: {
                display: true,
                text: datasetLabel,
              },
            },
            x: {
              title: {
                display: true,
                text: 'Dự báo cho 6 tháng tới',
              },
            },
          },
        },
      });
    }
  }
}
