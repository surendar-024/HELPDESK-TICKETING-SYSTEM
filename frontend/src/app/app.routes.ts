import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.Register)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/tickets/tickets').then(m => m.Tickets)
  },
  {
    path: 'tickets/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/ticket-create/ticket-create').then(m => m.TicketCreate)
  },
  {
    path: 'tickets/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/ticket-detail/ticket-detail').then(m => m.TicketDetail)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];