import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Habit } from '@/hooks/useHabits';
import { PLAN_STATUS_BADGE_CLASSES, PLAN_STATUS_LABELS, RewardPlan } from '@/types/flywheel';
import { useTranslation } from 'react-i18next';

interface LibraryViewProps {
  plans: RewardPlan[];
  archivedHabits: Habit[];
  onOpenPlan: (planId: string) => void;
  onDuplicatePlan: (planId: string) => void;
  onReviveHabitTemplate: (habitId: string) => void;
}

export default function LibraryView({
  plans,
  archivedHabits,
  onOpenPlan,
  onDuplicatePlan,
  onReviveHabitTemplate,
}: LibraryViewProps) {
  const { t } = useTranslation();
  const repeatablePlans = plans.filter((plan) => plan.type === 'repeatable');

  return (
    <div className="space-y-6">
      <div className="surface-panel-muted rounded-3xl p-6">
        <h2 className="editorial-display text-3xl font-semibold">{t('flywheel.library.title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('flywheel.library.description')}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>{t('flywheel.library.archivedPlans.title')}</CardTitle>
            <CardDescription>{t('flywheel.library.archivedPlans.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t('flywheel.library.archivedPlans.empty')}
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-border bg-[hsl(var(--background)/0.72)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('flywheel.library.archivedPlans.meta', {
                          status: t(PLAN_STATUS_LABELS[plan.status]),
                          count: plan.totalCompletions,
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${PLAN_STATUS_BADGE_CLASSES[plan.status]}`}>{t(PLAN_STATUS_LABELS[plan.status])}</span>
                      <Button variant="ghost" onClick={() => onOpenPlan(plan.id)}>{t('flywheel.library.archivedPlans.view')}</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>{t('flywheel.library.archivedHabits.title')}</CardTitle>
            <CardDescription>{t('flywheel.library.archivedHabits.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {archivedHabits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t('flywheel.library.archivedHabits.empty')}
              </div>
            ) : (
              archivedHabits.map((habit) => (
                <div key={habit.id} className="rounded-2xl border border-border bg-[hsl(var(--background)/0.72)] p-4">
                  <div className="font-medium">{habit.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('flywheel.library.archivedHabits.meta', {
                      energy: habit.energy_value,
                      frequency: t(`flywheel.frequency.${habit.frequency ?? 'daily'}`),
                      count: habit.target_count ?? 1,
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>{t('flywheel.library.repeatableTemplates.title')}</CardTitle>
            <CardDescription>{t('flywheel.library.repeatableTemplates.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {repeatablePlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t('flywheel.library.repeatableTemplates.empty')}
              </div>
            ) : (
              repeatablePlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-border bg-[hsl(var(--background)/0.72)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('flywheel.library.repeatableTemplates.meta', {
                          count: plan.boundHabits.length,
                          status: t(PLAN_STATUS_LABELS[plan.status]),
                        })}
                      </div>
                    </div>
                    <Button variant="outline" className="btn-subtle" onClick={() => onDuplicatePlan(plan.id)}>
                      {t('flywheel.library.repeatableTemplates.duplicate')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>{t('flywheel.library.habitTemplates.title')}</CardTitle>
            <CardDescription>{t('flywheel.library.habitTemplates.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {archivedHabits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t('flywheel.library.habitTemplates.empty')}
              </div>
            ) : (
              archivedHabits.map((habit) => (
                <div key={habit.id} className="rounded-2xl border border-border bg-[hsl(var(--background)/0.72)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('flywheel.library.habitTemplates.meta', {
                          frequency: t(`flywheel.frequency.${habit.frequency ?? 'daily'}`),
                          count: habit.target_count ?? 1,
                          energy: habit.energy_value,
                        })}
                      </div>
                    </div>
                    <Button variant="outline" className="btn-subtle" onClick={() => onReviveHabitTemplate(habit.id)}>
                      {t('flywheel.library.habitTemplates.revive')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="surface-panel-compat">
        <CardHeader>
          <CardTitle>{t('flywheel.library.recommendations.title')}</CardTitle>
          <CardDescription>{t('flywheel.library.recommendations.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            {t('flywheel.library.recommendations.placeholder')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
