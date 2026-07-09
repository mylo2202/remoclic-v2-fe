export interface DroughtEventForecastResponse {
  location: {
    lat: number;
    lng: number;
  };
  ref_date: string;
  timescale: number;
  labels: string[];
  data: {
    dr_ens: number[];
  };
}
