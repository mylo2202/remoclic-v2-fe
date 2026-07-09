export interface MonthlyClimModelResponse {
  location: {
    lat: number;
    lng: number;
  };
  lead: number;
  labels: string[];
  data: {
    pr_m: number[];
    t2_m: number[];
  };
}
