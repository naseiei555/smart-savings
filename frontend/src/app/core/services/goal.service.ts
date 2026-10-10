import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Goal, 
  SavingTransaction, 
  DashboardData, 
  GoalAnalysisData, 
  AIAnalysisResult, 
  NotificationsResponse 
} from '../models/goal.models';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  getGoals(status?: 'active' | 'completed'): Observable<Goal[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Goal[]>(`${this.apiUrl}/goals`, { params });
  }

  getGoalById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.apiUrl}/goals/${id}`);
  }

  createGoal(payload: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(`${this.apiUrl}/goals`, payload);
  }

  updateGoal(id: number, payload: Partial<Goal>): Observable<Goal> {
    return this.http.put<Goal>(`${this.apiUrl}/goals/${id}`, payload);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/goals/${id}`);
  }

  getSavings(goalId: number): Observable<SavingTransaction[]> {
    return this.http.get<SavingTransaction[]>(`${this.apiUrl}/goals/${goalId}/savings`);
  }

  addSaving(goalId: number, payload: { amount: number; saving_date: string; note?: string }): Observable<SavingTransaction> {
    return this.http.post<SavingTransaction>(`${this.apiUrl}/goals/${goalId}/savings`, payload);
  }

  deleteSaving(savingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/savings/${savingId}`);
  }

  getGoalAnalysis(goalId: number): Observable<GoalAnalysisData> {
    return this.http.get<GoalAnalysisData>(`${this.apiUrl}/goals/${goalId}/analysis`);
  }

  triggerAIAnalysis(goalId: number): Observable<AIAnalysisResult> {
    return this.http.post<AIAnalysisResult>(`${this.apiUrl}/goals/${goalId}/analyze`, {});
  }

  getNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications`);
  }

  markNotificationRead(id: number): Observable<{ success: boolean; id: number }> {
    return this.http.put<{ success: boolean; id: number }>(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/notifications/read-all`, {});
  }

  triggerReminders(): Observable<{ success: boolean; generated_count: number; date: string }> {
    return this.http.post<{ success: boolean; generated_count: number; date: string }>(`${this.apiUrl}/notifications/trigger-reminders`, {});
  }
}
