export interface MonthlyClimObservedResponse {
  location: {
    lat: number;
    lng: number;
  };
  labels: string[];
  data: {
    pr_o: number[];
    t2_o: number[];
  };
}
