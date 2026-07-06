export interface DroughtEventForecastResponse {
  location: {
    lat: number;
    lng: number;
  };
  labels: string[];
  data: {
    dr_ens: number[];
  };
}
