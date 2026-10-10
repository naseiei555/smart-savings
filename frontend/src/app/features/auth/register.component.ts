import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-sm border-0 rounded-4 p-4">
            <div class="text-center mb-3">
              <span style="font-size: 2.5rem;">👋</span>
              <h2 class="h4 fw-bold mt-2">สมัครสมาชิกใหม่</h2>
              <p class="text-muted small">ยินดีต้อนรับ! มาเริ่มต้นวางแผนการออมด้วยกันนะ</p>
            </div>

            @if (errorMessage()) {
              <div class="alert alert-danger rounded-3 py-2 px-3 small mb-3">
                ⚠️ {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="name" class="form-label fw-semibold">ชื่อ-นามสกุล</label>
                <input
                  id="name"
                  type="text"
                  class="form-control form-control-lg rounded-3"
                  formControlName="name"
                  placeholder="เช่น สมชาย ใจดี"
                  maxlength="100"
                />
                @if (form.get('name')?.touched && form.get('name')?.invalid) {
                  <div class="text-danger small mt-1">กรุณากรอกชื่อ-นามสกุล (ไม่เกิน 100 ตัวอักษร)</div>
                }
              </div>

              <div class="mb-3">
                <label for="email" class="form-label fw-semibold">อีเมล</label>
                <input
                  id="email"
                  type="email"
                  class="form-control form-control-lg rounded-3"
                  formControlName="email"
                  placeholder="name@example.com"
                  maxlength="191"
                />
                @if (form.get('email')?.touched && form.get('email')?.invalid) {
                  <div class="text-danger small mt-1">กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง</div>
                }
              </div>

              <div class="mb-4">
                <label for="password" class="form-label fw-semibold">รหัสผ่าน</label>
                <input
                  id="password"
                  type="password"
                  class="form-control form-control-lg rounded-3"
                  formControlName="password"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                />
                <div class="text-muted small mt-1">รหัสผ่านความยาว 8 - 72 ไบต์</div>
                @if (passwordByteError()) {
                  <div class="text-danger small mt-1">{{ passwordByteError() }}</div>
                }
              </div>

              <div class="d-grid mb-3">
                <button
                  type="submit"
                  class="btn btn-success btn-lg rounded-pill"
                  [disabled]="form.invalid || isLoading()"
                >
                  @if (isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>กำลังสร้างบัญชี...
                  } @else {
                    สมัครสมาชิก
                  }
                </button>
              </div>

              <div class="text-center text-muted small">
                มีบัญชีอยู่แล้ว?
                <a routerLink="/login" class="text-success text-decoration-none fw-semibold">เข้าสู่ระบบที่นี่</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  passwordByteError = signal<string | null>(null);

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(191)]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { name, email, password } = this.form.value;
    const passBytes = new TextEncoder().encode(password).length;

    if (passBytes < 8) {
      this.passwordByteError.set('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (passBytes > 72) {
      this.passwordByteError.set('รหัสผ่านต้องมีขนาดไม่เกิน 72 ไบต์');
      return;
    }
    this.passwordByteError.set(null);

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register({ name: name.trim(), email: email.trim(), password }).subscribe({
      next: () => {
        // Auto-login after successful registration
        this.authService.login({ email: email.trim(), password }).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
      }
    });
  }
}
