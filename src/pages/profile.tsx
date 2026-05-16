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
  Github,
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
} from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
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

function getSocialProviderIcon(provider: string) {
  switch (provider) {
    case 'github':
      return <Github className="size-4" />;
    case 'twitter-oauth2':
      return <Twitter className="size-4" />;
    case 'linkedin-oauth2':
      return <Linkedin className="size-4" />;
    case 'google-oauth2':
      return <Globe className="size-4" />;
    case 'gitee':
      return <span className="text-xs font-bold">G</span>;
    case 'huggingface':
      return <span className="text-xs">🤗</span>;
    default:
      return <Link2 className="size-4" />;
  }
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

  const fetchSocialConnections = useCallback(async () => {
    try {
      const { data: socialData } = await api.get('/auth/social/connections');
      setSocialConnections(socialData?.connections ?? []);
      setCanDisconnectSocial(socialData?.can_disconnect ?? true);
    } catch {
      // 静默处理：社交连接禁用时不阻断主流程
    }
  }, []);

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
                <span>{t('profile.birthday')}：{format(new Date(profile.birth_date), 'yyyy-MM-dd')}</span>
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
            <CardTitle className="text-base font-semibold">{t('profile.socialAccounts')}</CardTitle>
          </CardHeader>
          <CardContent>
            {socialConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t('profile.socialNotBound')}</p>
            ) : (
              <div className="space-y-2">
                {socialConnections.map((conn) => {
                  const accountLabel =
                    conn.username && conn.uid
                      ? `${conn.username}(${conn.uid})`
                      : conn.username || conn.uid;
                  return (
                  <div
                    key={conn.provider}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <div className="flex size-6 items-center justify-center rounded-full bg-muted shrink-0">
                        {getSocialProviderIcon(conn.provider)}
                      </div>
                      <span className="font-medium shrink-0">{conn.name}</span>
                      {conn.is_connected && accountLabel && (
                        conn.profile_url ? (
                          <a
                            href={conn.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline truncate"
                          >
                            {accountLabel}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground truncate">
                            {accountLabel}
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
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs shrink-0"
                        onClick={() => handleConnectProvider(conn.provider)}
                      >
                        <Link2 className="size-4" />
                        {t('profile.bind')}
                      </Button>
                    )}
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
    </div>
  );
}
