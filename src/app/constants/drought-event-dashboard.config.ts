import { Injector } from '@angular/core';
import { DroughtDashboardConfig } from '../models/drought-dashboard-config.model';
import { DroughtForecastService } from '../services/drought-forecast.service';

export const DROUGHT_EVENT_DASHBOARD_CONFIG: DroughtDashboardConfig = {
  title: 'Dự báo sự kiện hạn theo các cấp và quy mô thời gian',
  isProbability: false,
  yAxisTitle: '',
  valueFormatter: (val) => `${val.toFixed(2)}`,
  fetchRefDates: (injector: Injector) => injector.get(DroughtForecastService).getRefDates(),
  fetchData: (injector: Injector, lat: number, lng: number, scale: number, date?: string) =>
    injector.get(DroughtForecastService).getEventForecast(lat, lng, scale, date),
  transformData: (response) => ({
    labels: response.labels,
    datasets: [
      {
        label: 'Sự kiện hạn (Ensemble, z-score)',
        data: response.data.dr_ens,
        borderColor: '#bd6817',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0,
      },
    ],
  }),
};
