import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthlyClimObservedResponse } from '../models/monthly-clim-observed-response.interface';
import { MonthlyClimModelResponse } from '../models/monthly-clim-model-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MonthlyClimService {
  private readonly monthlyClimObservedUrl = `${environment.apiUrl}/monthly-clim/observed`;
  private readonly monthlyClimModelUrl = `${environment.apiUrl}/monthly-clim/model`;

  constructor(private readonly http: HttpClient) {}

  getMonthlyClimObserved(lat: number, lng: number): Observable<MonthlyClimObservedResponse> {
    const params: any = { lat, lng };
    return this.http.get<MonthlyClimObservedResponse>(this.monthlyClimObservedUrl, {
      params,
    });
  }

  getMonthlyClimModel(
    lat: number,
    lng: number,
    lead?: number,
  ): Observable<MonthlyClimModelResponse> {
    const params: any = { lat, lng };
    if (lead) {
      params.lead = lead;
    }
    return this.http.get<MonthlyClimModelResponse>(this.monthlyClimModelUrl, {
      params,
    });
  }
}
