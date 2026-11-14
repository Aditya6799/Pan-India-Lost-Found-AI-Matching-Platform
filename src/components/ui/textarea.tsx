import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      id,
      value,
      defaultValue,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    const [currentLength, setCurrentLength] = React.useState<number>(() => {
      if (typeof value === "string") return value.length;
      if (typeof defaultValue === "string") return defaultValue.length;
      return 0;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    React.useEffect(() => {
      if (typeof value === "string") {
        setCurrentLength(value.length);
      }
    }, [value]);

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {label}
            </label>
          )}

          {showCount && maxLength && (
            <span
              className={cn(
                "text-xs text-neutral-400 dark:text-neutral-500",
                currentLength >= maxLength && "text-red-500 font-semibold"
              )}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "flex min-h-[96px] w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-75 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:disabled:bg-neutral-800",
            error &&
              "border-red-500 focus-visible:ring-red-500 dark:border-red-600",
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export default Textarea;
