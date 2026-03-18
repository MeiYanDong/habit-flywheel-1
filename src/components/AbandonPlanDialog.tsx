import { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RewardPlan } from '@/types/flywheel';
import { useTranslation } from 'react-i18next';

interface AbandonPlanDialogProps {
  isOpen: boolean;
  plan: RewardPlan | null;
  onClose: () => void;
  onConfirm: (rewardId: string, abandonReason: string, reflectionNote: string) => Promise<void>;
}

export default function AbandonPlanDialog({
  isOpen,
  plan,
  onClose,
  onConfirm,
}: AbandonPlanDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setReflection('');
    }
  }, [isOpen]);

  if (!plan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="dialog-shell dialog-shell--abandon sm:max-w-2xl">
        <DialogHeader className="border-b border-[hsl(var(--abandoned)/0.18)] pb-4">
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-[hsl(var(--abandoned))]" />
            {t('flywheel.abandonDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('flywheel.abandonDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="surface-panel-reflective rounded-[1.5rem] p-4">
            <div className="text-sm text-muted-foreground">{t('flywheel.abandonDialog.currentPlan')}</div>
            <div className="mt-1 text-xl font-semibold">{plan.name}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {t('flywheel.abandonDialog.currentPlanMeta', {
                count: plan.totalCompletions,
                progress: Math.round(plan.progress),
              })}
            </div>
          </div>

          <div className="dialog-section rounded-[1.5rem] p-4">
            <Label htmlFor="abandon-reason">{t('flywheel.abandonDialog.reason')}</Label>
            <Textarea
              id="abandon-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t('flywheel.abandonDialog.reasonPlaceholder')}
              className="mt-2"
            />
          </div>

          <div className="dialog-section-muted rounded-[1.5rem] p-4">
            <Label htmlFor="abandon-reflection">{t('flywheel.abandonDialog.reflection')}</Label>
            <Textarea
              id="abandon-reflection"
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              placeholder={t('flywheel.abandonDialog.reflectionPlaceholder')}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="btn-subtle" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="btn-quiet-danger"
            disabled={!reason.trim()}
            onClick={() => onConfirm(plan.id, reason.trim(), reflection.trim())}
          >
            {t('flywheel.abandonDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
