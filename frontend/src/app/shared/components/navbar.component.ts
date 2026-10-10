import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" routerLink="/dashboard">
          <span>🌱</span>
          <span>Smart Savings</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-nav">☰</span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                📊 แดชบอร์ด
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/goals" routerLinkActive="active">
                🎯 เป้าหมายทั้งหมด
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/goals/new" routerLinkActive="active">
                ➕ เพิ่มเป้าหมาย
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/notifications" routerLinkActive="active">
                🔔 การแจ้งเตือน
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-3">
            @if (authService.currentUser(); as user) {
              <span class="text-light small">
                สวัสดี, <strong>{{ user.name }}</strong>
              </span>
            }
            <button class="btn btn-sm btn-outline-light" (click)="logout()">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link.active {
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
