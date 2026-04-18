import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForecastResponse } from '../models/forecast-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  private readonly apiUrl = `${environment.apiUrl}/dataset/forecast`;

  constructor(private http: HttpClient) { }

  getForecast(lat: number, lng: number): Observable<ForecastResponse> {
    return this.http.get<ForecastResponse>(this.apiUrl, {
      params: { lat, lng }
    });
  }
}
