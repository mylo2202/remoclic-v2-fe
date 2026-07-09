export interface PrT2PrecipitationForecastResponse {
  location: {
    lat: number;
    lng: number;
  };
  ref_date: string;
  labels: string[];
  data: {
    pr: number[];
    pr_ano: number[];
    pr_fcs: number[];
  };
}
