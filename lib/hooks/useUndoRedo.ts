import { useState, useCallback, useRef } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory: number = 50) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track if we're currently applying undo/redo to prevent adding to history
  const isApplying = useRef(false);

  // True while a transient sequence (e.g. an in-progress drag) is recording.
  // The first transient update opens one history entry; subsequent updates just
  // replace `present` so the whole gesture collapses into a single undo step.
  const transientActive = useRef(false);

  const setState = useCallback((
    newState: T | ((prev: T) => T),
    options?: { transient?: boolean }
  ) => {
    if (isApplying.current) return;

    const transient = options?.transient === true;
    // Open a new history entry on a normal update, or on the FIRST update of a
    // transient sequence. Continuing a transient sequence just replaces present.
    const openNewEntry = !transient || !transientActive.current;
    transientActive.current = transient;

    setHistory((currentHistory) => {
      const resolvedState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(currentHistory.present)
        : newState;

      if (!openNewEntry) {
        // Mid-gesture: update present without growing history.
        return { ...currentHistory, present: resolvedState };
      }

      // Create new history entry
      const newPast = [
        ...currentHistory.past.slice(-maxHistory + 1),
        currentHistory.present,
      ];

      return {
        past: newPast,
        present: resolvedState,
        future: [], // Clear future when new action is performed
      };
    });
  }, [maxHistory]);

  // End a transient sequence so the next update opens a fresh history entry.
  // Called when a drag finishes; the gesture is already reflected in `present`.
  const commit = useCallback(() => {
    transientActive.current = false;
  }, []);

  const undo = useCallback(() => {
    transientActive.current = false;
    setHistory((currentHistory) => {
      if (currentHistory.past.length === 0) return currentHistory;

      isApplying.current = true;
      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);

      setTimeout(() => { isApplying.current = false; }, 0);

      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    transientActive.current = false;
    setHistory((currentHistory) => {
      if (currentHistory.future.length === 0) return currentHistory;

      isApplying.current = true;
      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);

      setTimeout(() => { isApplying.current = false; }, 0);

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: history.present,
      future: [],
    });
  }, [history.present]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    commit,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    historySize: history.past.length + history.future.length + 1,
  };
}
