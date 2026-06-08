import { useEffect, useCallback, useRef } from "react";
import type {
  UseFormWatch,
  UseFormSetValue,
  FieldValues,
} from "react-hook-form";

export interface UseFormPersistOptions<T extends FieldValues> {
  /** React Hook Form's watch function */
  watch: UseFormWatch<T>;
  /** React Hook Form's setValue function */
  setValue: UseFormSetValue<T>;
  /** localStorage key for persistence */
  storageKey: string;
  /** Fields to exclude from persistence */
  exclude?: (keyof T & string)[];
  /** Debounce delay before saving to localStorage (default: 500) */
  debounceMs?: number;
  /** If false, persistence is paused (default: true) */
  enabled?: boolean;
}

export interface FormPersistReturn {
  /** Clear persisted data from localStorage */
  clearPersisted: () => void;
  /** Restore persisted data manually */
  restore: () => void;
}

/**
 * Persist and restore React Hook Form values in localStorage.
 *
 * Automatically saves form values to localStorage on change and restores
 * them on mount. Supports field exclusion and debounced writes.
 *
 * @example
 * ```tsx
 * const { register, watch, setValue } = useForm({
 *   defaultValues: { name: "", email: "" },
 * });
 *
 * const { clearPersisted } = useFormPersist({
 *   watch,
 *   setValue,
 *   storageKey: "my-form-data",
 *   exclude: ["password"],
 * });
 *
 * return (
 *   <>
 *     <input {...register("name")} />
 *     <input {...register("email")} />
 *     <button onClick={clearPersisted}>Clear saved</button>
 *   </>
 * );
 * ```
 */
export function useFormPersist<T extends FieldValues>({
  watch,
  setValue,
  storageKey,
  exclude = [],
  debounceMs = 500,
  enabled = true,
}: UseFormPersistOptions<T>): FormPersistReturn {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoringRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const saveToStorage = useCallback(
    (data: T) => {
      try {
        const filtered = { ...data };
        for (const key of exclude) {
          delete filtered[key];
        }
        localStorage.setItem(storageKey, JSON.stringify(filtered));
      } catch {
        // localStorage unavailable or full — silently ignore
      }
    },
    [storageKey, exclude]
  );

  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const restore = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<T>;
      isRestoringRef.current = true;
      for (const [key, value] of Object.entries(parsed)) {
        if (exclude.includes(key as keyof T & string)) continue;
        setValue(key as any, value as any, { shouldDirty: false });
      }
      // allow subscription to resume after restore tick
      queueMicrotask(() => {
        isRestoringRef.current = false;
      });
    } catch {
      // corrupted data — ignore
    }
  }, [storageKey, setValue, exclude]);

  // Restore on mount
  const restoredRef = useRef(false);
  if (!restoredRef.current && enabled) {
    restoredRef.current = true;
    restore();
  }

  // Watch for changes and persist
  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    const subscription = watch((data) => {
      if (isRestoringRef.current) return;
      clearTimer();
      timeoutRef.current = setTimeout(() => {
        saveToStorage(data as T);
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      clearTimer();
    };
  }, [watch, debounceMs, enabled, clearTimer, saveToStorage]);

  return { clearPersisted, restore };
}
