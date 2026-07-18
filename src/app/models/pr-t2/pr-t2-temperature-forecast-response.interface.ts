export interface PrT2TemperatureForecastResponse {
  location: {
    lat: number;
    lng: number;
  };
  ref_date: string;
  labels: string[];
  data: {
    t2: number[];
    t2_ano: number[];
    t2_fcs: number[];
  };
}
