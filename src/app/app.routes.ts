import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate:[authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
    {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'registro-usuario',
    loadComponent: () => import('./pages/registro-usuario/registro-usuario.page').then( m => m.RegistroUsuarioPage)
  },

];
