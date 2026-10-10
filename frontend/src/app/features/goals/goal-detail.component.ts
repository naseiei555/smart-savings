import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { GoalService } from '../../core/services/goal.service';
import { Goal, GoalAnalysisData, SavingTransaction } from '../../core/models/goal.models';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { MascotComponent, MascotMood } from '../../shared/components/mascot.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { ThaiDatePipe } from '../../shared/pipes/thai-date.pipe';
import { AddSavingModalComponent } from '../../shared/components/add-saving-modal.component';

@Component({
  selector: 'app-goal-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective,
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
      @if (isLoading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">กำลังโหลด...</span>
          </div>
        </div>
      } @else if (errorMessage) {
        <div class="alert alert-danger shadow-sm rounded-4">
          {{ errorMessage }}
          <div class="mt-2">
            <a routerLink="/goals" class="btn btn-sm btn-outline-danger">กลับหน้ารายการ</a>
          </div>
        </div>
      } @else if (goal) {
        <!-- Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <a routerLink="/goals" class="text-decoration-none text-secondary">🎯 เป้าหมาย</a>
              <span class="text-muted">/</span>
              <h3 class="fw-bold mb-0">{{ goal.name }}</h3>
              <app-status-badge [status]="goal.metrics.status"></app-status-badge>
            </div>
            <p class="text-muted mb-0 small">
              เริ่มต้น: {{ goal.start_date | thaiDate }} &bull; เป้าหมาย: {{ goal.target_date | thaiDate }}
            </p>
          </div>
          <div class="d-flex gap-2">
            <button 
              class="btn btn-success rounded-pill px-4"
              (click)="isAddSavingOpen = true"
              [disabled]="goal.status === 'completed'"
            >
              💰 บันทึกออมเงิน
            </button>
            <a [routerLink]="['/goals', goal.id, 'edit']" class="btn btn-outline-secondary rounded-pill px-3">
              ✏️ แก้ไข
            </a>
            <button class="btn btn-outline-danger rounded-pill px-3" (click)="confirmDelete()">
              🗑️ ลบ
            </button>
          </div>
        </div>

        <!-- Mascot Advice Box -->
        <div class="card shadow-sm border-0 rounded-4 mb-4 bg-gradient-light">
          <div class="card-body p-4 d-flex flex-column flex-md-row align-items-center gap-4">
            <app-mascot [mood]="mascotMood" [size]="90"></app-mascot>
            <div class="flex-grow-1 text-center text-md-start">
              <h5 class="fw-bold mb-1 text-primary">คำแนะนำจากเพื่อนช่วยออม</h5>
              <p class="mb-0 text-secondary fs-6">{{ mascotMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Key Metrics Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 text-center">
              <span class="text-muted small">ออมได้แล้ว</span>
              <h4 class="fw-bold text-success my-1">{{ goal.metrics.current | money }}</h4>
              <span class="text-muted small">จากเป้าหมาย {{ goal.target_amount | money }}</span>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 text-center">
              <span class="text-muted small">ความคืบหน้า</span>
              <h4 class="fw-bold text-primary my-1">{{ goal.metrics.progress }}%</h4>
              <div class="progress mt-1" style="height: 6px;">
                <div class="progress-bar rounded-pill" [style.width.%]="goal.metrics.progress > 100 ? 100 : goal.metrics.progress"></div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 text-center">
              <span class="text-muted small">ต้องออมเพิ่มอีก</span>
              <h4 class="fw-bold text-dark my-1">{{ goal.metrics.remaining | money }}</h4>
              <span class="text-muted small">
                @if (goal.metrics.days_left > 0) {
                  เหลืออีก {{ goal.metrics.days_left }} วัน
                } @else {
                  ครบกำหนดแล้ว
                }
              </span>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 text-center">
              <span class="text-muted small">แผนออมเฉลี่ย</span>
              <h4 class="fw-bold text-info my-1">{{ goal.metrics.daily | money }}</h4>
              <span class="text-muted small">ต่อวัน ({{ goal.metrics.weekly | money }}/สัปดาห์)</span>
            </div>
          </div>
        </div>

        <!-- Progress Chart (Planned vs Actual) -->
        <div class="card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">📈 กราฟเปรียบเทียบแผนการออม (Planned vs Actual)</h5>
            <span class="badge bg-light text-muted fw-normal">รายสัปดาห์</span>
          </div>
          <div class="card-body p-4">
            @if (chartData && chartData.labels && chartData.labels.length > 0) {
              <div style="height: 320px; position: relative;">
                <canvas 
                  baseChart
                  [data]="chartData"
                  [options]="chartOptions"
                  [type]="'line'"
                ></canvas>
              </div>
            } @else {
              <div class="text-center py-4 text-muted">กำลังเตรียมข้อมูลกราฟ...</div>
            }
          </div>
        </div>

        <!-- Savings History Section -->
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">📝 ประวัติการออมเงิน</h5>
            <span class="badge bg-light text-secondary">{{ savings.length }} รายการ</span>
          </div>
          <div class="card-body p-4">
            @if (savings.length === 0) {
              <div class="text-center py-4 text-muted">
                ยังไม่มีบันทึกการออม กดปุ่ม <strong>"💰 บันทึกออมเงิน"</strong> ด้านบนเพื่อเริ่มต้น
              </div>
            } @else {
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>วันที่ออม</th>
                      <th>จำนวนเงิน</th>
                      <th>บันทึกช่วยจำ</th>
                      <th class="text-end">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of savings; track s.id) {
                      <tr>
                        <td>{{ s.saving_date | thaiDate }}</td>
                        <td class="fw-bold text-success">+{{ s.amount | money }}</td>
                        <td class="text-muted small">{{ s.note || '-' }}</td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-outline-danger border-0" (click)="deleteSaving(s.id)" title="ลบรายการ">
                            ✕ ลบ
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Add Saving Modal -->
    @if (goal) {
      <app-add-saving-modal
        [isOpen]="isAddSavingOpen"
        [goalId]="goal.id"
        [goalName]="goal.name"
        (closed)="isAddSavingOpen = false"
        (saved)="onSavingAdded($event)"
      ></app-add-saving-modal>
    }
  `,
  styles: [`
    .bg-gradient-light {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
  `]
})
export class GoalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private goalService = inject(GoalService);

  goalId = 0;
  goal: Goal | null = null;
  savings: SavingTransaction[] = [];
  isLoading = true;
  errorMessage = '';

  isAddSavingOpen = false;

  // Chart configuration
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'inherit', size: 13 } }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            return ` ${context.dataset.label}: ${val !== null ? val.toLocaleString('th-TH') + ' บาท' : '-'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Number(value).toLocaleString('th-TH') + ' ฿'
        }
      }
    }
  };

  ngOnInit() {
    this.goalId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.goalId) {
      this.loadGoalData();
    }
  }

  loadGoalData() {
    this.isLoading = true;
    this.goalService.getGoalById(this.goalId).subscribe({
      next: (g) => {
        this.goal = g;
        this.loadSavingsAndAnalysis();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'ไม่พบข้อมูลเป้าหมาย';
        this.isLoading = false;
      }
    });
  }

  loadSavingsAndAnalysis() {
    this.goalService.getSavings(this.goalId).subscribe({
      next: (txs) => {
        this.savings = txs;
      }
    });

    this.goalService.getGoalAnalysis(this.goalId).subscribe({
      next: (analysis) => {
        this.chartData = {
          labels: analysis.chart.labels,
          datasets: [
            {
              data: analysis.chart.planned,
              label: 'แผนการออม (Planned)',
              borderColor: '#6c757d',
              borderDash: [5, 5],
              fill: false,
              tension: 0.1,
              pointRadius: 2
            },
            {
              data: analysis.chart.actual,
              label: 'เงินออมจริง (Actual)',
              borderColor: '#198754',
              backgroundColor: 'rgba(25, 135, 84, 0.1)',
              fill: true,
              tension: 0.2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get mascotMood(): MascotMood {
    if (!this.goal) return 'happy';
    const s = this.goal.metrics.status;
    if (s === 'completed') return 'celebrating';
    if (s === 'on_track') return 'happy';
    if (s === 'at_risk') return 'worried';
    if (s === 'behind' || s === 'overdue') return 'cheering';
    return 'thinking';
  }

  get mascotMessage(): string {
    if (!this.goal) return '';
    const m = this.goal.metrics;
    if (m.status === 'completed') {
      return `ยอดเยี่ยมที่สุดเลย! คุณบรรลุเป้าหมาย ${this.goal.name} ครบ ${m.current.toLocaleString('th-TH')} บาทแล้ว 🎉`;
    }
    if (m.status === 'on_track') {
      return `เก่งมากครับ! การออมของคุณกำลังเป็นไปตามแผนอย่างสม่ำเสมอ ออมวันละ ${m.daily.toLocaleString('th-TH')} บาท อีกเพียง ${m.days_left} วันก็จะสำเร็จแล้ว!`;
    }
    if (m.status === 'at_risk') {
      return `การออมเริ่มช้ากว่าแผนเล็กน้อย ลองมองหาเงินเก็บเศษหรือลดค่าใช้จ่ายไม่จำเป็นเพื่อเร่งตามแผนนะครับ`;
    }
    if (m.status === 'overdue') {
      return `เป้าหมายเลยกำหนดมาแล้ว แต่ไม่ต้องกังวลนะครับ คุณสามารถขยายเวลาหรือปรับแผนการออมใหม่ได้เสมอ`;
    }
    return `อย่าเพิ่งท้อนะ! ทุกการออมแม้เพียงเล็กน้อยล้วนมีความหมาย ค่อย ๆ ออมวันละนิด สู้ ๆ ครับ!`;
  }

  onSavingAdded(payload: { goalId: number; amount: number; saving_date: string; note?: string }) {
    this.goalService.addSaving(payload.goalId, payload).subscribe({
      next: () => {
        this.isAddSavingOpen = false;
        this.loadGoalData();
      },
      error: (err) => {
        alert(err.error?.error || 'เกิดข้อผิดพลาดในการบันทึกการออม');
      }
    });
  }

  deleteSaving(savingId: number) {
    if (confirm('คุณต้องการลบรายการออมนี้ใช่หรือไม่? ยอดเงินสะสมจะถูกคำนวณใหม่')) {
      this.goalService.deleteSaving(savingId).subscribe({
        next: () => {
          this.loadGoalData();
        },
        error: (err) => {
          alert(err.error?.error || 'ไม่สามารถลบรายการได้');
        }
      });
    }
  }

  confirmDelete() {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "${this.goal?.name}"? ประวัติการออมทั้งหมดในเป้าหมายนี้จะถูกลบด้วย`)) {
      this.goalService.deleteGoal(this.goalId).subscribe({
        next: () => {
          this.router.navigate(['/goals']);
        },
        error: (err) => {
          alert(err.error?.error || 'ไม่สามารถลบเป้าหมายได้');
        }
      });
    }
  }
}
