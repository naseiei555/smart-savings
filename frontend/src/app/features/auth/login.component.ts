import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-sm border-0 rounded-4 p-4">
            <div class="text-center mb-3">
              <span style="font-size: 2.5rem;">🔐 🐻</span>
              <h2 class="h4 fw-bold mt-2">เข้าสู่ระบบ</h2>
              <p class="text-muted small">ยินดีต้อนรับกลับมา! พร้อมออมเงินไปด้วยกันนะ</p>
            </div>

            @if (errorMessage()) {
              <div class="alert alert-danger rounded-3 py-2 px-3 small mb-3">
                ⚠️ {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="email" class="form-label fw-semibold">อีเมล</label>
                <input
                  id="email"
                  type="email"
                  class="form-control form-control-lg rounded-3"
                  formControlName="email"
                  placeholder="name@example.com"
                />
              </div>

              <div class="mb-4">
                <label for="password" class="form-label fw-semibold">รหัสผ่าน</label>
                <input
                  id="password"
                  type="password"
                  class="form-control form-control-lg rounded-3"
                  formControlName="password"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </div>

              <div class="d-grid mb-3">
                <button
                  type="submit"
                  class="btn btn-success btn-lg rounded-pill"
                  [disabled]="form.invalid || isLoading()"
                >
                  @if (isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>กำลังเข้าสู่ระบบ...
                  } @else {
                    เข้าสู่ระบบ
                  }
                </button>
              </div>

              <div class="text-center text-muted small">
                ยังไม่มีบัญชีผู้ใช้?
                <a routerLink="/register" class="text-success text-decoration-none fw-semibold">สมัครสมาชิกที่นี่</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.value;

    this.authService.login({ email: email.trim(), password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    });
  }
}
