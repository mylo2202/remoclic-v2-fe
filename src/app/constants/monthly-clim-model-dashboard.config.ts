import { Injector } from '@angular/core';
import { MonthlyClimDashboardConfig } from '../models/monthly-clim-dashboard-config.model';
import { MonthlyClimService } from '../services/monthly-clim.service';
import { MONTHLY_CLIM_VARIABLES } from './monthly-clim-variables.constant';

export const MONTHLY_CLIM_MODEL_DASHBOARD_CONFIG: MonthlyClimDashboardConfig = {
  title: 'Trung bình khí hậu mô hình các tháng trong năm',
  // getYAxisTitle: (selectedVariable = MONTHLY_CLIM_VARIABLES.temperature) => {
  //   const isPrecipitation = selectedVariable === MONTHLY_CLIM_VARIABLES.precipitation;
  //   return isPrecipitation ? 'Trung bình tổng lượng mưa (mm/tháng)' : 'Trung bình nhiệt độ (độ C)';
  // },
  valueFormatter: (val) => `${val.toFixed(2)}`,
  fetchData: (injector: Injector, lat: number, lng: number, lead?: number) =>
    injector.get(MonthlyClimService).getMonthlyClimModel(lat, lng, lead),
  transformData: (response, selectedVariable = MONTHLY_CLIM_VARIABLES.temperature) => {
    const isPrecipitation = selectedVariable === MONTHLY_CLIM_VARIABLES.precipitation;
    return {
      labels: response.labels,
      datasets: [
        {
          label: isPrecipitation
            ? 'Trung bình tổng lượng mưa (mm/tháng)'
            : 'Trung bình nhiệt độ (độ C)',
          data: isPrecipitation ? response.data.pr_o : response.data.t2_o,
          borderColor: isPrecipitation ? '#2563eb' : '#ffa500',
          backgroundColor: 'transparent',
          fill: !isPrecipitation,
          tension: 0,
        },
      ],
    };
  },
};
