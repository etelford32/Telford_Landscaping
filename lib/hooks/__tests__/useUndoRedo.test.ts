import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from '../useUndoRedo';

describe('useUndoRedo', () => {
  it('should initialize with the initial state', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should add to history when state changes', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
    });

    expect(result.current.state).toEqual({ count: 2 });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('should redo to next state', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 0 });

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canRedo).toBe(false);
  });

  it('should clear future when new action is performed after undo', async () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    // undo() guards re-entrancy with a flag it clears on a setTimeout(0); let that
    // macrotask run before the next edit, otherwise setState is ignored.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.setState({ count: 3 });
    });

    expect(result.current.canRedo).toBe(false);
    expect(result.current.state).toEqual({ count: 3 });
  });

  it('should support function updates', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.setState((prev) => ({ count: prev.count + 1 }));
    });

    expect(result.current.state).toEqual({ count: 1 });
  });

  it('should not add to history if state has not changed', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
    });

    const historySize1 = result.current.historySize;

    act(() => {
      result.current.setState({ count: 1 }); // Same state
    });

    expect(result.current.historySize).toBe(historySize1);
  });

  it('should respect max history limit', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }, 3));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
      result.current.setState({ count: 3 });
      result.current.setState({ count: 4 });
    });

    // Max history is 3, so we should have: past(2 items) + present + future(0)
    expect(result.current.historySize).toBeLessThanOrEqual(4);
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
    });

    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.clear();
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
