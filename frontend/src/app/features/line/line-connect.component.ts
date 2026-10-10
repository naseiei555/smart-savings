import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { MascotComponent } from '../../shared/components/mascot.component';

@Component({
  selector: 'app-line-connect',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, MascotComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-7">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h3 class="fw-bold mb-1 d-flex align-items-center gap-2">
                    <span style="color: #06C755;">💬</span>
                    <span>เชื่อมต่อ LINE Official Account</span>
                  </h3>
                  <p class="text-muted mb-0">รับสรุปการออมและแจ้งเตือนประจำวันผ่าน LINE</p>
                </div>
                <app-mascot [mood]="isConnected ? 'celebrating' : 'cheering'" [size]="75"></app-mascot>
              </div>

              @if (isLoading) {
                <div class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">กำลังโหลด...</span>
                  </div>
                </div>
              } @else {
                <!-- Status Banner -->
                @if (isConnected) {
                  <div class="alert alert-success d-flex align-items-center gap-3 rounded-4 p-3 mb-4">
                    <span class="fs-2">✅</span>
                    <div>
                      <h6 class="fw-bold mb-1 text-success">เชื่อมต่อบัญชี LINE เรียบร้อยแล้ว</h6>
                      <p class="mb-0 small text-secondary">
                        รหัสผู้ใช้: <code>{{ lineUserId }}</code>
                      </p>
                    </div>
                  </div>

                  <div class="card bg-light border-0 rounded-4 p-4 mb-4">
                    <h6 class="fw-bold mb-2">บริการแจ้งเตือนผ่าน LINE ที่คุณจะได้รับ:</h6>
                    <ul class="text-secondary small mb-0 ps-3">
                      <li class="mb-1">ข้อความสรุปยอดเงินออมรวมและเป้าหมายประจำวันทุกเช้า (09:00 น.)</li>
                      <li class="mb-1">เตือนเมื่อมีเป้าหมายที่ใกล้ถึงกำหนดใน 7 วันข้างหน้า</li>
                      <li>พิมพ์ <strong>"สรุป"</strong> ในแชท LINE เพื่อดูยอดออมปัจจุบันได้ตลอดเวลา</li>
                    </ul>
                  </div>

                  <div class="d-flex justify-content-between align-items-center">
                    <a routerLink="/dashboard" class="btn btn-light rounded-pill px-4">← กลับแดชบอร์ด</a>
                    <button class="btn btn-outline-danger rounded-pill px-4" (click)="disconnect()">
                      ยกเลิกการเชื่อมต่อ
                    </button>
                  </div>
                } @else {
                  <div class="card bg-light border-0 rounded-4 p-4 mb-4 text-center">
                    <h5 class="fw-bold mb-2 text-dark">ขั้นตอนการเชื่อมต่อบัญชี</h5>
                    <p class="text-muted small mb-4">
                      กดปุ่มเพื่อขอรหัสยืนยัน 6 หลัก แล้วนำไปพิมพ์ในช่องแชท LINE Official Account ของ Smart Savings
                    </p>

                    @if (linkCode) {
                      <div class="bg-white p-3 rounded-4 shadow-sm border mb-3 d-inline-block px-5">
                        <span class="text-muted small d-block mb-1">รหัสยืนยันของคุณ (หมดอายุใน 15 นาที)</span>
                        <h1 class="fw-bold text-primary tracking-widest my-2">{{ linkCode }}</h1>
                        <span class="badge bg-warning-subtle text-warning-emphasis small">
                          นำรหัสนี้ไปส่งในช่องแชท LINE
                        </span>
                      </div>
                    }

                    <div class="mt-3">
                      <button 
                        class="btn btn-lg rounded-pill px-4 text-white shadow-sm"
                        style="background-color: #06C755;"
                        (click)="generateCode()"
                        [disabled]="isGenerating"
                      >
                        @if (isGenerating) {
                          <span class="spinner-border spinner-border-sm me-1"></span> กำลังสร้างรหัส...
                        } @else {
                          <span>{{ linkCode ? '🔄 ขอรหัสใหม่' : '🔑 ขอรหัสเชื่อมต่อ LINE (OTP)' }}</span>
                        }
                      </button>
                    </div>
                  </div>

                  <div class="text-center">
                    <a routerLink="/dashboard" class="btn btn-light rounded-pill px-4">← กลับสู่แดชบอร์ด</a>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-widest {
      letter-spacing: 0.25em;
    }
  `]
})
export class LineConnectComponent implements OnInit {
  private goalService = inject(GoalService);

  isConnected = false;
  lineUserId: string | null = null;
  linkCode: string | null = null;
  isLoading = true;
  isGenerating = false;

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.isLoading = true;
    this.goalService.getLineStatus().subscribe({
      next: (res) => {
        this.isConnected = res.is_connected;
        this.lineUserId = res.line_user_id || null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  generateCode() {
    this.isGenerating = true;
    this.goalService.getLineLinkCode().subscribe({
      next: (res) => {
        this.linkCode = res.code;
        this.isGenerating = false;
      },
      error: (err) => {
        this.isGenerating = false;
        alert(err.error?.error || 'ไม่สามารถขอรหัสได้');
      }
    });
  }

  disconnect() {
    if (confirm('คุณต้องการยกเลิกการเชื่อมต่อกับบัญชี LINE ใช่หรือไม่?')) {
      this.goalService.disconnectLine().subscribe({
        next: () => {
          this.isConnected = false;
          this.lineUserId = null;
          this.linkCode = null;
          alert('ยกเลิกการเชื่อมต่อเรียบร้อยแล้ว');
        },
        error: (err) => {
          alert(err.error?.error || 'เกิดข้อผิดพลาดในการยกเลิก');
        }
      });
    }
  }
}
