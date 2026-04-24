import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/lista-compras', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'registrar',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
    ],
  },
  {
    path: 'dieta',
    canActivate: [authGuard],
    children: [
      {
        path: 'enviar',
        loadComponent: () =>
          import('./features/diet/upload/diet-upload.component').then(
            (m) => m.DietUploadComponent
          ),
      },
      {
        path: 'revisar/:id',
        loadComponent: () =>
          import('./features/diet/review/diet-review.component').then(
            (m) => m.DietReviewComponent
          ),
      },
    ],
  },
  {
    path: 'lista-compras',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/shopping-list/list/shopping-list.component'
      ).then((m) => m.ShoppingListComponent),
  },
  { path: '**', redirectTo: '/lista-compras' },
];
