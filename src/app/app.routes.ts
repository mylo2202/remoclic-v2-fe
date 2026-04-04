import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DraughtDashboard } from './draught-dashboard/draught-dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'draught-dashboard', pathMatch: 'full' },
      { path: 'draught-dashboard', component: DraughtDashboard }
    ]
  }
];
