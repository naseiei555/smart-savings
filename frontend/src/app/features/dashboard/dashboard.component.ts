import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <header class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <span style="font-size: 2rem;">🐻</span>
          <div>
            <h1 class="h4 mb-0 fw-bold text-success">Smart Savings Companion</h1>
            <small class="text-muted">ยินดีต้อนรับ, {{ authService.currentUser()?.name || 'ผู้ใช้งาน' }}</small>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm rounded-pill px-3" (click)="authService.logout()">
          ออกจากระบบ
        </button>
      </header>

      <div class="row g-3 mb-4">
        <div class="col-md-12">
          <div class="card border-0 shadow-sm rounded-4 p-4" style="background: #eef7f2;">
            <div class="d-flex align-items-center gap-3">
              <span style="font-size: 3rem;">🎉</span>
              <div>
                <h2 class="h5 fw-bold mb-1">ยินดีด้วย! คุณเข้าสู่ Dashboard สำเร็จแล้ว</h2>
                <p class="text-muted mb-0 small">
                  ระบบตรวจสอบ JWT Guard ทำงานได้อย่างถูกต้อง (อีเมล: {{ authService.currentUser()?.email }})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4 text-center">
        <span style="font-size: 2.5rem;" class="mb-2">📋</span>
        <h3 class="h5 fw-bold">เป้าหมายการออมของคุณ</h3>
        <p class="text-muted small mb-3">ระบบบริหารจัดการเป้าหมายการออมจะพร้อมใช้งานเต็มรูปแบบใน Block B2</p>
        <div>
          <button class="btn btn-success rounded-pill px-4" disabled>
            + สร้างเป้าหมายการออมแรกของคุณ
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
}
