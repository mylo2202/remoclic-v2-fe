import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
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
import {
  formatRefDate,
  initLeafletMarkerIcon,
  isRefDateAvailable,
  loadProvinceGeoJson,
} from '../shared/utils/dashboard-helpers';
import { PR_T2_TEMPERATURE_DASHBOARD_CONFIG } from '../constants/pr-t2-temperature-dashboard.config';

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
export class PrT2Dashboard implements OnInit, AfterViewInit {
  // defaults to temperature
  @Input() config: PrT2DashboardConfig = PR_T2_TEMPERATURE_DASHBOARD_CONFIG;

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
  isTemperature: boolean = true;

  /** Reference to the custom header — passed to [calendarHeaderComponent] */
  readonly monthPickerHeader = MonthPickerHeaderComponent;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly injector: Injector,
  ) {}

  isLoadingForecast: boolean = false;
  private forecastChart: Chart | undefined;
  private lastForecastResponse: any = null;

  /** Format selectedRefDate as yyyy-MM-dd for the API */
  private get selectedRefDateForApi(): string | undefined {
    return formatRefDate(this.selectedRefDate);
  }

  /** Only allow months that exist in availableRefDates */
  refDateFilter = (date: Date | null): boolean => {
    return isRefDateAvailable(date, this.availableRefDates);
  };

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

  ngOnInit() {
    this.isTemperature = this.config.isTemperature;
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

  private fetchForecastData(lat: number, lng: number): void {
    this.isLoadingForecast = true;
    this.cdr.detectChanges();

    this.config.fetchData(this.injector, lat, lng, this.selectedRefDateForApi).subscribe({
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
                text: 'Dự báo cho 6 tháng từ thời điểm dự báo',
              },
            },
          },
        },
      });
    }
  }
}
