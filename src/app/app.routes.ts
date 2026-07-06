import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { MainDashboard } from './main-dashboard/main-dashboard.component';
import { DROUGHT_PROBABILITY_DASHBOARD_CONFIG } from './constants/drought-probability-dashboard.config';
import { DROUGHT_EVENT_DASHBOARD_CONFIG } from './constants/drought-event-dashboard.config';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'drought-probability-dashboard', pathMatch: 'full' },
      {
        path: 'drought-probability-dashboard',
        component: MainDashboard,
        data: { config: DROUGHT_PROBABILITY_DASHBOARD_CONFIG },
      },
      {
        path: 'drought-event-dashboard',
        component: MainDashboard,
        data: { config: DROUGHT_EVENT_DASHBOARD_CONFIG },
      },
    ],
  },
];

