import { Injector } from '@angular/core';
import { PrT2DashboardConfig } from '../models/pr-t2-dashboard-config.model';
import { PrT2ForecastService } from '../services/pr-t2-forecast.service';
import { PR_T2_VARIABLES } from './pr-t2-variables.constant';

export const PR_T2_PRECIPITATION_DASHBOARD_CONFIG: PrT2DashboardConfig = {
  title: 'Dự báo tổng lượng mưa tháng và dị thường lượng mưa tháng',
  isTemperature: false,
  // getYAxisTitle: (selectedVariable = PR_T2_VARIABLES.forecast) => {
  //   const isAnomaly = selectedVariable === PR_T2_VARIABLES.anomaly;
  //   return isAnomaly ? 'Dị thường lượng mưa tháng (%)' : 'Tổng lượng mưa tháng (mm/tháng)';
  // },
  valueFormatter: (val, selectedVariable = PR_T2_VARIABLES.forecast) => {
    const isAnomaly = selectedVariable === PR_T2_VARIABLES.anomaly;
    return isAnomaly ? `${val.toFixed(2)}%` : `${val.toFixed(2)}`;
  },
  fetchRefDates: (injector: Injector) => injector.get(PrT2ForecastService).getRefDates(),
  fetchData: (injector: Injector, lat: number, lng: number, date?: string) =>
    injector.get(PrT2ForecastService).getPrecipitationForecast(lat, lng, date),
  transformData: (response, selectedVariable = PR_T2_VARIABLES.forecast) => {
    const isAnomaly = selectedVariable === PR_T2_VARIABLES.anomaly;
    return {
      labels: response.labels,
      datasets: [
        {
          label: isAnomaly ? 'Dị thường lượng mưa tháng (%)' : 'Tổng lượng mưa tháng (mm/tháng)',
          data: isAnomaly ? response.data.pr_ano : response.data.pr_fcs,
          borderColor: isAnomaly ? '#06b6d4' : '#2563eb',
          backgroundColor: isAnomaly ? '#06b6d499' : '#2563eb99',
          fill: !isAnomaly,
          tension: 0,
        },
      ],
    };
  },
};
