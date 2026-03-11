import { Routes } from '@angular/router';
import { Main } from './components/main/main';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Main,
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
