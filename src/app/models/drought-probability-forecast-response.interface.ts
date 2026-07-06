export interface DroughtProbabilityForecastResponse {
  location: {
    lat: number;
    lng: number;
  };
  labels: string[];
  data: {
    mild: number[];
    mord: number[];
    seve: number[];
  };
}
