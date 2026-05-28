import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { MonthPicker } from '@/app/components/ui/month-picker';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form';
import { Badge } from '@/app/components/ui/badge';

// --- Types ---
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

interface ProfileData {
  bio: string;
  birth_date: string | null;
  company: string;
  location: string;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const profileSchema = z.object({
    bio: z.string().max(500, t('profileEdit.bioMax')),
    birth_date: z.string(),
    company: z.string().max(100, t('profileEdit.companyMax')),
    location: z.string().max(100, t('profileEdit.locationMax')),
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const workExpSchema = z.object({
    company_name: z.string().min(1, t('profileEdit.enterCompanyName')),
    title: z.string().min(1, t('profileEdit.enterJobTitle')),
    start_date: z.string().min(1, t('profileEdit.selectStartDate')),
    end_date: z.string(),
    description: z.string().max(500, t('profileEdit.descriptionMax')),
  });

  type WorkExpFormValues = z.infer<typeof workExpSchema>;

  const educationSchema = z.object({
    institution_name: z.string().min(1, t('profileEdit.enterSchoolName')),
    degree: z.string().min(1, t('profileEdit.enterDegree')),
    field_of_study: z.string().min(1, t('profileEdit.enterMajor')),
    start_date: z.string().min(1, t('profileEdit.selectStartDate')),
    end_date: z.string(),
  });

  type EducationFormValues = z.infer<typeof educationSchema>;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);

  // Dialog states
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [eduDialogOpen, setEduDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkExperience | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [dialogSaving, setDialogSaving] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMonth = todayStr.slice(0, 7);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      birth_date: '',
      company: '',
      location: '',
    },
  });

  const workForm = useForm<WorkExpFormValues>({
    resolver: zodResolver(workExpSchema),
    defaultValues: {
      company_name: '',
      title: '',
      start_date: '',
      end_date: '',
      description: '',
    },
  });

  const eduForm = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution_name: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, workExpRes, eduRes] = await Promise.all([
          api.get('/me/profile'),
          api.get('/me/work-experiences'),
          api.get('/me/educations'),
        ]);
        const profile: ProfileData = profileRes.data.profile;
        form.reset({
          bio: profile.bio || '',
          birth_date: profile.birth_date ? profile.birth_date.slice(0, 7) : '',
          company: profile.company || '',
          location: profile.location || '',
        });
        setWorkExperiences(workExpRes.data.items || []);
        setEducations(eduRes.data.items || []);
      } catch (error) {
        const apiError = getApiError(error);
        toast.error(apiError.message || t('profileEdit.loadFailed'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSaveProfile(values: ProfileFormValues) {
    setSaving(true);
    try {
      const payload: Record<string, string | null> = { ...values };
      if (!payload.birth_date) payload.birth_date = null;
      else payload.birth_date = payload.birth_date + '-01';
      await api.patch('/me/profile', payload);
      toast.success(t('profileEdit.profileUpdated'));
      navigate('/profile');
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('profileEdit.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  // --- Work Experience CRUD ---
  function openAddWork() {
    setEditingWork(null);
    workForm.reset({ company_name: '', title: '', start_date: '', end_date: '', description: '' });
    setWorkDialogOpen(true);
  }

  function openEditWork(exp: WorkExperience) {
    setEditingWork(exp);
    workForm.reset({
      company_name: exp.company_name,
      title: exp.title,
      start_date: exp.start_date ? exp.start_date.slice(0, 7) : '',
      end_date: exp.end_date ? exp.end_date.slice(0, 7) : '',
      description: exp.description || '',
    });
    setWorkDialogOpen(true);
  }

  async function onSaveWork(values: WorkExpFormValues) {
    setDialogSaving(true);
    try {
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date + '-01' : '',
        end_date: values.end_date ? values.end_date + '-01' : null,
      };
      if (editingWork) {
        const { data } = await api.patch(`/me/work-experiences/${editingWork.id}`, payload);
        setWorkExperiences(prev => prev.map(w => w.id === editingWork.id ? data : w));
        toast.success(t('profileEdit.workExpUpdated'));
      } else {
        const { data } = await api.post('/me/work-experiences', payload);
        setWorkExperiences(prev => [...prev, data]);
        toast.success(t('profileEdit.workExpAdded'));
      }
      setWorkDialogOpen(false);
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('addresses.operationFailed'));
    } finally {
      setDialogSaving(false);
    }
  }

  async function deleteWork(id: number) {
    try {
      await api.delete(`/me/work-experiences/${id}`);
      setWorkExperiences(prev => prev.filter(w => w.id !== id));
      toast.success(t('profileEdit.workExpDeleted'));
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || '删除失败');
    }
  }

  // --- Education CRUD ---
  function openAddEdu() {
    setEditingEdu(null);
    eduForm.reset({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '' });
    setEduDialogOpen(true);
  }

  function openEditEdu(edu: Education) {
    setEditingEdu(edu);
    eduForm.reset({
      institution_name: edu.institution_name,
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      start_date: edu.start_date ? edu.start_date.slice(0, 7) : '',
      end_date: edu.end_date ? edu.end_date.slice(0, 7) : '',
    });
    setEduDialogOpen(true);
  }

  async function onSaveEdu(values: EducationFormValues) {
    setDialogSaving(true);
    try {
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date + '-01' : '',
        end_date: values.end_date ? values.end_date + '-01' : null,
      };
      if (editingEdu) {
        const { data } = await api.patch(`/me/educations/${editingEdu.id}`, payload);
        setEducations(prev => prev.map(e => e.id === editingEdu.id ? data : e));
        toast.success(t('profileEdit.eduExpUpdated'));
      } else {
        const { data } = await api.post('/me/educations', payload);
        setEducations(prev => [...prev, data]);
        toast.success(t('profileEdit.eduExpAdded'));
      }
      setEduDialogOpen(false);
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('addresses.operationFailed'));
    } finally {
      setDialogSaving(false);
    }
  }

  async function deleteEdu(id: number) {
    try {
      await api.delete(`/me/educations/${id}`);
      setEducations(prev => prev.filter(e => e.id !== id));
      toast.success(t('profileEdit.eduExpDeleted'));
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError.message || '删除失败');
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label={t('common.back')} onClick={() => navigate('/profile')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t('profileEdit.title')}</h1>
      </div>

      <Form {...form}>
        <form id="profile-form" onSubmit={form.handleSubmit(onSaveProfile)} className="space-y-6">
          {/* 基本资料区 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('profileEdit.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profileEdit.bio')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('profileEdit.bioPlaceholder')} className="resize-none" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profileEdit.birthday')}</FormLabel>
                    <FormControl>
                      <MonthPicker max={todayMonth} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.company')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('profileEdit.companyPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.location')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('profileEdit.locationPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

        </form>
      </Form>

      {/* 工作经历区 */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">{t('profileEdit.workExperience')}</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={openAddWork}>
            <Plus className="size-4" />
            {t('profileEdit.addWorkExp')}
          </Button>
        </CardHeader>
        <CardContent>
          {workExperiences.length > 0 ? (
            <div className="space-y-4">
              {workExperiences.map((exp) => (
                <div key={exp.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exp.company_name}</span>
                      <Badge variant="secondary">{exp.title}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {exp.start_date} - {exp.end_date || t('common.present')}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" size="icon" variant="ghost" aria-label={t('common.edit')} onClick={() => openEditWork(exp)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" aria-label={t('common.delete')} onClick={() => deleteWork(exp.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">{t('profileEdit.noWorkExp')}</p>
          )}
        </CardContent>
      </Card>

      {/* 教育背景区 */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">{t('profileEdit.education')}</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={openAddEdu}>
            <Plus className="size-4" />
            {t('profileEdit.addEduExp')}
          </Button>
        </CardHeader>
        <CardContent>
          {educations.length > 0 ? (
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{edu.institution_name}</span>
                      <Badge variant="secondary">{edu.degree}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.start_date} - {edu.end_date || t('common.present')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" size="icon" variant="ghost" aria-label={t('common.edit')} onClick={() => openEditEdu(edu)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" aria-label={t('common.delete')} onClick={() => deleteEdu(edu.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">{t('profileEdit.noEduExp')}</p>
          )}
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end pt-2 pb-4">
        <Button type="submit" form="profile-form" disabled={saving} size="lg">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {t('profileEdit.saveAll')}
        </Button>
      </div>

      {/* 工作经历 Dialog */}
      <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWork ? t('profileEdit.editWorkExp') : t('profileEdit.addWorkExp')}</DialogTitle>
          </DialogHeader>
          <Form {...workForm}>
            <form onSubmit={workForm.handleSubmit(onSaveWork)} className="space-y-4">
              <FormField
                control={workForm.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profileEdit.companyName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('profileEdit.companyNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={workForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profileEdit.jobTitle')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('profileEdit.jobTitlePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={workForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.startDate')}</FormLabel>
                      <FormControl>
                        <MonthPicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workForm.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.endDateOptional')}</FormLabel>
                      <FormControl>
                        <MonthPicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={workForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profileEdit.description')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('profileEdit.descriptionPlaceholder')} className="resize-none" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setWorkDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={dialogSaving}>
                  {dialogSaving && <Loader2 className="size-4 animate-spin" />}
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 教育经历 Dialog */}
      <Dialog open={eduDialogOpen} onOpenChange={setEduDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEdu ? t('profileEdit.editEduExp') : t('profileEdit.addEduExp')}</DialogTitle>
          </DialogHeader>
          <Form {...eduForm}>
            <form onSubmit={eduForm.handleSubmit(onSaveEdu)} className="space-y-4">
              <FormField
                control={eduForm.control}
                name="institution_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profileEdit.schoolName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('profileEdit.schoolNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={eduForm.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.degree')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('profileEdit.degreePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eduForm.control}
                  name="field_of_study"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.major')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('profileEdit.majorPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={eduForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.startDate')}</FormLabel>
                      <FormControl>
                        <MonthPicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eduForm.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profileEdit.endDateOptional')}</FormLabel>
                      <FormControl>
                        <MonthPicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEduDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={dialogSaving}>
                  {dialogSaving && <Loader2 className="size-4 animate-spin" />}
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
