import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Coins,
  FolderSearch,
  Calendar,
  Eye,
  CheckCircle,
  Loader2,
  X,
  Search,
  Send,
} from "lucide-react";
import api, { getApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { MonthPicker } from "@/app/components/ui/month-picker";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Separator } from "@/app/components/ui/separator";
import { DataPagination } from "@/app/components/ui/data-pagination";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/app/components/ui/alert-dialog";
import { toast } from "sonner";

const PREVIEW_PAGE_SIZE = 10;

// --- Types ---

interface PoolItem {
  owner_type: "user" | "organization";
  owner_name: string;
  owner_slug: string;
  point_type: "cash" | "gift";
  tag_slug: string | null;
  tag_name: string | null;
  available_balance: number;
}

interface TagItem {
  id: string;
  name: string;
  platforms: string[];
  type: string;
  openrank: number;
}

interface PreviewRecipient {
  github_login: string;
  email: string;
  is_registered: boolean;
  contribution_score: number;
  calculated_points: number;
  adjusted_points: number;
}

interface PreviewResponse {
  source_selector: Record<string, unknown>;
  available_balance: number;
  total_points: number;
  total_recipients: number;
  preview: PreviewRecipient[];
}

interface AllocationResult {
  result: { success: number; pending: number; failed: number; total_points: number };
  allocation: Record<string, unknown>;
}

// --- Helpers ---

function getDefaultMonths() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return { start: fmt(twoMonthsAgo), end: fmt(lastMonth) };
}

function getMaxMonth() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
}

