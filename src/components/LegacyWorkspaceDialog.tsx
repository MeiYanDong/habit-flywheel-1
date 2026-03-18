import { useState } from 'react';
import { ArrowRight, Clock3, FolderKanban, Gift, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HabitForm from '@/components/HabitForm';
import RewardForm from '@/components/RewardForm';
import BindingManager from '@/components/BindingManager';
import HistoryView from '@/components/HistoryView';
import { Habit, HabitMutation } from '@/hooks/useHabits';
import { Reward, RewardMutation } from '@/hooks/useRewards';
import { useTranslation } from 'react-i18next';

interface LegacyWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  rewards: Reward[];
  onCreateHabit: (data: HabitMutation) => Promise<Habit | undefined>;
  onCreateReward: (data: RewardMutation) => Promise<Reward | undefined>;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => Promise<Habit | undefined>;
}

export default function LegacyWorkspaceDialog({
  isOpen,
  onClose,
  habits,
  rewards,
  onCreateHabit,
  onCreateReward,
  onUpdateHabit,
}: LegacyWorkspaceDialogProps) {
  const { t } = useTranslation();
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [rewardFormOpen, setRewardFormOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="dialog-shell dialog-shell--legacy max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader className="border-b border-border/70 pb-4">
            <DialogTitle>{t('flywheel.legacyWorkspace.title')}</DialogTitle>
            <DialogDescription>
              {t('flywheel.legacyWorkspace.description')}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-4 rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.72)] p-1">
              <TabsTrigger value="overview">{t('flywheel.legacyWorkspace.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="forms">{t('flywheel.legacyWorkspace.tabs.forms')}</TabsTrigger>
              <TabsTrigger value="bindings">{t('flywheel.legacyWorkspace.tabs.bindings')}</TabsTrigger>
              <TabsTrigger value="history">{t('flywheel.legacyWorkspace.tabs.history')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="surface-panel-compat">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-[hsl(var(--ink-soft))]" />
                      {t('flywheel.legacyWorkspace.migrationAdvice.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-4 w-4 text-foreground" />
                      <span>{t('flywheel.legacyWorkspace.migrationAdvice.primaryFlow')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-4 w-4 text-foreground" />
                      <span>{t('flywheel.legacyWorkspace.migrationAdvice.quickEntry')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-4 w-4 text-foreground" />
                      <span>{t('flywheel.legacyWorkspace.migrationAdvice.compatibilityOnly')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="surface-panel-compat">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock3 className="h-5 w-5 text-[hsl(var(--ink-soft))]" />
                      {t('flywheel.legacyWorkspace.compatibilityCapabilities.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.68)] p-3">
                      <span>{t('flywheel.legacyWorkspace.compatibilityCapabilities.habitForm')}</span>
                      <Button size="sm" variant="outline" className="btn-subtle" onClick={() => setHabitFormOpen(true)}>
                        {t('flywheel.legacyWorkspace.open')}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.68)] p-3">
                      <span>{t('flywheel.legacyWorkspace.compatibilityCapabilities.rewardForm')}</span>
                      <Button size="sm" variant="outline" className="btn-subtle" onClick={() => setRewardFormOpen(true)}>
                        {t('flywheel.legacyWorkspace.open')}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.68)] p-3">
                      <span>{t('flywheel.legacyWorkspace.compatibilityCapabilities.bindingManager')}</span>
                      <span className="text-muted-foreground">{t('flywheel.legacyWorkspace.compatibilityCapabilities.bindingManagerHint')}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.68)] p-3">
                      <span>{t('flywheel.legacyWorkspace.compatibilityCapabilities.historyView')}</span>
                      <span className="text-muted-foreground">{t('flywheel.legacyWorkspace.compatibilityCapabilities.historyViewHint')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forms" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="surface-panel-compat">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-[hsl(var(--ink-soft))]" />
                      {t('flywheel.legacyWorkspace.forms.habitEntryTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>{t('flywheel.legacyWorkspace.forms.habitEntryDescription')}</p>
                    <Button className="btn-subtle" onClick={() => setHabitFormOpen(true)}>{t('flywheel.legacyWorkspace.forms.createHabit')}</Button>
                  </CardContent>
                </Card>

                <Card className="surface-panel-compat">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-[hsl(var(--ink-soft))]" />
                      {t('flywheel.legacyWorkspace.forms.rewardEntryTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>{t('flywheel.legacyWorkspace.forms.rewardEntryDescription')}</p>
                    <Button className="btn-subtle" onClick={() => setRewardFormOpen(true)}>{t('flywheel.legacyWorkspace.forms.createReward')}</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bindings" className="space-y-4">
              <BindingManager
                habits={habits.map((habit) => ({
                  id: habit.id,
                  name: habit.name,
                  energyValue: habit.energy_value,
                  bindingRewardId: habit.binding_reward_id ?? undefined,
                  isArchived: habit.is_archived,
                }))}
                rewards={rewards.map((reward) => ({
                  id: reward.id,
                  name: reward.name,
                  energyCost: reward.energy_cost,
                  currentEnergy: reward.current_energy,
                  isRedeemed: reward.is_redeemed,
                }))}
                onUpdateHabit={(habitId, updates) => {
                  void onUpdateHabit(habitId, {
                    binding_reward_id: updates.bindingRewardId ?? null,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                {t('flywheel.legacyWorkspace.historyNotice')}
              </div>
              <HistoryView />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <HabitForm
        isOpen={habitFormOpen}
        onClose={() => setHabitFormOpen(false)}
        rewards={rewards.map((reward) => ({ id: reward.id, name: reward.name }))}
        onSubmit={(data) => {
          void onCreateHabit({
            name: data.name,
            description: data.description,
            energy_value: data.energyValue,
            binding_reward_id: data.bindingRewardId ?? null,
            frequency: data.frequency,
            target_count: data.targetCount ?? 1,
            is_archived: false,
          });
        }}
      />

      <RewardForm
        isOpen={rewardFormOpen}
        onClose={() => setRewardFormOpen(false)}
        onSubmit={(data) => {
          void onCreateReward({
            name: data.name,
            description: data.description,
            energy_cost: data.energyCost,
            plan_type: 'one_time',
            status: 'wish',
            target_date: '',
            motivation_note: '',
            abandon_reason: '',
            reflection_note: '',
            redeemed_at: '',
            priority: 0,
          });
        }}
      />
    </>
  );
}
