import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
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
} from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { inferDeveloperAvatarUrl } from '@/pages/insight/domain/repoPlatform';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Skeleton } from '@/app/components/ui/skeleton';
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
        alt={provider}
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
      return <Twitter className="size-4" />;
    case 'linkedin-oauth2':
      return <Linkedin className="size-4" />;
    case 'google-oauth2':
      return <Globe className="size-4" />;
    default:
      return <Link2 className="size-4" />;
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
      setAvailableProviders(providersData?.providers ?? []);
      setProvidersLoaded(true);
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('profile.loadProvidersFailed'));
    } finally {
      setProvidersLoading(false);
    }
  }, [t]);

  useEffect(() => {
    Promise.all([
      api.get('/me/profile'),
      api.get('/me/work-experiences'),
      api.get('/me/educations'),
      api.get('/auth/social/connections').catch(() => null),
    ])
      .then(([profileRes, workRes, eduRes, socialRes]) => {
        setData(profileRes.data);
        setWorkExperiences(workRes.data?.items ?? []);
        setEducations(eduRes.data?.items ?? []);
        if (socialRes) {
          setSocialConnections(socialRes.data?.connections ?? []);
          setCanDisconnectSocial(socialRes.data?.can_disconnect ?? true);
        }
      })
      .catch((error) => {
        const apiError = getApiError(error);
        toast.error(apiError.message || t('profile.loadFailedMsg'));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-muted-foreground text-center">{t('profile.loadFailed')}</p>
      </div>
    );
  }

  const { user, profile, balance } = data;

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
      '_blank'
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

  // 已绑定社交账号的头像 URL（复用数据洞察开发者详情页的构造逻辑）
  // 优先使用国内平台头像以加快加载速度：gitee > atomgit > github > gitlab
  const socialAvatarUrl = (() => {
    const priority = ['gitee', 'atomgit', 'github', 'gitlab'];
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
  })();

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        <Button asChild>
          <Link to="/profile/edit">
            <Pencil className="size-4" />
            {t('profile.editProfile')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('profile.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                {socialAvatarUrl && (
                  <AvatarImage src={socialAvatarUrl} alt={user.username || ''} />
                )}
                <AvatarFallback className="text-lg">
                  {(user.username?.charAt(0) || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium text-lg">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-4" />
                <span>{t('profile.username')}：{user.username}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                <span>{t('profile.email')}：{user.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 个人简介卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('profile.bio')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profile.bio && (
              <p className="text-muted-foreground">{profile.bio}</p>
            )}
            {profile.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-4" />
                <span>{profile.company}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.birth_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span>{t('profile.birthday')}：{format(new Date(profile.birth_date), 'yyyy-MM')}</span>
              </div>
            )}
            {!profile.bio && !profile.company && !profile.location && !profile.birth_date && (
              <p className="text-muted-foreground italic">{t('profile.noBio')}</p>
            )}
          </CardContent>
        </Card>

        {/* 社交账号卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{t('profile.socialAccounts')}</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={handleOpenAddDialog}
              >
                <Plus className="size-4" />
                {t('profile.addAccount')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {socialConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t('profile.socialNotBound')}</p>
            ) : (
              <div className="space-y-2">
                {socialConnections.map((conn) => {
                  const labelInfo = formatSocialAccountLabel(conn.username, conn.uid);
                  const rowKey =
                    conn.social_auth_id ?? `${conn.provider}-${conn.uid ?? ''}`;
                  return (
                  <div
                    key={rowKey}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                      <div className="flex size-6 items-center justify-center rounded-full bg-muted shrink-0">
                        {getSocialProviderIcon(conn.provider)}
                      </div>
                      <span className="font-medium shrink-0">{conn.name}</span>
                      {conn.is_connected && labelInfo && (
                        conn.profile_url ? (
                          <a
                            href={conn.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={labelInfo.full}
                            className="text-xs text-primary hover:underline truncate min-w-0"
                          >
                            {labelInfo.display}
                          </a>
                        ) : (
                          <span
                            title={labelInfo.full}
                            className="text-xs text-muted-foreground truncate min-w-0"
                          >
                            {labelInfo.display}
                          </span>
                        )
                      )}
                    </div>
                    {conn.is_connected && conn.social_auth_id !== null ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2 text-xs shrink-0"
                            disabled={
                              !canDisconnectSocial ||
                              disconnectingId === conn.social_auth_id
                            }
                          >
                            {disconnectingId === conn.social_auth_id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Unlink className="size-4" />
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
                                  conn.social_auth_id as number
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

        {/* 积分概览卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('profile.pointsOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
                <Coins className="size-5 text-primary" />
                <span className="text-lg font-bold">{balance.total}</span>
                <span className="text-xs text-muted-foreground">{t('profile.totalBalance')}</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
                <Wallet className="size-5 text-green-500" />
                <span className="text-lg font-bold">{balance.cash}</span>
                <span className="text-xs text-muted-foreground">{t('profile.cashPoints')}</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
                <Gift className="size-5 text-orange-500" />
                <span className="text-lg font-bold">{balance.gift}</span>
                <span className="text-xs text-muted-foreground">{t('profile.giftPoints')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工作经历卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="size-4" />
            {t('profile.workExperience')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workExperiences.length > 0 ? (
            <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {workExperiences.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-6 top-1.5 size-3 rounded-full border-2 border-primary bg-background" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exp.company_name}</span>
                      <Badge variant="secondary">{exp.title}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(exp.start_date), 'yyyy-MM')} -{' '}
                      {exp.end_date ? format(new Date(exp.end_date), 'yyyy-MM') : t('common.present')}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">{t('profile.noWorkExperience')}</p>
          )}
        </CardContent>
      </Card>

      {/* 教育背景卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GraduationCap className="size-4" />
            {t('profile.education')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {educations.length > 0 ? (
            <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {educations.map((edu) => (
                <div key={edu.id} className="relative">
                  <div className="absolute -left-6 top-1.5 size-3 rounded-full border-2 border-primary bg-background" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{edu.institution_name}</span>
                      <Badge variant="secondary">{edu.degree}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(edu.start_date), 'yyyy-MM')} -{' '}
                      {edu.end_date ? format(new Date(edu.end_date), 'yyyy-MM') : t('common.present')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">{t('profile.noEducation')}</p>
          )}
        </CardContent>
      </Card>

      {/* 添加社交账号弹窗 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('profile.addAccountTitle')}</DialogTitle>
            <DialogDescription>{t('profile.addAccountDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 已绑定账号清单（与外部卡片一致的 login(id) 展示） */}
            <section>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">
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
                        className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5"
                      >
                        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                          <div className="flex size-6 items-center justify-center rounded-full bg-muted shrink-0">
                            {getSocialProviderIcon(conn.provider)}
                          </div>
                          <span className="font-medium shrink-0">{conn.name}</span>
                          {labelInfo && (
                            conn.profile_url ? (
                              <a
                                href={conn.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={labelInfo.full}
                                className="text-xs text-primary hover:underline truncate min-w-0"
                              >
                                {labelInfo.display}
                              </a>
                            ) : (
                              <span
                                title={labelInfo.full}
                                className="text-xs text-muted-foreground truncate min-w-0"
                              >
                                {labelInfo.display}
                              </span>
                            )
                          )}
                        </div>
                        {conn.social_auth_id !== null && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2 text-xs shrink-0"
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
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Unlink className="size-4" />
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
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                {t('profile.bindablePlatformsHeading')}
              </h4>
              {providersLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
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
                        className="justify-between h-auto py-2.5"
                        onClick={() => handleSelectProviderToBind(provider.provider)}
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted shrink-0">
                            {getSocialProviderIcon(provider.provider)}
                          </span>
                          <span className="font-medium">{provider.name}</span>
                          {boundCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {t('profile.boundCountBadge', { count: boundCount })}
                            </Badge>
                          )}
                        </span>
                        <Link2 className="size-4 text-muted-foreground" />
                      </Button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('profile.addAccountTip')}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
