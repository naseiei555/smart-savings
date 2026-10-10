import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { Goal } from '../../core/models/goal.models';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { MascotComponent } from '../../shared/components/mascot.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { ThaiDatePipe } from '../../shared/pipes/thai-date.pipe';
import { AddSavingModalComponent } from '../../shared/components/add-saving-modal.component';

@Component({
  selector: 'app-goals-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    StatusBadgeComponent,
    MascotComponent,
    MoneyPipe,
    ThaiDatePipe,
    AddSavingModalComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="container py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="fw-bold mb-1">🎯 เป้าหมายการออมของคุณ</h2>
          <p class="text-muted mb-0">ติดตามความคืบหน้าและบันทึกเงินออมได้ทุกเมื่อ</p>
        </div>
        <div class="d-flex gap-2">
          <div class="btn-group" role="group">
            <button 
              type="button" 
              class="btn" 
              [class.btn-primary]="filterStatus === 'all'" 
              [class.btn-outline-primary]="filterStatus !== 'all'"
              (click)="setFilter('all')"
            >
              ทั้งหมด
            </button>
            <button 
              type="button" 
              class="btn" 
              [class.btn-primary]="filterStatus === 'active'" 
              [class.btn-outline-primary]="filterStatus !== 'active'"
              (click)="setFilter('active')"
            >
              กำลังดำเนินการ
            </button>
            <button 
              type="button" 
              class="btn" 
              [class.btn-primary]="filterStatus === 'completed'" 
              [class.btn-outline-primary]="filterStatus !== 'completed'"
              (click)="setFilter('completed')"
            >
              สำเร็จแล้ว
            </button>
          </div>
          <a routerLink="/goals/new" class="btn btn-success d-flex align-items-center gap-2">
            <span>➕</span>
            <span>เพิ่มเป้าหมาย</span>
          </a>
        </div>
      </div>

      @if (isLoading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">กำลังโหลด...</span>
          </div>
        </div>
      } @else if (errorMessage) {
        <div class="alert alert-danger shadow-sm rounded-4">
          {{ errorMessage }}
        </div>
      } @else if (filteredGoals.length === 0) {
        <div class="card shadow-sm border-0 rounded-4 text-center py-5">
          <div class="card-body">
            <app-mascot mood="thinking" [size]="100" speech="ยังไม่พบเป้าหมายที่เลือกเลย เริ่มสร้างเป้าหมายกันเถอะ!"></app-mascot>
            <h5 class="fw-bold mt-4 mb-2">ยังไม่มีเป้าหมายในรายการนี้</h5>
            <p class="text-muted mb-4">กำหนดเป้าหมายเพื่อสร้างวินัยการออมไปด้วยกัน</p>
            <a routerLink="/goals/new" class="btn btn-primary rounded-pill px-4">
              🎯 สร้างเป้าหมายแรกของคุณ
            </a>
          </div>
        </div>
      } @else {
        <div class="row g-4">
          @for (goal of filteredGoals; track goal.id) {
            <div class="col-md-6 col-lg-4">
              <div class="card h-100 shadow-sm border-0 rounded-4 goal-card">
                <div class="card-body d-flex flex-column p-4">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="fw-bold mb-0 text-truncate pe-2" [title]="goal.name">{{ goal.name }}</h5>
                    <app-status-badge [status]="goal.metrics.status"></app-status-badge>
                  </div>

                  <p class="text-muted small mb-3">
                    กำหนดเวลา: {{ goal.target_date | thaiDate }} 
                    <span class="ms-1 badge bg-light text-secondary">
                      @if (goal.metrics.days_left > 0) {
                        เหลืออีก {{ goal.metrics.days_left }} วัน
                      } @else if (goal.metrics.days_left === 0) {
                        ครบกำหนดวันนี้
                      } @else {
                        เลยกำหนดแล้ว
                      }
                    </span>
                  </p>

                  <!-- Progress Bar -->
                  <div class="mb-3">
                    <div class="d-flex justify-content-between small mb-1">
                      <span class="text-muted">ความคืบหน้า</span>
                      <strong class="text-primary">{{ goal.metrics.progress }}%</strong>
                    </div>
                    <div class="progress" style="height: 10px;">
                      <div 
                        class="progress-bar rounded-pill" 
                        [class.bg-success]="goal.metrics.status === 'completed'"
                        [class.bg-primary]="goal.metrics.status === 'on_track'"
                        [class.bg-warning]="goal.metrics.status === 'at_risk'"
                        [class.bg-danger]="goal.metrics.status === 'behind' || goal.metrics.status === 'overdue'"
                        role="progressbar" 
                        [style.width.%]="goal.metrics.progress > 100 ? 100 : goal.metrics.progress"
                      ></div>
                    </div>
                  </div>

                  <!-- Amount details -->
                  <div class="bg-light rounded-3 p-3 mb-3">
                    <div class="d-flex justify-content-between mb-1 small">
                      <span class="text-muted">ออมแล้ว:</span>
                      <strong class="text-success">{{ goal.metrics.current | money }}</strong>
                    </div>
                    <div class="d-flex justify-content-between small">
                      <span class="text-muted">เป้าหมาย:</span>
                      <span class="fw-semibold">{{ goal.target_amount | money }}</span>
                    </div>
                    @if (goal.metrics.remaining > 0) {
                      <hr class="my-2 border-secondary-subtle">
                      <div class="d-flex justify-content-between small text-muted">
                        <span>ออมเฉลี่ย/วัน:</span>
                        <span>{{ goal.metrics.daily | money }}</span>
                      </div>
                    }
                  </div>

                  <!-- Card Actions -->
                  <div class="mt-auto d-flex gap-2">
                    <button 
                      class="btn btn-sm btn-outline-success flex-grow-1 rounded-pill"
                      (click)="openAddSaving(goal)"
                      [disabled]="goal.status === 'completed'"
                    >
                      💰 บันทึกออม
                    </button>
                    <a [routerLink]="['/goals', goal.id]" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                      ดูแผนงาน
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Add Saving Modal -->
    <app-add-saving-modal
      [isOpen]="isModalOpen"
      [goalId]="selectedGoalId"
      [goalName]="selectedGoalName"
      (closed)="isModalOpen = false"
      (saved)="onSavingAdded($event)"
    ></app-add-saving-modal>
  `,
  styles: [`
    .goal-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .goal-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
    }
  `]
})
export class GoalsListComponent implements OnInit {
  private goalService = inject(GoalService);

  goals: Goal[] = [];
  filteredGoals: Goal[] = [];
  filterStatus: 'all' | 'active' | 'completed' = 'all';
  isLoading = true;
  errorMessage = '';

  // Modal state
  isModalOpen = false;
  selectedGoalId = 0;
  selectedGoalName = '';

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.isLoading = true;
    this.goalService.getGoals().subscribe({
      next: (data) => {
        this.goals = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'ไม่สามารถโหลดข้อมูลเป้าหมายได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoading = false;
      }
    });
  }

  setFilter(status: 'all' | 'active' | 'completed') {
    this.filterStatus = status;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterStatus === 'all') {
      this.filteredGoals = this.goals;
    } else {
      this.filteredGoals = this.goals.filter(g => g.status === this.filterStatus);
    }
  }

  openAddSaving(goal: Goal) {
    this.selectedGoalId = goal.id;
    this.selectedGoalName = goal.name;
    this.isModalOpen = true;
  }

  onSavingAdded(payload: { goalId: number; amount: number; saving_date: string; note?: string }) {
    this.goalService.addSaving(payload.goalId, payload).subscribe({
      next: () => {
        this.isModalOpen = false;
        this.loadGoals();
      },
      error: (err) => {
        alert(err.error?.error || 'เกิดข้อผิดพลาดในการบันทึกการออม');
      }
    });
  }
}
