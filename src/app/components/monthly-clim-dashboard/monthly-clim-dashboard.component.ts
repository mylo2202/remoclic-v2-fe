import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import * as L from 'leaflet';
import 'leaflet.vectorgrid';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MonthPickerHeaderComponent } from '../../shared/components/month-picker-header/month-picker-header.component';
import { VI_MONTH_DATE_FORMATS, ViDateAdapter } from '../../shared/adapters/vi-date.adapter';
import { MonthlyClimDashboardConfig } from '../../models/monthly-clim/monthly-clim-dashboard-config.model';
import { initLeafletMarkerIcon, loadProvinceGeoJson } from '../../shared/utils/dashboard-helpers';
import { MONTHLY_CLIM_OBSERVED_DASHBOARD_CONFIG } from '../../constants/monthly-clim/monthly-clim-observed-dashboard.config';
import { MONTHLY_CLIM_VARIABLES } from '../../constants/monthly-clim/monthly-clim-variables.constant';

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
  templateUrl: './monthly-clim-dashboard.component.html',
  styleUrl: './monthly-clim-dashboard.component.css',
})
export class MonthlyClimDashboard implements AfterViewInit {
  // defaults to temperature
  @Input() config: MonthlyClimDashboardConfig = MONTHLY_CLIM_OBSERVED_DASHBOARD_CONFIG;

  private map: L.Map | undefined;
  private selectedMarker: L.Marker | undefined;

  /** Unique ID for the canvas element — prevents DOM conflicts when both routes are cached */
  readonly canvasId = `climateChart-${Math.random().toString(36).slice(2)}`;
  readonly mapId = `vietnamMap-${Math.random().toString(36).slice(2)}`;
  readonly expandedCanvasId = `forecastChartExpanded-${Math.random().toString(36).slice(2)}`;

  selectedLocation: { lat: number; lng: number } | null = null;
  selectedProvinceName: string | null = null;
  mouseLocation: { lat: number; lng: number } | null = null;
  isMouseOnMap: boolean = false;
  currentZoom: number = 6;

  /** Reference to the custom header — passed to [calendarHeaderComponent] */
  readonly monthPickerHeader = MonthPickerHeaderComponent;

  protected readonly MONTHLY_CLIM_VARIABLES = MONTHLY_CLIM_VARIABLES;
  selectedVariable: string = MONTHLY_CLIM_VARIABLES.temperature;
  selectedLead: number = 1;
  readonly leadOptions: number[] = [1, 2, 3, 4, 5, 6];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly injector: Injector,
  ) {}

  isLoadingClimate: boolean = false;
  isChartExpanded: boolean = false;
  private climateChart: Chart | undefined;
  private lastClimateResponse: any = null;
  private expandedChart: Chart | undefined;
  private _escListener: ((e: KeyboardEvent) => void) | undefined;

  ngAfterViewInit() {
    this.initMap();
  }

  expandChart(): void {
    if (!this.climateChart) return;
    this.isChartExpanded = true;
    this.cdr.detectChanges();

    // Small delay to let Angular render the canvas in the DOM
    setTimeout(() => {
      const ctx = document.getElementById(this.expandedCanvasId) as HTMLCanvasElement;
      if (!ctx || !this.climateChart) return;

      const src = this.climateChart;
      this.expandedChart = new Chart(ctx, {
        type: (src.config as ChartConfiguration).type,
        data: JSON.parse(JSON.stringify(src.data)), // deep-copy data
        options: JSON.parse(JSON.stringify(src.options)), // deep-copy options
      });
    }, 50);

    // Close on ESC
    this._escListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.closeChart();
    };
    document.addEventListener('keydown', this._escListener);
  }

  closeChart(event?: MouseEvent): void {
    this.isChartExpanded = false;
    if (this.expandedChart) {
      this.expandedChart.destroy();
      this.expandedChart = undefined;
    }
    if (this._escListener) {
      document.removeEventListener('keydown', this._escListener);
      this._escListener = undefined;
    }
    this.cdr.detectChanges();
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

    // Fetch climate data whenever selection changes
    this.fetchClimateData(latlng.lat, latlng.lng);
  }

  onVariableRadioChange(value: string): void {
    this.selectedVariable = value;
    if (this.lastClimateResponse) {
      const chartData = this.config.transformData(this.lastClimateResponse, this.selectedVariable);
      this.updateChart(chartData);
    }
  }

  onLeadChange(lead: number): void {
    this.selectedLead = lead;
    if (this.selectedLocation) {
      this.fetchClimateData(this.selectedLocation.lat, this.selectedLocation.lng);
    }
  }

  private initMap(): void {
    initLeafletMarkerIcon();

    // Initialize map centered roughly on Vietnam
    this.map = L.map(this.mapId, {
      minZoom: 5,
      maxZoom: 9,
    }).setView([16, 112], 5);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ).addTo(this.map);

    loadProvinceGeoJson(this.map, (latlng, provinceName) => {
      this.updateSelection(latlng, provinceName);
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

  private fetchClimateData(lat: number, lng: number): void {
    this.isLoadingClimate = true;
    this.cdr.detectChanges();

    const lead = this.config.showLeadSlider ? this.selectedLead : undefined;
    this.config.fetchData(this.injector, lat, lng, lead).subscribe({
      next: (response) => {
        this.lastClimateResponse = response;
        const chartData = this.config.transformData(response, this.selectedVariable);
        this.updateChart(chartData);
        this.isLoadingClimate = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching climate data:', err);
        this.isLoadingClimate = false;
        this.cdr.detectChanges();
      },
    });
  }

  private updateChart(data: any): void {
    const ctx = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!ctx) return;

    // const datasetLabel = this.config.getYAxisTitle(this.selectedVariable);

    if (this.climateChart) {
      this.climateChart.data.labels = data.labels;
      this.climateChart.data.datasets = data.datasets;
      // const yScale = this.climateChart.options.scales?.['y'] as any;
      // if (yScale?.title) {
      //   yScale.title.text = datasetLabel;
      // }
      this.climateChart.update();
    } else {
      this.climateChart = new Chart(ctx, {
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
              // title: {
              //   display: true,
              //   text: datasetLabel,
              // },
            },
            // x: {
            //   title: {
            //     display: true,
            //     text: 'Khí hậu 12 tháng',
            //   },
            // },
          },
        },
      });
    }
  }
}
