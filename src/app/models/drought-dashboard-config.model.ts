import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

export interface DroughtDashboardConfig {
  title: string;

  // API Fetch Strategy
  fetchRefDates?: (injector: Injector) => Observable<string[]>;
  fetchData: (
    injector: Injector,
    lat: number,
    lng: number,
    timescale: number,
    refDate?: string,
  ) => Observable<any>;

  // Chart styling & format strategies
  yAxisTitle: string;
  yAxisMax?: number;
  yAxisMin?: number;
  valueFormatter: (value: number) => string;

  // Data transformation Strategy
  transformData: (response: any) => {
    labels: string[];
    datasets: any[];
  };
}
