import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass">
      <span class="badge-icon me-1">{{ icon }}</span>
      <span>{{ label }}</span>
    </span>
  `,
  styles: [`
    .badge-completed {
      background-color: #d1e7dd;
      color: #0f5132;
      border: 1px solid #badbcc;
      padding: 0.35rem 0.65rem;
      border-radius: 50rem;
      font-weight: 500;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
    }
    .badge-on-track {
      background-color: #cfe2ff;
      color: #084298;
      border: 1px solid #b6d4fe;
      padding: 0.35rem 0.65rem;
      border-radius: 50rem;
      font-weight: 500;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
    }
    .badge-at-risk {
      background-color: #fff3cd;
      color: #664d03;
      border: 1px solid #ffecb5;
      padding: 0.35rem 0.65rem;
      border-radius: 50rem;
      font-weight: 500;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
    }
    .badge-behind {
      background-color: #f8d7da;
      color: #842029;
      border: 1px solid #f5c2c7;
      padding: 0.35rem 0.65rem;
      border-radius: 50rem;
      font-weight: 500;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
    }
    .badge-overdue {
      background-color: #f8d7da;
      color: #842029;
      border: 1px solid #df9da2;
      padding: 0.35rem 0.65rem;
      border-radius: 50rem;
      font-weight: 600;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: 'completed' | 'on_track' | 'at_risk' | 'behind' | 'overdue' | string = 'on_track';

  get badgeClass(): string {
    switch (this.status) {
      case 'completed': return 'badge-completed';
      case 'on_track': return 'badge-on-track';
      case 'at_risk': return 'badge-at-risk';
      case 'behind': return 'badge-behind';
      case 'overdue': return 'badge-overdue';
      default: return 'badge-on-track';
    }
  }

  get icon(): string {
    switch (this.status) {
      case 'completed': return '🎉';
      case 'on_track': return '✨';
      case 'at_risk': return '⚠️';
      case 'behind': return '💪';
      case 'overdue': return '⏳';
      default: return '📌';
    }
  }

  get label(): string {
    switch (this.status) {
      case 'completed': return 'บรรลุเป้าหมายแล้ว';
      case 'on_track': return 'ตามแผนยอดเยี่ยม';
      case 'at_risk': return 'เริ่มช้ากว่าแผน';
      case 'behind': return 'ต้องเร่งการออม';
      case 'overdue': return 'เลยกำหนดเป้าหมาย';
      default: return 'กำลังดำเนินการ';
    }
  }
}
