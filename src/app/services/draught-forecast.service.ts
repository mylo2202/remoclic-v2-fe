import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DraughtProbabilityForecastResponse } from '../models/draught-probability-forecast-response.interface';
import { DraughtEventForecastResponse } from '../models/draught-event-forecast-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DraughtForecastService {
  private readonly refDateUrl = `${environment.apiUrl}/draught/ref-dates`;
  private readonly probabilityForecastUrl = `${environment.apiUrl}/draught/probability-forecast`;
  private readonly eventForecastUrl = `${environment.apiUrl}/draught/event-forecast`;

  constructor(private readonly http: HttpClient) { }

  getRefDates(): Observable<any> {
    return this.http.get(this.refDateUrl);
  }

  getProbabilityForecast(lat: number, lng: number, timescale?: number, refDate?: string): Observable<DraughtProbabilityForecastResponse> {
    const params: any = { lat, lng };
    if (timescale !== undefined) {
      params.timescale = timescale;
    }
    if (refDate) {
      params.ref_date = refDate;
    }
    return this.http.get<DraughtProbabilityForecastResponse>(this.probabilityForecastUrl, {
      params,
    });
  }

  getEventForecast(lat: number, lng: number, timescale?: number, refDate?: string): Observable<DraughtEventForecastResponse> {
    const params: any = { lat, lng };
    if (timescale !== undefined) {
      params.timescale = timescale;
    }
    if (refDate) {
      params.ref_date = refDate;
    }
    return this.http.get<DraughtEventForecastResponse>(this.eventForecastUrl, {
      params,
    });
  }
}
