import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DraughtProbabilityDashboard } from './draught-probability-dashboard/draught-probability-dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'draught-probability-dashboard', pathMatch: 'full' },
      { path: 'draught-probability-dashboard', component: DraughtProbabilityDashboard }
    ]
  }
];
