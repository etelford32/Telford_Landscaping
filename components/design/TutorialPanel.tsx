/**
 * TutorialPanel - Minimal, dismissable tutorial and help system
 * Designed for maximum utility with minimal visual footprint
 */

"use client";

import { useState, useEffect } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp, Lightbulb, Keyboard, Mouse } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  shortcut?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Add Plants",
    description: "Drag plants from the left panel onto the 3D grid to place them in your design.",
    icon: <Mouse className="w-4 h-4" />,
  },
  {
    title: "Select & Move",
    description: "Click objects to select them. Drag selected objects to move them around the grid.",
    icon: <Mouse className="w-4 h-4" />,
    shortcut: "Click + Drag"
  },
  {
    title: "Precision Editing",
    description: "Use the Precision Edit panel for exact positioning, dimensions, and rotation controls.",
    icon: <Keyboard className="w-4 h-4" />,
  },
  {
    title: "Timeline Control",
    description: "Adjust the timeline slider to see how your plants will grow over the years.",
    icon: <Keyboard className="w-4 h-4" />,
  },
  {
    title: "Grid Snapping",
    description: "Toggle grid snapping in the bottom toolbar for precise alignment.",
    icon: <Keyboard className="w-4 h-4" />,
    shortcut: "G key"
  },
  {
    title: "Save Your Design",
    description: "Click the Save button in the bottom toolbar to export your landscape design.",
    icon: <Keyboard className="w-4 h-4" />,
    shortcut: "Ctrl+S"
  },
];

interface TutorialPanelProps {
  onClose?: () => void;
}

export default function TutorialPanel({ onClose }: TutorialPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has dismissed tutorial before
  useEffect(() => {
    const dismissed = localStorage.getItem('tutorial-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('tutorial-dismissed', 'true');
    setIsDismissed(true);
    setIsVisible(false);
    onClose?.();
  };

  const handleNextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleDismiss();
  };

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setIsVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render if dismissed permanently
  if (isDismissed) {
    return (
      <button
        onClick={() => {
          setIsDismissed(false);
          setIsVisible(true);
          localStorage.removeItem('tutorial-dismissed');
        }}
        className="fixed top-4 right-4 z-50 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg transition-all"
        title="Show Tutorial (F1)"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed top-4 right-4 z-50 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border-2 border-primary-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-sm font-bold">Quick Start Guide</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Hide (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Progress Indicator */}
          <div className="bg-gray-100 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {TUTORIAL_STEPS.length}</span>
              <span className="text-primary-600 font-semibold">{Math.round(((currentStep + 1) / TUTORIAL_STEPS.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              {step.icon && (
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                  {step.icon}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.shortcut && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
                    <Keyboard className="w-3 h-3" />
                    {step.shortcut}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Don't show again
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevStep}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNextStep}
                className="px-3 py-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
              >
                {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Got it!'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Minimized State */}
      {!isExpanded && (
        <div className="px-4 py-2 text-xs text-gray-600">
          Click to expand tutorial
        </div>
      )}
    </div>
  );
}

/**
 * Minimal help button that can be placed anywhere
 */
export function HelpButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group p-2 bg-white/90 hover:bg-primary-600 text-gray-600 hover:text-white rounded-lg shadow-md transition-all duration-200"
      title="Show Help (F1)"
    >
      <HelpCircle className="w-4 h-4" />
    </button>
  );
}
