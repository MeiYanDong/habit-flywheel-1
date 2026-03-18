import type { Habit } from '@/hooks/useHabits';
import type { HabitCompletion } from '@/hooks/useHabitCompletions';
import type { Reward } from '@/hooks/useRewards';

export type PlanType = 'one_time' | 'repeatable';

export type PlanStatus =
  | 'wish'
  | 'validating'
  | 'active'
  | 'ready_to_redeem'
  | 'redeemed'
  | 'abandoned';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface HabitDraft {
  id?: string;
  name: string;
  description?: string;
  energyValue: number;
  frequency: HabitFrequency;
  targetCount: number;
}

export interface PlanDraft {
  name: string;
  description?: string;
  type: PlanType;
  energyCost: number;
  motivationNote?: string;
  targetDate?: string;
  priority: number;
  status: PlanStatus;
  habits: HabitDraft[];
}

export interface RewardPlan extends Reward {
  status: PlanStatus;
  type: PlanType;
  progress: number;
  boundHabits: Habit[];
  recentCompletions: HabitCompletion[];
  completionCount: number;
  totalCompletions: number;
  lastCompletedAt: string | null;
  energyPerAction: number;
}

export interface TodayAction {
  habit: Habit;
  reward?: Reward;
  rewardStatus: PlanStatus | 'wish';
  impact: number;
  currentBucketCount: number;
  remainingCount: number;
  isCompleted: boolean;
}

export interface HabitRankingItem {
  habit: Habit;
  completions: number;
  energy: number;
}

export interface ReviewStats {
  totalCompletions: number;
  totalPlans: number;
  validatingPlans: number;
  filteredOutPlans: number;
}

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  wish: 'flywheel.planStatus.wish',
  validating: 'flywheel.planStatus.validating',
  active: 'flywheel.planStatus.active',
  ready_to_redeem: 'flywheel.planStatus.readyToRedeem',
  redeemed: 'flywheel.planStatus.redeemed',
  abandoned: 'flywheel.planStatus.abandoned',
};

export const PLAN_STATUS_BADGE_CLASSES: Record<PlanStatus, string> = {
  wish: 'status-chip status-chip--wish',
  validating: 'status-chip status-chip--validating',
  active: 'status-chip status-chip--active',
  ready_to_redeem: 'status-chip status-chip--ready_to_redeem',
  redeemed: 'status-chip status-chip--redeemed',
  abandoned: 'status-chip status-chip--abandoned',
};

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  one_time: 'flywheel.planType.oneTime',
  repeatable: 'flywheel.planType.repeatable',
};

export const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: 'flywheel.frequency.daily',
  weekly: 'flywheel.frequency.weekly',
  monthly: 'flywheel.frequency.monthly',
};
