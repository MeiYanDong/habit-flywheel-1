import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanComposer from '@/components/PlanComposer';
import { Habit } from '@/hooks/useHabits';

const availableHabits: Habit[] = [
  {
    id: 'habit-existing',
    name: '复盘高价值问题',
    description: '把一周最有价值的问题整理成笔记',
    energy_value: 15,
    binding_reward_id: null,
    frequency: 'weekly',
    target_count: 1,
    is_archived: false,
    created_at: '2026-03-18T00:00:00.000Z',
    updated_at: '2026-03-18T00:00:00.000Z',
  },
];

describe('PlanComposer', () => {
  it('submits a multi-step reward-first plan draft', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <PlanComposer
        isOpen
        onClose={onClose}
        onSubmit={onSubmit}
        availableHabits={availableHabits}
      />,
    );

    await user.type(screen.getByLabelText('第一步：填写奖励名称'), '升级 GPT Plus');
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByRole('button', { name: '可重复奖励' }));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.type(screen.getByLabelText('第三步：填写动机说明'), '先用真实行动验证它值不值得。');
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.selectOptions(screen.getByRole('combobox'), 'habit-existing');
    await user.click(screen.getByRole('button', { name: '收编到计划' }));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByRole('button', { name: '创建奖励计划' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '升级 GPT Plus',
        type: 'repeatable',
        habits: expect.arrayContaining([
          expect.objectContaining({
            id: 'habit-existing',
            name: '复盘高价值问题',
          }),
        ]),
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
