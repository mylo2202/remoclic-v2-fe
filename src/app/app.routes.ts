import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { MainDashboard } from './main-dashboard/main-dashboard.component';
import { DRAUGHT_PROBABILITY_DASHBOARD_CONFIG } from './constants/draught-probability-dashboard.config';
import { DRAUGHT_EVENT_DASHBOARD_CONFIG } from './constants/draught-event-dashboard.config';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'draught-probability-dashboard', pathMatch: 'full' },
      {
        path: 'draught-probability-dashboard',
        component: MainDashboard,
        data: { config: DRAUGHT_PROBABILITY_DASHBOARD_CONFIG },
      },
      {
        path: 'draught-event-dashboard',
        component: MainDashboard,
        data: { config: DRAUGHT_EVENT_DASHBOARD_CONFIG },
      },
    ],
  },
];

