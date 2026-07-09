import { Injector } from '@angular/core';
import { PrT2DashboardConfig } from '../models/pr-t2-dashboard-config.model';
import { PrT2ForecastService } from '../services/pr-t2-forecast.service';

export const PR_T2_TEMPERATURE_DASHBOARD_CONFIG: PrT2DashboardConfig = {
  title: 'Dự báo nhiệt độ trung bình tháng và dị thường nhiệt độ trung bình tháng',
  isTemperature: true,
  yAxisTitle: 'Nhiệt độ trung bình tháng (độ C)',
  valueFormatter: (val) => `${val.toFixed(2)}`,
  fetchRefDates: (injector: Injector) => injector.get(PrT2ForecastService).getRefDates(),
  fetchData: (injector: Injector, lat: number, lng: number, date?: string) =>
    injector.get(PrT2ForecastService).getTemperatureForecast(lat, lng, date),
  transformData: (response, selectedVariable = 1) => {
    const isAnomaly = selectedVariable === 2;
    return {
      labels: response.labels,
      datasets: [
        {
          label: isAnomaly
            ? 'Dị thường nhiệt độ trung bình tháng (độ C)'
            : 'Nhiệt độ trung bình tháng (độ C)',
          data: isAnomaly ? response.data.t2_ano : response.data.t2_fcs,
          borderColor: isAnomaly ? '#ef4444' : '#ffa500',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0,
        },
      ],
    };
  },
};
