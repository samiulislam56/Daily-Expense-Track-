import React, { useState, useEffect, useCallback } from 'react';
import {
  Delete,
  CornerDownLeft,
  ArrowRightCircle,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface InAppCalculatorProps {
  onTransferAmount?: (amountDecimal: string) => void;
  className?: string;
}

export const InAppCalculator: React.FC<InAppCalculatorProps> = ({
  onTransferAmount,
  className = '',
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setHasEvaluated(false);
    setErrorState(null);
  }, []);

  const handleBackspace = useCallback(() => {
    if (errorState) {
      handleClear();
      return;
    }
    if (hasEvaluated) {
      setHasEvaluated(false);
    }
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }, [errorState, hasEvaluated, handleClear]);

  const handleNumber = useCallback((num: string) => {
    setErrorState(null);
    if (hasEvaluated) {
      setDisplay(num);
      setEquation('');
      setHasEvaluated(false);
      return;
    }
    setDisplay((prev) => (prev === '0' ? num : prev + num));
  }, [hasEvaluated]);

  const handleDecimal = useCallback(() => {
    setErrorState(null);
    if (hasEvaluated) {
      setDisplay('0.');
      setEquation('');
      setHasEvaluated(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  }, [hasEvaluated, display]);

  const handleOperator = useCallback((op: string) => {
    setErrorState(null);
    setHasEvaluated(false);
    setEquation(`${display} ${op}`);
    setDisplay('0');
  }, [display]);

  const handleEvaluate = useCallback(() => {
    if (!equation || errorState) return;

    try {
      const parts = equation.trim().split(' ');
      if (parts.length < 2) return;

      const left = parseFloat(parts[0]);
      const op = parts[1];
      const right = parseFloat(display);

      if (isNaN(left) || isNaN(right)) {
        setErrorState('Invalid Input');
        return;
      }

      let result = 0;
      if (op === '+') result = left + right;
      else if (op === '−' || op === '-') result = left - right;
      else if (op === '×' || op === '*') result = left * right;
      else if (op === '÷' || op === '/') {
        if (right === 0) {
          setErrorState('Cannot divide by zero');
          return;
        }
        result = left / right;
      }

      // Avoid floating point jitter
      const rounded = Number(Math.round(Number(result + 'e+8')) + 'e-8');
      const resultStr = rounded.toString();

      setEquation(`${parts[0]} ${op} ${display} =`);
      setDisplay(resultStr);
      setHasEvaluated(true);
    } catch {
      setErrorState('Calculation error');
    }
  }, [equation, display, errorState]);

  // Keyboard navigation support (SRS FR-06 & 5.5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing into input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        handleOperator(e.key === '-' ? '−' : '+');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleDecimal, handleOperator, handleEvaluate, handleBackspace, handleClear]);

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransfer = () => {
    if (onTransferAmount && !errorState) {
      onTransferAmount(display);
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between max-w-sm w-full select-none ${className}`}
      role="region"
      aria-label="Built-in Expense Calculator"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-ink-muted flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          Quick Calculator
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
            title="Copy value"
            aria-label="Copy display value"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
            title="Clear (Escape)"
            aria-label="Clear calculator"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="bg-surface-elevated/70 border border-border rounded-xl p-3.5 mb-4 text-right transition-colors">
        <div className="text-xs text-ink-muted h-4 font-mono overflow-hidden text-ellipsis">
          {equation || '\u00A0'}
        </div>
        <div
          className={`text-2xl font-bold font-mono tracking-tight tabular-nums overflow-x-auto ${
            errorState ? 'text-rose-500 text-lg' : 'text-ink'
          }`}
          aria-live="polite"
        >
          {errorState || display}
        </div>
      </div>

      {/* Action Strip: Use as Expense Amount */}
      {onTransferAmount && (
        <button
          onClick={handleTransfer}
          disabled={Boolean(errorState) || parseFloat(display) <= 0}
          className="mb-4 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium text-xs border border-teal-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowRightCircle className="w-4 h-4" />
          <span>Transfer Result to Expense</span>
        </button>
      )}

      {/* Keypad Buttons Grid */}
      <div className="grid grid-cols-4 gap-2 text-sm font-medium">
        <button
          onClick={handleClear}
          className="h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all font-semibold"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="h-11 rounded-xl bg-surface-elevated text-ink-muted hover:text-ink hover:bg-surface-subtle active:scale-95 transition-all flex items-center justify-center"
          title="Backspace"
          aria-label="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-11 rounded-xl bg-surface-subtle text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 active:scale-95 transition-all font-semibold text-base"
        >
          ÷
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="h-11 rounded-xl bg-surface-subtle text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 active:scale-95 transition-all font-semibold text-base"
        >
          ×
        </button>

        {/* Row 2 */}
        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-11 rounded-xl bg-surface-elevated text-ink hover:bg-surface-subtle active:scale-95 transition-all font-mono text-base font-semibold"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('−')}
          className="h-11 rounded-xl bg-surface-subtle text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 active:scale-95 transition-all font-semibold text-base"
        >
          −
        </button>

        {/* Row 3 */}
        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-11 rounded-xl bg-surface-elevated text-ink hover:bg-surface-subtle active:scale-95 transition-all font-mono text-base font-semibold"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className="h-11 rounded-xl bg-surface-subtle text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 active:scale-95 transition-all font-semibold text-base"
        >
          +
        </button>

        {/* Row 4 */}
        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-11 rounded-xl bg-surface-elevated text-ink hover:bg-surface-subtle active:scale-95 transition-all font-mono text-base font-semibold"
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleEvaluate}
          className="row-span-2 h-auto rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center active:scale-95 transition-all shadow-sm shadow-teal-600/30"
          title="Calculate (Enter)"
          aria-label="Calculate result"
        >
          <CornerDownLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleNumber('0')}
          className="col-span-2 h-11 rounded-xl bg-surface-elevated text-ink hover:bg-surface-subtle active:scale-95 transition-all font-mono text-base font-semibold"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="h-11 rounded-xl bg-surface-elevated text-ink hover:bg-surface-subtle active:scale-95 transition-all font-mono text-base font-semibold"
        >
          .
        </button>
      </div>
    </div>
  );
};
