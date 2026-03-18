import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { FolderKanban, Gift, LayoutDashboard, Plus, Settings, Sparkles, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import UserAccountPopover from '@/components/UserAccountPopover';
import { useRewardPlans } from '@/hooks/useRewardPlans';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PlanDraft, PLAN_STATUS_LABELS, PlanStatus } from '@/types/flywheel';
import { useTranslation } from 'react-i18next';

type AppView = 'dashboard' | 'plans' | 'review' | 'library' | 'settings';

const DashboardView = lazy(() => import('@/components/vnext/DashboardView'));
const PlansView = lazy(() => import('@/components/vnext/PlansView'));
const ReviewView = lazy(() => import('@/components/vnext/ReviewView'));
const LibraryView = lazy(() => import('@/components/vnext/LibraryView'));
const LazySettingsCenter = lazy(() => import('@/components/SettingsCenter'));
const PlanComposer = lazy(() => import('@/components/PlanComposer'));
const PlanDetailDialog = lazy(() => import('@/components/PlanDetailDialog'));
const RedeemPlanDialog = lazy(() => import('@/components/RedeemPlanDialog'));
const AbandonPlanDialog = lazy(() => import('@/components/AbandonPlanDialog'));
const LegacyWorkspaceDialog = lazy(() => import('@/components/LegacyWorkspaceDialog'));

