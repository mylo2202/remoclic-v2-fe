export interface DraughtEventForecastResponse {
  location: {
    lat: number;
    lng: number;
  };
  labels: string[];
  data: {
    dr_ens: number[];
  };
}
