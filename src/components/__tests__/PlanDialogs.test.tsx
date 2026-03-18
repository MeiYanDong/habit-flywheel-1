import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RedeemPlanDialog from '@/components/RedeemPlanDialog';
import AbandonPlanDialog from '@/components/AbandonPlanDialog';
import { RewardPlan } from '@/types/flywheel';

const plan: RewardPlan = {
  id: 'plan-1',
  name: '升级 GPT Plus',
  description: '验证高强度使用后再升级。',
  energy_cost: 100,
  current_energy: 100,
  is_redeemed: false,
  plan_type: 'one_time',
  status: 'ready_to_redeem',
  target_date: '2026-03-31',
  motivation_note: '有持续高价值使用时再付费。',
  priority: 1,
  created_at: '2026-03-18T00:00:00.000Z',
  updated_at: '2026-03-18T00:00:00.000Z',
  type: 'one_time',
  progress: 100,
  boundHabits: [],
  recentCompletions: [],
  completionCount: 0,
  totalCompletions: 5,
  lastCompletedAt: '2026-03-18T08:00:00.000Z',
  energyPerAction: 20,
};

describe('Plan dialogs', () => {
  it('confirms redeem flow', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <RedeemPlanDialog
        isOpen
        plan={plan}
        onClose={() => {}}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: '确认兑现' }));
    expect(onConfirm).toHaveBeenCalledWith('plan-1');
  });

  it('requires a reason before abandoning a plan', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <AbandonPlanDialog
        isOpen
        plan={plan}
        onClose={() => {}}
        onConfirm={onConfirm}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: '确认放弃' });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText('放弃原因'), '验证后发现当前需求不足。');
    await user.type(screen.getByLabelText('这次学到了什么'), '需要更清晰地区分短期兴奋和长期价值。');
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(
      'plan-1',
      '验证后发现当前需求不足。',
      '需要更清晰地区分短期兴奋和长期价值。',
    );
  });
});
