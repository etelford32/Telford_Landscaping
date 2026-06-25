import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, getShortcutString, platform } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('should call handler when key matches', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: 'z',
          ctrl: true,
          handler,
        },
      ])
    );

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when key does not match', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: 'z',
          ctrl: true,
          handler,
        },
      ])
    );

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support shift modifier', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: 'z',
          ctrl: true,
          shift: true,
          handler,
        },
      ])
    );

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
    });

    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when shift modifier does not match', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: 'z',
          ctrl: true,
          shift: true,
          handler,
        },
      ])
    );

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: false,
    });

    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should prevent default when handler is called', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: 's',
          ctrl: true,
          handler,
        },
      ])
    );

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call handler when disabled', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        [
          {
            key: 'z',
            ctrl: true,
            handler,
          },
        ],
        false // disabled
      )
    );

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([
        {
          key: 'z',
          ctrl: true,
          handler,
        },
      ])
    );

    unmount();

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should be case insensitive', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: 'Z',
          ctrl: true,
          handler,
        },
      ])
    );

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    });

    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('getShortcutString', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should format shortcut with Ctrl on non-Mac', () => {
    vi.spyOn(platform, 'isMac').mockReturnValue(false);

    const shortcut = {
      key: 'z',
      ctrl: true,
      handler: () => {},
    };

    expect(getShortcutString(shortcut)).toBe('Ctrl+Z');
  });

  it('should format shortcut with ⌘ on Mac', () => {
    vi.spyOn(platform, 'isMac').mockReturnValue(true);

    const shortcut = {
      key: 'z',
      ctrl: true,
      handler: () => {},
    };

    expect(getShortcutString(shortcut)).toBe('⌘+Z');
  });

  it('should format shortcut with multiple modifiers', () => {
    const shortcut = {
      key: 'z',
      ctrl: true,
      shift: true,
      alt: true,
      handler: () => {},
    };

    const result = getShortcutString(shortcut);
    expect(result).toContain('Shift');
    expect(result).toContain('Alt');
    expect(result).toContain('Z');
  });
});
