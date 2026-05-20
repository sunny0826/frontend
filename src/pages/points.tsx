import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightLeft,
  ArrowUpRight,
  ShoppingBag,
  Send,
  Loader2,
} from "lucide-react";
import api, { getApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  PointsBalanceCard,
  type PointsBalanceData,
} from "@/app/components/points-balance-card";
import { toast } from "sonner";

interface WalletResponse {
  balance: PointsBalanceData;
  wallet_id: number | null;
  recent_transactions: unknown[];
}

export default function PointsPage() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<PointsBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const { data } = await api.get<WalletResponse>("/points/me/wallet");
        setBalance(data.balance);
      } catch (err) {
        const apiErr = getApiError(err);
        toast.error(t('points.loadFailed'), { description: apiErr.message });
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t('points.loadFailedData')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('points.title')}</h1>
        <p className="text-muted-foreground">{t('points.subtitle')}</p>
      </div>

      <PointsBalanceCard balance={balance} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('points.operations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/points/withdrawals">
                <ArrowUpRight className="size-5" />
                <span>{t('points.withdrawRequest')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/shop">
                <ShoppingBag className="size-5" />
                <span>{t('points.shop')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/points/allocate">
                <Send className="size-5" />
                <span>{t('points.allocatePoints')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/points/transactions">
                <ArrowRightLeft className="size-5" />
                <span>{t('points.transactions')}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
