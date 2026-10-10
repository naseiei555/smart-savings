import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-saving-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow border-0 rounded-4">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold text-success d-flex align-items-center gap-2">
                <span>💰</span>
                <span>บันทึกการออมเงิน</span>
              </h5>
              <button type="button" class="btn-close" (click)="close()"></button>
            </div>
            <div class="modal-body pt-3">
              <p class="text-muted small mb-3">
                เป้าหมาย: <strong>{{ goalName }}</strong>
              </p>

              @if (errorMessage) {
                <div class="alert alert-danger py-2 small rounded-3">
                  {{ errorMessage }}
                </div>
              }

              <form (ngSubmit)="submit()">
                <div class="mb-3">
                  <label class="form-label small fw-semibold">จำนวนเงินที่ออม (บาท) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">฿</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      max="10000000"
                      class="form-control form-control-lg fw-bold text-success" 
                      placeholder="0.00" 
                      [(ngModel)]="amount" 
                      name="amount" 
                      required
                      autofocus
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">วันที่ออม <span class="text-danger">*</span></label>
                  <input 
                    type="date" 
                    class="form-control" 
                    [(ngModel)]="savingDate" 
                    name="savingDate" 
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">บันทึกช่วยจำ (ไม่บังคับ)</label>
                  <input 
                    type="text" 
                    maxlength="200" 
                    class="form-control" 
                    placeholder="เช่น เงินเหลือจากค่าอาหาร, ได้รับเงินพิเศษ" 
                    [(ngModel)]="note" 
                    name="note"
                  />
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-light rounded-pill px-4" (click)="close()" [disabled]="isLoading">
                    ยกเลิก
                  </button>
                  <button type="submit" class="btn btn-success rounded-pill px-4" [disabled]="isLoading || !amount || amount <= 0">
                    @if (isLoading) {
                      <span class="spinner-border spinner-border-sm me-1"></span> กำลังบันทึก...
                    } @else {
                      <span>บันทึกการออม</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.45);
    }
  `]
})
export class AddSavingModalComponent {
  @Input() isOpen = false;
  @Input() goalId = 0;
  @Input() goalName = '';
  @Output() saved = new EventEmitter<{ goalId: number; amount: number; saving_date: string; note?: string }>();
  @Output() closed = new EventEmitter<void>();

  amount: number | null = null;
  savingDate: string = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  note = '';
  isLoading = false;
  errorMessage = '';

  close() {
    this.errorMessage = '';
    this.amount = null;
    this.note = '';
    this.closed.emit();
  }

  submit() {
    if (!this.amount || this.amount <= 0) {
      this.errorMessage = 'กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)';
      return;
    }
    if (!this.savingDate) {
      this.errorMessage = 'กรุณาระบุวันที่ออม';
      return;
    }

    this.errorMessage = '';
    this.saved.emit({
      goalId: this.goalId,
      amount: Number(this.amount),
      saving_date: this.savingDate,
      note: this.note.trim() || undefined
    });
  }
}
