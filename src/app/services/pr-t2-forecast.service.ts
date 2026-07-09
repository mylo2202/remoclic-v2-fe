import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrT2PrecipitationForecastResponse } from '../models/pr-t2-precipitation-forecast-response.interface';
import { PrT2TemperatureForecastResponse } from '../models/pr-t2-temperature-forecast-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PrT2ForecastService {
  private readonly refDateUrl = `${environment.apiUrl}/pr-t2/ref-dates`;
  private readonly precipitationForecastUrl = `${environment.apiUrl}/pr-t2/precipitation-forecast`;
  private readonly temperatureForecastUrl = `${environment.apiUrl}/pr-t2/temperature-forecast`;

  constructor(private readonly http: HttpClient) {}

  getRefDates(): Observable<string[]> {
    return this.http.get<string[]>(this.refDateUrl);
  }

  getPrecipitationForecast(
    lat: number,
    lng: number,
    refDate?: string,
  ): Observable<PrT2PrecipitationForecastResponse> {
    const params: any = { lat, lng };
    if (refDate) {
      params.ref_date = refDate;
    }
    return this.http.get<PrT2PrecipitationForecastResponse>(this.precipitationForecastUrl, {
      params,
    });
  }

  getTemperatureForecast(
    lat: number,
    lng: number,
    refDate?: string,
  ): Observable<PrT2TemperatureForecastResponse> {
    const params: any = { lat, lng };
    if (refDate) {
      params.ref_date = refDate;
    }
    return this.http.get<PrT2TemperatureForecastResponse>(this.temperatureForecastUrl, {
      params,
    });
  }
}
