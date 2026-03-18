import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Zap, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const features = [
  {
    icon: Zap,
    titleKey: 'welcome.features.flywheel.title',
    descriptionKey: 'welcome.features.flywheel.description',
  },
  {
    icon: Award,
    titleKey: 'welcome.features.rewards.title',
    descriptionKey: 'welcome.features.rewards.description',
  },
  {
    icon: ShieldCheck,
    titleKey: 'welcome.features.supabase.title',
    descriptionKey: 'welcome.features.supabase.description',
  },
  {
    icon: Smartphone,
    titleKey: 'welcome.features.pwa.title',
    descriptionKey: 'welcome.features.pwa.description',
  },
];

const Welcome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pillars = t('welcome.story.pillars.items', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const cycleSteps = t('welcome.story.cycle.steps', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const narrativeParagraphs = t('welcome.story.narrative.paragraphs', { returnObjects: true }) as string[];
  const quote = t('welcome.story.narrative.quote');
  const quoteCite = t('welcome.story.narrative.quoteCite');

  useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.09),_transparent_42%),radial-gradient(circle_at_bottom_right,_hsl(var(--brass)/0.12),_transparent_28%)]" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-24 md:flex-row md:items-center md:pb-28 md:pt-28">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <Badge className="status-chip status-chip--validating mx-auto w-fit md:mx-0">
              {t('welcome.badge')}
            </Badge>
            <h1 className="editorial-display text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              {t('welcome.title')}
            </h1>
            <p className="text-balance text-lg text-[hsl(var(--ink-soft))] sm:text-xl">
              {t('welcome.subtitle')}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
              <Button size="lg" asChild className="group">
                <Link to="/auth">
                  {t('welcome.primaryCta')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <a href="#features">{t('welcome.secondaryCta')}</a>
              </Button>
            </div>
          </div>
          <div className="flex flex-1 justify-center md:justify-end">
            <div className="surface-panel surface-subtle-grid relative w-full max-w-md rounded-[2rem] p-6 backdrop-blur">
              <div className="space-y-5">
                <h2 className="text-lg font-medium text-foreground">
                  {t('welcome.preview.title')}
                </h2>
                <p className="text-sm text-[hsl(var(--ink-soft))]">
                  {t('welcome.preview.description')}
                </p>
                <div className="dialog-section space-y-4 rounded-[1.5rem] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {t('welcome.preview.habitExample')}
                    </span>
                    <span className="rounded-full border border-[hsl(var(--brass)/0.22)] bg-[hsl(var(--brass)/0.1)] px-3 py-1 text-xs font-medium text-[hsl(var(--brass))]">
                      +30 pts
                    </span>
                  </div>
                  <div className="rounded-xl border border-dashed border-[hsl(var(--primary)/0.24)] bg-[hsl(var(--primary)/0.06)] p-4 text-sm text-muted-foreground">
                    {t('welcome.preview.bindingExample')}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="metric-panel rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">
                        {t('welcome.preview.progressTitle')}
                      </p>
                      <p className="text-lg font-semibold text-foreground">82%</p>
                    </div>
                    <div className="metric-panel rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">
                        {t('welcome.preview.energyTitle')}
                      </p>
                      <p className="text-lg font-semibold text-[hsl(var(--brass))]">540 pts</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('welcome.preview.disclaimer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="editorial-display text-3xl font-semibold text-foreground">
              {t('welcome.features.title')}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {t('welcome.features.subtitle')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map(({ icon: Icon, titleKey, descriptionKey }) => (
              <div
                key={titleKey}
                className="surface-panel group rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:border-[hsl(var(--primary)/0.36)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.16)] bg-[hsl(var(--primary)/0.08)] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t(titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="border-t border-border/60 bg-[hsl(var(--muted)/0.36)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="editorial-display text-3xl font-semibold text-foreground">
              {t('welcome.story.title')}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {t('welcome.story.subtitle')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="surface-panel rounded-[1.75rem] p-6"
              >
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--brass)/0.18)] bg-[hsl(var(--brass)/0.08)] text-sm font-semibold text-[hsl(var(--brass))]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="surface-panel rounded-[1.75rem] p-6">
              <h3 className="text-xl font-semibold text-foreground">
                {t('welcome.story.cycle.title')}
              </h3>
              <ol className="mt-6 space-y-4">
                {cycleSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.08)] text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="surface-panel rounded-[1.75rem] p-6">
              <h3 className="text-xl font-semibold text-foreground">
                {t('welcome.story.narrative.title')}
              </h3>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {narrativeParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <figure className="mt-6 border-l-4 border-[hsl(var(--brass))] pl-4 text-[hsl(var(--foreground))]">
                <blockquote className="text-base font-medium">
                  "{quote}"
                </blockquote>
                <figcaption className="mt-2 text-xs uppercase tracking-[0.2em] text-[hsl(var(--brass))]">
                  {quoteCite}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-border/60 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.42))]">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
          <h2 className="editorial-display text-2xl font-semibold text-foreground md:text-4xl">
            {t('welcome.cta.title')}
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            {t('welcome.cta.subtitle')}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="group">
              <Link to="/auth">
                {t('welcome.cta.primary')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="btn-subtle" asChild>
              <a href="https://supabase.com" target="_blank" rel="noreferrer">
                {t('welcome.cta.secondary')}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;

