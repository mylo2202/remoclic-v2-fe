import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

export interface PrT2DashboardConfig {
  title: string;
  isTemperature: boolean;
  // API Fetch Strategy
  fetchRefDates?: (injector: Injector) => Observable<string[]>;
  fetchData: (injector: Injector, lat: number, lng: number, refDate?: string) => Observable<any>;

  // Chart styling & format strategies
  yAxisTitle: string;
  yAxisMax?: number;
  yAxisMin?: number;
  valueFormatter: (value: number, selectedVariable?: number) => string;

  // Data transformation Strategy
  transformData: (
    response: any,
    selectedVariable?: number,
  ) => {
    labels: string[];
    datasets: any[];
  };
}
