import { useCallback, useRef, useState } from "react";
import type { UseFormWatch, UseFormSetValue, FieldValues, FieldPath } from "react-hook-form";

export interface UseFieldHistoryOptions<T extends FieldValues> {
  /** React Hook Form's watch function */
  watch: UseFormWatch<T>;
  /** React Hook Form's setValue function */
  setValue: UseFormSetValue<T>;
  /** The field name to track */
  fieldName: FieldPath<T>;
  /** Maximum history entries to keep (default: 50) */
  maxHistory?: number;
}

export interface FieldHistoryReturn {
  /** Undo the last change */
  undo: () => void;
  /** Redo the last undone change */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Current history stack (for debugging) */
  history: unknown[];
  /** Current position in history */
  currentIndex: number;
}

/**
 * Track field value changes with undo/redo support.
 *
 * Subscribes to changes on a specific field and maintains a history stack.
 * Call `undo()` / `redo()` to navigate through values.
 *
 * @example
 * ```tsx
 * const { watch, setValue } = useForm({ defaultValues: { name: "" } });
 * const { undo, redo, canUndo, canRedo } = useFieldHistory({
 *   watch,
 *   setValue,
 *   fieldName: "name",
 * });
 *
 * return (
 *   <>
 *     <input {...register("name")} />
 *     <button onClick={undo} disabled={!canUndo}>Undo</button>
 *     <button onClick={redo} disabled={!canRedo}>Redo</button>
 *   </>
 * );
 * ```
 */
export function useFieldHistory<T extends FieldValues>({
  watch,
  setValue,
  fieldName,
  maxHistory = 50,
}: UseFieldHistoryOptions<T>): FieldHistoryReturn {
  const historyRef = useRef<unknown[]>([watch(fieldName)]);
  const indexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const [state, setState] = useState({ canUndo: false, canRedo: false });

  const updateState = useCallback(() => {
    setState({
      canUndo: indexRef.current > 0,
      canRedo: indexRef.current < historyRef.current.length - 1,
    });
  }, []);

  // Subscribe to field changes
  const watchRef = useRef(watch);
  const setValueRef = useRef(setValue);
  watchRef.current = watch;
  setValueRef.current = setValue;

  // Only subscribe once
  const subscribedRef = useRef(false);
  if (!subscribedRef.current) {
    subscribedRef.current = true;
    watch((value, { name }) => {
      if (name !== fieldName) return;
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }
      const history = historyRef.current;
      const idx = indexRef.current;
      // Truncate forward history on new change
      historyRef.current = history.slice(0, idx + 1);
      historyRef.current.push(value);
      // Trim if exceeding max
      if (historyRef.current.length > maxHistory) {
        historyRef.current = historyRef.current.slice(-maxHistory);
      }
      indexRef.current = historyRef.current.length - 1;
      updateState();
    });
  }

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    isUndoRedoRef.current = true;
    setValueRef.current(fieldName, historyRef.current[indexRef.current] as any);
    updateState();
  }, [fieldName, updateState]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    isUndoRedoRef.current = true;
    setValueRef.current(fieldName, historyRef.current[indexRef.current] as any);
    updateState();
  }, [fieldName, updateState]);

  return {
    undo,
    redo,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    history: historyRef.current,
    currentIndex: indexRef.current,
  };
}
