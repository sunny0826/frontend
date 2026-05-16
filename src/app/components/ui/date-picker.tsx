import * as React from "react";

import { Input } from "./input";
import { cn } from "./utils";

export type DatePickerProps = Omit<React.ComponentProps<"input">, "type">;

/**
 * 全站通用日期选择器：基于原生 <input type="date">。
 * 与表单中的其他 Input 控件保持完全一致的视觉与交互。
 *
 * 与 react-hook-form 配合：
 *   <FormControl>
 *     <DatePicker {...field} />
 *   </FormControl>
 *
 * 限制日期范围使用 HTML 原生 min / max（YYYY-MM-DD）。
 */
const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        data-slot="date-picker"
        className={cn(className)}
        {...props}
      />
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
