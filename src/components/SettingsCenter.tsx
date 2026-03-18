
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Upload, Trash2, RotateCcw, Bell, Palette, Database, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

interface SettingsCenterProps {
  onExportData: () => void;
  onImportData: (data: unknown) => void;
  onClearAllData: () => void;
  onResetToDefaults: () => void;
  onOpenLegacyWorkspace?: () => void;
}

const SettingsCenter: React.FC<SettingsCenterProps> = ({
  onExportData,
  onImportData,
  onClearAllData,
  onResetToDefaults,
  onOpenLegacyWorkspace,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const {
    notifications,
    darkMode,
    showProgress,
    showStats,
    setNotifications,
    setDarkMode,
    setShowProgress,
    setShowStats,
  } = useSettings();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            onImportData(data);
            toast({
              title: t('settings.importSuccess'),
              description: t('settings.importSuccessDesc'),
            });
          } catch (error) {
            toast({
              title: t('settings.importFailed'),
              description: t('settings.importFailedDesc'),
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    onExportData();
    toast({
      title: t('settings.exportSuccess'),
      description: t('settings.exportSuccessDesc'),
    });
  };

  const handleClearData = () => {
    if (window.confirm(t('settings.clearConfirm'))) {
      onClearAllData();
      toast({
        title: t('settings.dataCleared'),
        description: t('settings.dataClearedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      onResetToDefaults();
      toast({
        title: t('settings.resetSuccess'),
        description: t('settings.resetSuccessDesc'),
      });
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="text-center">
        <h2 className="editorial-display mb-2 text-3xl font-semibold">{t('settings.title')}</h2>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>{t('settings.notifications')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">{t('settings.pushNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.pushNotificationsDesc')}</p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-primary" />
            <span>{t('settings.interface')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">{t('settings.darkMode')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.darkModeDesc')}</p>
            </div>
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showProgress">{t('settings.showProgress')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.showProgressDesc')}</p>
            </div>
            <Switch
              id="showProgress"
              checked={showProgress}
              onCheckedChange={setShowProgress}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showStats">{t('settings.showStats')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.showStatsDesc')}</p>
            </div>
            <Switch
              id="showStats"
              checked={showStats}
              onCheckedChange={setShowStats}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <span>{t('settings.language')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LanguageSelector />
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <span>{t('settings.dataManagement')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExport}
              className="btn-subtle flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('settings.exportData')}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleImport}
              className="btn-subtle flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{t('settings.importData')}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="btn-subtle flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t('settings.resetDefault')}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleClearData}
              className="btn-quiet-danger flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('settings.clearAllData')}</span>
            </Button>
          </div>

          <div className="rounded-lg border border-[hsl(var(--brass)/0.2)] bg-[hsl(var(--brass)/0.08)] p-3">
            <p className="text-sm text-foreground">
              <strong>{t('common.confirm')}：</strong> {t('settings.dataBackupTip')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel-compat">
        <CardHeader>
          <CardTitle>{t('settings.compatibilityLab')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-[hsl(var(--brass)/0.24)] bg-[hsl(var(--brass)/0.08)] p-4">
            <div className="text-sm font-medium text-foreground">{t('settings.compatibilityNote')}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settings.compatibilityNoteDesc')}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium">{t('settings.rewardFirstMode')}</div>
              <p className="text-sm text-muted-foreground">{t('settings.compatibilityLabDesc')}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenLegacyWorkspace?.()}
              disabled={!onOpenLegacyWorkspace}
              className="btn-subtle"
            >
              {t('settings.openLegacyWorkspace')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel-muted">
        <CardHeader>
          <CardTitle>{t('settings.appInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.version')}</span>
            <Badge variant="secondary" className="status-chip status-chip--validating">{t('settings.vnextPreview')}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.lastUpdate')}</span>
            <span className="text-sm">2026-03-18</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.developer')}</span>
            <span className="text-sm">梅炎栋</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsCenter;
