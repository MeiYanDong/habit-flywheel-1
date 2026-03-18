import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, Calendar, TrendingUp, Zap, CheckCircle, Clock, CalendarDays, Archive } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useHabitCompletions, TimeRange } from '@/hooks/useHabitCompletions';
import { useTranslation } from 'react-i18next';

const HistoryView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  
  // 使用优化版的hooks，传递时间范围参数
  const { habits, loading: habitsLoading } = useHabits();
  const { 
    completions, 
    loading: completionsLoading, 
    preloadTimeRange,
    cacheInfo 
  } = useHabitCompletions(timeRange);

  // 转换数据格式以匹配组件需求
  const transformedHabits = useMemo(() => {
    return habits.map(habit => ({
      id: habit.id,
      name: habit.name,
      energyValue: habit.energy_value,
      isArchived: habit.is_archived
    }));
  }, [habits]);

  const transformedCompletions = useMemo(() => {
    return completions.map(completion => ({
      id: completion.id,
      habitId: completion.habit_id,
      date: completion.completed_at.split('T')[0], // 转换为YYYY-MM-DD格式
      energy: completion.energy_gained,
      timestamp: completion.completed_at
    }));
  }, [completions]);

  // 预加载其他时间范围的数据（智能预加载）
  useEffect(() => {
    if (!completionsLoading && completions.length > 0) {
      // 根据当前时间范围，预加载用户可能查看的下一个时间范围
      const preloadMap: Record<TimeRange, TimeRange[]> = {
        'week': ['month'], // 查看周数据的用户可能想看月数据
        'month': ['week', 'all'], // 查看月数据的用户可能想看周或全部数据
        'all': ['month'] // 查看全部数据的用户可能想看月数据
      };
      
      const toPreload = preloadMap[timeRange] || [];
      toPreload.forEach(range => {
        if (!cacheInfo.hasData(range)) {
          // 延迟500ms后预加载，避免影响当前页面
          setTimeout(() => preloadTimeRange(range), 500);
        }
      });
    }
  }, [timeRange, completionsLoading, completions.length, preloadTimeRange, cacheInfo]);

  // 计算统计数据（客户端筛选逻辑保持不变，但数据量已减少）
  const stats = useMemo(() => {
    if (completionsLoading || habitsLoading) {
      return {
        totalCompletions: 0,
        totalEnergy: 0,
        uniqueDays: 0,
        dailyStats: {},
        habitStats: {},
        filteredCompletions: []
      };
    }

    // 由于数据已经在服务端按时间范围过滤，这里只需要按习惯过滤
    const filteredCompletions = transformedCompletions.filter(c => {
      return selectedHabit === 'all' || c.habitId === selectedHabit;
    });

    const totalCompletions = filteredCompletions.length;
    const totalEnergy = filteredCompletions.reduce((sum, c) => sum + c.energy, 0);
    const uniqueDays = new Set(filteredCompletions.map(c => c.date)).size;

    // 按日期分组
    const dailyStats = filteredCompletions.reduce((acc, completion) => {
      const date = completion.date;
      if (!acc[date]) {
        acc[date] = { completions: 0, energy: 0 };
      }
      acc[date].completions += 1;
      acc[date].energy += completion.energy;
      return acc;
    }, {} as Record<string, { completions: number; energy: number }>);

    // 按习惯分组
    const habitStats = filteredCompletions.reduce((acc, completion) => {
      const habitId = completion.habitId;
      if (!acc[habitId]) {
        acc[habitId] = { completions: 0, energy: 0 };
      }
      acc[habitId].completions += 1;
      acc[habitId].energy += completion.energy;
      return acc;
    }, {} as Record<string, { completions: number; energy: number }>);

    return {
      totalCompletions,
      totalEnergy,
      uniqueDays,
      dailyStats,
      habitStats,
      filteredCompletions
    };
  }, [transformedCompletions, selectedHabit, completionsLoading, habitsLoading]);

  // 获取最近7天的数据用于折线图显示
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = stats.dailyStats[dateStr] || { completions: 0, energy: 0 };
      days.push({
        date: dateStr,
        day: date.toLocaleDateString(i18n.language, { month: 'numeric', day: 'numeric' }),
        completions: dayStats.completions,
        energy: dayStats.energy
      });
    }
    return days;
  }, [i18n.language, stats.dailyStats]);

  // 时间范围变化处理（优化：添加预加载提示）
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    // 显示加载提示（如果数据未缓存）
    if (!cacheInfo.hasData(newRange)) {
      // 这里可以添加加载提示逻辑
      console.log(`Loading ${newRange} data...`);
    }
  };

  // 如果数据正在加载，显示优化的加载状态
  if (habitsLoading || completionsLoading) {
    return (
      <div className="w-full max-w-none overflow-x-hidden">
        <div className="space-y-6 pt-6 p-2 sm:p-4 lg:px-0">
          <div className="text-center">
            <h2 className="editorial-display mb-2 text-2xl font-semibold">{t('flywheel.historyView.title')}</h2>
            <p className="text-muted-foreground">
              {cacheInfo.hasData(timeRange) ? t('flywheel.historyView.loadingFromCache') : t('common.loading')}
            </p>
          </div>
          
          {/* 优化的骨架屏 */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="surface-panel min-w-0">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <div className="animate-pulse">
                    <div className="mx-auto mb-2 h-6 w-6 rounded bg-muted"></div>
                    <div className="mb-1 h-4 rounded bg-muted"></div>
                    <div className="h-3 rounded bg-muted"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* 显示缓存状态（开发模式下） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center text-xs text-muted-foreground">
              {t('flywheel.historyView.cacheStatus', { count: cacheInfo.size })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none overflow-x-hidden">
      {/* 移动端全宽容器 */}
      <div className="space-y-6 pt-6 p-2 sm:p-4 lg:px-0">
        <div className="text-center">
          <h2 className="editorial-display mb-2 text-2xl font-semibold">{t('flywheel.historyView.title')}</h2>
          <p className="text-muted-foreground">{t('flywheel.historyView.description')}</p>
        </div>

        {/* 筛选器 - 移动端优化 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <EnhancedSelect
            value={timeRange}
            onValueChange={(value: TimeRange) => handleTimeRangeChange(value)}
            options={[
              {
                value: 'week',
                label: t('flywheel.historyView.range.week'),
                icon: <Clock className="h-4 w-4" />,
                description: t('flywheel.historyView.range.weekDescription')
              },
              {
                value: 'month',
                label: t('flywheel.historyView.range.month'),
                icon: <CalendarDays className="h-4 w-4" />,
                description: t('flywheel.historyView.range.monthDescription')
              },
              {
                value: 'all',
                label: t('flywheel.historyView.range.all'),
                icon: <Archive className="h-4 w-4" />,
                description: t('flywheel.historyView.range.allDescription')
              }
            ]}
            width="w-full sm:w-44"
            placeholder={t('flywheel.historyView.range.placeholder')}
          />

          <EnhancedSelect
            value={selectedHabit}
            onValueChange={setSelectedHabit}
            options={[
              {
                value: 'all',
                label: t('flywheel.historyView.allHabits'),
                icon: <CheckCircle className="h-4 w-4" />,
                count: transformedHabits.length,
                description: t('flywheel.historyView.allHabitsDescription')
              },
              ...transformedHabits.map(habit => ({
                value: habit.id,
                label: habit.name,
                icon: <Zap className="h-4 w-4" />,
                description: t('flywheel.historyView.habitHistoryDescription', { name: habit.name })
              }))
            ]}
            width="w-full sm:w-48"
            placeholder={t('flywheel.historyView.habitPlaceholder')}
          />
        </div>

        {/* 显示数据状态信息 */}
        {transformedCompletions.length === 0 && (
            <Card className="surface-panel-compat">
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-[hsl(var(--ink-soft))]" />
                <h3 className="mb-2 text-lg font-medium">{t('flywheel.historyView.emptyTitle')}</h3>
                <p className="text-muted-foreground">{t('flywheel.historyView.emptyDescription')}</p>
              </CardContent>
            </Card>
          )}

        {/* 统计卡片 - 移动端2x2布局 */}
        {transformedCompletions.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
              <Card className="metric-panel min-w-0">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <CheckCircle className="mx-auto mb-1 h-4 w-4 text-[hsl(var(--redeemed))] sm:mb-2 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  <div className="truncate text-sm font-bold sm:text-lg md:text-2xl">{stats.totalCompletions}</div>
                  <div className="text-xs text-muted-foreground sm:text-xs md:text-sm">{t('flywheel.historyView.stats.totalCompletions')}</div>
                </CardContent>
              </Card>

              <Card className="metric-panel min-w-0">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <Zap className="mx-auto mb-1 h-4 w-4 text-[hsl(var(--brass))] sm:mb-2 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  <div className="truncate text-sm font-bold text-[hsl(var(--brass))] sm:text-lg md:text-2xl">{stats.totalEnergy}</div>
                  <div className="text-xs text-muted-foreground sm:text-xs md:text-sm">{t('flywheel.historyView.stats.totalEnergy')}</div>
                </CardContent>
              </Card>

              <Card className="metric-panel min-w-0">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <Calendar className="mx-auto mb-1 h-4 w-4 text-primary sm:mb-2 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  <div className="truncate text-sm font-bold sm:text-lg md:text-2xl">{stats.uniqueDays}</div>
                  <div className="text-xs text-muted-foreground sm:text-xs md:text-sm">{t('flywheel.historyView.stats.activeDays')}</div>
                </CardContent>
              </Card>

              <Card className="metric-panel min-w-0">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <TrendingUp className="mx-auto mb-1 h-4 w-4 text-primary sm:mb-2 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  <div className="truncate text-sm font-bold sm:text-lg md:text-2xl">
                    {stats.uniqueDays > 0 ? Math.round(stats.totalCompletions / stats.uniqueDays * 10) / 10 : 0}
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-xs md:text-sm">{t('flywheel.historyView.stats.dailyAverage')}</div>
                </CardContent>
              </Card>
            </div>

            {/* 折线图趋势 - 移动端优化 */}
            <Card className="surface-panel w-full min-w-0">
              <CardHeader className="pb-2 sm:pb-3 md:pb-6">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                  <BarChart3 className="h-3 w-3 text-primary sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span>{t('flywheel.historyView.chart.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-2 sm:px-6">
                <div className="w-full overflow-x-auto">
                  <div className="h-[160px] sm:h-[200px] md:h-[300px] min-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        className="text-xs"
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        className="text-xs"
                      />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card) / 0.96)',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))',
                            fontSize: '12px'
                          }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completions" 
                          stroke="hsl(var(--primary))"
                        strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 1, r: 3 }}
                          activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                          stroke="hsl(var(--brass))"
                        strokeWidth={2}
                          dot={{ fill: 'hsl(var(--brass))', strokeWidth: 1, r: 3 }}
                          activeDot={{ r: 4, stroke: 'hsl(var(--brass))', strokeWidth: 2 }}
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-1 text-center text-xs text-muted-foreground sm:mt-2 sm:text-xs md:mt-4 md:text-sm">
                  {t('flywheel.historyView.chart.legend')}
                </div>
              </CardContent>
            </Card>

            {/* 习惯排行 - 移动端优化 */}
            <Card className="surface-panel w-full min-w-0">
              <CardHeader className="pb-2 sm:pb-3 md:pb-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">{t('flywheel.historyView.rankingTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-2 sm:px-6">
                <div className="space-y-2 md:space-y-3">
                  {Object.entries(stats.habitStats)
                    .sort(([,a], [,b]) => b.completions - a.completions)
                    .slice(0, 5)
                    .map(([habitId, habitStat], index) => {
                      const habit = transformedHabits.find(h => h.id === habitId);
                      if (!habit) return null;

                      return (
                        <div key={habitId} className="ranking-item flex min-w-0 items-center justify-between rounded-lg p-2 sm:p-3">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                              index === 0 ? 'bg-[hsl(var(--brass))]' : 
                              index === 1 ? 'bg-[hsl(var(--primary)/0.72)]' : 
                              index === 2 ? 'bg-[hsl(var(--validating))]' : 'bg-[hsl(var(--wish)/0.72)]'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="truncate text-xs font-medium sm:text-sm md:text-base">{habit.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 text-xs sm:text-xs md:text-sm flex-shrink-0">
                            <div className="text-center">
                              <div className="font-bold">{habitStat.completions}</div>
                              <div className="text-muted-foreground">{t('flywheel.historyView.completions')}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold">{habitStat.energy}</div>
                              <div className="text-muted-foreground">{t('common.energy')}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
