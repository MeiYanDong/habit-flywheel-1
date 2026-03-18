import { ArrowUpRight, Plus, Sparkles, Undo2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PLAN_STATUS_BADGE_CLASSES, PLAN_STATUS_LABELS, RewardPlan, TodayAction } from '@/types/flywheel';
import { useTranslation } from 'react-i18next';

interface DashboardViewProps {
  topPlan: RewardPlan | null;
  todayActions: TodayAction[];
  completedTodayCount: number;
  activeTodayCount: number;
  activePlansCount: number;
  totalLifetimeEnergy: number;
  topPlansByProgress: RewardPlan[];
  libraryPlans: RewardPlan[];
  onCreatePlan: () => void;
  onOpenPlan: (planId: string) => void;
  onToggleHabit: (habitId: string) => void;
}

export default function DashboardView({
  topPlan,
  todayActions,
  completedTodayCount,
  activeTodayCount,
  activePlansCount,
  totalLifetimeEnergy,
  topPlansByProgress,
  libraryPlans,
  onCreatePlan,
  onOpenPlan,
  onToggleHabit,
}: DashboardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card className="surface-panel-strong overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Badge className="status-chip status-chip--active bg-[hsl(var(--background)/0.88)] text-foreground">{t('flywheel.dashboard.badge')}</Badge>
            <div>
              <h2 className="editorial-display text-3xl font-semibold text-foreground md:text-[2.4rem]">
                {topPlan ? topPlan.name : t('flywheel.dashboard.heroEmptyTitle')}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--ink-soft))]">
                {topPlan?.motivation_note ||
                  t('flywheel.dashboard.heroEmptyDescription')}
              </p>
            </div>
            {topPlan ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="metric-panel rounded-[1.5rem] p-4">
                  <div className="text-sm text-muted-foreground">{t('common.progress')}</div>
                  <div className="mt-1 text-2xl font-semibold">{Math.round(topPlan.progress)}%</div>
                  <div className="mt-2">
                    <Progress value={topPlan.progress} className="progress-shell [&>div]:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--brass)))]" />
                  </div>
                </div>
                <div className="metric-panel rounded-[1.5rem] p-4">
                  <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.distanceToRedeem')}</div>
                  <div className="mt-1 text-2xl font-semibold text-[hsl(var(--brass))]">
                    {Math.max(topPlan.energy_cost - topPlan.current_energy, 0)} ⚡
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t('flywheel.dashboard.currentStatus', { status: t(PLAN_STATUS_LABELS[topPlan.status]) })}
                  </div>
                </div>
                <div className="metric-panel rounded-[1.5rem] p-4">
                  <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.actionMix')}</div>
                  <div className="mt-1 text-2xl font-semibold">{topPlan.boundHabits.length}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t('flywheel.dashboard.actionMixHint', { energy: topPlan.energyPerAction })}
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={onCreatePlan}>
                <Plus className="mr-2 h-4 w-4" />
                {t('flywheel.dashboard.createFirstPlan')}
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <Card className="metric-panel">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.todayActionsCompleted')}</div>
                <div className="mt-1 text-2xl font-semibold">
                  {completedTodayCount}/{activeTodayCount || 0}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{t('flywheel.dashboard.todayActionsHint')}</div>
              </CardContent>
            </Card>
            <Card className="metric-panel">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.activePlans')}</div>
                <div className="mt-1 text-2xl font-semibold">{activePlansCount}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t('flywheel.dashboard.activePlansHint')}</div>
              </CardContent>
            </Card>
            <Card className="metric-panel">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.lifetimeEnergy')}</div>
                <div className="mt-1 text-2xl font-semibold text-[hsl(var(--brass))]">{totalLifetimeEnergy}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t('flywheel.dashboard.lifetimeEnergyHint')}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="surface-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('flywheel.dashboard.todayActionsTitle')}</CardTitle>
              <CardDescription>{t('flywheel.dashboard.todayActionsDescription')}</CardDescription>
            </div>
            <Button variant="outline" onClick={onCreatePlan}>
              <Plus className="mr-2 h-4 w-4" />
              {t('flywheel.dashboard.newPlan')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayActions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {t('flywheel.dashboard.noTodayActions')}
              </div>
            ) : (
              todayActions.map(({ habit, reward, isCompleted, impact, currentBucketCount, remainingCount }) => (
                <div
                  key={habit.id}
                  className={cn(
                    'rounded-[1.5rem] border p-4 transition sm:flex sm:items-center sm:justify-between',
                    isCompleted
                      ? 'border-[hsl(var(--redeemed)/0.24)] bg-[hsl(var(--redeemed)/0.08)]'
                      : 'border-border bg-[hsl(var(--background)/0.74)]',
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{habit.name}</span>
                      <Badge variant="secondary" className="status-chip status-chip--active">{t('flywheel.dashboard.impactBadge', { impact })}</Badge>
                      {reward && <Badge className={PLAN_STATUS_BADGE_CLASSES[reward.status]}>{reward.name}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {habit.frequency === 'weekly'
                        ? t('flywheel.dashboard.bucket.week', { current: currentBucketCount, target: habit.target_count ?? 1 })
                        : habit.frequency === 'monthly'
                          ? t('flywheel.dashboard.bucket.month', { current: currentBucketCount, target: habit.target_count ?? 1 })
                          : t('flywheel.dashboard.bucket.day', { current: currentBucketCount, target: habit.target_count ?? 1 })}
                      {' · '}
                      {t('flywheel.dashboard.energyGain', { energy: habit.energy_value })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reward
                        ? t('flywheel.dashboard.advancesReward', { reward: reward.name, remaining: remainingCount })
                        : t('flywheel.dashboard.unassignedPlan')}
                    </div>
                  </div>
                  <Button
                    onClick={() => onToggleHabit(habit.id)}
                    className={cn(isCompleted ? 'btn-quiet-danger' : 'bg-primary text-primary-foreground hover:bg-primary/90')}
                  >
                    {isCompleted ? (
                      <>
                        <Undo2 className="mr-2 h-4 w-4" />
                        {t('flywheel.dashboard.rollbackProgress')}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        {t('flywheel.dashboard.completeAndAdvance')}
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="surface-panel-muted">
            <CardHeader>
              <CardTitle>{t('flywheel.dashboard.validationSignalsTitle')}</CardTitle>
              <CardDescription>{t('flywheel.dashboard.validationSignalsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-[hsl(var(--redeemed)/0.22)] bg-[hsl(var(--redeemed)/0.08)] p-4">
                <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.recentRedeemed')}</div>
                <div className="mt-1 text-base font-medium">
                  {libraryPlans.find((plan) => plan.status === 'redeemed')?.name ?? t('flywheel.dashboard.none')}
                </div>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--abandoned)/0.22)] bg-[hsl(var(--abandoned)/0.08)] p-4">
                <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.recentAbandoned')}</div>
                <div className="mt-1 text-base font-medium">
                  {libraryPlans.find((plan) => plan.status === 'abandoned')?.name ?? t('flywheel.dashboard.none')}
                </div>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] p-4">
                <div className="text-sm text-muted-foreground">{t('flywheel.dashboard.recentFocusArea')}</div>
                <div className="mt-1 text-base font-medium">{topPlansByProgress[0]?.name ?? t('flywheel.dashboard.startPlan')}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle>{t('flywheel.dashboard.topPlansTitle')}</CardTitle>
              <CardDescription>{t('flywheel.dashboard.topPlansDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPlansByProgress.slice(0, 3).map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className="w-full rounded-2xl border border-border bg-[hsl(var(--background)/0.72)] p-4 text-left transition hover:bg-[hsl(var(--muted)/0.52)]"
                  onClick={() => onOpenPlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{plan.name}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Progress value={plan.progress} className="progress-shell [&>div]:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--brass)))]" />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {plan.current_energy}/{plan.energy_cost} ⚡ · {t(PLAN_STATUS_LABELS[plan.status])}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
