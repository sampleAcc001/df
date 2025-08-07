import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import Notiflix from 'notiflix';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(), provideAnimationsAsync(), importProvidersFrom([
      // Add any other providers you need here
      NgbModule
    ]),
  ]
}).catch(err => console.error(err));

// ✅ Notiflix configuration (unchanged)
Notiflix.Loading.init({
  backgroundColor: 'rgba(0,0,0,0.6)',
  svgColor: '#0d6efd',
  messageColor: '#fff',
});
