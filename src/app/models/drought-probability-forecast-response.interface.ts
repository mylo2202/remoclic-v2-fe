export interface DroughtProbabilityForecastResponse {
  location: {
    lat: number;
    lng: number;
  };
  ref_date: string;
  timescale: number;
  labels: string[];
  data: {
    mild: number[];
    mord: number[];
    seve: number[];
  };
}
