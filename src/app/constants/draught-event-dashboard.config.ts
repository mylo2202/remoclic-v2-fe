import { Injector } from '@angular/core';
import { DashboardConfig } from '../models/dashboard-config.model';
import { DraughtForecastService } from '../services/draught-forecast.service';

export const DRAUGHT_EVENT_DASHBOARD_CONFIG: DashboardConfig = {
  title: 'Dự báo sự kiện hạn theo các cấp và quy mô thời gian',
  showTimescale: true,
  showRefDate: true,
  yAxisTitle: 'Sự kiện hạn (Ensemble)',
  valueFormatter: (val) => `${val.toFixed(1)}`,
  fetchRefDates: (injector: Injector) =>
    injector.get(DraughtForecastService).getRefDates(),
  fetchData: (injector: Injector, lat: number, lng: number, scale: number, date?: string) =>
    injector.get(DraughtForecastService).getEventForecast(lat, lng, scale, date),
  transformData: (response) => ({
    labels: response.labels,
    datasets: [
      {
        label: 'Sự kiện hạn (Ensemble)',
        data: response.data.dr_ens,
        borderColor: '#00ffffff',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0,
      },
    ],
  }),
};
