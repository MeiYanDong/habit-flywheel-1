import { useMemo } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useHabitCompletions } from '@/hooks/useHabitCompletions';
import { useRewards } from '@/hooks/useRewards';
import { PlanDraft, PlanStatus, PlanType } from '@/types/flywheel';

const statusOrder: PlanStatus[] = [
  'active',
  'validating',
  'ready_to_redeem',
  'wish',
  'redeemed',
  'abandoned',
];

const deriveStatus = (
  reward: {
    status?: PlanStatus | null;
    is_redeemed: boolean;
    current_energy: number;
    energy_cost: number;
  },
): PlanStatus => {
  if (reward.status) {
    return reward.status;
  }

  if (reward.is_redeemed) {
    return 'redeemed';
  }

  if (reward.current_energy >= reward.energy_cost) {
    return 'ready_to_redeem';
  }

  return 'active';
};

const deriveType = (reward: { plan_type?: PlanType | null }): PlanType => {
  return reward.plan_type ?? 'one_time';
};

const isInCurrentFrequencyBucket = (completedAt: string, frequency: string | undefined) => {
  const now = new Date();
  const date = new Date(completedAt);

  if (frequency === 'monthly') {
    return now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth();
  }

  if (frequency === 'weekly') {
    const start = new Date(now);
    const day = start.getDay();
    const delta = day === 0 ? 6 : day - 1;
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - delta);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return date >= start && date < end;
  }

  return now.getFullYear() === date.getFullYear()
    && now.getMonth() === date.getMonth()
    && now.getDate() === date.getDate();
};

