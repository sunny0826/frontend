import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/app/components/ui/form';

export default function OrganizationCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const createOrgSchema = z.object({
    name: z.string().min(2, t('organizations.orgNameMin2')).max(100, t('organizations.orgNameMax100')),
    slug: z
      .string()
      .min(1, t('organizations.slugMin1'))
      .regex(/^[a-zA-Z0-9_-]+$/, t('organizations.slugRegex')),
    description: z.string().optional(),
    website: z
      .string()
      .url(t('organizations.validUrl'))
      .optional()
      .or(z.literal('')),
    location: z.string().optional(),
  });

  type CreateOrgFormValues = z.infer<typeof createOrgSchema>;

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '');
  }

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
      location: '',
    },
  });

  function handleNameChange(value: string) {
    form.setValue('name', value);
    const currentSlug = form.getValues('slug');
    const prevName = form.getValues('name');
    // Auto-generate slug only if slug is empty or matches previous auto-generated slug
    if (!currentSlug || currentSlug === generateSlug(prevName)) {
      form.setValue('slug', generateSlug(value));
    }
  }

  async function onSubmit(values: CreateOrgFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        website: values.website || undefined,
        location: values.location || undefined,
      };
      const { data } = await api.post('/organizations/', payload);
      toast.success(t('organizations.createSuccess'));
      navigate(`/organizations/${data.slug}`);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('organizations.createFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label={t('common.back')}>
          <Link to="/organizations">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t('organizations.createOrg')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('organizations.orgInfo')}</CardTitle>
          <CardDescription>{t('organizations.orgInfoSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('organizations.orgName')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('organizations.orgNamePlaceholder')}
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('organizations.orgSlug')} *</FormLabel>
                    <FormControl>
                      <Input placeholder="my-organization" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('organizations.orgSlugHint')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('organizations.orgDesc')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('organizations.orgDescPlaceholder')} rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('organizations.website')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
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
                    <FormLabel>{t('organizations.location')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('organizations.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/organizations">{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="size-4 animate-spin" />}
                  {t('organizations.createOrg')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
