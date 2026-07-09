import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

export interface MonthlyClimDashboardConfig {
  title: string;

  fetchData: (injector: Injector, lat: number, lng: number, lead?: number) => Observable<any>;

  // Chart styling & format strategies
  // getYAxisTitle: (selectedVariable?: string) => string;
  yAxisMax?: number;
  yAxisMin?: number;
  valueFormatter: (value: number) => string;

  // Data transformation Strategy
  transformData: (
    response: any,
    selectedVariable?: string,
  ) => {
    labels: string[];
    datasets: any[];
  };
}
