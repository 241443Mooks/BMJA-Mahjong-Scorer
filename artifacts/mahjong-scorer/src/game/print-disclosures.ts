type Disclosure = { open: boolean };

type PrintEventSource = {
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};
type PrintWindow = PrintEventSource;
type PrintDocument = PrintEventSource & { visibilityState: DocumentVisibilityState };

/** Opens print-only disclosures and returns their exact prior state. */
export const prepareFullPrintDisclosures = (disclosures: Array<Disclosure | null | undefined>) => {
  const states = disclosures.flatMap((disclosure) => disclosure ? [[disclosure, disclosure.open] as const] : []);
  states.forEach(([disclosure]) => { disclosure.open = true; });

  return () => states.forEach(([disclosure, wasOpen]) => { disclosure.open = wasOpen; });
};

/**
 * Restores print-only DOM changes only once the print lifecycle has finished.
 * `afterprint` is authoritative. Focus/visibility are a fallback for native
 * print flows that do not dispatch it, and only restore after the page left.
 */
export const watchPrintLifecycle = (
  printWindow: PrintWindow,
  printDocument: PrintDocument,
  restore: () => void,
) => {
  let pageLeftForPrint = false;

  const notePageLeft = () => { pageLeftForPrint = true; };
  const restoreAfterReturn = () => {
    if (pageLeftForPrint && printDocument.visibilityState === 'visible') restore();
  };
  const onVisibilityChange = () => {
    if (printDocument.visibilityState === 'hidden') notePageLeft();
    else restoreAfterReturn();
  };

  printWindow.addEventListener('afterprint', restore);
  printWindow.addEventListener('blur', notePageLeft);
  printWindow.addEventListener('focus', restoreAfterReturn);
  printDocument.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    printWindow.removeEventListener('afterprint', restore);
    printWindow.removeEventListener('blur', notePageLeft);
    printWindow.removeEventListener('focus', restoreAfterReturn);
    printDocument.removeEventListener('visibilitychange', onVisibilityChange);
  };
};
