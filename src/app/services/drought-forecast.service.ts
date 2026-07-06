import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DroughtProbabilityForecastResponse } from '../models/drought-probability-forecast-response.interface';
import { DroughtEventForecastResponse } from '../models/drought-event-forecast-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DroughtForecastService {
  private readonly refDateUrl = `${environment.apiUrl}/drought/ref-dates`;
  private readonly probabilityForecastUrl = `${environment.apiUrl}/drought/probability-forecast`;
  private readonly eventForecastUrl = `${environment.apiUrl}/drought/event-forecast`;

  constructor(private readonly http: HttpClient) {}

  getRefDates(): Observable<string[]> {
    return this.http.get<string[]>(this.refDateUrl);
  }

  getProbabilityForecast(
    lat: number,
    lng: number,
    timescale?: number,
    refDate?: string,
  ): Observable<DroughtProbabilityForecastResponse> {
    const params: any = { lat, lng };
    if (timescale !== undefined) {
      params.timescale = timescale;
    }
    if (refDate) {
      params.ref_date = refDate;
    }
    return this.http.get<DroughtProbabilityForecastResponse>(this.probabilityForecastUrl, {
      params,
    });
  }

  getEventForecast(
    lat: number,
    lng: number,
    timescale?: number,
    refDate?: string,
  ): Observable<DroughtEventForecastResponse> {
    const params: any = { lat, lng };
    if (timescale !== undefined) {
      params.timescale = timescale;
    }
    if (refDate) {
      params.ref_date = refDate;
    }
    return this.http.get<DroughtEventForecastResponse>(this.eventForecastUrl, {
      params,
    });
  }
}
