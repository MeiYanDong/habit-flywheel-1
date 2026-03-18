import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanDetailDialog from '@/components/PlanDetailDialog';
import { Habit } from '@/hooks/useHabits';
import { RewardPlan } from '@/types/flywheel';

const habits: Habit[] = [
  {
    id: 'habit-bound',
    name: '完成深度工作',
    description: '单次深度工作 90 分钟',
    energy_value: 20,
    binding_reward_id: 'plan-1',
    frequency: 'daily',
    target_count: 1,
    is_archived: false,
    created_at: '2026-03-18T00:00:00.000Z',
    updated_at: '2026-03-18T00:00:00.000Z',
  },
  {
    id: 'habit-free',
    name: '整理复盘笔记',
    description: '输出本周复盘',
    energy_value: 15,
    binding_reward_id: null,
    frequency: 'weekly',
    target_count: 1,
    is_archived: false,
    created_at: '2026-03-18T00:00:00.000Z',
    updated_at: '2026-03-18T00:00:00.000Z',
  },
];

const plan: RewardPlan = {
  id: 'plan-1',
  name: '升级 GPT Plus',
  description: '把高价值使用频率拉起来后再决定是否升级。',
  energy_cost: 120,
  current_energy: 90,
  is_redeemed: false,
  plan_type: 'one_time',
  status: 'active',
  target_date: '2026-03-31',
  motivation_note: '先验证需求，再决定付费。',
  priority: 1,
  created_at: '2026-03-18T00:00:00.000Z',
  updated_at: '2026-03-18T00:00:00.000Z',
  type: 'one_time',
  progress: 75,
  boundHabits: [habits[0]],
  recentCompletions: [],
  completionCount: 0,
  totalCompletions: 3,
  lastCompletedAt: null,
  energyPerAction: 20,
};

describe('PlanDetailDialog', () => {
  it('binds habits and routes redeem / abandon actions', async () => {
    const user = userEvent.setup();
    const onBindHabit = vi.fn().mockResolvedValue(undefined);
    const onUpdateStatus = vi.fn().mockResolvedValue(undefined);
    const onOpenRedeem = vi.fn();
    const onOpenAbandon = vi.fn();

    render(
      <PlanDetailDialog
        plan={plan}
        habits={habits}
        isOpen
        onClose={() => {}}
        onBindHabit={onBindHabit}
        onUpdateStatus={onUpdateStatus}
        onOpenRedeem={onOpenRedeem}
        onOpenAbandon={onOpenAbandon}
      />,
    );

    await user.selectOptions(screen.getByRole('combobox'), 'habit-free');
    await user.click(screen.getByRole('button', { name: '绑定' }));
    expect(onBindHabit).toHaveBeenCalledWith('habit-free', 'plan-1');

    await user.click(screen.getByRole('button', { name: '兑现奖励' }));
    expect(onOpenRedeem).toHaveBeenCalledWith('plan-1');

    await user.click(screen.getByRole('button', { name: '放弃计划' }));
    expect(onOpenAbandon).toHaveBeenCalledWith('plan-1');
  });
});
