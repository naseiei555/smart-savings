import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { MascotComponent } from '../../shared/components/mascot.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent, MascotComponent, MoneyPipe],
  template: `
    <app-navbar></app-navbar>

    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h3 class="fw-bold mb-1">
                    {{ isEditMode ? '✏️ แก้ไขเป้าหมายการออม' : '🎯 สร้างเป้าหมายการออมใหม่' }}
                  </h3>
                  <p class="text-muted mb-0">
                    {{ isEditMode ? 'ปรับเปลี่ยนรายละเอียดเป้าหมายของคุณ' : 'กำหนดแผนและเริ่มต้นสร้างอนาคตทางการเงินที่ดี' }}
                  </p>
                </div>
                <app-mascot [mood]="previewMetrics.daily > 0 ? 'cheering' : 'thinking'" [size]="70"></app-mascot>
              </div>

              @if (errorMessage) {
                <div class="alert alert-danger shadow-sm rounded-3 mb-4">
                  {{ errorMessage }}
                </div>
              }

              <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
                <!-- Name -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">ชื่อเป้าหมาย <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    placeholder="เช่น ซื้อคอมพิวเตอร์ใหม่, กองทุนสำรองฉุกเฉิน, ทริปท่องเที่ยวญี่ปุ่น"
                    formControlName="name"
                    [class.is-invalid]="f['name'].touched && f['name'].invalid"
                  />
                  @if (f['name'].touched && f['name'].invalid) {
                    <div class="invalid-feedback">กรุณาระบุชื่อเป้าหมาย (ไม่เกิน 150 ตัวอักษร)</div>
                  }
                </div>

                <div class="row g-3 mb-3">
                  <!-- Target Amount -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">จำนวนเงินเป้าหมาย (บาท) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">฿</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="1" 
                        class="form-control" 
                        placeholder="30000"
                        formControlName="target_amount"
                        [class.is-invalid]="f['target_amount'].touched && f['target_amount'].invalid"
                      />
                    </div>
                  </div>

                  <!-- Initial Amount -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">เงินตั้งต้นที่มีอยู่แล้ว (บาท)</label>
                    <div class="input-group">
                      <span class="input-group-text">฿</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        class="form-control" 
                        placeholder="0"
                        formControlName="initial_amount"
                      />
                    </div>
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <!-- Start Date -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">วันที่เริ่มต้น <span class="text-danger">*</span></label>
                    <input 
                      type="date" 
                      class="form-control" 
                      formControlName="start_date"
                      [class.is-invalid]="f['start_date'].touched && f['start_date'].invalid"
                    />
                  </div>

                  <!-- Target Date -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">วันที่เป้าหมาย <span class="text-danger">*</span></label>
                    <input 
                      type="date" 
                      class="form-control" 
                      formControlName="target_date"
                      [class.is-invalid]="f['target_date'].touched && f['target_date'].invalid"
                    />
                  </div>
                </div>

                <!-- Financial Capacity Accordion / Optional Details -->
                <div class="border rounded-4 p-3 bg-light mb-4">
                  <h6 class="fw-bold mb-2 text-secondary">📊 ข้อมูลทางการเงินเพื่อช่วยวางแผน (ไม่บังคับ)</h6>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label small text-muted">รายได้เฉลี่ย/เดือน (บาท)</label>
                      <input type="number" step="0.01" min="0" class="form-control form-control-sm" formControlName="income" (input)="calcCapacity()" />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label small text-muted">รายจ่ายเฉลี่ย/เดือน (บาท)</label>
                      <input type="number" step="0.01" min="0" class="form-control form-control-sm" formControlName="expense" (input)="calcCapacity()" />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label small text-muted">ความสามารถในการออม/เดือน</label>
                      <input type="number" step="0.01" min="0" class="form-control form-control-sm" formControlName="saving_capacity" />
                    </div>
                  </div>
                </div>

                <!-- Live Saving Plan Preview Card -->
                <div class="card border-primary border-opacity-25 bg-primary bg-opacity-10 rounded-4 mb-4">
                  <div class="card-body p-4">
                    <h5 class="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                      <span>💡</span>
                      <span>ประมาณการแผนการออม (Live Preview)</span>
                    </h5>
                    @if (previewMetrics.days_left > 0 && previewMetrics.remaining > 0) {
                      <div class="row g-3 text-center">
                        <div class="col-6 col-md-3">
                          <div class="bg-white rounded-3 p-2 shadow-sm">
                            <span class="text-muted small d-block">ระยะเวลา</span>
                            <strong class="text-dark">{{ previewMetrics.days_left }} วัน</strong>
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <div class="bg-white rounded-3 p-2 shadow-sm">
                            <span class="text-muted small d-block">ต้องออมเพิ่ม</span>
                            <strong class="text-dark">{{ previewMetrics.remaining | money }}</strong>
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <div class="bg-white rounded-3 p-2 shadow-sm">
                            <span class="text-muted small d-block">ออมเฉลี่ย/วัน</span>
                            <strong class="text-primary">{{ previewMetrics.daily | money }}</strong>
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <div class="bg-white rounded-3 p-2 shadow-sm">
                            <span class="text-muted small d-block">ออมเฉลี่ย/เดือน</span>
                            <strong class="text-success">{{ previewMetrics.monthly | money }}</strong>
                          </div>
                        </div>
                      </div>
                    } @else if (previewMetrics.remaining <= 0 && f['target_amount'].value > 0) {
                      <div class="text-success fw-semibold">
                        🎉 เงินตั้งต้นครอบคลุมเป้าหมายแล้ว! คุณสามารถสร้างเป้าหมายเพื่อเป็นสถิติความสำเร็จได้เลย
                      </div>
                    } @else {
                      <p class="text-muted mb-0 small">
                        กรอกข้อมูลจำนวนเงินเป้าหมายและวันที่เพื่อดูแผนการออมเฉลี่ยต่อวัน/เดือนแบบเรียลไทม์
                      </p>
                    }
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex justify-content-end gap-2">
                  <a routerLink="/goals" class="btn btn-light rounded-pill px-4">ยกเลิก</a>
                  <button type="submit" class="btn btn-primary rounded-pill px-4" [disabled]="goalForm.invalid || isSubmitting">
                    @if (isSubmitting) {
                      <span class="spinner-border spinner-border-sm me-1"></span> กำลังบันทึก...
                    } @else {
                      <span>{{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกเป้าหมาย' }}</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GoalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private goalService = inject(GoalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  goalForm!: FormGroup;
  isEditMode = false;
  goalId = 0;
  isSubmitting = false;
  errorMessage = '';

  previewMetrics = {
    days_left: 0,
    remaining: 0,
    daily: 0,
    monthly: 0
  };

  get f() { return this.goalForm.controls; }

  ngOnInit() {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

    this.goalForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      target_amount: [null, [Validators.required, Validators.min(1)]],
      initial_amount: [0, [Validators.min(0)]],
      income: [0],
      expense: [0],
      saving_capacity: [0],
      start_date: [today, [Validators.required]],
      target_date: ['', [Validators.required]]
    });

    // Listen to form value changes for live preview
    this.goalForm.valueChanges.subscribe(() => {
      this.updateLivePreview();
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.isEditMode = true;
      this.goalId = Number(paramId);
      this.loadGoal(this.goalId);
    }
  }

  loadGoal(id: number) {
    this.goalService.getGoalById(id).subscribe({
      next: (g) => {
        this.goalForm.patchValue({
          name: g.name,
          target_amount: g.target_amount,
          initial_amount: g.initial_amount,
          income: g.income || 0,
          expense: g.expense || 0,
          saving_capacity: g.saving_capacity || 0,
          start_date: g.start_date.slice(0, 10),
          target_date: g.target_date.slice(0, 10)
        });
        this.updateLivePreview();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'ไม่พบข้อมูลเป้าหมาย';
      }
    });
  }

  calcCapacity() {
    const inc = Number(this.goalForm.value.income) || 0;
    const exp = Number(this.goalForm.value.expense) || 0;
    this.goalForm.patchValue({
      saving_capacity: Math.max(inc - exp, 0)
    }, { emitEvent: false });
  }

  updateLivePreview() {
    const target = Number(this.goalForm.value.target_amount) || 0;
    const initial = Number(this.goalForm.value.initial_amount) || 0;
    const startStr = this.goalForm.value.start_date;
    const targetStr = this.goalForm.value.target_date;

    if (!targetStr || !startStr || targetStr <= startStr) {
      this.previewMetrics = { days_left: 0, remaining: 0, daily: 0, monthly: 0 };
      return;
    }

    const d1 = new Date(startStr);
    const d2 = new Date(targetStr);
    const diffDays = Math.max(Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)), 1);

    const remaining = Math.max(target - initial, 0);
    const daily = diffDays > 0 ? Math.round((remaining / diffDays) * 100) / 100 : 0;
    const monthly = Math.round(daily * 30 * 100) / 100;

    this.previewMetrics = {
      days_left: diffDays,
      remaining: remaining,
      daily: daily,
      monthly: monthly
    };
  }

  onSubmit() {
    if (this.goalForm.invalid) {
      this.goalForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = this.goalForm.value;

    const op = this.isEditMode
      ? this.goalService.updateGoal(this.goalId, payload)
      : this.goalService.createGoal(payload);

    op.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.router.navigate(['/goals', res.id || this.goalId]);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
        this.isSubmitting = false;
      }
    });
  }
}
