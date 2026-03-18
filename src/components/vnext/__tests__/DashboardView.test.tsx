import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardView from '@/components/vnext/DashboardView';
import { RewardPlan, TodayAction } from '@/types/flywheel';

const topPlan: RewardPlan = {
  id: 'plan-1',
  name: '升级 GPT Plus',
  description: '验证是否值得长期付费。',
  energy_cost: 120,
  current_energy: 96,
  is_redeemed: false,
  plan_type: 'one_time',
  status: 'active',
  target_date: '2026-03-31',
  motivation_note: '用真实使用强度决定是否升级。',
  priority: 1,
  created_at: '2026-03-18T00:00:00.000Z',
  updated_at: '2026-03-18T00:00:00.000Z',
  type: 'one_time',
  progress: 80,
  boundHabits: [],
  recentCompletions: [],
  completionCount: 0,
  totalCompletions: 4,
  lastCompletedAt: null,
  energyPerAction: 20,
};

const todayActions: TodayAction[] = [
  {
    habit: {
      id: 'habit-1',
      name: '完成深度工作',
      description: '深度工作 90 分钟',
      energy_value: 20,
      binding_reward_id: 'plan-1',
      frequency: 'daily',
      target_count: 1,
      is_archived: false,
      created_at: '2026-03-18T00:00:00.000Z',
      updated_at: '2026-03-18T00:00:00.000Z',
    },
    reward: topPlan,
    rewardStatus: 'active',
    impact: 40,
    currentBucketCount: 0,
    remainingCount: 1,
    isCompleted: false,
  },
  {
    habit: {
      id: 'habit-2',
      name: '写复盘笔记',
      description: '输出复盘',
      energy_value: 10,
      binding_reward_id: 'plan-1',
      frequency: 'weekly',
      target_count: 1,
      is_archived: false,
      created_at: '2026-03-18T00:00:00.000Z',
      updated_at: '2026-03-18T00:00:00.000Z',
    },
    reward: topPlan,
    rewardStatus: 'active',
    impact: 20,
    currentBucketCount: 1,
    remainingCount: 0,
    isCompleted: true,
  },
];

describe('DashboardView', () => {
  it('routes complete and undo actions through onToggleHabit', async () => {
    const user = userEvent.setup();
    const onToggleHabit = vi.fn();

    render(
      <DashboardView
        topPlan={topPlan}
        todayActions={todayActions}
        completedTodayCount={1}
        activeTodayCount={2}
        activePlansCount={1}
        totalLifetimeEnergy={120}
        topPlansByProgress={[topPlan]}
        libraryPlans={[]}
        onCreatePlan={() => {}}
        onOpenPlan={() => {}}
        onToggleHabit={onToggleHabit}
      />,
    );

    await user.click(screen.getByRole('button', { name: '完成并推进' }));
    await user.click(screen.getByRole('button', { name: '回退本次推进' }));

    expect(onToggleHabit).toHaveBeenNthCalledWith(1, 'habit-1');
    expect(onToggleHabit).toHaveBeenNthCalledWith(2, 'habit-2');
  });
});
