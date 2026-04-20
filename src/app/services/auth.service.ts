import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { AuthResponse, Ninja } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://pr3-lista-misiones-konoha-backend.vercel.app';
  private tokenKey = 'ninja_token';
  private ninjaKey = 'ninja_data';

  private currentToken: string | null = null;
  private currentNinja$ = new BehaviorSubject<Ninja | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private sessionRestored$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  async initializeSession(): Promise<void> {
    await this.restoreSession();
    this.sessionRestored$.next(true);
  }

  private async restoreSession() {
    try {
      const { value: token } = await Preferences.get({ key: this.tokenKey });
      const { value: ninjaData } = await Preferences.get({ key: this.ninjaKey });

      if (token && ninjaData) {
        this.currentToken = token;
        this.currentNinja$.next(JSON.parse(ninjaData));
        this.isAuthenticated$.next(true);
      }
    } catch (error) {
    }
  }

  register(username: string, password: string, rank: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      username,
      password,
      rank
    }).pipe(
      tap(response => this.saveSession(response))
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => this.saveSession(response))
    );
  }

  private async saveSession(response: AuthResponse) {
    this.currentToken = response.token;
    await Preferences.set({ key: this.tokenKey, value: response.token });
    await Preferences.set({ key: this.ninjaKey, value: JSON.stringify(response.ninja) });
    this.currentNinja$.next(response.ninja);
    this.isAuthenticated$.next(true);
  }

  async logout() {
    this.currentToken = null;
    await Preferences.remove({ key: this.tokenKey });
    await Preferences.remove({ key: this.ninjaKey });
    this.currentNinja$.next(null);
    this.isAuthenticated$.next(false);
  }

  getTokenSync(): string | null {
    return this.currentToken;
  }

  // Obtener token async (para otros usos)
  async getToken(): Promise<string | null> {
    if (this.currentToken) {
      return this.currentToken;
    }
    const { value } = await Preferences.get({ key: this.tokenKey });
    if (value) {
      this.currentToken = value;
    }
    return value;
  }

  // Observables
  getNinja$() {
    return this.currentNinja$.asObservable();
  }

  getIsAuthenticated$() {
    return this.isAuthenticated$.asObservable();
  }

  getCurrentNinja(): Ninja | null {
    return this.currentNinja$.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticated$.value;
  }
}
