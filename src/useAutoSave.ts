import { useEffect, useRef, useCallback } from "react";
import type { UseFormWatch, FieldValues } from "react-hook-form";

export interface UseAutoSaveOptions<T extends FieldValues> {
  /** React Hook Form's watch function */
  watch: UseFormWatch<T>;
  /** Callback invoked with current form values on save */
  onSave: (data: T) => void | Promise<void>;
  /** Debounce delay in milliseconds (default: 1000) */
  debounceMs?: number;
  /** If false, auto-save is paused (default: true) */
  enabled?: boolean;
}

/**
 * Debounced auto-save hook for React Hook Form.
 *
 * Watches all form fields and triggers `onSave` after the user stops
 * changing values for `debounceMs` milliseconds.
 *
 * @example
 * ```tsx
 * const { control, watch } = useForm();
 * useAutoSave({
 *   watch,
 *   onSave: async (data) => await saveToServer(data),
 *   debounceMs: 2000,
 * });
 * ```
 */
export function useAutoSave<T extends FieldValues>({
  watch,
  onSave,
  debounceMs = 1000,
  enabled = true,
}: UseAutoSaveOptions<T>): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    const subscription = watch((data) => {
      clearTimer();
      timeoutRef.current = setTimeout(() => {
        onSaveRef.current(data as T);
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      clearTimer();
    };
  }, [watch, debounceMs, enabled, clearTimer]);
}
