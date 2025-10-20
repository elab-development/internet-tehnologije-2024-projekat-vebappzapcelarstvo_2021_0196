import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PublicAPIService {
  private baseUrl = 'http://localhost:3000/public';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getForecast(lat: number, lon: number, days = 7, timezone = 'Europe/Belgrade') {
    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lon', String(lon))
      .set('days', String(days))
      .set('timezone', timezone);

    return this.http.get<{ data: { data: Array<{date:string;tmax:number;tmin:number;precip:number}> } }>(
      'http://localhost:3000/public/getForecast',
      { headers: this.authHeaders(), params }
    );
  }

  getAirQuality(lat: number, lon: number, days = 2, tz = 'Europe/Belgrade') {
    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lon', String(lon))
      .set('days', String(days))
      .set('tz', tz);

    return this.http.get<{ data: { hours: Array<any> } }>(
      'http://localhost:3000/public/getAirQuality',
      { headers: this.authHeaders(), params }
    );
  }
}