const Index = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [redeemPlanId, setRedeemPlanId] = useState<string | null>(null);
  const [abandonPlanId, setAbandonPlanId] = useState<string | null>(null);
  const [legacyWorkspaceOpen, setLegacyWorkspaceOpen] = useState(false);
  const [milestoneNotice, setMilestoneNotice] = useState<{
    title: string;
    description: string;
    planId?: string;
    action?: 'open' | 'redeem';
  } | null>(null);

  const flywheel = useRewardPlans();
  const { toast } = useToast();
  const { t } = useTranslation();

  const navigation = useMemo(() => ([
    { id: 'dashboard', label: t('vnextShell.nav.dashboard'), icon: LayoutDashboard, shortLabel: t('vnextShell.nav.dashboardShort') },
    { id: 'plans', label: t('vnextShell.nav.plans'), icon: Gift, shortLabel: t('vnextShell.nav.plansShort') },
    { id: 'review', label: t('vnextShell.nav.review'), icon: Compass, shortLabel: t('vnextShell.nav.reviewShort') },
    { id: 'library', label: t('vnextShell.nav.library'), icon: FolderKanban, shortLabel: t('vnextShell.nav.libraryShort') },
    { id: 'settings', label: t('vnextShell.nav.settings'), icon: Settings, shortLabel: t('vnextShell.nav.settingsShort') },
  ] as const satisfies Array<{ id: AppView; label: string; icon: typeof LayoutDashboard; shortLabel: string }>), [t]);

  const selectedPlan = flywheel.plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const redeemPlan = flywheel.plans.find((plan) => plan.id === redeemPlanId) ?? null;
  const abandonPlan = flywheel.plans.find((plan) => plan.id === abandonPlanId) ?? null;

  const reviewStats = useMemo(() => {
    const validatingPlans = flywheel.plans.filter((plan) => plan.status === 'validating').length;
    const filteredOutPlans = flywheel.plans.filter((plan) => plan.status === 'abandoned').length;

    return {
      totalCompletions: flywheel.completions.length,
      totalPlans: flywheel.plans.length,
      validatingPlans,
      filteredOutPlans,
    };
  }, [flywheel.completions.length, flywheel.plans]);

  const topPlansByProgress = useMemo(() => {
    return [...flywheel.plans]
      .filter((plan) => plan.boundHabits.length > 0)
      .sort((left, right) => right.progress - left.progress)
      .slice(0, 5);
  }, [flywheel.plans]);

  const habitContributionRanking = useMemo(() => {
    const counts = new Map<string, { completions: number; energy: number }>();

    flywheel.completions.forEach((completion) => {
      const current = counts.get(completion.habit_id) ?? { completions: 0, energy: 0 };
      current.completions += 1;
      current.energy += completion.energy_gained;
      counts.set(completion.habit_id, current);
    });

    return flywheel.habits
      .map((habit) => ({
        habit,
        completions: counts.get(habit.id)?.completions ?? 0,
        energy: counts.get(habit.id)?.energy ?? 0,
      }))
      .filter((item) => item.completions > 0)
      .sort((left, right) => right.energy - left.energy)
      .slice(0, 5);
  }, [flywheel.completions, flywheel.habits]);

  useEffect(() => {
    if (!milestoneNotice) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMilestoneNotice(null);
    }, 4800);

    return () => window.clearTimeout(timeout);
  }, [milestoneNotice]);

  const handleToggleHabit = async (habitId: string) => {
    const action = flywheel.todayActions.find((item) => item.habit.id === habitId);
    if (!action) {
      return;
    }

    const { habit, isCompleted, reward } = action;

    if (isCompleted) {
      flywheel.optimisticRemoveCompletion(habit.id);
      if (reward) {
        flywheel.optimisticSubtractEnergyFromReward(reward.id, habit.energy_value);
      }

      try {
        await flywheel.unCheckInHabit(habit.id);
        flywheel.refetchCompletions();
        flywheel.refetchRewards();
        flywheel.clearOptimisticRemoval(habit.id);
        toast({
          title: t('flywheel.index.toast.progressRolledBackTitle'),
          description: reward
            ? t('flywheel.index.toast.progressRolledBackReward', { reward: reward.name, energy: habit.energy_value })
            : t('flywheel.index.toast.progressRolledBackHabit', { habit: habit.name }),
        });
      } catch {
        flywheel.rollbackRemoveCompletion(habit.id);
        if (reward) {
          flywheel.rollbackSubtractEnergyFromReward(reward.id, habit.energy_value);
        }
      }

      return;
    }

    flywheel.optimisticAddCompletion(habit.id);
    if (reward) {
      flywheel.optimisticAddEnergyToReward(reward.id, habit.energy_value);
    }

    try {
      await flywheel.checkInHabit(habit.id);
      flywheel.refetchCompletions();
      flywheel.refetchRewards();
      if (reward) {
        const previous = reward.current_energy;
        const projected = previous + habit.energy_value;
        const remaining = Math.max(reward.energy_cost - projected, 0);
        const thresholdMessage = projected >= reward.energy_cost
          ? t('flywheel.index.toast.thresholdReached')
          : projected / reward.energy_cost >= 0.8
            ? t('flywheel.index.toast.finalSprint')
            : t('flywheel.index.toast.steadyMomentum');
        toast({
          title: t('flywheel.index.toast.progressAdvancedTitle', { reward: reward.name }),
          description: t('flywheel.index.toast.progressAdvancedDescription', {
            energy: habit.energy_value,
            remaining,
            thresholdMessage,
          }),
        });
        if (projected >= reward.energy_cost) {
          setMilestoneNotice({
            title: t('flywheel.index.milestone.reachedTitle', { reward: reward.name }),
            description: t('flywheel.index.milestone.reachedDescription', {
              current: projected,
              target: reward.energy_cost,
            }),
            planId: reward.id,
            action: 'redeem',
          });
        } else if (previous / reward.energy_cost < 0.8 && projected / reward.energy_cost >= 0.8) {
          setMilestoneNotice({
            title: t('flywheel.index.milestone.sprintTitle', { reward: reward.name }),
            description: t('flywheel.index.milestone.sprintDescription', { remaining }),
            planId: reward.id,
            action: 'open',
          });
        }
      }
    } catch {
      flywheel.rollbackAddCompletion(habit.id);
      if (reward) {
        flywheel.rollbackAddEnergyToReward(reward.id, habit.energy_value);
      }
    }
  };

  const handleCreatePlan = async (draft: PlanDraft) => {
    const reward = await flywheel.createPlan(draft);
    if (!reward) {
      return;
    }

    setActiveView('plans');
    setSelectedPlanId(reward.id);
    toast({
      title: t('flywheel.index.toast.planCreatedTitle'),
      description: t('flywheel.index.toast.planCreatedDescription', { name: draft.name }),
    });
  };

  const handleUpdatePlanStatus = async (rewardId: string, status: PlanStatus) => {
    await flywheel.updatePlanStatus(rewardId, status);
    flywheel.refetchRewards();
    toast({
      title: t('flywheel.index.toast.planStatusUpdatedTitle'),
      description: t('flywheel.index.toast.planStatusUpdatedDescription', { status: t(PLAN_STATUS_LABELS[status]) }),
    });
  };

  const handleDuplicatePlan = async (planId: string) => {
    const sourcePlan = flywheel.plans.find((plan) => plan.id === planId);
    if (!sourcePlan) {
      return;
    }

    const duplicate = await flywheel.createPlan({
      name: `${sourcePlan.name} · ${t('flywheel.index.newRoundSuffix')}`,
      description: sourcePlan.description ?? '',
      type: sourcePlan.type,
      energyCost: sourcePlan.energy_cost,
      motivationNote: sourcePlan.motivation_note ?? '',
      targetDate: '',
      priority: sourcePlan.priority ?? 0,
      status: 'wish',
      habits: sourcePlan.boundHabits.map((habit) => ({
        name: habit.name,
        description: habit.description ?? '',
        energyValue: habit.energy_value,
        frequency: habit.frequency ?? 'daily',
        targetCount: habit.target_count ?? 1,
      })),
    });

    if (!duplicate) {
      return;
    }

    setActiveView('plans');
    setSelectedPlanId(duplicate.id);
    toast({
      title: t('flywheel.index.toast.templateCopiedTitle'),
      description: t('flywheel.index.toast.templateCopiedDescription', { name: sourcePlan.name }),
    });
  };

  const handleReviveHabitTemplate = async (habitId: string) => {
    const template = flywheel.habits.find((habit) => habit.id === habitId);
    if (!template) {
      return;
    }

    await flywheel.createHabit({
      name: `${template.name} · ${t('flywheel.index.habitTemplateSuffix')}`,
      description: template.description,
      energy_value: template.energy_value,
      binding_reward_id: null,
      frequency: template.frequency ?? 'daily',
      target_count: template.target_count ?? 1,
      is_archived: false,
    });

    toast({
      title: t('flywheel.index.toast.habitTemplateCopiedTitle'),
      description: t('flywheel.index.toast.habitTemplateCopiedDescription', { name: template.name }),
    });
  };

  const handleRedeemPlan = async (rewardId: string) => {
    await flywheel.redeemReward(rewardId);
    await flywheel.updatePlanStatus(rewardId, 'redeemed');
    flywheel.refetchRewards();
    setRedeemPlanId(null);
    toast({
      title: t('flywheel.index.toast.planRedeemedTitle'),
      description: t('flywheel.index.toast.planRedeemedDescription'),
    });
  };

  const handleAbandonPlan = async (rewardId: string, abandonReason: string, reflectionNote: string) => {
    await flywheel.updateReward(rewardId, {
      status: 'abandoned',
      abandon_reason: abandonReason,
      reflection_note: reflectionNote,
    });
    flywheel.refetchRewards();
    setAbandonPlanId(null);
    toast({
      title: t('flywheel.index.toast.planAbandonedTitle'),
      description: t('flywheel.index.toast.planAbandonedDescription'),
    });
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      rewards: flywheel.plans,
      habits: flywheel.habits,
      completions: flywheel.completions,
      totalLifetimeEnergy: flywheel.totalLifetimeEnergy,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-flywheel-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (data: unknown) => {
    const payload = data as {
      rewards?: Array<Record<string, unknown>>;
      habits?: Array<Record<string, unknown>>;
      completions?: Array<Record<string, unknown>>;
      totalLifetimeEnergy?: number;
    };

    void (async () => {
      if (!payload.rewards || !payload.habits) {
        return;
      }

      const rewardIdMap = new Map<string, string>();
      const habitIdMap = new Map<string, string>();
      const userId = (await supabase.auth.getUser()).data.user?.id;

      if (!userId) {
        return;
      }

      for (const reward of payload.rewards) {
        const { data: insertedReward } = await supabase
          .from('rewards')
          .insert({
            user_id: userId,
            name: String(reward.name ?? ''),
            description: typeof reward.description === 'string' ? reward.description : null,
            energy_cost: Number(reward.energy_cost ?? 0),
            current_energy: Number(reward.current_energy ?? 0),
            is_redeemed: Boolean(reward.is_redeemed),
            redeemed_at: typeof reward.redeemed_at === 'string' ? reward.redeemed_at : null,
            plan_type: typeof reward.type === 'string' ? reward.type : typeof reward.plan_type === 'string' ? reward.plan_type : 'one_time',
            status: typeof reward.status === 'string' ? reward.status : 'active',
            target_date: typeof reward.target_date === 'string' ? reward.target_date : null,
            motivation_note: typeof reward.motivation_note === 'string' ? reward.motivation_note : null,
            priority: Number(reward.priority ?? 0),
          })
          .select()
          .single();

        if (insertedReward && typeof reward.id === 'string') {
          rewardIdMap.set(reward.id, insertedReward.id);
        }
      }

      for (const habit of payload.habits) {
        const bindingRewardId =
          typeof habit.binding_reward_id === 'string' ? rewardIdMap.get(habit.binding_reward_id) ?? null : null;
        const { data: insertedHabit } = await supabase
          .from('habits')
          .insert({
            user_id: userId,
            name: String(habit.name ?? ''),
            description: typeof habit.description === 'string' ? habit.description : null,
            energy_value: Number(habit.energy_value ?? 0),
            binding_reward_id: bindingRewardId,
            is_archived: Boolean(habit.is_archived),
            frequency: typeof habit.frequency === 'string' ? habit.frequency : 'daily',
            target_count: Number(habit.target_count ?? 1),
          })
          .select()
          .single();

        if (insertedHabit && typeof habit.id === 'string') {
          habitIdMap.set(habit.id, insertedHabit.id);
        }
      }

      if (payload.completions) {
        for (const completion of payload.completions) {
          const mappedHabitId =
            typeof completion.habit_id === 'string' ? habitIdMap.get(completion.habit_id) : undefined;
          if (!mappedHabitId) {
            continue;
          }

          await supabase.from('habit_completions').insert({
            user_id: userId,
            habit_id: mappedHabitId,
            completed_at: typeof completion.completed_at === 'string' ? completion.completed_at : new Date().toISOString(),
            energy_gained: Number(completion.energy_gained ?? 0),
            notes: typeof completion.notes === 'string' ? completion.notes : null,
            plan_id_snapshot:
              typeof completion.plan_id_snapshot === 'string'
                ? rewardIdMap.get(completion.plan_id_snapshot) ?? null
                : null,
            frequency_bucket: typeof completion.frequency_bucket === 'string' ? completion.frequency_bucket : null,
            evidence_type: typeof completion.evidence_type === 'string' ? completion.evidence_type : null,
          });
        }
      }

      if (typeof payload.totalLifetimeEnergy === 'number') {
        await supabase.from('user_energy').upsert({
          user_id: userId,
          total_energy: payload.totalLifetimeEnergy,
        });
      }

      flywheel.refetchRewards();
      flywheel.refetchCompletions();
    })();
  };

  const clearAllData = () => {
    void (async () => {
      await supabase.from('habit_completions').delete().not('id', 'is', null);
      await supabase.from('habits').delete().not('id', 'is', null);
      await supabase.from('rewards').delete().not('id', 'is', null);
      await supabase.from('user_energy').update({ total_energy: 0 }).not('user_id', 'is', null);
      flywheel.refetchRewards();
      flywheel.refetchCompletions();
    })();
  };

  const resetToDefaults = () => {
    clearAllData();
    void handleCreatePlan({
      name: t('flywheel.index.defaultPlan.name'),
      description: t('flywheel.index.defaultPlan.description'),
      type: 'one_time',
      energyCost: 120,
      motivationNote: t('flywheel.index.defaultPlan.motivation'),
      targetDate: '',
      priority: 1,
      status: 'validating',
      habits: [
        {
          name: t('flywheel.index.defaultPlan.habitName'),
          description: t('flywheel.index.defaultPlan.habitDescription'),
          energyValue: 20,
          frequency: 'weekly',
          targetCount: 1,
        },
      ],
    });
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <Card className="lg:hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('settings.userAccount')}</span>
            <UserAccountPopover />
          </CardTitle>
        </CardHeader>
      </Card>
      <Suspense fallback={<Card className="h-40 animate-pulse bg-muted/40" />}>
        <LazySettingsCenter
          onExportData={exportData}
          onImportData={importData}
          onClearAllData={clearAllData}
          onResetToDefaults={resetToDefaults}
          onOpenLegacyWorkspace={() => setLegacyWorkspaceOpen(true)}
        />
      </Suspense>
    </div>
  );

  const renderContent = () => {
    if (flywheel.loading) {
      return <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Card key={index} className="h-40 animate-pulse bg-muted/40" />)}</div>;
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <Suspense fallback={<Card className="h-40 animate-pulse bg-muted/40" />}>
            <DashboardView
              topPlan={flywheel.topPlan}
              todayActions={flywheel.todayActions}
              completedTodayCount={flywheel.completedTodayCount}
              activeTodayCount={flywheel.activeTodayCount}
              activePlansCount={flywheel.activePlansCount}
              totalLifetimeEnergy={flywheel.totalLifetimeEnergy}
              topPlansByProgress={topPlansByProgress}
              libraryPlans={flywheel.plans.filter((plan) => ['redeemed', 'abandoned'].includes(plan.status))}
              onCreatePlan={() => setComposerOpen(true)}
              onOpenPlan={(planId) => setSelectedPlanId(planId)}
              onToggleHabit={handleToggleHabit}
            />
          </Suspense>
        );
      case 'plans':
        return (
          <Suspense fallback={<Card className="h-40 animate-pulse bg-muted/40" />}>
            <PlansView plans={flywheel.plans} onCreatePlan={() => setComposerOpen(true)} onOpenPlan={(planId) => setSelectedPlanId(planId)} />
          </Suspense>
        );
      case 'review':
        return (
          <Suspense fallback={<Card className="h-40 animate-pulse bg-muted/40" />}>
            <ReviewView
              reviewStats={reviewStats}
              topPlansByProgress={topPlansByProgress}
              habitContributionRanking={habitContributionRanking}
              validatedPlans={flywheel.plans.filter((plan) => plan.status === 'redeemed')}
              filteredPlans={flywheel.plans.filter((plan) => plan.status === 'abandoned')}
              completions={flywheel.completions}
            />
          </Suspense>
        );
      case 'library':
        return (
          <Suspense fallback={<Card className="h-40 animate-pulse bg-muted/40" />}>
            <LibraryView
              plans={flywheel.plans.filter((plan) => ['redeemed', 'abandoned'].includes(plan.status))}
              archivedHabits={flywheel.habits.filter((habit) => habit.is_archived)}
              onOpenPlan={(planId) => setSelectedPlanId(planId)}
              onDuplicatePlan={handleDuplicatePlan}
              onReviveHabitTemplate={handleReviveHabitTemplate}
            />
          </Suspense>
        );
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div className="editorial-shell min-h-screen text-foreground lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      {milestoneNotice && (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center lg:inset-x-auto lg:right-6 lg:top-6 lg:bottom-auto">
          <Card className="surface-panel-brass pointer-events-auto w-full max-w-md shadow-apple-xl">
            <CardContent className="space-y-3 p-5">
              <div className="space-y-1">
                <div className="text-sm font-medium text-[hsl(var(--brass))]">{t('vnextShell.milestone')}</div>
                <div className="text-lg font-semibold">{milestoneNotice.title}</div>
                <div className="text-sm leading-6 text-muted-foreground">{milestoneNotice.description}</div>
              </div>
              <div className="flex gap-2">
                {milestoneNotice.planId && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (milestoneNotice.action === 'redeem') {
                        setRedeemPlanId(milestoneNotice.planId);
                      } else {
                        setSelectedPlanId(milestoneNotice.planId);
                      }
                      setMilestoneNotice(null);
                    }}
                  >
                    {milestoneNotice.action === 'redeem' ? t('flywheel.index.milestone.redeemAction') : t('vnextShell.viewPlan')}
                  </Button>
                )}
                  <Button size="sm" variant="outline" className="btn-subtle" onClick={() => setMilestoneNotice(null)}>
                  {t('vnextShell.dismissMilestone')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <aside className="surface-subtle-grid hidden border-r border-border/70 bg-[hsl(var(--sidebar-background)/0.82)] lg:flex lg:flex-col">
        <div className="border-b border-border/80 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-[hsl(var(--brass)/0.18)] bg-[linear-gradient(145deg,hsl(var(--primary)),hsl(var(--primary)/0.92))] text-[hsl(var(--primary-foreground))] shadow-apple-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="editorial-display text-2xl font-semibold">{t('auth.title')}</h1>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--ink-soft))]">
                {t('vnextShell.description')}
              </p>
            </div>
            <UserAccountPopover />
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-[1.25rem] px-4 py-3 text-left text-sm font-medium transition',
                activeView === item.id
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-apple-sm'
                  : 'text-muted-foreground hover:bg-[hsl(var(--card)/0.72)] hover:text-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-border/80 p-4">
          <Button className="w-full" onClick={() => setComposerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('vnextShell.createPlan')}
          </Button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-[hsl(var(--background)/0.88)] backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-[hsl(var(--ink-soft))]">{t('auth.title')}</div>
              <div className="font-medium">{navigation.find((item) => item.id === activeView)?.label}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => setComposerOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
              <UserAccountPopover />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 px-2 pb-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
              className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition',
                  activeView === item.id
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-muted-foreground hover:bg-[hsl(var(--card)/0.72)] hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.shortLabel}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="p-4 md:p-6">{renderContent()}</div>
      </main>

      <Suspense fallback={null}>
        <PlanComposer
          isOpen={composerOpen}
          onClose={() => setComposerOpen(false)}
          onSubmit={handleCreatePlan}
          availableHabits={flywheel.habits}
        />

        <PlanDetailDialog
          isOpen={Boolean(selectedPlan)}
          plan={selectedPlan}
          habits={flywheel.habits}
          onClose={() => setSelectedPlanId(null)}
          onBindHabit={flywheel.bindHabitToPlan}
          onUpdateStatus={handleUpdatePlanStatus}
          onOpenRedeem={setRedeemPlanId}
          onOpenAbandon={setAbandonPlanId}
        />

        <RedeemPlanDialog
          isOpen={Boolean(redeemPlan)}
          plan={redeemPlan}
          onClose={() => setRedeemPlanId(null)}
          onConfirm={handleRedeemPlan}
        />

        <AbandonPlanDialog
          isOpen={Boolean(abandonPlan)}
          plan={abandonPlan}
          onClose={() => setAbandonPlanId(null)}
          onConfirm={handleAbandonPlan}
        />

        <LegacyWorkspaceDialog
          isOpen={legacyWorkspaceOpen}
          onClose={() => setLegacyWorkspaceOpen(false)}
          habits={flywheel.habits}
          rewards={flywheel.rewards}
          onCreateHabit={flywheel.createHabit}
          onCreateReward={flywheel.createReward}
          onUpdateHabit={flywheel.updateHabit}
        />
      </Suspense>
    </div>
  );
};

export default Index;
