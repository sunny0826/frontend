import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow, format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Plus, Loader2, Upload } from "lucide-react";
import api, { getApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { toast } from "sonner";

interface Withdrawal {
  id: number;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  real_name: string;
  bank_name: string;
  created_at: string;
  reviewed_at: string | null;
  reject_reason: string | null;
}

interface WithdrawalsResponse {
  items: Withdrawal[];
  total: number;
  page: number;
  page_size: number;
}

// WithdrawalFormData type will be inferred inside the component

function statusBadge(status: Withdrawal["status"], t: (key: string) => string) {
  const config: Record<
    Withdrawal["status"],
    { labelKey: string; className: string }
  > = {
    pending: {
      labelKey: "withdrawals.pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    approved: {
      labelKey: "withdrawals.approved",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    rejected: {
      labelKey: "withdrawals.rejected",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    completed: {
      labelKey: "withdrawals.completed",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    cancelled: {
      labelKey: "withdrawals.cancelled",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={c.className}>
      {t(c.labelKey)}
    </Badge>
  );
}

export default function WithdrawalsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "en" ? enUS : zhCN;

  const withdrawalSchema = z.object({
    amount: z.number().min(1, t('withdrawals.amountMin')),
    real_name: z.string().min(1, t('withdrawals.enterRealName')),
    phone: z.string().regex(/^1[3-9]\d{9}$/, t('withdrawals.validPhone')),
    id_card: z
      .string()
      .regex(/^\d{17}[\dXx]$/, t('withdrawals.validIdCard')),
    bank_name: z.string().min(1, t('withdrawals.enterBankName')),
    bank_account: z.string().min(10, t('withdrawals.validBankAccount')),
  });

  type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      real_name: "",
      phone: "",
      id_card: "",
      bank_name: "",
      bank_account: "",
    },
  });

  const watchedAmount = watch("amount");
  const needInvoice = watchedAmount > 5000;

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<WithdrawalsResponse>("/points/me/withdrawals", {
        params: { page, page_size: pageSize },
      });
      setWithdrawals(data.items);
      setTotal(data.total);
    } catch (err) {
      const apiErr = getApiError(err);
      toast.error(t('withdrawals.loadFailed'), { description: apiErr.message });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const onSubmit = async (formData: WithdrawalFormData) => {
    if (needInvoice && !invoiceFile) {
      toast.error(t('withdrawals.invoiceRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("amount", String(formData.amount));
      payload.append("real_name", formData.real_name);
      payload.append("phone", formData.phone);
      payload.append("id_card", formData.id_card);
      payload.append("bank_name", formData.bank_name);
      payload.append("bank_account", formData.bank_account);
      if (invoiceFile) {
        payload.append("invoice_file", invoiceFile);
      }

      await api.post("/points/me/withdrawals", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(t('withdrawals.submitSuccess'));
      setDialogOpen(false);
      reset();
      setInvoiceFile(null);
      fetchWithdrawals();
    } catch (err) {
      const apiErr = getApiError(err);
      toast.error(t('withdrawals.submitFailed'), { description: apiErr.message });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 + 操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('withdrawals.title')}</h1>
          <p className="text-muted-foreground">{t('withdrawals.subtitle')}</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              {t('withdrawals.applyWithdraw')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('withdrawals.applyWithdraw')}</DialogTitle>
              <DialogDescription>
                {t('withdrawals.applyWithdraw')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 金额 */}
              <div className="space-y-2">
                <Label htmlFor="amount">{t('withdrawals.withdrawAmount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={t('withdrawals.withdrawAmountPlaceholder')}
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              {/* 真实姓名 */}
              <div className="space-y-2">
                <Label htmlFor="real_name">{t('withdrawals.realName')}</Label>
                <Input
                  id="real_name"
                  placeholder={t('withdrawals.realNamePlaceholder')}
                  {...register("real_name")}
                />
                {errors.real_name && (
                  <p className="text-sm text-destructive">{errors.real_name.message}</p>
                )}
              </div>

              {/* 手机号 */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t('withdrawals.phone')}</Label>
                <Input
                  id="phone"
                  placeholder={t('withdrawals.phonePlaceholder')}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              {/* 身份证号 */}
              <div className="space-y-2">
                <Label htmlFor="id_card">{t('withdrawals.idCard')}</Label>
                <Input
                  id="id_card"
                  placeholder={t('withdrawals.idCardPlaceholder')}
                  {...register("id_card")}
                />
                {errors.id_card && (
                  <p className="text-sm text-destructive">{errors.id_card.message}</p>
                )}
              </div>

              {/* 银行名称 */}
              <div className="space-y-2">
                <Label htmlFor="bank_name">{t('withdrawals.bankName')}</Label>
                <Input
                  id="bank_name"
                  placeholder={t('withdrawals.bankNamePlaceholder')}
                  {...register("bank_name")}
                />
                {errors.bank_name && (
                  <p className="text-sm text-destructive">{errors.bank_name.message}</p>
                )}
              </div>

              {/* 银行账号 */}
              <div className="space-y-2">
                <Label htmlFor="bank_account">{t('withdrawals.bankAccount')}</Label>
                <Input
                  id="bank_account"
                  placeholder={t('withdrawals.bankAccountPlaceholder')}
                  {...register("bank_account")}
                />
                {errors.bank_account && (
                  <p className="text-sm text-destructive">{errors.bank_account.message}</p>
                )}
              </div>

              {/* 发票上传 (金额 > 5000) */}
              {needInvoice && (
                <div className="space-y-2">
                  <Label>{t('withdrawals.invoiceUpload')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('withdrawals.invoiceUploadHint')}
                  </p>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-6 mx-auto text-muted-foreground mb-2" />
                    {invoiceFile ? (
                      <p className="text-sm">{invoiceFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t('withdrawals.clickToSelect')}
                      </p>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setInvoiceFile(file);
                    }}
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                  {t('withdrawals.submitApply')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 提现记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('withdrawals.records', { total })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : withdrawals.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('withdrawals.noRecords')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('withdrawals.tableAmount')}</TableHead>
                  <TableHead>{t('withdrawals.tableStatus')}</TableHead>
                  <TableHead>{t('withdrawals.tableBankInfo')}</TableHead>
                  <TableHead>{t('withdrawals.tableTime')}</TableHead>
                  <TableHead>{t('withdrawals.tableRemark')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">
                      {w.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{statusBadge(w.status, t)}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {w.bank_name} · {w.real_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-sm text-muted-foreground"
                        title={format(new Date(w.created_at), "yyyy-MM-dd HH:mm:ss")}
                      >
                        {formatDistanceToNow(new Date(w.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {w.reject_reason ? (
                        <span className="text-sm text-red-600">{w.reject_reason}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {t('transactions.page', { current: page, total: totalPages })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {t('transactions.prevPage')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('transactions.nextPage')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
