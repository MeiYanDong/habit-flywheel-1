import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PLAN_STATUS_BADGE_CLASSES, PLAN_STATUS_LABELS, PlanStatus, RewardPlan } from '@/types/flywheel';
import { useTranslation } from 'react-i18next';

const formatDateTime = (value: string | null | undefined, locale: string, emptyLabel: string) => {
  if (!value) {
    return emptyLabel;
  }

  return new Date(value).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDate = (value: string | null | undefined, locale: string, emptyLabel: string) => {
  if (!value) {
    return emptyLabel;
  }

  return new Date(value).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface PlansViewProps {
  plans: RewardPlan[];
  onCreatePlan: () => void;
  onOpenPlan: (planId: string) => void;
}

export default function PlansView({ plans, onCreatePlan, onOpenPlan }: PlansViewProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="surface-panel-muted flex flex-col gap-4 rounded-3xl p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="editorial-display text-3xl font-semibold">{t('flywheel.plans.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('flywheel.plans.description')}
          </p>
        </div>
        <Button onClick={onCreatePlan}>
          <Plus className="mr-2 h-4 w-4" />
          {t('flywheel.plans.createPlan')}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {(['active', 'validating', 'ready_to_redeem', 'redeemed', 'abandoned'] as PlanStatus[]).map((status) => {
          const group = plans.filter((plan) => plan.status === status);
          return (
            <Card key={status} className="surface-panel">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{t(PLAN_STATUS_LABELS[status])}</span>
                  <Badge className={PLAN_STATUS_BADGE_CLASSES[status]}>{group.length}</Badge>
                </CardTitle>
                <CardDescription>{t('flywheel.plans.groupCount', { count: group.length })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    {t('flywheel.plans.emptyGroup')}
                  </div>
                ) : (
                  group.map((plan) => (
                    <button
                      type="button"
                      key={plan.id}
                      className="w-full rounded-[1.5rem] border border-border bg-[hsl(var(--background)/0.74)] p-4 text-left transition hover:bg-[hsl(var(--muted)/0.46)]"
                      onClick={() => onOpenPlan(plan.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {t('flywheel.plans.actionAndRecentProgress', {
                              count: plan.boundHabits.length,
                              date: formatDateTime(plan.lastCompletedAt, i18n.language, t('flywheel.plans.noRecentProgress')),
                            })}
                          </div>
                        </div>
                        <Badge className={PLAN_STATUS_BADGE_CLASSES[plan.status]}>{Math.round(plan.progress)}%</Badge>
                      </div>
                      <div className="mt-3">
                        <Progress value={plan.progress} className="progress-shell [&>div]:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--brass)))]" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{plan.current_energy}/{plan.energy_cost} ⚡</span>
                        <span>
                          {t('flywheel.plans.targetDate', {
                            date: formatShortDate(plan.target_date, i18n.language, t('flywheel.plans.noTargetDate')),
                          })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
