import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  type LucideIcon,
  User,
  Mail,
  Calendar,
  MapPin,
  Building2,
  Globe,
  Twitter,
  Linkedin,
  Coins,
  Gift,
  Wallet,
  Briefcase,
  GraduationCap,
  Pencil,
  Link2,
  Unlink,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { inferDeveloperAvatarUrl } from '@/pages/insight/domain/repoPlatform';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/app/components/ui/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';

interface Profile {
  bio: string;
  birth_date: string | null;
  company: string;
  location: string;
}

interface SocialConnectionItem {
  provider: string;
  name: string;
  icon: string;
  is_connected: boolean;
  uid: string | null;
  username: string | null;
  profile_url: string | null;
  social_auth_id: number | null;
}

interface SocialProviderItem {
  provider: string;
  name: string;
  icon: string;
  start_url: string;
}

// 与落地页 platforms-section.tsx 保持一致，复用 OpenDigger OSS 提供的平台 logo
// 文件名规则：https://oss.open-digger.cn/logos/{slug}.png
const OPEN_DIGGER_LOGO_SLUGS: Record<string, string> = {
  github: 'github',
  gitlab: 'gitlab',
  gitee: 'gitee',
  atomgit: 'atomgit',
  huggingface: 'huggingface',
};

function getSocialProviderIcon(provider: string) {
  const logoSlug = OPEN_DIGGER_LOGO_SLUGS[provider];
  if (logoSlug) {
    return (
      <img
        src={`https://oss.open-digger.cn/logos/${logoSlug}.png`}
        alt=""
        aria-hidden="true"
        className="size-4 object-contain"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  switch (provider) {
    case 'twitter-oauth2':
      return <Twitter className="size-4" aria-hidden="true" />;
    case 'linkedin-oauth2':
      return <Linkedin className="size-4" aria-hidden="true" />;
    case 'google-oauth2':
      return <Globe className="size-4" aria-hidden="true" />;
    default:
      return <Link2 className="size-4" aria-hidden="true" />;
  }
}

// 超过指定长度的文本以省略号截断，防止超长 ID/用户名冲出容器
function truncateText(text: string, max: number): string {
  if (!text) return text;
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(1, max - 1))}…`;
}

// 构造 username(uid) 展示文本，同时返回原始未截断的文本用于 title 属性
function formatSocialAccountLabel(
  username: string | null | undefined,
  uid: string | null | undefined,
): { display: string; full: string } | null {
  const u = (username ?? '').trim();
  const i = (uid ?? '').trim();
  if (!u && !i) return null;
  const fullParts = u && i ? `${u}(${i})` : u || i;
  const tu = u ? truncateText(u, 20) : '';
  const ti = i ? truncateText(i, 16) : '';
  const display = tu && ti ? `${tu}(${ti})` : tu || ti;
  return { display, full: fullParts };
}

function formatPoints(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function formatMonth(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'yyyy-MM');
}

interface WorkExperience {
  id: number;
  company_name: string;
  title: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

interface Education {
  id: number;
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
}

interface PointsBalance {
  total: number;
  cash: number;
  gift: number;
}

type PointsTone = 'primary' | 'cash' | 'gift';

interface PointsItem {
  key: keyof PointsBalance;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: PointsTone;
}

interface UserSummary {
  id: number;
  username: string;
  email: string;
}

interface ProfileData {
  user: UserSummary;
  profile: Profile;
  balance: PointsBalance;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ProfileData | null>(null);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [socialConnections, setSocialConnections] = useState<SocialConnectionItem[]>([]);
  const [canDisconnectSocial, setCanDisconnectSocial] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // 添加社交账号弹窗状态
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<SocialProviderItem[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersLoaded, setProvidersLoaded] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, workRes, eduRes, socialRes] = await Promise.all([
        api.get('/me/profile'),
        api.get('/me/work-experiences'),
        api.get('/me/educations'),
        api.get('/auth/social/connections').catch(() => null),
      ]);

      setData(profileRes.data);
      setWorkExperiences(workRes.data?.items ?? []);
      setEducations(eduRes.data?.items ?? []);
      if (socialRes) {
        setSocialConnections(socialRes.data?.connections ?? []);
        setCanDisconnectSocial(socialRes.data?.can_disconnect ?? true);
      }
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('profile.loadFailedMsg'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchSocialConnections = useCallback(async () => {
    try {
      const { data: socialData } = await api.get('/auth/social/connections');
      setSocialConnections(socialData?.connections ?? []);
      setCanDisconnectSocial(socialData?.can_disconnect ?? true);
    } catch {
      // 静默处理：社交连接禁用时不阻断主流程
    }
  }, []);

  const fetchAvailableProviders = useCallback(async () => {
    setProvidersLoading(true);
    try {
      const { data: providersData } = await api.get('/auth/social/providers');
      // 仅展示 GitHub 与 AtomGit；其它后端虽配置保留，但前端不再作为可绑定平台暴露
      const allowed = new Set(['github', 'atomgit']);
      const items: SocialProviderItem[] = (providersData?.providers ?? []).filter(
        (p: SocialProviderItem) => allowed.has(p.provider),
      );
      setAvailableProviders(items);
      setProvidersLoaded(true);
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('profile.loadProvidersFailed'));
    } finally {
      setProvidersLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const socialAvatarUrl = useMemo(() => {
    const priority = ['github', 'atomgit'];
    for (const provider of priority) {
      const conn = socialConnections.find(
        (c) => c.is_connected && c.provider === provider && (c.username || c.uid),
      );
      if (!conn) continue;
      const url = inferDeveloperAvatarUrl(
        conn.provider,
        conn.username || conn.uid || '',
        conn.uid,
      );
      if (url) return url;
    }
    return '';
  }, [socialConnections]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-11 w-28" />
        </div>
        <Skeleton className="h-36 rounded-xl" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto flex min-h-[min(24rem,60dvh)] max-w-4xl items-center justify-center px-4 py-8 sm:px-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <RefreshCw className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-balance">{t('profile.loadFailed')}</h1>
              <p className="text-sm text-muted-foreground text-pretty">{t('profile.loadFailedMsg')}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => void loadProfile()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, profile, balance } = data;
  const pointsItems: PointsItem[] = [
    {
      key: 'total',
      label: t('profile.totalBalance'),
      value: balance.total,
      icon: Coins,
      tone: 'primary',
    },
    {
      key: 'cash',
      label: t('profile.cashPoints'),
      value: balance.cash,
      icon: Wallet,
      tone: 'cash',
    },
    {
      key: 'gift',
      label: t('profile.giftPoints'),
      value: balance.gift,
      icon: Gift,
      tone: 'gift',
    },
  ];

  function handleConnectProvider(provider: string) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const accessToken = localStorage.getItem('access_token') ?? '';
    if (!accessToken) {
      toast.error(t('profile.loginExpired'));
      return;
    }
    const query = new URLSearchParams({ access_token: accessToken }).toString();
    window.open(
      `${baseUrl}/auth/social/${provider}/start?${query}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  function handleOpenAddDialog() {
    setAddDialogOpen(true);
    if (!providersLoaded && !providersLoading) {
      void fetchAvailableProviders();
    }
  }

  function handleSelectProviderToBind(provider: string) {
    handleConnectProvider(provider);
    // OAuth 流程会在新标签页进行，关闭弹窗并提示用户
    setAddDialogOpen(false);
    toast.info(t('profile.bindOpenedInNewTab'));
  }

  async function handleDisconnectProvider(provider: string, associationId: number) {
    setDisconnectingId(associationId);
    try {
      await api.delete(`/auth/social/connections/${provider}/${associationId}`);
      toast.success(t('profile.unbindSuccess'));
      await fetchSocialConnections();
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('profile.unbindFailed'));
    } finally {
      setDisconnectingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold text-balance">{t('profile.title')}</h1>
          <p className="text-sm text-muted-foreground text-pretty">{t('profile.basicInfo')}</p>
        </div>
        <Button asChild className="min-h-11 w-full sm:w-auto">
          <Link to="/profile/edit">
            <Pencil className="size-4" aria-hidden="true" />
            {t('profile.editProfile')}
          </Link>
        </Button>
      </div>

      <Card className="overflow-visible">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 shrink-0 ring-1 ring-border sm:size-20">
                {socialAvatarUrl && (
                  <AvatarImage src={socialAvatarUrl} alt={user.username || ''} />
                )}
                <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary sm:text-2xl">
                  {(user.username?.charAt(0) || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold text-foreground sm:text-2xl" title={user.username}>
                    {user.username}
                  </p>
                  <p className="truncate text-sm text-muted-foreground" title={user.email}>
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1">
                    <User className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{user.username}</span>
                  </span>
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1">
                    <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{user.email}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-80 sm:gap-3">
              {pointsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="min-w-0 rounded-lg border border-border bg-secondary/40 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Icon
                        className={cn(
                          'size-4 shrink-0',
                          item.tone === 'primary' && 'text-primary',
                          item.tone === 'cash' && 'text-chart-2',
                          item.tone === 'gift' && 'text-chart-4',
                        )}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="truncate text-lg font-semibold tabular-nums text-foreground" title={String(item.value)}>
                      {formatPoints(item.value)}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground text-pretty">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('profile.bio')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {profile.bio ? (
                <p className="max-w-3xl text-muted-foreground text-pretty break-words">
                  {profile.bio}
                </p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3">
                {profile.company ? (
                  <div className="flex min-w-0 items-start gap-2 text-muted-foreground">
                    <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span className="break-words">{profile.company}</span>
                  </div>
                ) : null}
                {profile.location ? (
                  <div className="flex min-w-0 items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span className="break-words">{profile.location}</span>
                  </div>
                ) : null}
                {profile.birth_date && formatMonth(profile.birth_date) ? (
                  <div className="flex min-w-0 items-start gap-2 text-muted-foreground">
                    <Calendar className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{t('profile.birthday')}：{formatMonth(profile.birth_date)}</span>
                  </div>
                ) : null}
              </div>
              {!profile.bio && !profile.company && !profile.location && !profile.birth_date && (
                <p className="text-muted-foreground italic">{t('profile.noBio')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Briefcase className="size-4" aria-hidden="true" />
                {t('profile.workExperience')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workExperiences.length > 0 ? (
                <div className="space-y-4">
                  {workExperiences.map((exp) => (
                    <div key={exp.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <p className="break-words font-medium text-foreground">{exp.company_name}</p>
                          {exp.description ? (
                            <p className="text-sm text-muted-foreground text-pretty break-words">
                              {exp.description}
                            </p>
                          ) : null}
                        </div>
                        <Badge variant="secondary" className="max-w-full whitespace-normal text-left">
                          {exp.title}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatMonth(exp.start_date)} - {exp.end_date ? formatMonth(exp.end_date) : t('common.present')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('profile.noWorkExperience')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <GraduationCap className="size-4" aria-hidden="true" />
                {t('profile.education')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {educations.length > 0 ? (
                <div className="space-y-4">
                  {educations.map((edu) => (
                    <div key={edu.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <p className="break-words font-medium text-foreground">{edu.institution_name}</p>
                          <p className="text-sm text-muted-foreground break-words">{edu.field_of_study}</p>
                        </div>
                        <Badge variant="secondary" className="max-w-full whitespace-normal text-left">
                          {edu.degree}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatMonth(edu.start_date)} - {edu.end_date ? formatMonth(edu.end_date) : t('common.present')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('profile.noEducation')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch">
                <CardTitle className="text-base font-semibold">{t('profile.socialAccounts')}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto lg:w-full"
                  onClick={handleOpenAddDialog}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {t('profile.addAccount')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {socialConnections.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('profile.socialNotBound')}</p>
              ) : (
                <div className="space-y-3">
                  {socialConnections.map((conn) => {
                    const labelInfo = formatSocialAccountLabel(conn.username, conn.uid);
                    const rowKey =
                      conn.social_auth_id ?? `${conn.provider}-${conn.uid ?? ''}`;
                    return (
                      <div
                        key={rowKey}
                        className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            {getSocialProviderIcon(conn.provider)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground" title={conn.name}>
                              {conn.name}
                            </p>
                            {conn.is_connected && labelInfo ? (
                              conn.profile_url ? (
                                <a
                                  href={conn.profile_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={labelInfo.full}
                                  className="block truncate text-xs text-primary hover:underline"
                                >
                                  {labelInfo.display}
                                </a>
                              ) : (
                                <span
                                  title={labelInfo.full}
                                  className="block truncate text-xs text-muted-foreground"
                                >
                                  {labelInfo.display}
                                </span>
                              )
                            ) : null}
                          </div>
                        </div>
                        {conn.is_connected && conn.social_auth_id !== null ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="min-h-11 shrink-0"
                                disabled={
                                  !canDisconnectSocial ||
                                  disconnectingId === conn.social_auth_id
                                }
                              >
                                {disconnectingId === conn.social_auth_id ? (
                                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <Unlink className="size-4" aria-hidden="true" />
                                )}
                                {t('profile.unbind')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('profile.confirmUnbindTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('profile.confirmUnbindDesc', { name: conn.name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDisconnectProvider(
                                      conn.provider,
                                      conn.social_auth_id as number,
                                    )
                                  }
                                >
                                  {t('profile.confirmUnbind')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* 添加社交账号弹窗 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden sm:max-w-2xl">
          <DialogHeader className="pr-8">
            <DialogTitle>{t('profile.addAccountTitle')}</DialogTitle>
            <DialogDescription>{t('profile.addAccountDesc')}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
            {/* 已绑定账号清单（与外部卡片一致的 login(id) 展示） */}
            <section>
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                {t('profile.boundAccountsHeading')}
              </h4>
              {socialConnections.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {t('profile.socialNotBound')}
                </p>
              ) : (
                <div className="space-y-2">
                  {socialConnections.map((conn) => {
                    const labelInfo = formatSocialAccountLabel(conn.username, conn.uid);
                    const rowKey =
                      conn.social_auth_id ?? `${conn.provider}-${conn.uid ?? ''}`;
                    return (
                      <div
                        key={rowKey}
                        className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            {getSocialProviderIcon(conn.provider)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground" title={conn.name}>
                              {conn.name}
                            </p>
                            {labelInfo ? (
                              conn.profile_url ? (
                                <a
                                  href={conn.profile_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={labelInfo.full}
                                  className="block truncate text-xs text-primary hover:underline"
                                >
                                  {labelInfo.display}
                                </a>
                              ) : (
                                <span
                                  title={labelInfo.full}
                                  className="block truncate text-xs text-muted-foreground"
                                >
                                  {labelInfo.display}
                                </span>
                              )
                            ) : null}
                          </div>
                        </div>
                        {conn.social_auth_id !== null && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="min-h-11 shrink-0"
                            disabled={
                              !canDisconnectSocial ||
                              disconnectingId === conn.social_auth_id
                            }
                            onClick={() =>
                              handleDisconnectProvider(
                                conn.provider,
                                conn.social_auth_id as number,
                              )
                            }
                          >
                            {disconnectingId === conn.social_auth_id ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Unlink className="size-4" aria-hidden="true" />
                            )}
                            {t('profile.unbind')}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 可绑定的 providers（全部可点，支持同一平台多次绑定） */}
            <section>
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                {t('profile.bindablePlatformsHeading')}
              </h4>
              {providersLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground" role="status">
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : availableProviders.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  {t('profile.noProvidersAvailable')}
                </p>
              ) : (
                <div className="grid gap-2">
                  {availableProviders.map((provider) => {
                    const boundCount = socialConnections.filter(
                      (c) => c.provider === provider.provider,
                    ).length;
                    return (
	                      <Button
                        key={provider.provider}
                        type="button"
                        variant="outline"
                        className="min-h-11 justify-between py-2.5"
                        onClick={() => handleSelectProviderToBind(provider.provider)}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted shrink-0">
                            {getSocialProviderIcon(provider.provider)}
                          </span>
                          <span className="truncate font-medium">{provider.name}</span>
                          {boundCount > 0 && (
                            <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
                              {t('profile.boundCountBadge', { count: boundCount })}
                            </Badge>
                          )}
                        </span>
                        <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </Button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
          <p className="text-xs text-muted-foreground text-pretty">
            {t('profile.addAccountTip')}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setAddDialogOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
