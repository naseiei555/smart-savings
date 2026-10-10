import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './features/landing/landing.component';
import { RegisterComponent } from './features/auth/register.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { GoalsListComponent } from './features/goals/goals-list.component';
import { GoalFormComponent } from './features/goals/goal-form.component';
import { GoalDetailComponent } from './features/goals/goal-detail.component';
import { NotificationsListComponent } from './features/notifications/notifications-list.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'goals', component: GoalsListComponent, canActivate: [authGuard] },
  { path: 'goals/new', component: GoalFormComponent, canActivate: [authGuard] },
  { path: 'goals/:id', component: GoalDetailComponent, canActivate: [authGuard] },
  { path: 'goals/:id/edit', component: GoalFormComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