export default function PointAllocationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Step 1 - Pool selection
  const [pools, setPools] = useState<PoolItem[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Step 2 - Project scope
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [tagSearchResults, setTagSearchResults] = useState<TagItem[]>([]);
  const [tagSearching, setTagSearching] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [projectOperation, setProjectOperation] = useState<string>("AND");

  // Step 3 - Time range
  const defaults = getDefaultMonths();
  const [startMonth, setStartMonth] = useState(defaults.start);
  const [endMonth, setEndMonth] = useState(defaults.end);

  // Preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [adjustmentRatio, setAdjustmentRatio] = useState(1.0);
  const [individualAdjustments, setIndividualAdjustments] = useState<Record<string, number>>({});
  const [previewPage, setPreviewPage] = useState(1);

  // Execute
  const [executing, setExecuting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // --- Fetch pools ---
  useEffect(() => {
    async function fetchPools() {
      try {
        const { data } = await api.get<{ items: PoolItem[] }>("/points/pools");
        setPools(data.items);
      } catch (err) {
        const apiErr = getApiError(err);
        toast.error(t('pointAllocation.loadPoolFailed'), { description: apiErr.message });
      } finally {
        setPoolsLoading(false);
      }
    }
    fetchPools();
  }, []);

  // --- Tag search with debounce ---
  useEffect(() => {
    if (!tagSearchQuery.trim()) {
      setTagSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setTagSearching(true);
      try {
        const { data } = await api.get<{ items: TagItem[] }>(
          `/points/tags/search?q=${encodeURIComponent(tagSearchQuery.trim())}`
        );
        setTagSearchResults(data.items);
      } catch {
        setTagSearchResults([]);
      } finally {
        setTagSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [tagSearchQuery]);

  // --- Derived ---
  const selectedPool = selectedPoolIndex !== null ? pools[selectedPoolIndex] : null;
  const userPools = pools.filter((p) => p.owner_type === "user");
  const orgPools = pools.filter((p) => p.owner_type === "organization");

  const canPreview =
    selectedPool !== null &&
    selectedPool.available_balance > 0 &&
    selectedTags.length > 0 &&
    startMonth &&
    endMonth;

  const getAdjustedPoints = useCallback(
    (r: PreviewRecipient) => {
      if (individualAdjustments[r.github_login] !== undefined) {
        return individualAdjustments[r.github_login];
      }
      return Math.round(r.calculated_points * adjustmentRatio);
    },
    [individualAdjustments, adjustmentRatio]
  );

  const basePoints = previewData
    ? previewData.preview.reduce((sum, r) => sum + r.calculated_points, 0)
    : 0;

  const totalAdjustedPoints = previewData
    ? previewData.preview.reduce((sum, r) => sum + getAdjustedPoints(r), 0)
    : 0;

  const registeredCount = previewData
    ? previewData.preview.filter((r) => r.is_registered).length
    : 0;
  const unregisteredCount = previewData
    ? previewData.preview.filter((r) => !r.is_registered).length
    : 0;

  const canExecute =
    previewData !== null &&
    totalAmount > 0 &&
    totalAdjustedPoints <= totalAmount;

  const handleRatioChange = useCallback(
    (raw: number) => {
      if (!selectedPool || basePoints <= 0) return;
      let newRatio = Number.isFinite(raw) && raw >= 0 ? raw : 0;
      let newTotal = Math.round(basePoints * newRatio);
      if (newTotal > selectedPool.available_balance) {
        newTotal = selectedPool.available_balance;
        newRatio = selectedPool.available_balance / basePoints;
      }
      setAdjustmentRatio(newRatio);
      setTotalAmount(newTotal);
      setIndividualAdjustments({});
    },
    [selectedPool, basePoints]
  );

  const handleTotalChange = useCallback(
    (raw: number) => {
      if (!selectedPool || basePoints <= 0) return;
      let newTotal = Number.isFinite(raw) && raw >= 0 ? raw : 0;
      if (newTotal > selectedPool.available_balance) {
        newTotal = selectedPool.available_balance;
      }
      const newRatio = newTotal / basePoints;
      setTotalAmount(newTotal);
      setAdjustmentRatio(newRatio);
      setIndividualAdjustments({});
    },
    [selectedPool, basePoints]
  );

  // --- Actions ---
  function buildRequestBody() {
    // total_amount is always the pool's full available balance; user's intent
    // is carried via adjustment_ratio so preview/execute stay consistent.
    return {
      source_selector: {
        owner_type: selectedPool!.owner_type,
        owner_slug: selectedPool!.owner_type === "organization" ? selectedPool!.owner_slug : null,
        point_type: selectedPool!.point_type,
        tag_slug: selectedPool!.tag_slug,
      },
      project_scope: {
        tags: selectedTags.map((t) => t.id),
        operation: selectedTags.length >= 2 ? projectOperation : "AND",
      },
      user_scope: null,
      start_month: startMonth + "-01",
      end_month: endMonth + "-01",
      total_amount: selectedPool!.available_balance,
      adjustment_ratio: adjustmentRatio,
      individual_adjustments: individualAdjustments,
    };
  }

  async function handlePreview() {
    if (!canPreview) return;
    setPreviewLoading(true);
    setPreviewData(null);
    setIndividualAdjustments({});
    setAdjustmentRatio(1.0);
    setPreviewPage(1);
    try {
      const { data } = await api.post<PreviewResponse>(
        "/points/allocations/preview",
        buildRequestBody()
      );
      setPreviewData(data);
      const bp = data.preview.reduce((sum, r) => sum + r.calculated_points, 0);
      const ab = selectedPool!.available_balance;
      if (bp > ab && bp > 0) {
        setAdjustmentRatio(ab / bp);
        setTotalAmount(ab);
      } else {
        setAdjustmentRatio(1.0);
        setTotalAmount(Math.round(bp));
      }
    } catch (err) {
      const apiErr = getApiError(err);
      toast.error(t('pointAllocation.previewFailed'), { description: apiErr.message });
    } finally {
      setPreviewLoading(false);
    }
  }

  function openConfirmDialog() {
    if (!canExecute) return;
    setConfirmOpen(true);
  }

  async function handleExecute() {
    setConfirmOpen(false);
    setExecuting(true);
    try {
      const { data } = await api.post<AllocationResult>(
        "/points/allocations",
        buildRequestBody()
      );
      toast.success(t('pointAllocation.executeSuccess'), {
        description: t('pointAllocation.executeSuccessDesc', {
          success: data.result.success,
          pending: data.result.pending,
          failed: data.result.failed,
          totalPoints: data.result.total_points,
        }),
      });
      navigate("/points");
    } catch (err) {
      const apiErr = getApiError(err);
      toast.error(t('pointAllocation.executeFailed'), { description: apiErr.message });
    } finally {
      setExecuting(false);
    }
  }

  // --- Render ---
  if (poolsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('pointAllocation.title')}</h1>
        <p className="text-muted-foreground">{t('pointAllocation.subtitle')}</p>
      </div>

      {/* Step 1 - 选择积分池 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="size-5" />
            {t('pointAllocation.step1Title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('pointAllocation.poolLabel')}</Label>
            <Select
              value={selectedPoolIndex !== null ? String(selectedPoolIndex) : ""}
              onValueChange={(val) => {
                const idx = Number(val);
                setSelectedPoolIndex(idx);
                setTotalAmount(pools[idx].available_balance);
                setPreviewData(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('pointAllocation.poolPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {userPools.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>{t('pointAllocation.personalPool')}</SelectLabel>
                    {userPools.map((p) => {
                      const idx = pools.indexOf(p);
                      return (
                        <SelectItem key={idx} value={String(idx)}>
                          {p.owner_name} - {p.point_type === "cash" ? t('pointAllocation.cashPoints') : t('pointAllocation.giftPoints')}
                          {p.tag_name ? ` (${p.tag_name})` : ""} - {t('pointAllocation.balance')}: {p.available_balance}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                )}
                {orgPools.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>{t('pointAllocation.orgPool')}</SelectLabel>
                    {orgPools.map((p) => {
                      const idx = pools.indexOf(p);
                      return (
                        <SelectItem key={idx} value={String(idx)}>
                          {p.owner_name} - {p.point_type === "cash" ? t('pointAllocation.cashPoints') : t('pointAllocation.giftPoints')}
                          {p.tag_name ? ` (${p.tag_name})` : ""} - {t('pointAllocation.balance')}: {p.available_balance}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedPool && (
            <div className="flex items-center gap-2">
              <Badge
                className={
                  selectedPool.point_type === "cash"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                }
              >
                {selectedPool.point_type === "cash" ? t('pointAllocation.cashPointsType') : t('pointAllocation.giftPointsType')}
              </Badge>
              {selectedPool.tag_name && (
                <Badge variant="outline">{selectedPool.tag_name}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {t('pointAllocation.availableBalance')}: {selectedPool.available_balance.toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2 - 选择项目范围 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FolderSearch className="size-5" />
            {t('pointAllocation.step2Title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('pointAllocation.searchTagLabel')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t('pointAllocation.searchTagPlaceholder')}
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
              />
              {tagSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {tagSearchResults.length > 0 && (
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {tagSearchResults.map((tag) => {
                const alreadyAdded = selectedTags.some((t) => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between text-sm disabled:opacity-50"
                    disabled={alreadyAdded}
                    onClick={() => {
                      setSelectedTags((prev) => [...prev, tag]);
                      setTagSearchQuery("");
                      setTagSearchResults([]);
                      setPreviewData(null);
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      {tag.platforms && tag.platforms.length > 0 && (
                        <span className="flex items-center gap-0.5 shrink-0">
                          {tag.platforms.map((p) => (
                            <img
                              key={p}
                              src={`https://oss.open-digger.cn/logos/${p.toLowerCase()}.png`}
                              alt={p}
                              title={p}
                              className="size-4 rounded-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ))}
                        </span>
                      )}
                      <span>
                        {tag.name}{" "}
                        <span className="text-muted-foreground">
                          ({tag.type})
                        </span>
                      </span>
                    </span>
                    {alreadyAdded && <CheckCircle className="size-4 text-green-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <Label>{t('pointAllocation.selectedTags')}</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="gap-1">
                    {tag.name}
                    <button
                      onClick={() => {
                        setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
                        setPreviewData(null);
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {selectedTags.length >= 2 && (
            <div className="space-y-2">
              <Label>{t('pointAllocation.operation')}</Label>
              <Select value={projectOperation} onValueChange={(v) => { setProjectOperation(v); setPreviewData(null); }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                  <SelectItem value="NOT">NOT</SelectItem>
                  <SelectItem value="XOR">XOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3 - 时间区间 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="size-5" />
            {t('pointAllocation.step3Title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('pointAllocation.startMonth')}</Label>
              <MonthPicker
                min="2015-01"
                max={getMaxMonth()}
                value={startMonth}
                onChange={(e) => { setStartMonth(e.target.value); setPreviewData(null); }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('pointAllocation.endMonth')}</Label>
              <MonthPicker
                min="2015-01"
                max={getMaxMonth()}
                value={endMonth}
                onChange={(e) => { setEndMonth(e.target.value); setPreviewData(null); }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          disabled={!canPreview || previewLoading}
          onClick={handlePreview}
        >
          {previewLoading ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <Eye className="size-4 mr-2" />
          )}
          {t('pointAllocation.previewButton')}
        </Button>
      </div>

      {/* Preview results */}
      {previewData && (
        <>
          <Separator />

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">{t('pointAllocation.totalPeople')}</p>
                <p className="text-2xl font-bold">{previewData.preview.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">{t('pointAllocation.registered')}</p>
                <p className="text-2xl font-bold text-green-600">{registeredCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">{t('pointAllocation.unregistered')}</p>
                <p className="text-2xl font-bold text-orange-500">{unregisteredCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">{t('pointAllocation.totalPoints')}</p>
                <p className={`text-2xl font-bold ${totalAdjustedPoints > totalAmount ? "text-red-600" : ""}`}>
                  {totalAdjustedPoints.toLocaleString()}
                </p>
                {totalAdjustedPoints > totalAmount && (
                  <p className="text-xs text-red-500 mt-1">{t('pointAllocation.exceedTotal')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Adjustment ratio & total amount */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pointAllocation.totalAmount')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={selectedPool?.available_balance}
                      value={totalAmount}
                      onChange={(e) => handleTotalChange(Number(e.target.value))}
                    />
                    {selectedPool && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        / {selectedPool.available_balance.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('pointAllocation.globalRatio')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={Number(adjustmentRatio.toFixed(4))}
                    onChange={(e) => handleRatioChange(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipients table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('pointAllocation.contributorList')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pointAllocation.username')}</TableHead>
                      <TableHead>{t('pointAllocation.status')}</TableHead>
                      <TableHead className="text-right">{t('pointAllocation.contribution')}</TableHead>
                      <TableHead className="text-right">{t('pointAllocation.calculatedPoints')}</TableHead>
                      <TableHead className="text-right">{t('pointAllocation.adjustedPoints')}</TableHead>
                      <TableHead className="text-center">{t('pointAllocation.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.preview
                      .slice(
                        (previewPage - 1) * PREVIEW_PAGE_SIZE,
                        previewPage * PREVIEW_PAGE_SIZE,
                      )
                      .map((r) => (
                      <TableRow key={r.github_login}>
                        <TableCell className="font-medium">{r.github_login}</TableCell>
                        <TableCell>
                          {r.is_registered ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              {t('pointAllocation.registered')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t('pointAllocation.unregistered')}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.contribution_score.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.calculated_points.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            className="w-24 ml-auto text-right"
                            value={getAdjustedPoints(r)}
                            onChange={(e) => {
                              setIndividualAdjustments((prev) => ({
                                ...prev,
                                [r.github_login]: Number(e.target.value),
                              }));
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIndividualAdjustments((prev) => {
                                const next = { ...prev };
                                delete next[r.github_login];
                                return next;
                              });
                            }}
                          >
                            {t('pointAllocation.reset')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {previewData.preview.length > PREVIEW_PAGE_SIZE && (
                <div className="mt-4">
                  <DataPagination
                    currentPage={previewPage}
                    totalPages={Math.max(
                      1,
                      Math.ceil(previewData.preview.length / PREVIEW_PAGE_SIZE),
                    )}
                    onPageChange={setPreviewPage}
                    totalItems={previewData.preview.length}
                    pageSize={PREVIEW_PAGE_SIZE}
                    previousLabel={t('pointAllocation.prevPage', {
                      defaultValue: '上一页',
                    })}
                    nextLabel={t('pointAllocation.nextPage', {
                      defaultValue: '下一页',
                    })}
                    infoText={t('pointAllocation.paginationInfo', {
                      defaultValue:
                        '第 {{start}}-{{end}} 位 / 共 {{total}} 位贡献者（第 {{page}}/{{pages}} 页）',
                      start: (previewPage - 1) * PREVIEW_PAGE_SIZE + 1,
                      end: Math.min(
                        previewPage * PREVIEW_PAGE_SIZE,
                        previewData.preview.length,
                      ),
                      total: previewData.preview.length,
                      page: previewPage,
                      pages: Math.max(
                        1,
                        Math.ceil(previewData.preview.length / PREVIEW_PAGE_SIZE),
                      ),
                    })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execute button */}
          <div className="flex justify-center pb-8">
            <Button
              size="lg"
              disabled={!canExecute || executing}
              onClick={openConfirmDialog}
            >
              {executing ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              {t('pointAllocation.executeButton')}
            </Button>
          </div>
        </>
      )}

      {/* Confirm Allocation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pointAllocation.confirmExecute')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pointAllocation.confirmTotalPeople')}</span>
                  <span className="font-semibold text-foreground">{previewData?.preview.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pointAllocation.confirmRegistered')}</span>
                  <span className="font-semibold text-green-600">{registeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pointAllocation.confirmUnregistered')}</span>
                  <span className="font-semibold text-orange-500">{unregisteredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pointAllocation.confirmTotalPoints')}</span>
                  <span className="font-semibold text-foreground">{totalAdjustedPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pointAllocation.confirmRatio')}</span>
                  <span className="font-semibold text-foreground">{adjustmentRatio.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pointAllocation.confirmRemainingPoints')}</span>
                  <span className="font-semibold text-foreground">
                    {((selectedPool?.available_balance ?? 0) - totalAdjustedPoints).toLocaleString()}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel>{t('pointAllocation.confirmCancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecute}>
              {t('pointAllocation.confirmConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
