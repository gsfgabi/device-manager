import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/devices',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'devices',
    loadComponent: () => import('./components/device-list/device-list').then(m => m.DeviceListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'devices/new',
    loadComponent: () => import('./components/device-form/device-form').then(m => m.DeviceFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'devices/:id/edit',
    loadComponent: () => import('./components/device-form/device-form').then(m => m.DeviceFormComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/devices'
  }
];
