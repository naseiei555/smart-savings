import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { GoalService } from '../../core/services/goal.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData, Goal } from '../../core/models/goal.models';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { MascotComponent, MascotMood } from '../../shared/components/mascot.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { ThaiDatePipe } from '../../shared/pipes/thai-date.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective,
    NavbarComponent,
    MascotComponent,
    StatusBadgeComponent,
    MoneyPipe,
    ThaiDatePipe
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="container py-4">
      @if (isLoading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      } @else if (errorMessage) {
        <div class="alert alert-danger shadow-sm rounded-4">
          {{ errorMessage }}
        </div>
      } @else if (data) {
        <!-- Welcome & Mascot Advice Banner -->
        <div class="card shadow-sm border-0 rounded-4 mb-4 welcome-banner text-white">
          <div class="card-body p-4 p-md-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
            <div>
              <span class="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold mb-2">
                ✨ บันทึกการออมอัจฉริยะ
              </span>
              <h2 class="fw-bold mb-2">ยินดีต้อนรับ, {{ authService.currentUser()?.name || 'เพื่อนนักออม' }}</h2>
              <p class="mb-0 fs-6 text-light opacity-90 max-w-600">
                {{ mascotMessage }}
              </p>
            </div>
            <app-mascot [mood]="mascotMood" [size]="105"></app-mascot>
          </div>
        </div>

        <!-- 4 Summary Metric Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
              <span class="text-muted small">💰 ยอดเงินออมรวมทั้งหมด</span>
              <h3 class="fw-bold text-success my-2">{{ data.summary.total_saved | money }}</h3>
              <span class="text-muted small">จากทุกเป้าหมายที่มี</span>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
              <span class="text-muted small">🎯 เป้าหมายที่กำลังทำ</span>
              <h3 class="fw-bold text-primary my-2">{{ data.summary.active_goals }}</h3>
              <span class="text-muted small">เป้าหมายที่อยู่ระหว่างดำเนินการ</span>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
              <span class="text-muted small">🎉 บรรลุเป้าหมายแล้ว</span>
              <h3 class="fw-bold text-warning my-2">{{ data.summary.completed_goals }}</h3>
              <span class="text-muted small">เป้าหมายที่สำเร็จเรียบร้อย</span>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
              <span class="text-muted small">📅 ยอดควรออมวันนี้</span>
              <h3 class="fw-bold text-info my-2">{{ data.today_saving_total | money }}</h3>
              <span class="text-muted small">รวมทุกเป้าหมายที่ยังไม่ครบกำหนด</span>
            </div>
          </div>
        </div>

        <!-- Charts Section: 2 Charts side by side -->
        <div class="row g-4 mb-4">
          <!-- Chart 1: Target vs Saved Comparison Bar Chart -->
          <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">📊 เปรียบเทียบยอดออมกับเป้าหมาย</h5>
                <span class="badge bg-light text-muted fw-normal">รายเป้าหมาย</span>
              </div>
              <div class="card-body p-4">
                @if (barChartData.labels && barChartData.labels.length > 0) {
                  <div style="height: 280px; position: relative;">
                    <canvas 
                      baseChart
                      [data]="barChartData"
                      [options]="barChartOptions"
                      [type]="'bar'"
                    ></canvas>
                  </div>
                } @else {
                  <div class="text-center py-5 text-muted">
                    ยังไม่มีข้อมูลเป้าหมายสำหรับการสร้างกราฟ
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Chart 2: Status Breakdown Doughnut Chart -->
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">🍩 สถานะเป้าหมายทั้งหมด</h5>
                <span class="badge bg-light text-muted fw-normal">ภาพรวม</span>
              </div>
              <div class="card-body p-4 d-flex align-items-center justify-content-center">
                @if (doughnutChartData.labels && doughnutChartData.labels.length > 0) {
                  <div style="height: 260px; width: 100%; position: relative;">
                    <canvas 
                      baseChart
                      [data]="doughnutChartData"
                      [options]="doughnutChartOptions"
                      [type]="'doughnut'"
                    ></canvas>
                  </div>
                } @else {
                  <div class="text-center py-5 text-muted">
                    ยังไม่มีข้อมูลสถานะเป้าหมาย
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Deadlines & Goals Quick List -->
        <div class="row g-4">
          <!-- Upcoming Deadlines Alert -->
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
                <h5 class="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                  <span>⏳</span>
                  <span>เป้าหมายที่ใกล้ถึงกำหนด (30 วัน)</span>
                </h5>
              </div>
              <div class="card-body p-4">
                @if (data.upcoming_deadlines.length === 0) {
                  <div class="text-center py-4 text-muted small">
                    ไม่มีเป้าหมายที่ใกล้หมดเวลาใน 30 วันนี้ ยอดเยี่ยมมากครับ!
                  </div>
                } @else {
                  <div class="list-group list-group-flush">
                    @for (item of data.upcoming_deadlines; track item.id) {
                      <div class="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
                        <div>
                          <a [routerLink]="['/goals', item.id]" class="fw-bold text-decoration-none text-dark d-block">
                            {{ item.name }}
                          </a>
                          <span class="text-muted small">
                            กำหนด: {{ item.target_date | thaiDate }} &bull; คงเหลือ {{ item.remaining | money }}
                          </span>
                        </div>
                        <span class="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold">
                          อีก {{ item.days_left }} วัน
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Active Goals Grid Overview -->
          <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">🎯 เป้าหมายล่าสุดของคุณ</h5>
                <a routerLink="/goals" class="small text-decoration-none">ดูทั้งหมด →</a>
              </div>
              <div class="card-body p-4">
                @if (data.goals.length === 0) {
                  <div class="text-center py-4 text-muted">
                    คุณยังไม่มีเป้าหมายการออม 
                    <div class="mt-2">
                      <a routerLink="/goals/new" class="btn btn-primary btn-sm rounded-pill px-3">
                        ➕ สร้างเป้าหมายแรก
                      </a>
                    </div>
                  </div>
                } @else {
                  <div class="list-group list-group-flush">
                    @for (goal of data.goals.slice(0, 4); track goal.id) {
                      <div class="list-group-item px-0 py-3 border-bottom">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <a [routerLink]="['/goals', goal.id]" class="fw-bold text-decoration-none text-dark">
                            {{ goal.name }}
                          </a>
                          <app-status-badge [status]="goal.metrics.status"></app-status-badge>
                        </div>
                        <div class="d-flex justify-content-between small text-muted mb-1">
                          <span>ออมแล้ว {{ goal.metrics.current | money }}</span>
                          <span>{{ goal.metrics.progress }}%</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                          <div 
                            class="progress-bar rounded-pill" 
                            [class.bg-success]="goal.metrics.status === 'completed'"
                            [class.bg-primary]="goal.metrics.status === 'on_track'"
                            [class.bg-warning]="goal.metrics.status === 'at_risk'"
                            [class.bg-danger]="goal.metrics.status === 'behind' || goal.metrics.status === 'overdue'"
                            [style.width.%]="goal.metrics.progress > 100 ? 100 : goal.metrics.progress"
                          ></div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .welcome-banner {
      background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
    }
    .max-w-600 {
      max-width: 600px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private goalService = inject(GoalService);

  data: DashboardData | null = null;
  isLoading = true;
  errorMessage = '';

  // Bar Chart (Target vs Saved)
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('th-TH')} บาท`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => Number(v).toLocaleString('th-TH') + ' ฿'
        }
      }
    }
  };

  // Doughnut Chart (Status distribution)
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: []
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading = true;
    this.goalService.getDashboard().subscribe({
      next: (res) => {
        this.data = res;
        this.setupCharts(res);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้';
        this.isLoading = false;
      }
    });
  }

  setupCharts(dashboard: DashboardData) {
    if (!dashboard.goals || dashboard.goals.length === 0) return;

    // 1. Bar Chart Setup (Limit to first 6 goals for clarity)
    const displayGoals = dashboard.goals.slice(0, 6);
    this.barChartData = {
      labels: displayGoals.map(g => g.name),
      datasets: [
        {
          data: displayGoals.map(g => g.metrics.current),
          label: 'ออมแล้ว',
          backgroundColor: '#198754'
        },
        {
          data: displayGoals.map(g => g.target_amount),
          label: 'เป้าหมาย',
          backgroundColor: '#cfe2ff'
        }
      ]
    };

    // 2. Doughnut Chart Setup (Status breakdown)
    let completedCount = 0;
    let onTrackCount = 0;
    let atRiskCount = 0;
    let behindCount = 0;

    for (const g of dashboard.goals) {
      const s = g.metrics.status;
      if (s === 'completed') completedCount++;
      else if (s === 'on_track') onTrackCount++;
      else if (s === 'at_risk') atRiskCount++;
      else behindCount++;
    }

    this.doughnutChartData = {
      labels: ['สำเร็จแล้ว', 'ตามแผนยอดเยี่ยม', 'เริ่มช้ากว่าแผน', 'ต้องเร่งการออม'],
      datasets: [
        {
          data: [completedCount, onTrackCount, atRiskCount, behindCount],
          backgroundColor: ['#198754', '#0d6efd', '#ffc107', '#dc3545']
        }
      ]
    };
  }

  get mascotMood(): MascotMood {
    if (!this.data) return 'happy';
    if (this.data.summary.completed_goals > 0 && this.data.summary.active_goals === 0) return 'celebrating';
    if (this.data.summary.active_goals === 0) return 'thinking';
    if (this.data.upcoming_deadlines.length > 0) return 'cheering';
    return 'happy';
  }

  get mascotMessage(): string {
    if (!this.data) return '';
    if (this.data.summary.total_goals === 0) {
      return 'เริ่มต้นเส้นทางการออมของคุณวันนี้! กดปุ่ม "เพิ่มเป้าหมาย" เพื่อสร้างเป้าหมายทางการเงินแรกของคุณครับ';
    }
    if (this.data.summary.completed_goals > 0 && this.data.summary.active_goals === 0) {
      return 'ยินดีด้วยครับ! คุณบรรลุเป้าหมายการออมที่มีทั้งหมดเรียบร้อยแล้ว ยอดเยี่ยมมาก!';
    }
    if (this.data.today_saving_total > 0) {
      return `เป้าหมายการออมรวมวันนี้อยู่ที่ ${this.data.today_saving_total.toLocaleString('th-TH')} บาท อย่าลืมหยอดกระปุกหรือโอนเข้าบัญชีออมนะครับ!`;
    }
    return 'การออมอย่างสม่ำเสมอเป็นบันไดสู่ความสำเร็จทางการเงิน สู้ไปด้วยกันนะครับ!';
  }
}
