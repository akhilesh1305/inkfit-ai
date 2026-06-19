"use client";

import { useCallback, useState } from "react";

interface OptimisticMutationOptions<TInput, TResult> {
  onMutate?: (input: TInput) => void | Promise<void>;
  onSuccess?: (result: TResult, input: TInput) => void;
  onError?: (error: unknown, input: TInput) => void;
  onSettled?: () => void;
}

export function useOptimisticMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  options: OptimisticMutationOptions<TInput, TResult> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (input: TInput) => {
      setLoading(true);
      setError(null);

      try {
        await options.onMutate?.(input);
        const result = await mutationFn(input);
        options.onSuccess?.(result, input);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        options.onError?.(err, input);
        throw err;
      } finally {
        setLoading(false);
        options.onSettled?.();
      }
    },
    [mutationFn, options]
  );

  return { mutate, loading, error, setError };
}

export function usePersistedList<T extends { id: string }>(
  initial: T[] = []
) {
  const [items, setItems] = useState<T[]>(initial);
  const [syncing, setSyncing] = useState(false);

  const optimisticUpdate = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const optimisticAdd = useCallback((item: T) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const optimisticRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    items,
    setItems,
    syncing,
    setSyncing,
    optimisticUpdate,
    optimisticAdd,
    optimisticRemove,
  };
}
