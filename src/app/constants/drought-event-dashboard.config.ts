import { Injector } from '@angular/core';
import { DroughtDashboardConfig } from '../models/drought-dashboard-config.model';
import { DroughtForecastService } from '../services/drought-forecast.service';

export const DROUGHT_EVENT_DASHBOARD_CONFIG: DroughtDashboardConfig = {
  title: 'Dự báo sự kiện hạn theo các cấp và quy mô thời gian',
  showTimescale: true,
  showRefDate: true,
  yAxisTitle: 'Sự kiện hạn (z-score)',
  valueFormatter: (val) => `${val.toFixed(1)}`,
  fetchRefDates: (injector: Injector) => injector.get(DroughtForecastService).getRefDates(),
  fetchData: (injector: Injector, lat: number, lng: number, scale: number, date?: string) =>
    injector.get(DroughtForecastService).getEventForecast(lat, lng, scale, date),
  transformData: (response) => ({
    labels: response.labels,
    datasets: [
      {
        label: 'Sự kiện hạn (z-score)',
        data: response.data.dr_ens,
        borderColor: '#654321',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0,
      },
    ],
  }),
};
