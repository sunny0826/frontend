import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "./utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "./pagination";

export interface DataPaginationProps {
  /** 当前页码（从 1 开始） */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 页码变更回调 */
  onPageChange: (page: number) => void;
  /** 总条数（可选，用于展示统计信息） */
  totalItems?: number;
  /** 每页条数（可选，用于展示统计信息） */
  pageSize?: number;
  /** 当前页两侧显示的页码数量，默认 1 */
  siblingCount?: number;
  /** 是否显示统计信息（如 1-20 / 100），默认 true */
  showInfo?: boolean;
  /** 自定义统计信息文本，提供时优先生效 */
  infoText?: React.ReactNode;
  /** 上一页按钮文本，默认 "Previous" */
  previousLabel?: React.ReactNode;
  /** 下一页按钮文本，默认 "Next" */
  nextLabel?: React.ReactNode;
  /** 当只有一页时是否仍然渲染（默认 false） */
  alwaysShow?: boolean;
  className?: string;
}

type PageToken = number | "ellipsis-left" | "ellipsis-right";

function buildPages(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PageToken[] {
  // 槽位：首 + 末 + 当前 + 2 * siblings + 2 * ellipsis = 5 + 2 * sibling
  const totalSlots = 5 + siblingCount * 2;
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: PageToken[] = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + siblingCount * 2;
    for (let i = 1; i <= leftCount; i++) pages.push(i);
    pages.push("ellipsis-right");
    pages.push(totalPages);
  } else if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + siblingCount * 2;
    pages.push(1);
    pages.push("ellipsis-left");
    for (let i = totalPages - rightCount + 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("ellipsis-left");
    for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
    pages.push("ellipsis-right");
    pages.push(totalPages);
  }
  return pages;
}

/**
 * 通用业务分页组件：包含上一页、下一页、页码、省略号、统计信息。
 *
 * 与 `pagination.tsx` 中的纯展示型原语相比，本组件已封装好分页交互逻辑，
 * 可直接由调用方通过 currentPage / totalPages / onPageChange 控制状态。
 */
export function DataPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  siblingCount = 1,
  showInfo = true,
  infoText,
  previousLabel = "Previous",
  nextLabel = "Next",
  alwaysShow = false,
  className,
}: DataPaginationProps) {
  if (totalPages <= 1 && !alwaysShow) return null;

  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, currentPage), safeTotal);

  const goTo = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    if (page < 1 || page > safeTotal || page === safePage) return;
    onPageChange(page);
  };

  const tokens = buildPages(safePage, safeTotal, siblingCount);

  const defaultInfo: React.ReactNode = (() => {
    if (typeof totalItems === "number" && pageSize && totalItems > 0) {
      const start = (safePage - 1) * pageSize + 1;
      const end = Math.min(safePage * pageSize, totalItems);
      return `${start}-${end} / ${totalItems}`;
    }
    return `${safePage} / ${safeTotal}`;
  })();

  const isFirst = safePage <= 1;
  const isLast = safePage >= safeTotal;

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {showInfo ? (
        <span className="text-sm text-muted-foreground">{infoText ?? defaultInfo}</span>
      ) : (
        <span />
      )}

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent className="gap-1.5">
          <PaginationItem>
            <PaginationLink
              href="#"
              size="default"
              aria-label="Go to previous page"
              aria-disabled={isFirst}
              tabIndex={isFirst ? -1 : 0}
              onClick={(e) => goTo(e, safePage - 1)}
              className={cn(
                "gap-1 px-2.5",
                isFirst && "pointer-events-none opacity-50",
              )}
            >
              <ChevronLeftIcon />
              <span className="hidden sm:block">{previousLabel}</span>
            </PaginationLink>
          </PaginationItem>

          {tokens.map((token, idx) =>
            typeof token === "number" ? (
              <PaginationItem key={token}>
                <PaginationLink
                  href="#"
                  isActive={token === safePage}
                  onClick={(e) => goTo(e, token)}
                  className="h-9 w-auto min-w-9 px-2 tabular-nums"
                >
                  {token}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={`${token}-${idx}`}>
                <PaginationEllipsis className="h-9 w-auto min-w-9 px-1" />
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationLink
              href="#"
              size="default"
              aria-label="Go to next page"
              aria-disabled={isLast}
              tabIndex={isLast ? -1 : 0}
              onClick={(e) => goTo(e, safePage + 1)}
              className={cn(
                "gap-1 px-2.5",
                isLast && "pointer-events-none opacity-50",
              )}
            >
              <span className="hidden sm:block">{nextLabel}</span>
              <ChevronRightIcon />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default DataPagination;
