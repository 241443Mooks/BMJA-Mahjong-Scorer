import { describe, expect, it, vi } from 'vitest';
import { prepareFullPrintDisclosures, watchPrintLifecycle } from './print-disclosures';

class PrintEvents {
  private listeners = new Map<string, Set<() => void>>();

  addEventListener(type: string, listener: () => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: string) {
    this.listeners.get(type)?.forEach((listener) => listener());
  }
}

describe('prepareFullPrintDisclosures', () => {
  it('opens the outer ledger and each hand, then restores their individual states', () => {
    const ledger = { open: false };
    const firstHand = { open: true };
    const secondHand = { open: false };

    const restore = prepareFullPrintDisclosures([ledger, firstHand, secondHand]);

    expect([ledger.open, firstHand.open, secondHand.open]).toEqual([true, true, true]);
    restore();
    expect([ledger.open, firstHand.open, secondHand.open]).toEqual([false, true, false]);
  });

  it('waits for afterprint or a verified return from a native print flow before restoring', () => {
    const printWindow = new PrintEvents();
    const printDocument = Object.assign(new PrintEvents(), { visibilityState: 'visible' as DocumentVisibilityState });
    const restore = vi.fn();
    const stopWatching = watchPrintLifecycle(printWindow, printDocument, restore);

    printWindow.emit('focus');
    expect(restore).not.toHaveBeenCalled();

    printWindow.emit('blur');
    printWindow.emit('focus');
    expect(restore).toHaveBeenCalledTimes(1);

    printWindow.emit('afterprint');
    expect(restore).toHaveBeenCalledTimes(2);

    stopWatching();
    printWindow.emit('afterprint');
    expect(restore).toHaveBeenCalledTimes(2);
  });
});
