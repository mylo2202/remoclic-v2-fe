import { Injector } from '@angular/core';
import { MonthlyClimDashboardConfig } from '../models/monthly-clim-dashboard-config.model';
import { MonthlyClimService } from '../services/monthly-clim.service';
import { MONTHLY_CLIM_VARIABLES } from './monthly-clim-variables.constant';

export const MONTHLY_CLIM_OBSERVED_DASHBOARD_CONFIG: MonthlyClimDashboardConfig = {
  title: 'Trung bình khí hậu quan trắc các tháng trong năm',
  showLeadSlider: false,
  // getYAxisTitle: (selectedVariable = MONTHLY_CLIM_VARIABLES.temperature) => {
  //   const isPrecipitation = selectedVariable === MONTHLY_CLIM_VARIABLES.precipitation;
  //   return isPrecipitation ? 'Trung bình tổng lượng mưa (mm/tháng)' : 'Trung bình nhiệt độ (độ C)';
  // },
  valueFormatter: (val) => `${val.toFixed(2)}`,
  fetchData: (injector: Injector, lat: number, lng: number) =>
    injector.get(MonthlyClimService).getMonthlyClimObserved(lat, lng),
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
          backgroundColor: isPrecipitation ? '#2563eb99' : '#ffa50099',
          fill: isPrecipitation,
          tension: 0,
        },
      ],
    };
  },
};
