export interface MonthlyClimModelResponse {
  location: {
    lat: number;
    lng: number;
  };
  lead: number;
  labels: string[];
  data: {
    pr_o: number[];
    t2_o: number[];
  };
}
