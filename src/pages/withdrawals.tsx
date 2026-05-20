import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Plus, Loader2 } from "lucide-react";
import api, { getApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
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
  processed_at: string | null;
  admin_note: string | null;
}

interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

interface WithdrawalsResponse {
  items: Withdrawal[];
  pagination: PaginationMeta;
}

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

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<WithdrawalsResponse>("/points/me/withdrawals", {
        params: { page, page_size: pageSize },
      });
      setWithdrawals(data.items ?? []);
      setTotal(data.pagination?.total_items ?? 0);
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 + 操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('withdrawals.title')}</h1>
          <p className="text-muted-foreground">{t('withdrawals.subtitle')}</p>
        </div>

        <Button onClick={() => toast.info(t('common.comingSoon'))}>
          <Plus className="size-4 mr-2" />
          {t('withdrawals.applyWithdraw')}
        </Button>
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
                      {w.admin_note ? (
                        <span
                          className={
                            w.status === "rejected"
                              ? "text-sm text-red-600"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {w.admin_note}
                        </span>
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
