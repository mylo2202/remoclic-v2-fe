import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DroughtDashboard } from './drought-dashboard/drought-dashboard.component';
import { PrT2Dashboard } from './pr-t2-dashboard/pr-t2-dashboard.component';
import { DROUGHT_PROBABILITY_DASHBOARD_CONFIG } from './constants/drought-probability-dashboard.config';
import { DROUGHT_EVENT_DASHBOARD_CONFIG } from './constants/drought-event-dashboard.config';
import { PR_T2_TEMPERATURE_DASHBOARD_CONFIG } from './constants/pr-t2-temperature-dashboard.config';
import { PR_T2_PRECIPITATION_DASHBOARD_CONFIG } from './constants/pr-t2-precipitation-dashboard.config';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'drought-probability-dashboard', pathMatch: 'full' },
      {
        path: 'drought-probability-dashboard',
        component: DroughtDashboard,
        data: { config: DROUGHT_PROBABILITY_DASHBOARD_CONFIG },
      },
      {
        path: 'drought-event-dashboard',
        component: DroughtDashboard,
        data: { config: DROUGHT_EVENT_DASHBOARD_CONFIG },
      },
      {
        path: 'pr-t2-temperature-dashboard',
        component: PrT2Dashboard,
        data: { config: PR_T2_TEMPERATURE_DASHBOARD_CONFIG },
      },
      {
        path: 'pr-t2-precipitation-dashboard',
        component: PrT2Dashboard,
        data: { config: PR_T2_PRECIPITATION_DASHBOARD_CONFIG },
      },
    ],
  },
];

