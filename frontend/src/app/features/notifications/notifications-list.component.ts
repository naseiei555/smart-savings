import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { NotificationItem } from '../../core/models/goal.models';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { MascotComponent } from '../../shared/components/mascot.component';
import { ThaiDatePipe } from '../../shared/pipes/thai-date.pipe';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, MascotComponent, ThaiDatePipe],
  template: `
    <app-navbar></app-navbar>

    <div class="container py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="fw-bold mb-1">🔔 ศูนย์การแจ้งเตือน</h2>
          <p class="text-muted mb-0">ติดตามข่าวสารการออมและเตือนความจำเพื่อไม่ให้พลาดเป้าหมาย</p>
        </div>
        <div class="d-flex gap-2">
          <button 
            class="btn btn-outline-primary rounded-pill px-3" 
            (click)="triggerReminders()"
            [disabled]="isTriggering"
          >
            @if (isTriggering) {
              <span class="spinner-border spinner-border-sm me-1"></span> กำลังตรวจสอบ...
            } @else {
              <span>🔄 ตรวจสอบและเตือนวันนี้</span>
            }
          </button>
          <button 
            class="btn btn-light rounded-pill px-3" 
            (click)="markAllAsRead()"
            [disabled]="unreadCount === 0 || isLoading"
          >
            ✓ อ่านทั้งหมดแล้ว
          </button>
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
      } @else if (notifications.length === 0) {
        <div class="card shadow-sm border-0 rounded-4 text-center py-5">
          <div class="card-body">
            <app-mascot mood="happy" [size]="90" speech="ไม่มีการแจ้งเตือนค้างอยู่เลย ทุกอย่างเรียบร้อยดีมากครับ!"></app-mascot>
            <h5 class="fw-bold mt-4 mb-2">ยังไม่มีรายการแจ้งเตือน</h5>
            <p class="text-muted mb-4">ระบบจะส่งข้อความแจ้งเตือนเมื่อใกล้ถึงกำหนดหรือเมื่อบรรลุเป้าหมาย</p>
            <a routerLink="/dashboard" class="btn btn-primary rounded-pill px-4">
              กลับสู่แดชบอร์ด
            </a>
          </div>
        </div>
      } @else {
        <div class="row justify-content-center">
          <div class="col-lg-9">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div class="list-group list-group-flush">
                @for (item of notifications; track item.id) {
                  <div 
                    class="list-group-item p-4 d-flex align-items-start gap-3 border-bottom transition-all"
                    [class.bg-light]="item.is_read"
                    [class.border-start-primary]="!item.is_read"
                  >
                    <div class="fs-3">
                      @if (item.type === 'goal_completed') {
                        🎉
                      } @else if (item.type === 'deadline_warning') {
                        ⏳
                      } @else {
                        📅
                      }
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <h6 class="fw-bold mb-0" [class.text-primary]="!item.is_read">
                          {{ item.title }}
                          @if (!item.is_read) {
                            <span class="badge bg-primary-subtle text-primary ms-2 rounded-pill small">ใหม่</span>
                          }
                        </h6>
                        <span class="text-muted small">{{ item.notification_date | thaiDate }}</span>
                      </div>
                      <p class="text-secondary mb-2 small fs-6">{{ item.message }}</p>
                      <div class="d-flex align-items-center gap-3">
                        <a [routerLink]="['/goals', item.goal_id]" class="small text-decoration-none fw-semibold">
                          🎯 ไปยังเป้าหมาย: {{ item.goal_name || 'ดูเป้าหมาย' }} →
                        </a>
                        @if (!item.is_read) {
                          <button class="btn btn-sm btn-link p-0 text-muted small text-decoration-none" (click)="markAsRead(item.id)">
                            ทำเครื่องหมายว่าอ่านแล้ว
                          </button>
                        }
                      </div>
                    </div>
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
    .border-start-primary {
      border-left: 4px solid #0d6efd !important;
      background-color: #f8faff;
    }
    .transition-all {
      transition: all 0.2s ease;
    }
  `]
})
export class NotificationsListComponent implements OnInit {
  private goalService = inject(GoalService);

  notifications: NotificationItem[] = [];
  unreadCount = 0;
  isLoading = true;
  isTriggering = false;
  errorMessage = '';

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.goalService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res.notifications;
        this.unreadCount = res.unread_count;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'ไม่สามารถโหลดรายการแจ้งเตือนได้';
        this.isLoading = false;
      }
    });
  }

  markAsRead(id: number) {
    this.goalService.markNotificationRead(id).subscribe({
      next: () => {
        const item = this.notifications.find(n => n.id === id);
        if (item && !item.is_read) {
          item.is_read = true;
          this.unreadCount = Math.max(this.unreadCount - 1, 0);
        }
      }
    });
  }

  markAllAsRead() {
    this.goalService.markAllNotificationsRead().subscribe({
      next: () => {
        for (const item of this.notifications) {
          item.is_read = true;
        }
        this.unreadCount = 0;
      }
    });
  }

  triggerReminders() {
    this.isTriggering = true;
    this.goalService.triggerReminders().subscribe({
      next: (res) => {
        this.isTriggering = false;
        alert(`ตรวจสอบเรียบร้อย: มีการสร้างแจ้งเตือนใหม่ ${res.generated_count} รายการ`);
        this.loadNotifications();
      },
      error: (err) => {
        this.isTriggering = false;
        alert(err.error?.error || 'เกิดข้อผิดพลาดในการตรวจสอบ');
      }
    });
  }
}
