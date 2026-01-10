import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DebugPanel from '../DebugPanel';

describe('DebugPanel', () => {
  const defaultProps = {
    plantsCount: 5,
    structuresCount: 3,
    housesCount: 2,
    historySize: 10,
    canUndo: true,
    canRedo: false,
  };

  beforeEach(() => {
    // Mock requestAnimationFrame - don't call callback to avoid infinite loop in tests
    let rafId = 1;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
      return rafId++;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  it('should render collapsed button initially', () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText('Debug')).toBeInTheDocument();
  });

  it('should expand when button is clicked', async () => {
    render(<DebugPanel {...defaultProps} />);

    const button = screen.getByRole('button', { name: /debug/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Debug Panel')).toBeInTheDocument();
    });
  });

  it('should display scene statistics', async () => {
    render(<DebugPanel {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /debug/i }));

    await waitFor(() => {
      expect(screen.getByText('Plants:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // plants count
      expect(screen.getByText('3')).toBeInTheDocument(); // structures count
      expect(screen.getByText('2')).toBeInTheDocument(); // houses count
      // Total objects is 5+3+2 = 10, but there's also historySize = 10, so use getAllByText
      const tens = screen.getAllByText('10');
      expect(tens.length).toBeGreaterThanOrEqual(1); // At least one "10" should be present
    });
  });

  it('should display history state', async () => {
    render(<DebugPanel {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /debug/i }));

    await waitFor(() => {
      expect(screen.getByText('History Size:')).toBeInTheDocument();
      // history size is 10, but total objects is also 10, so use getAllByText
      const tens = screen.getAllByText('10');
      expect(tens.length).toBeGreaterThanOrEqual(1); // At least one "10" should be present
      expect(screen.getAllByText('Yes')[0]).toBeInTheDocument(); // can undo
      expect(screen.getByText('No')).toBeInTheDocument(); // can redo
    });
  });

  it('should collapse when close button is clicked', async () => {
    render(<DebugPanel {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /debug/i }));

    await waitFor(() => {
      expect(screen.getByText('Debug Panel')).toBeInTheDocument();
    });

    const closeButton = screen.getAllByRole('button').find((btn) => {
      const svg = btn.querySelector('svg');
      return svg !== null;
    });

    if (closeButton) {
      fireEvent.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('Debug Panel')).not.toBeInTheDocument();
      expect(screen.getByText('Debug')).toBeInTheDocument();
    });
  });

  it('should update when props change', async () => {
    const { rerender } = render(<DebugPanel {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /debug/i }));

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // initial plants count
    });

    rerender(<DebugPanel {...defaultProps} plantsCount={10} />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // updated plants count
    });
  });

  it('should display FPS counter', async () => {
    render(<DebugPanel {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /debug/i }));

    await waitFor(() => {
      expect(screen.getByText('FPS:')).toBeInTheDocument();
    });
  });

  it('should display system info', async () => {
    render(<DebugPanel {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /debug/i }));

    await waitFor(() => {
      expect(screen.getByText(/Platform:/)).toBeInTheDocument();
      expect(screen.getByText(/UserAgent:/)).toBeInTheDocument();
    });
  });
});
