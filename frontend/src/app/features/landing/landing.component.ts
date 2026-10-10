import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm border-0 rounded-4 p-4 mb-4" style="background: #f8faf9;">
            <div class="mb-3">
              <span style="font-size: 4rem;">👋 🐻</span>
            </div>
            <h1 class="h3 fw-bold text-success mb-2">Smart Savings Companion</h1>
            <p class="text-secondary mb-4">"เพื่อนช่วยออม เพื่อไปถึงเป้าหมาย"</p>
            <p class="mb-4 text-muted">
              กำหนดเป้าหมาย วางแผนการออมเงินอย่างชาญฉลาด และติดตามผลลัพธ์ได้อย่างแม่นยำและเป็นมิตร
            </p>
            <div class="d-grid gap-2">
              <a routerLink="/register" class="btn btn-success btn-lg rounded-pill shadow-sm py-2">
                เริ่มต้นใช้งานฟรี (สมัครสมาชิก)
              </a>
              <a routerLink="/login" class="btn btn-outline-success btn-lg rounded-pill py-2">
                เข้าสู่ระบบ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent {}
