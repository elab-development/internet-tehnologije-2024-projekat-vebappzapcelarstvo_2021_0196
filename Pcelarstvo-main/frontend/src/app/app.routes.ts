import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './services/auth.guard';
import { Admin } from './components/admin/admin';
import { AdminOverview } from './components/admin-overview/admin-overview';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login},
    { path: 'register', component: Register},
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard]},
    { path: 'admin', component: Admin, canActivate: [authGuard]},
    { path: 'overview', component: AdminOverview, canActivate: [authGuard]}
];
