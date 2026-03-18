import { Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RewardPlan } from '@/types/flywheel';
import { useTranslation } from 'react-i18next';

interface RedeemPlanDialogProps {
  isOpen: boolean;
  plan: RewardPlan | null;
  onClose: () => void;
  onConfirm: (rewardId: string) => Promise<void>;
}

const formatDate = (value: string | null | undefined, locale: string, emptyLabel: string) => {
  if (!value) return emptyLabel;
  return new Date(value).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function RedeemPlanDialog({
  isOpen,
  plan,
  onClose,
  onConfirm,
}: RedeemPlanDialogProps) {
  const { t, i18n } = useTranslation();

  if (!plan) {
    return null;
  }

  const canRedeem = plan.current_energy >= plan.energy_cost;
  const firstCompletion = plan.recentCompletions[plan.recentCompletions.length - 1]?.completed_at ?? null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="dialog-shell dialog-shell--redeem sm:max-w-2xl">
        <DialogHeader className="border-b border-[hsl(var(--brass)/0.18)] pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[hsl(var(--brass))]" />
            {t('flywheel.redeemDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('flywheel.redeemDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="surface-panel-brass rounded-[1.5rem] p-4">
            <div className="text-sm text-muted-foreground">{t('flywheel.redeemDialog.rewardName')}</div>
            <div className="mt-1 text-xl font-semibold">{plan.name}</div>
            <div className="mt-3">
              <Progress value={plan.progress} className="progress-shell [&>div]:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--brass)))]" />
            </div>
            <div className="mt-2 text-sm text-[hsl(var(--brass))]">
              {plan.current_energy}/{plan.energy_cost} ⚡
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="dialog-section rounded-[1.5rem] p-4">
              <div className="text-sm text-muted-foreground">{t('flywheel.redeemDialog.actionCount')}</div>
              <div className="mt-1 text-2xl font-semibold">{plan.totalCompletions}</div>
            </div>
            <div className="dialog-section rounded-[1.5rem] p-4">
              <div className="text-sm text-muted-foreground">{t('flywheel.redeemDialog.boundActions')}</div>
              <div className="mt-1 text-2xl font-semibold">{plan.boundHabits.length}</div>
            </div>
            <div className="dialog-section rounded-[1.5rem] p-4">
              <div className="text-sm text-muted-foreground">{t('flywheel.redeemDialog.latestProgress')}</div>
              <div className="mt-1 text-base font-semibold">{formatDate(plan.lastCompletedAt, i18n.language, t('flywheel.redeemDialog.noDate'))}</div>
            </div>
          </div>

          <div className="dialog-section rounded-[1.5rem] p-4">
            <div className="text-sm font-semibold text-foreground">{t('flywheel.redeemDialog.actionSources')}</div>
            <div className="mt-3 space-y-2">
              {plan.boundHabits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between text-sm">
                  <span>{habit.name}</span>
                  <span className="text-muted-foreground">{t('flywheel.redeemDialog.actionSourceMeta', { energy: habit.energy_value })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-dashed border-[hsl(var(--brass)/0.28)] bg-[hsl(var(--brass)/0.12)] p-4 text-sm text-[hsl(var(--foreground))]">
            {canRedeem
              ? t('flywheel.redeemDialog.validatedWindow', {
                start: formatDate(firstCompletion, i18n.language, t('flywheel.redeemDialog.noDate')),
              })
              : t('flywheel.redeemDialog.insufficientEnergy')}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="btn-subtle" onClick={onClose}>
            {t('flywheel.redeemDialog.later')}
          </Button>
          <Button type="button" className="btn-brass" onClick={() => onConfirm(plan.id)} disabled={!canRedeem}>
            {t('flywheel.redeemDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
