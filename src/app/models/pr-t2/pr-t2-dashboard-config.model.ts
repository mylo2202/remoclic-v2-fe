import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

export interface PrT2DashboardConfig {
  title: string;
  isTemperature: boolean;
  // API Fetch Strategy
  fetchRefDates?: (injector: Injector) => Observable<string[]>;
  fetchData: (injector: Injector, lat: number, lng: number, refDate?: string) => Observable<any>;

  // Chart styling & format strategies
  // getYAxisTitle: (selectedVariable?: string) => string;
  yAxisMax?: number;
  yAxisMin?: number;
  valueFormatter: (value: number, selectedVariable?: string) => string;

  // Data transformation Strategy
  transformData: (
    response: any,
    selectedVariable?: string,
  ) => {
    labels: string[];
    datasets: any[];
  };
}
