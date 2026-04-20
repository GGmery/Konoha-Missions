import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, HTTP_INTERCEPTORS, withXsrfConfiguration, withInterceptorsFromDi } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { personAdd, informationCircle, closeCircle, checkmarkCircle, person, list, logOut, alertCircle } from 'ionicons/icons';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/services/auth.interceptor';
import { AuthService } from './app/services/auth.service';

// Registrar todos los iconos
addIcons({
  'person-add': personAdd,
  'information-circle': informationCircle,
  'close-circle': closeCircle,
  'checkmark-circle': checkmarkCircle,
  'person': person,
  'list': list,
  'log-out': logOut,
  'alert-circle': alertCircle,
});

// Factory para inicializar la sesión antes de cargar la app
export function initializeApp(authService: AuthService) {
  return () => authService.initializeSession();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    },
  ],
});
