import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DroughtDashboard } from './components/drought-dashboard/drought-dashboard.component';
import { PrT2Dashboard } from './components/pr-t2-dashboard/pr-t2-dashboard.component';
import { DROUGHT_PROBABILITY_DASHBOARD_CONFIG } from './constants/drought/drought-probability-dashboard.config';
import { DROUGHT_EVENT_DASHBOARD_CONFIG } from './constants/drought/drought-event-dashboard.config';
import { PR_T2_TEMPERATURE_DASHBOARD_CONFIG } from './constants/pr-t2/pr-t2-temperature-dashboard.config';
import { PR_T2_PRECIPITATION_DASHBOARD_CONFIG } from './constants/pr-t2/pr-t2-precipitation-dashboard.config';
import { MonthlyClimDashboard } from './components/monthly-clim-dashboard/monthly-clim-dashboard.component';
import { MONTHLY_CLIM_OBSERVED_DASHBOARD_CONFIG } from './constants/monthly-clim/monthly-clim-observed-dashboard.config';
import { MONTHLY_CLIM_MODEL_DASHBOARD_CONFIG } from './constants/monthly-clim/monthly-clim-model-dashboard.config';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'drought-probability', pathMatch: 'full' },
      {
        path: 'drought-probability',
        component: DroughtDashboard,
        data: { config: DROUGHT_PROBABILITY_DASHBOARD_CONFIG },
      },
      {
        path: 'drought-event',
        component: DroughtDashboard,
        data: { config: DROUGHT_EVENT_DASHBOARD_CONFIG },
      },
      {
        path: 'pr-t2-temperature',
        component: PrT2Dashboard,
        data: { config: PR_T2_TEMPERATURE_DASHBOARD_CONFIG },
      },
      {
        path: 'pr-t2-precipitation',
        component: PrT2Dashboard,
        data: { config: PR_T2_PRECIPITATION_DASHBOARD_CONFIG },
      },
      {
        path: 'monthly-clim-observed',
        component: MonthlyClimDashboard,
        data: { config: MONTHLY_CLIM_OBSERVED_DASHBOARD_CONFIG },
      },
      {
        path: 'monthly-clim-model',
        component: MonthlyClimDashboard,
        data: { config: MONTHLY_CLIM_MODEL_DASHBOARD_CONFIG },
      },
    ],
  },
];
