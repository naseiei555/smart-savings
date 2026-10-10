export interface GoalMetrics {
  current: number;
  remaining: number;
  days_left: number;
  daily: number;
  weekly: number;
  monthly: number;
  progress: number;
  planned_to_date: number;
  actual_saved: number;
  ratio: number;
  status: 'completed' | 'on_track' | 'at_risk' | 'behind' | 'overdue';
  overdue: boolean;
  near_deadline: boolean;
  over_amount: number;
}

export interface Goal {
  id: number;
  user_id?: number;
  name: string;
  target_amount: number;
  initial_amount: number;
  income?: number;
  expense?: number;
  saving_capacity?: number;
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  metrics: GoalMetrics;
  transaction_count?: number;
}

export interface SavingTransaction {
  id: number;
  goal_id: number;
  amount: number;
  saving_date: string;
  note?: string;
  created_at?: string;
  metrics?: GoalMetrics;
}

export interface DashboardSummary {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_saved: number;
}

export interface UpcomingDeadline {
  id: number;
  name: string;
  days_left: number;
  target_date: string;
  remaining: number;
  status: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  today_saving_total: number;
  goals: Goal[];
  upcoming_deadlines: UpcomingDeadline[];
  latest_ai: any;
  unread_notifications: number;
}

export interface ChartSeries {
  labels: string[];
  planned: number[];
  actual: (number | null)[];
}

export interface GoalAnalysisData {
  goal: Goal;
  metrics: GoalMetrics;
  chart: ChartSeries;
  latest_ai: AIAnalysisResult | null;
}

export interface AIAnalysisResult {
  id?: number;
  goal_id: number;
  status: 'completed' | 'on_track' | 'at_risk' | 'behind' | 'overdue';
  risk_level: 'none' | 'low' | 'medium' | 'high';
  summary: string;
  recommendation: string;
  is_fallback: boolean;
  disclaimer: string;
  created_at?: string;
}

export interface NotificationItem {
  id: number;
  goal_id: number;
  goal_name?: string;
  type: string;
  channel: 'app' | 'line';
  title: string;
  message: string;
  is_read: boolean;
  notification_date: string;
  created_at: string;
}

export interface NotificationsResponse {
  unread_count: number;
  notifications: NotificationItem[];
}
