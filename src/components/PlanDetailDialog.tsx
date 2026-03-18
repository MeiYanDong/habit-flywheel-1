import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Link2, Milestone, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Habit } from '@/hooks/useHabits';
import { FREQUENCY_LABELS, PLAN_STATUS_BADGE_CLASSES, PLAN_STATUS_LABELS, PLAN_TYPE_LABELS, PlanStatus, RewardPlan } from '@/types/flywheel';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PlanDetailDialogProps {
  plan: RewardPlan | null;
  habits: Habit[];
  isOpen: boolean;
  onClose: () => void;
  onBindHabit: (habitId: string, rewardId: string | null) => Promise<void>;
  onUpdateStatus: (rewardId: string, status: PlanStatus) => Promise<void>;
  onOpenRedeem: (rewardId: string) => void;
  onOpenAbandon: (rewardId: string) => void;
}

export default function PlanDetailDialog({
  plan,
  habits,
  isOpen,
  onClose,
  onBindHabit,
  onUpdateStatus,
  onOpenRedeem,
  onOpenAbandon,
}: PlanDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const [selectedHabitId, setSelectedHabitId] = useState('');

  const unboundHabits = useMemo(() => {
    return habits.filter((habit) => !habit.is_archived && !habit.binding_reward_id);
  }, [habits]);

  if (!plan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="dialog-shell dialog-shell--detail max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader className="border-b border-border/70 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[hsl(var(--brass))]" />
            {plan.name}
          </DialogTitle>
          <DialogDescription>
            {t('flywheel.planDetail.dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <div className="dialog-section rounded-[1.5rem] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                {t('flywheel.planDetail.currentStatus')}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={PLAN_STATUS_BADGE_CLASSES[plan.status]}>{t(PLAN_STATUS_LABELS[plan.status])}</Badge>
                <span className="text-sm text-muted-foreground">{t(PLAN_TYPE_LABELS[plan.type])}</span>
              </div>
            </div>
            <div className="dialog-section rounded-[1.5rem] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Milestone className="h-4 w-4" />
                {t('flywheel.planDetail.redeemProgress')}
              </div>
              <div className="text-2xl font-semibold">{Math.round(plan.progress)}%</div>
              <div className="mt-2">
                <Progress value={plan.progress} className="progress-shell [&>div]:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--brass)))]" />
              </div>
              <div className="mt-2 text-sm text-[hsl(var(--brass))]">
                {plan.current_energy}/{plan.energy_cost} ⚡
              </div>
            </div>
            <div className="dialog-section rounded-[1.5rem] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                {t('flywheel.planDetail.rhythmSummary')}
              </div>
              <div className="text-sm text-foreground">{t('flywheel.planDetail.boundActionCount', { count: plan.boundHabits.length })}</div>
              <div className="text-sm text-foreground">{t('flywheel.planDetail.totalCompletions', { count: plan.totalCompletions })}</div>
              <div className="text-sm text-muted-foreground">
                {t('flywheel.planDetail.targetDate', { date: plan.target_date ?? t('flywheel.planDetail.unset') })}
              </div>
            </div>
          </section>

          {(plan.description || plan.motivation_note) && (
            <section className="grid gap-4 md:grid-cols-2">
              <div className="dialog-section-muted rounded-[1.5rem] p-4">
                <h3 className="mb-2 text-sm font-semibold">{t('flywheel.planDetail.descriptionTitle')}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {plan.description || t('flywheel.planDetail.notFilled')}
                </p>
              </div>
              <div className="dialog-section-muted rounded-[1.5rem] p-4">
                <h3 className="mb-2 text-sm font-semibold">{t('flywheel.planDetail.motivationTitle')}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {plan.motivation_note || t('flywheel.planDetail.notFilled')}
                </p>
              </div>
            </section>
          )}

          <section className="dialog-section space-y-4 rounded-[1.5rem] p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">{t('flywheel.planDetail.bindingTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('flywheel.planDetail.bindingDescription')}</p>
              </div>
              {unboundHabits.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={selectedHabitId}
                    onChange={(event) => setSelectedHabitId(event.target.value)}
                  >
                    <option value="">{t('flywheel.planDetail.selectExistingHabit')}</option>
                    {unboundHabits.map((habit) => (
                      <option key={habit.id} value={habit.id}>
                        {habit.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="btn-subtle"
                    disabled={!selectedHabitId}
                    onClick={async () => {
                      await onBindHabit(selectedHabitId, plan.id);
                      setSelectedHabitId('');
                    }}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    {t('flywheel.planDetail.bind')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {plan.boundHabits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  {t('flywheel.planDetail.emptyBinding')}
                </div>
              ) : (
                plan.boundHabits.map((habit) => (
                  <div key={habit.id} className="dialog-section-muted flex items-center justify-between rounded-2xl p-4">
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('flywheel.planDetail.boundHabitMeta', {
                          frequency: t(FREQUENCY_LABELS[habit.frequency ?? 'daily']),
                          count: habit.target_count ?? 1,
                          energy: habit.energy_value,
                        })}
                      </div>
                    </div>
                    <Button type="button" variant="ghost" className="text-[hsl(var(--abandoned))] hover:bg-[hsl(var(--abandoned)/0.08)] hover:text-[hsl(var(--abandoned))]" onClick={() => onBindHabit(habit.id, null)}>
                      {t('flywheel.planDetail.unbind')}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="dialog-section rounded-[1.5rem] p-4">
              <h3 className="mb-3 text-sm font-semibold">{t('flywheel.planDetail.statusActions')}</h3>
              <div className="flex flex-wrap gap-2">
                {(['wish', 'validating', 'active', 'abandoned'] as PlanStatus[]).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={plan.status === status ? 'default' : 'outline'}
                    onClick={() => onUpdateStatus(plan.id, status)}
                    className={cn(plan.status !== status && 'btn-subtle', status === 'abandoned' && plan.status === status && 'btn-quiet-danger')}
                  >
                    {t(PLAN_STATUS_LABELS[status])}
                  </Button>
                ))}
                <Button
                  type="button"
                  className="btn-brass"
                  onClick={() => onUpdateStatus(plan.id, 'ready_to_redeem')}
                >
                  {t('flywheel.planDetail.markReadyToRedeem')}
                </Button>
                <Button
                  type="button"
                  className="btn-brass"
                  onClick={() => onOpenRedeem(plan.id)}
                >
                  {t('flywheel.planDetail.redeemReward')}
                </Button>
                <Button
                  type="button"
                  className="btn-quiet-danger"
                  onClick={() => onOpenAbandon(plan.id)}
                >
                  {t('flywheel.planDetail.abandonPlan')}
                </Button>
              </div>
            </div>

            <div className="dialog-section rounded-[1.5rem] p-4">
              <h3 className="mb-3 text-sm font-semibold">{t('flywheel.planDetail.recentProgress')}</h3>
              <div className="space-y-3">
                {plan.recentCompletions.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t('flywheel.planDetail.noRecentProgress')}</div>
                ) : (
                  plan.recentCompletions.map((completion) => {
                    const habit = plan.boundHabits.find((item) => item.id === completion.habit_id);
                    return (
                      <div key={completion.id} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[hsl(var(--redeemed))]" />
                        <div className="text-sm">
                          <div className="font-medium">{habit?.name ?? t('flywheel.planDetail.deletedAction')}</div>
                          <div className="text-muted-foreground">
                            {t('flywheel.planDetail.completionMeta', {
                              energy: completion.energy_gained,
                              date: new Date(completion.completed_at).toLocaleString(i18n.language),
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="btn-subtle" onClick={onClose}>
            {t('flywheel.planDetail.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
