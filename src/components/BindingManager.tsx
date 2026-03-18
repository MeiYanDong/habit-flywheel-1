import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { Link2, Unlink, Target, CheckCircle, Gift, Activity, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface BindingManagerProps {
  habits: Array<{
    id: string;
    name: string;
    energyValue: number;
    bindingRewardId?: string;
    isArchived: boolean;
  }>;
  rewards: Array<{
    id: string;
    name: string;
    energyCost: number;
    currentEnergy: number;
    isRedeemed: boolean;
  }>;
  onUpdateHabit: (habitId: string, updates: { bindingRewardId?: string }) => void;
}

const BindingManager: React.FC<BindingManagerProps> = ({
  habits,
  rewards,
  onUpdateHabit
}) => {
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const activeHabits = habits.filter(h => !h.isArchived);
  const availableRewards = rewards.filter(r => !r.isRedeemed);

  const createBinding = () => {
    if (!selectedHabit || !selectedReward) {
      toast({
        title: t('flywheel.bindingManager.toast.missingSelectionTitle'),
        description: t('flywheel.bindingManager.toast.missingSelectionDescription'),
        variant: "destructive",
      });
      return;
    }

    onUpdateHabit(selectedHabit, { bindingRewardId: selectedReward });
    
    const habit = habits.find(h => h.id === selectedHabit);
    const reward = rewards.find(r => r.id === selectedReward);
    
    toast({
      title: t('flywheel.bindingManager.toast.createdTitle'),
      description: t('flywheel.bindingManager.toast.createdDescription', {
        habit: habit?.name ?? '',
        reward: reward?.name ?? '',
      }),
    });

    setSelectedHabit('');
    setSelectedReward('');
  };

  const removeBinding = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    const reward = rewards.find(r => r.id === habit?.bindingRewardId);
    
    onUpdateHabit(habitId, { bindingRewardId: undefined });
    
    toast({
      title: t('flywheel.bindingManager.toast.removedTitle'),
      description: t('flywheel.bindingManager.toast.removedDescription', {
        habit: habit?.name ?? '',
        reward: reward?.name ?? '',
      }),
    });
  };

  const unboundHabits = activeHabits.filter(h => !h.bindingRewardId);

  // 获取有绑定习惯的奖励
  const rewardsWithBindings = availableRewards.filter(reward => 
    activeHabits.some(habit => habit.bindingRewardId === reward.id)
  ).map(reward => {
    const boundHabits = activeHabits.filter(habit => habit.bindingRewardId === reward.id);
    return {
      ...reward,
      boundHabits
    };
  });

  return (
    <div className="space-y-6 pt-6">
      <div className="text-center">
        <h2 className="editorial-display mb-2 text-3xl font-semibold">{t('flywheel.bindingManager.title')}</h2>
        <p className="text-muted-foreground">{t('flywheel.bindingManager.description')}</p>
      </div>

      <Card className="surface-panel-compat">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="h-5 w-5 text-primary" />
            <span>{t('flywheel.bindingManager.createTitle')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('flywheel.bindingManager.selectHabit')}
              </label>
              <EnhancedSelect
                value={selectedHabit}
                onValueChange={setSelectedHabit}
                options={unboundHabits.map(habit => ({
                  value: habit.id,
                  label: habit.name,
                  icon: <Activity className="h-4 w-4" />,
                  count: habit.energyValue,
                  description: t('flywheel.bindingManager.habitOptionDescription', { energy: habit.energyValue })
                }))}
                width="w-full"
                placeholder={t('flywheel.bindingManager.selectHabitPlaceholder')}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('flywheel.bindingManager.selectReward')}
              </label>
              <EnhancedSelect
                value={selectedReward}
                onValueChange={setSelectedReward}
                options={availableRewards.map(reward => ({
                  value: reward.id,
                  label: reward.name,
                  icon: <Star className="h-4 w-4" />,
                  count: reward.energyCost,
                  description: t('flywheel.bindingManager.rewardOptionDescription', { energy: reward.energyCost })
                }))}
                width="w-full"
                placeholder={t('flywheel.bindingManager.selectRewardPlaceholder')}
              />
            </div>
          </div>

          <Button 
            onClick={createBinding}
            className="w-full"
            disabled={!selectedHabit || !selectedReward}
          >
            {t('flywheel.bindingManager.createButton')}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-medium">
          {t('flywheel.bindingManager.existingBindings', { count: rewardsWithBindings.length })}
        </h3>

        {rewardsWithBindings.length === 0 ? (
          <Card className="surface-panel-compat p-8">
            <div className="text-center text-muted-foreground">
              <Target className="mx-auto mb-4 h-12 w-12 text-[hsl(var(--ink-soft))]" />
              <p>{t('flywheel.bindingManager.emptyTitle')}</p>
              <p className="text-sm mt-2">{t('flywheel.bindingManager.emptyDescription')}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {rewardsWithBindings.map(reward => {
              const progress = Math.min((reward.currentEnergy / reward.energyCost) * 100, 100);

              return (
                <Card key={reward.id} className="surface-panel hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Gift className="h-6 w-6 text-[hsl(var(--brass))]" />
                          <div>
                            <h4 className="text-lg font-semibold">{reward.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="status-chip status-chip--validating">
                                {t('flywheel.bindingManager.rewardNeed', { energy: reward.energyCost })}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {t('flywheel.bindingManager.boundHabitCount', { count: reward.boundHabits.length })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{t('flywheel.bindingManager.progress')}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-bar h-3">
                          <div 
                            className="progress-fill h-3"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-center text-sm text-[hsl(var(--brass))]">
                          {reward.currentEnergy}/{reward.energyCost}⚡
                        </div>
                      </div>

                      <div>
                        <h5 className="mb-3 text-sm font-medium">{t('flywheel.bindingManager.boundHabits')}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {reward.boundHabits.map(habit => (
                            <div 
                              key={habit.id}
                              className="ranking-item flex items-center justify-between rounded-lg p-3"
                            >
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-[hsl(var(--redeemed))]" />
                                <div>
                                  <span className="text-sm font-medium">{habit.name}</span>
                                  <div className="text-xs text-muted-foreground">
                                    {t('flywheel.bindingManager.boundHabitEnergy', { energy: habit.energyValue })}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeBinding(habit.id)}
                                className="btn-subtle px-2 py-1 text-xs"
                              >
                                <Unlink className="h-3 w-3 mr-1" />
                                {t('flywheel.bindingManager.unbind')}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BindingManager;
