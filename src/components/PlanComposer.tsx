import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Habit } from '@/hooks/useHabits';
import { FREQUENCY_LABELS, HabitDraft, HabitFrequency, PLAN_STATUS_LABELS, PLAN_TYPE_LABELS, PlanDraft, PlanStatus, PlanType } from '@/types/flywheel';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PlanComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (draft: PlanDraft) => Promise<void>;
  availableHabits: Habit[];
}

const createHabitDraft = (): HabitDraft => ({
  name: '',
  description: '',
  energyValue: 10,
  frequency: 'daily',
  targetCount: 1,
});

const initialDraft: PlanDraft = {
  name: '',
  description: '',
  type: 'one_time',
  energyCost: 100,
  motivationNote: '',
  targetDate: '',
  priority: 1,
  status: 'active',
  habits: [createHabitDraft()],
};

const stepBadgeVariant = (stepIndex: number, currentStep: number) => {
  if (stepIndex < currentStep) return 'default';
  if (stepIndex === currentStep) return 'secondary';
  return 'outline';
};

export default function PlanComposer({
  isOpen,
  onClose,
  onSubmit,
  availableHabits,
}: PlanComposerProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<PlanDraft>(initialDraft);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedExistingHabitId, setSelectedExistingHabitId] = useState('');
  const steps = useMemo(
    () => [
      t('flywheel.planComposer.steps.rewardDefinition'),
      t('flywheel.planComposer.steps.rewardType'),
      t('flywheel.planComposer.steps.motivationGoal'),
      t('flywheel.planComposer.steps.bindActions'),
      t('flywheel.planComposer.steps.confirmPlan'),
    ] as const,
    [t],
  );

  useEffect(() => {
    if (!isOpen) {
      setDraft(initialDraft);
      setStep(0);
      setSaving(false);
      setSelectedExistingHabitId('');
    }
  }, [isOpen]);

  const existingHabitOptions = useMemo(() => {
    return availableHabits.filter((habit) => !habit.is_archived && !habit.binding_reward_id);
  }, [availableHabits]);

  const updateHabit = (index: number, updates: Partial<HabitDraft>) => {
    setDraft((current) => ({
      ...current,
      habits: current.habits.map((habit, habitIndex) => (
        habitIndex === index ? { ...habit, ...updates } : habit
      )),
    }));
  };

  const addHabit = () => {
    setDraft((current) => ({
      ...current,
      habits: [...current.habits, createHabitDraft()],
    }));
  };

  const addExistingHabit = () => {
    const habit = existingHabitOptions.find((item) => item.id === selectedExistingHabitId);
    if (!habit) return;

    setDraft((current) => ({
      ...current,
      habits: [
        ...current.habits,
        {
          id: habit.id,
          name: habit.name,
          description: habit.description,
          energyValue: habit.energy_value,
          frequency: habit.frequency ?? 'daily',
          targetCount: habit.target_count ?? 1,
        },
      ],
    }));
    setSelectedExistingHabitId('');
  };

  const removeHabit = (index: number) => {
    setDraft((current) => ({
      ...current,
      habits: current.habits.filter((_, habitIndex) => habitIndex !== index),
    }));
  };

  const setType = (type: PlanType) => setDraft((current) => ({ ...current, type }));
  const setStatus = (status: PlanStatus) => setDraft((current) => ({ ...current, status }));
  const setFrequency = (index: number, frequency: HabitFrequency) => updateHabit(index, { frequency });

  const validHabits = draft.habits.filter((habit) => habit.name.trim());
  const canAdvance = (() => {
    switch (step) {
      case 0:
        return Boolean(draft.name.trim() && draft.energyCost > 0);
      case 1:
        return Boolean(draft.type && draft.status);
      case 2:
        return Boolean(draft.motivationNote?.trim() || draft.description?.trim());
      case 3:
        return validHabits.length > 0;
      default:
        return true;
    }
  })();

  const handleSubmit = async () => {
    if (!draft.name.trim() || validHabits.length === 0) return;

    setSaving(true);
    await onSubmit({
      ...draft,
      habits: validHabits,
    });
    setSaving(false);
    onClose();
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="plan-name">{t('flywheel.planComposer.rewardName')}</Label>
            <Input
              id="plan-name"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder={t('flywheel.planComposer.rewardNamePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-energy-cost">{t('flywheel.planComposer.energyCost')}</Label>
            <Input
              id="plan-energy-cost"
              type="number"
              min={1}
              value={draft.energyCost}
              onChange={(event) => setDraft((current) => ({ ...current, energyCost: Number(event.target.value) || 1 }))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="plan-description">{t('flywheel.planComposer.description')}</Label>
            <Textarea
              id="plan-description"
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder={t('flywheel.planComposer.descriptionPlaceholder')}
            />
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>{t('flywheel.planComposer.planType')}</Label>
            <div className="flex gap-2">
              {(['one_time', 'repeatable'] as PlanType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={draft.type === type ? 'default' : 'outline'}
                  onClick={() => setType(type)}
                  className={cn('flex-1', draft.type !== type && 'btn-subtle')}
                >
                  {t(PLAN_TYPE_LABELS[type])}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>{t('flywheel.planComposer.initialStatus')}</Label>
            <div className="flex flex-wrap gap-2">
              {(['wish', 'validating', 'active'] as PlanStatus[]).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={draft.status === status ? 'default' : 'outline'}
                  onClick={() => setStatus(status)}
                  className={draft.status !== status ? 'btn-subtle' : undefined}
                >
                  {t(PLAN_STATUS_LABELS[status])}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="plan-motivation">{t('flywheel.planComposer.motivation')}</Label>
            <Textarea
              id="plan-motivation"
              value={draft.motivationNote}
              onChange={(event) => setDraft((current) => ({ ...current, motivationNote: event.target.value }))}
              placeholder={t('flywheel.planComposer.motivationPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-target-date">{t('flywheel.planComposer.targetDate')}</Label>
            <Input
              id="plan-target-date"
              type="date"
              value={draft.targetDate}
              onChange={(event) => setDraft((current) => ({ ...current, targetDate: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-priority">{t('flywheel.planComposer.priority')}</Label>
            <Input
              id="plan-priority"
              type="number"
              min={0}
              max={5}
              value={draft.priority}
              onChange={(event) => setDraft((current) => ({ ...current, priority: Number(event.target.value) || 0 }))}
            />
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('flywheel.planComposer.actionsTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('flywheel.planComposer.actionsDescription')}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={addHabit}>
                <Plus className="mr-2 h-4 w-4" />
                {t('flywheel.planComposer.addAction')}
              </Button>
            </div>
          </div>

          {existingHabitOptions.length > 0 && (
            <div className="dialog-section-muted flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center">
              <select
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedExistingHabitId}
                onChange={(event) => setSelectedExistingHabitId(event.target.value)}
              >
                <option value="">{t('flywheel.planComposer.selectExistingAction')}</option>
                {existingHabitOptions.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
              <Button type="button" className="btn-brass" disabled={!selectedExistingHabitId} onClick={addExistingHabit}>
                {t('flywheel.planComposer.addExistingAction')}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {draft.habits.map((habit, index) => (
              <div key={`${habit.id ?? 'new'}-${index}`} className="dialog-section rounded-[1.5rem] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="status-chip status-chip--active">{t('flywheel.planComposer.actionBadge', { index: index + 1 })}</Badge>
                    {habit.id && <Badge variant="outline" className="border-[hsl(var(--brass)/0.22)] bg-[hsl(var(--brass)/0.08)] text-[hsl(var(--validating))]">{t('flywheel.planComposer.fromLibrary')}</Badge>}
                  </div>
                  {draft.habits.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeHabit(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('flywheel.planComposer.actionName')}</Label>
                    <Input
                      value={habit.name}
                      onChange={(event) => updateHabit(index, { name: event.target.value })}
                      placeholder={t('flywheel.planComposer.actionNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('flywheel.planComposer.actionEnergy')}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={habit.energyValue}
                      onChange={(event) => updateHabit(index, { energyValue: Number(event.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('flywheel.planComposer.frequency')}</Label>
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'monthly'] as HabitFrequency[]).map((frequency) => (
                        <Button
                          key={frequency}
                          type="button"
                          variant={habit.frequency === frequency ? 'default' : 'outline'}
                          onClick={() => setFrequency(index, frequency)}
                          className={cn('flex-1', habit.frequency !== frequency && 'btn-subtle')}
                        >
                          {t(FREQUENCY_LABELS[frequency])}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('flywheel.planComposer.targetCount')}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={habit.targetCount}
                      onChange={(event) => updateHabit(index, { targetCount: Number(event.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>{t('flywheel.planComposer.actionDescription')}</Label>
                  <Textarea
                    value={habit.description}
                    onChange={(event) => updateHabit(index, { description: event.target.value })}
                    placeholder={t('flywheel.planComposer.actionDescriptionPlaceholder')}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t('flywheel.planComposer.confirmTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('flywheel.planComposer.confirmDescription')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="dialog-section rounded-[1.5rem] p-4">
            <div className="text-sm text-muted-foreground">{t('flywheel.planComposer.summaryReward')}</div>
            <div className="mt-1 text-lg font-semibold">{draft.name}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {t(PLAN_TYPE_LABELS[draft.type])} · {t(PLAN_STATUS_LABELS[draft.status])}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {t('flywheel.planComposer.summaryRewardMeta', {
                energy: draft.energyCost,
                date: draft.targetDate || t('flywheel.planComposer.unset'),
              })}
            </div>
          </div>
          <div className="dialog-section rounded-[1.5rem] p-4">
            <div className="text-sm text-muted-foreground">{t('flywheel.planComposer.summaryActions')}</div>
            <div className="mt-1 text-lg font-semibold">{t('flywheel.planComposer.summaryActionCount', { count: validHabits.length })}</div>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              {validHabits.map((habit, index) => (
                <div key={`${habit.id ?? 'confirm'}-${index}`}>
                  {t('flywheel.planComposer.summaryActionItem', {
                    name: habit.name,
                    frequency: t(FREQUENCY_LABELS[habit.frequency]),
                    count: habit.targetCount,
                    energy: habit.energyValue,
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dialog-section-muted rounded-[1.5rem] p-4 text-sm leading-6 text-muted-foreground">
          {draft.motivationNote || draft.description || t('flywheel.planComposer.noSupplementaryNote')}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="dialog-shell dialog-shell--compose max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="border-b border-border/70 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[hsl(var(--brass))]" />
            {t('flywheel.planComposer.dialogTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('flywheel.planComposer.dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6 flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <Badge
              key={label}
              variant={stepBadgeVariant(index, step)}
              className={cn(
                index < step && 'status-chip status-chip--active',
                index === step && 'status-chip status-chip--validating',
                index > step && 'border-border bg-transparent text-muted-foreground',
              )}
            >
              {index + 1}. {label}
            </Badge>
          ))}
        </div>

        {renderStep()}

        <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="btn-subtle" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="btn-subtle"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              disabled={step === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('flywheel.planComposer.previous')}
            </Button>
          </div>
          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))} disabled={!canAdvance}>
                {t('flywheel.planComposer.next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={saving || !canAdvance}>
                {saving ? t('flywheel.planComposer.creating') : t('flywheel.planComposer.create')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
