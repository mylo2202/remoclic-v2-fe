import { Injector } from '@angular/core';
import { DroughtDashboardConfig } from '../models/drought-dashboard-config.model';
import { DroughtForecastService } from '../services/drought-forecast.service';

export const DROUGHT_PROBABILITY_DASHBOARD_CONFIG: DroughtDashboardConfig = {
  title: 'Dự báo xác suất xuất hiện hạn theo các cấp và quy mô thời gian',
  isProbability: true,
  yAxisTitle: 'Xác suất (%)',
  yAxisMax: 100,
  valueFormatter: (val) => `${val.toFixed(2)}%`,
  fetchRefDates: (injector: Injector) => injector.get(DroughtForecastService).getRefDates(),
  fetchData: (injector: Injector, lat: number, lng: number, scale: number, date?: string) =>
    injector.get(DroughtForecastService).getProbabilityForecast(lat, lng, scale, date),
  transformData: (response) => ({
    labels: response.labels,
    datasets: [
      {
        label: 'Hạn nhẹ (Mild)',
        data: response.data.mild,
        borderColor: '#fbbf24',
        backgroundColor: '#fbbf2499',
        fill: 1, // Fill space between this dataset and Moderate
        tension: 0,
      },
      {
        label: 'Hạn vừa (Moderate)',
        data: response.data.mord,
        borderColor: '#f97316',
        backgroundColor: '#f9731699',
        fill: 2, // Fill space between this dataset and Severe
        tension: 0,
      },
      {
        label: 'Hạn nặng (Severe)',
        data: response.data.seve,
        borderColor: '#dc2626',
        backgroundColor: '#dc262699',
        fill: 'origin', // Fill space to the 0-axis
        tension: 0,
      },
    ],
  }),
};
