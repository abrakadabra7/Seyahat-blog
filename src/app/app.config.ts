import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { SupabaseService } from './services/supabase.service';
import { CategoryService } from './services/category.service';
import { ProfileService } from './services/profile.service';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    ),
    SupabaseService,
    CategoryService,
    ProfileService,
    AuthService
  ]
};
