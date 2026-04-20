import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mission, MissionReport, Stats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MissionsService {
  private apiUrl = 'https://pr3-lista-misiones-konoha-backend.vercel.app';

  constructor(private http: HttpClient) { }

  getMissions(status?: string, rank?: string): Observable<Mission[]> {
    let url = `${this.apiUrl}/missions`;
    const params = new URLSearchParams();

    if (status) params.append('status', status);
    if (rank) params.append('rank', rank);

    if (params.toString()) {
      url += '?' + params.toString();
    }

    return this.http.get<Mission[]>(url);
  }

  getMissionById(id: string): Observable<Mission> {
    return this.http.get<Mission>(`${this.apiUrl}/missions/${id}`);
  }

  acceptMission(id: string): Observable<Mission> {
    return this.http.patch<Mission>(`${this.apiUrl}/missions/${id}/accept`, {});
  }

  reportMission(id: string, report: MissionReport): Observable<any> {
    return this.http.post(`${this.apiUrl}/missions/${id}/report`, report);
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/ninjas/me/stats`);
  }
}