export const useRewardPlans = () => {
  const habitsApi = useHabits();
  const rewardsApi = useRewards();
  const completionsApi = useHabitCompletions('all');
  const { habits } = habitsApi;
  const { rewards } = rewardsApi;
  const { completions, isCompletedToday } = completionsApi;

  const plans = useMemo(() => {
    const completionsByHabit = new Map<string, typeof completions>();

    completions.forEach((completion) => {
      const list = completionsByHabit.get(completion.habit_id) ?? [];
      list.push(completion);
      completionsByHabit.set(completion.habit_id, list);
    });

    return rewards
      .map((reward) => {
        const boundHabits = habits.filter(
          (habit) => habit.binding_reward_id === reward.id && !habit.is_archived,
        );
        const recentCompletions = completions
          .filter((completion) => boundHabits.some((habit) => habit.id === completion.habit_id))
          .slice(0, 6);
        const completionCount = recentCompletions.length;
        const totalCompletions = boundHabits.reduce((sum, habit) => {
          return sum + (completionsByHabit.get(habit.id)?.length ?? 0);
        }, 0);
        const progress = reward.energy_cost > 0
          ? Math.min((reward.current_energy / reward.energy_cost) * 100, 100)
          : 0;
        const status = deriveStatus(reward);
        const lastCompletedAt = recentCompletions[0]?.completed_at ?? null;
        const energyPerAction = boundHabits.reduce((sum, habit) => sum + habit.energy_value, 0);

        return {
          ...reward,
          status,
          type: deriveType(reward),
          progress,
          boundHabits,
          recentCompletions,
          completionCount,
          totalCompletions,
          lastCompletedAt,
          energyPerAction,
        };
      })
      .sort((left, right) => {
        const statusDelta = statusOrder.indexOf(left.status) - statusOrder.indexOf(right.status);
        if (statusDelta !== 0) {
          return statusDelta;
        }

        return right.current_energy - left.current_energy;
      });
  }, [completions, habits, rewards]);

  const todayActions = useMemo(() => {
    return habits
      .filter((habit) => !habit.is_archived)
      .map((habit) => {
        const reward = rewards.find((candidate) => candidate.id === habit.binding_reward_id);
        const rewardStatus = reward ? deriveStatus(reward) : 'wish';
        const currentBucketCount = completions.filter((completion) => {
          return completion.habit_id === habit.id && isInCurrentFrequencyBucket(completion.completed_at, habit.frequency);
        }).length;
        const remainingCount = Math.max((habit.target_count ?? 1) - currentBucketCount, 0);
        const impact = habit.energy_value
          + remainingCount * 10
          + (rewardStatus === 'active' ? 20 : rewardStatus === 'ready_to_redeem' ? 12 : 0);

        return {
          habit,
          reward,
          rewardStatus,
          impact,
          currentBucketCount,
          remainingCount,
          isCompleted: isCompletedToday(habit.id),
        };
      })
      .sort((left, right) => {
        if (left.isCompleted !== right.isCompleted) {
          return Number(left.isCompleted) - Number(right.isCompleted);
        }

        return right.impact - left.impact;
      });
  }, [completions, habits, isCompletedToday, rewards]);

  const topPlan = plans.find((plan) => ['active', 'ready_to_redeem', 'validating'].includes(plan.status)) ?? plans[0] ?? null;
  const totalLifetimeEnergy = completions.reduce((sum, completion) => sum + completion.energy_gained, 0);
  const completedTodayCount = todayActions.filter((item) => item.isCompleted).length;
  const activeTodayCount = todayActions.length;
  const activePlansCount = plans.filter((plan) => ['active', 'validating', 'ready_to_redeem'].includes(plan.status)).length;

  const createPlan = async (draft: PlanDraft) => {
    const reward = await rewardsApi.createReward({
      name: draft.name,
      description: draft.description,
      energy_cost: draft.energyCost,
      motivation_note: draft.motivationNote,
      target_date: draft.targetDate,
      plan_type: draft.type,
      status: draft.status,
      priority: draft.priority,
    });

    if (!reward) {
      return null;
    }

    for (const habit of draft.habits) {
      if (habit.id) {
        await habitsApi.updateHabit(habit.id, {
          name: habit.name,
          description: habit.description,
          energy_value: habit.energyValue,
          binding_reward_id: reward.id,
          frequency: habit.frequency,
          target_count: habit.targetCount,
          is_archived: false,
        });
        continue;
      }

      await habitsApi.createHabit({
        name: habit.name,
        description: habit.description,
        energy_value: habit.energyValue,
        binding_reward_id: reward.id,
        frequency: habit.frequency,
        target_count: habit.targetCount,
        is_archived: false,
      });
    }

    return reward;
  };

  const bindHabitToPlan = async (habitId: string, rewardId: string | null) => {
    await habitsApi.updateHabit(habitId, {
      binding_reward_id: rewardId,
    });
  };

  const updatePlanStatus = async (rewardId: string, status: PlanStatus) => {
    await rewardsApi.updateReward(rewardId, { status });
  };

  return {
    habits,
    rewards,
    completions,
    loading: habitsApi.loading || rewardsApi.loading || completionsApi.loading,
    createHabit: habitsApi.createHabit,
    updateHabit: habitsApi.updateHabit,
    deleteHabit: habitsApi.deleteHabit,
    checkInHabit: habitsApi.checkInHabit,
    unCheckInHabit: habitsApi.unCheckInHabit,
    createReward: rewardsApi.createReward,
    updateReward: rewardsApi.updateReward,
    deleteReward: rewardsApi.deleteReward,
    redeemReward: rewardsApi.redeemReward,
    optimisticAddCompletion: completionsApi.optimisticAddCompletion,
    rollbackAddCompletion: completionsApi.rollbackAddCompletion,
    optimisticRemoveCompletion: completionsApi.optimisticRemoveCompletion,
    rollbackRemoveCompletion: completionsApi.rollbackRemoveCompletion,
    clearOptimisticRemoval: completionsApi.clearOptimisticRemoval,
    optimisticAddEnergyToReward: rewardsApi.optimisticAddEnergyToReward,
    rollbackAddEnergyToReward: rewardsApi.rollbackAddEnergyToReward,
    optimisticSubtractEnergyFromReward: rewardsApi.optimisticSubtractEnergyFromReward,
    rollbackSubtractEnergyFromReward: rewardsApi.rollbackSubtractEnergyFromReward,
    isCompletedToday,
    plans,
    topPlan,
    todayActions,
    totalLifetimeEnergy,
    completedTodayCount,
    activeTodayCount,
    activePlansCount,
    createPlan,
    bindHabitToPlan,
    updatePlanStatus,
    refetchHabits: habitsApi.refetch,
    refetchRewards: rewardsApi.refetch,
    refetchCompletions: completionsApi.refetch,
  };
};
