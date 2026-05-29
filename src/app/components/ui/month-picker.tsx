import * as React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

export type MonthPickerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value" | "onChange" | "onBlur" | "disabled" | "name" | "className" | "id"
> & {
  value?: string; // YYYY-MM 格式
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // 模拟 input 的 onChange 事件，兼容 react-hook-form
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  min?: string; // YYYY-MM 格式，最小可选月份
  max?: string; // YYYY-MM 格式，最大可选月份
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
};

const DEFAULT_MONTH_LABELS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

/**
 * 月度时间选择器组件。
 *
 * 基于 Radix Popover，提供年份导航 + 3x4 月份网格交互。
 * 使用 forwardRef 并内部维护隐藏 input 元素以兼容 react-hook-form。
 *
 * 用法示例：
 *   <FormControl>
 *     <MonthPicker {...field} min="2020-01" max="2025-12" />
 *   </FormControl>
 */
const MonthPicker = React.forwardRef<HTMLInputElement, MonthPickerProps>(
  (
    {
      value,
      onChange,
      onBlur,
      min,
      max,
      placeholder,
      disabled = false,
      className,
      name,
      id,
      ...triggerProps
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const [yearSelectMode, setYearSelectMode] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const translatedMonthLabels = t("common.months", {
      returnObjects: true,
    }) as unknown;
    const monthLabels =
      Array.isArray(translatedMonthLabels) &&
      translatedMonthLabels.length === 12 &&
      translatedMonthLabels.every((label) => typeof label === "string")
        ? translatedMonthLabels
        : DEFAULT_MONTH_LABELS;
    const placeholderText = placeholder ?? t("common.selectMonth");

    // 合并外部 ref 和内部 ref
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // 当前面板展示的年份（用于年份导航）
    const [displayYear, setDisplayYear] = React.useState<number>(() => {
      if (value) {
        const y = parseInt(value.split("-")[0], 10);
        return isNaN(y) ? new Date().getFullYear() : y;
      }
      return new Date().getFullYear();
    });

    // 年份选择面板的起始年份（每页显示12年）
    const YEAR_PAGE_SIZE = 12;
    const [yearPageStart, setYearPageStart] = React.useState<number>(
      () => displayYear - (displayYear % YEAR_PAGE_SIZE),
    );

    // 当 value 变化时同步 displayYear
    React.useEffect(() => {
      if (value) {
        const y = parseInt(value.split("-")[0], 10);
        if (!isNaN(y)) setDisplayYear(y);
      }
    }, [value]);

    // Popover 打开时重置为月份视图
    React.useEffect(() => {
      if (open) {
        setYearSelectMode(false);
      }
    }, [open]);

    // 解析 min/max 为年月
    const minYear = min ? parseInt(min.split("-")[0], 10) : null;
    const maxYear = max ? parseInt(max.split("-")[0], 10) : null;

    // 判断某个月份是否禁用
    const isMonthDisabled = (month: number): boolean => {
      const val = `${displayYear}-${String(month).padStart(2, "0")}`;
      if (min && val < min) return true;
      if (max && val > max) return true;
      return false;
    };

    // 判断年份导航按钮是否禁用
    const isPrevYearDisabled = minYear !== null && displayYear <= minYear;
    const isNextYearDisabled = maxYear !== null && displayYear >= maxYear;

    // 判断年份选择面板中某个年份是否禁用
    const isYearDisabled = (year: number): boolean => {
      if (minYear !== null && year < minYear) return true;
      if (maxYear !== null && year > maxYear) return true;
      return false;
    };

    // 年份选择面板翻页是否禁用
    const isPrevYearPageDisabled =
      minYear !== null && yearPageStart <= minYear;
    const isNextYearPageDisabled =
      maxYear !== null && yearPageStart + YEAR_PAGE_SIZE - 1 >= maxYear;

    // 选择年份
    const handleSelectYear = (year: number) => {
      if (isYearDisabled(year)) return;
      setDisplayYear(year);
      setYearSelectMode(false);
    };

    // 进入年份选择模式
    const enterYearSelectMode = () => {
      setYearPageStart(displayYear - (displayYear % YEAR_PAGE_SIZE));
      setYearSelectMode(true);
    };

    // 当前选中的年月
    const selectedYear = value ? parseInt(value.split("-")[0], 10) : null;
    const selectedMonth = value ? parseInt(value.split("-")[1], 10) : null;
    const selectedMonthLabel =
      selectedMonth !== null &&
      Number.isInteger(selectedMonth) &&
      selectedMonth >= 1 &&
      selectedMonth <= 12
        ? monthLabels[selectedMonth - 1]
        : null;

    // 触发 onChange 事件（模拟原生 input 的 ChangeEvent）
    const triggerChange = (newValue: string) => {
      if (!inputRef.current) return;

      // 设置隐藏 input 的值
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(inputRef.current, newValue);

      // 构造并派发模拟的 change 事件
      const event = new Event("change", { bubbles: true });
      inputRef.current.dispatchEvent(event);

      // 调用 onChange 回调（react-hook-form 兼容）
      if (onChange) {
        const syntheticEvent = {
          target: { value: newValue, name: name || "" },
          currentTarget: { value: newValue, name: name || "" },
          type: "change",
          bubbles: true,
          cancelable: false,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: false,
          nativeEvent: event,
          preventDefault: () => {},
          stopPropagation: () => {},
          persist: () => {},
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          timeStamp: Date.now(),
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    // 选择月份
    const handleSelectMonth = (month: number) => {
      if (isMonthDisabled(month)) return;
      const newValue = `${displayYear}-${String(month).padStart(2, "0")}`;
      triggerChange(newValue);
      setOpen(false);
    };

    // 格式化显示文本
    const displayText = value && selectedYear !== null && selectedMonthLabel
      ? t("common.monthYear", {
          year: selectedYear,
          month: selectedMonthLabel,
        })
      : "";

    return (
      <>
        {/* 隐藏的 input 元素，用于 ref 绑定和表单集成 */}
        <input
          ref={inputRef}
          type="hidden"
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          aria-hidden="true"
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              {...triggerProps}
              id={id}
              type="button"
              disabled={disabled}
              onBlur={onBlur as unknown as React.FocusEventHandler<HTMLButtonElement>}
              className={cn(
                // 与 Input 组件保持一致的样式
                "border-input flex h-11 w-full min-w-0 rounded-lg border bg-input-background px-3.5 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "items-center justify-between gap-2",
                !value && "text-muted-foreground",
                className,
              )}
            >
              <span className="truncate">
                {displayText || placeholderText}
              </span>
              <Calendar className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-64 p-3" align="start">
            {yearSelectMode ? (
              <>
                {/* 年份选择面板 - 导航 */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    disabled={isPrevYearPageDisabled}
                    onClick={() =>
                      setYearPageStart((s) => s - YEAR_PAGE_SIZE)
                    }
                    className="flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    aria-label={t("common.previousYear")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">
                    {yearPageStart} - {yearPageStart + YEAR_PAGE_SIZE - 1}
                  </span>
                  <button
                    type="button"
                    disabled={isNextYearPageDisabled}
                    onClick={() =>
                      setYearPageStart((s) => s + YEAR_PAGE_SIZE)
                    }
                    className="flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    aria-label={t("common.nextYear")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* 3x4 年份网格 */}
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => {
                    const year = yearPageStart + i;
                    const isDisabled = isYearDisabled(year);
                    const isSelected = displayYear === year;

                    return (
                      <button
                        key={year}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleSelectYear(year)}
                        aria-label={String(year)}
                        className={cn(
                          "min-h-10 rounded-md text-sm transition-colors cursor-pointer",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "disabled:pointer-events-none disabled:opacity-50",
                          isSelected &&
                            "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                        )}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {/* 年份导航 */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    disabled={isPrevYearDisabled}
                    onClick={() => setDisplayYear((y) => y - 1)}
                    className="flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    aria-label={t("common.previousYear")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={enterYearSelectMode}
                    className="text-sm font-medium rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    {displayYear}
                  </button>
                  <button
                    type="button"
                    disabled={isNextYearDisabled}
                    onClick={() => setDisplayYear((y) => y + 1)}
                    className="flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    aria-label={t("common.nextYear")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* 3x4 月份网格 */}
                <div className="grid grid-cols-3 gap-1.5">
                  {monthLabels.map((label, i) => {
                    const month = i + 1;
                    const isDisabled = isMonthDisabled(month);
                    const isSelected =
                      selectedYear === displayYear && selectedMonth === month;
                    const monthLabel = t("common.monthYear", {
                      year: displayYear,
                      month: label,
                    });

                    return (
                      <button
                        key={month}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleSelectMonth(month)}
                        aria-label={monthLabel}
                        className={cn(
                          "min-h-10 rounded-md text-sm transition-colors cursor-pointer",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "disabled:pointer-events-none disabled:opacity-50",
                          isSelected &&
                            "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
      </>
    );
  },
);
MonthPicker.displayName = "MonthPicker";

export { MonthPicker };
