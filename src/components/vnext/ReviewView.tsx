import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HabitCompletion } from '@/hooks/useHabitCompletions';
import { HabitRankingItem, PLAN_STATUS_BADGE_CLASSES, PLAN_STATUS_LABELS, ReviewStats, RewardPlan } from '@/types/flywheel';
import { useTranslation } from 'react-i18next';

interface ReviewViewProps {
  reviewStats: ReviewStats;
  topPlansByProgress: RewardPlan[];
  habitContributionRanking: HabitRankingItem[];
  validatedPlans: RewardPlan[];
  filteredPlans: RewardPlan[];
  completions: HabitCompletion[];
}

export default function ReviewView({
  reviewStats,
  topPlansByProgress,
  habitContributionRanking,
  validatedPlans,
  filteredPlans,
  completions,
}: ReviewViewProps) {
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [viewMode, setViewMode] = useState<'plans' | 'habits'>('plans');

  const chartData = useMemo(() => {
    const days = timeRange === 'week' ? 7 : 30;
    return Array.from({ length: days }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - index - 1));
      const key = date.toISOString().slice(0, 10);
      const bucket = completions.filter((completion) => completion.completed_at.slice(0, 10) === key);

      return {
        label: date.toLocaleDateString(i18n.language, { month: 'numeric', day: 'numeric' }),
        completions: bucket.length,
        energy: bucket.reduce((sum, completion) => sum + completion.energy_gained, 0),
      };
    });
  }, [completions, i18n.language, timeRange]);

  return (
    <div className="space-y-6">
      <div className="surface-panel-muted rounded-3xl p-6">
        <h2 className="editorial-display text-3xl font-semibold">{t('flywheel.review.title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('flywheel.review.description')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={timeRange === 'week' ? 'default' : 'outline'} className={timeRange !== 'week' ? 'btn-subtle' : undefined} onClick={() => setTimeRange('week')}>
            {t('flywheel.review.range.week')}
          </Button>
          <Button variant={timeRange === 'month' ? 'default' : 'outline'} className={timeRange !== 'month' ? 'btn-subtle' : undefined} onClick={() => setTimeRange('month')}>
            {t('flywheel.review.range.month')}
          </Button>
          <Button variant={viewMode === 'plans' ? 'default' : 'outline'} className={viewMode !== 'plans' ? 'btn-subtle' : undefined} onClick={() => setViewMode('plans')}>
            {t('flywheel.review.view.plans')}
          </Button>
          <Button variant={viewMode === 'habits' ? 'default' : 'outline'} className={viewMode !== 'habits' ? 'btn-subtle' : undefined} onClick={() => setViewMode('habits')}>
            {t('flywheel.review.view.habits')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="metric-panel"><CardContent className="p-4"><div className="text-sm text-muted-foreground">{t('flywheel.review.stats.totalCompletions')}</div><div className="mt-1 text-2xl font-semibold">{reviewStats.totalCompletions}</div></CardContent></Card>
        <Card className="metric-panel"><CardContent className="p-4"><div className="text-sm text-muted-foreground">{t('flywheel.review.stats.totalPlans')}</div><div className="mt-1 text-2xl font-semibold">{reviewStats.totalPlans}</div></CardContent></Card>
        <Card className="metric-panel"><CardContent className="p-4"><div className="text-sm text-muted-foreground">{t('flywheel.review.stats.validatingPlans')}</div><div className="mt-1 text-2xl font-semibold text-[hsl(var(--validating))]">{reviewStats.validatingPlans}</div></CardContent></Card>
        <Card className="metric-panel"><CardContent className="p-4"><div className="text-sm text-muted-foreground">{t('flywheel.review.stats.filteredPlans')}</div><div className="mt-1 text-2xl font-semibold text-[hsl(var(--abandoned))]">{reviewStats.filteredOutPlans}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="surface-panel xl:col-span-2">
          <CardHeader>
            <CardTitle>{t('flywheel.review.energyTrend.title')}</CardTitle>
            <CardDescription>{t('flywheel.review.energyTrend.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completions" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="energy" stroke="hsl(var(--brass))" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>{viewMode === 'plans' ? t('flywheel.review.rankings.plansTitle') : t('flywheel.review.rankings.habitsTitle')}</CardTitle>
            <CardDescription>
              {viewMode === 'plans' ? t('flywheel.review.rankings.plansDescription') : t('flywheel.review.rankings.habitsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {viewMode === 'plans' ? (
              topPlansByProgress.map((plan, index) => (
                <div key={plan.id} className="rounded-2xl border border-border bg-[hsl(var(--background)/0.74)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{index + 1}. {plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('flywheel.review.rankings.planMeta', {
                          count: plan.totalCompletions,
                          status: t(PLAN_STATUS_LABELS[plan.status]),
                        })}
                      </div>
                    </div>
                    <Badge className={PLAN_STATUS_BADGE_CLASSES[plan.status]}>{Math.round(plan.progress)}%</Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={plan.progress} className="progress-shell [&>div]:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--brass)))]" />
                  </div>
                </div>
              ))
            ) : (
              habitContributionRanking.map(({ habit, completions, energy }, index) => (
                <div key={habit.id} className="rounded-2xl border border-border bg-[hsl(var(--background)/0.74)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{index + 1}. {habit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('flywheel.review.rankings.habitMeta', { completions, energy })}
                      </div>
                    </div>
                    <Badge variant="secondary" className={habit.binding_reward_id ? 'status-chip status-chip--active' : 'status-chip status-chip--wish'}>{habit.binding_reward_id ? t('flywheel.review.rankings.bound') : t('flywheel.review.rankings.unbound')}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="surface-panel-muted">
          <CardHeader>
            <CardTitle>{t('flywheel.review.summary.title')}</CardTitle>
            <CardDescription>{t('flywheel.review.summary.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-[hsl(var(--redeemed)/0.22)] bg-[hsl(var(--redeemed)/0.08)] p-4">
              <div className="text-sm text-muted-foreground">{t('flywheel.review.summary.validated')}</div>
              <div className="mt-1 text-2xl font-semibold">{validatedPlans.length}</div>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--abandoned)/0.22)] bg-[hsl(var(--abandoned)/0.08)] p-4">
              <div className="text-sm text-muted-foreground">{t('flywheel.review.summary.filtered')}</div>
              <div className="mt-1 text-2xl font-semibold">{filteredPlans.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>{t('flywheel.review.validated.title')}</CardTitle>
            <CardDescription>{t('flywheel.review.validated.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {validatedPlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t('flywheel.review.validated.empty')}
              </div>
            ) : (
              validatedPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-[hsl(var(--redeemed)/0.22)] bg-[hsl(var(--redeemed)/0.08)] p-4">
                  <div className="font-medium">{plan.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t('flywheel.review.validated.meta', {
                      count: plan.totalCompletions,
                      current: plan.current_energy,
                      target: plan.energy_cost,
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>{t('flywheel.review.filtered.title')}</CardTitle>
            <CardDescription>{t('flywheel.review.filtered.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredPlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t('flywheel.review.filtered.empty')}
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-[hsl(var(--abandoned)/0.22)] bg-[hsl(var(--abandoned)/0.08)] p-4">
                  <div className="font-medium">{plan.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t('flywheel.review.filtered.meta', {
                      count: plan.totalCompletions,
                      progress: Math.round(plan.progress),
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
