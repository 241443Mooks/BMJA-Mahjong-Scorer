type Disclosure = { open: boolean };

/** Opens print-only disclosures and returns their exact prior state. */
export const prepareFullPrintDisclosures = (disclosures: Array<Disclosure | null | undefined>) => {
  const states = disclosures.flatMap((disclosure) => disclosure ? [[disclosure, disclosure.open] as const] : []);
  states.forEach(([disclosure]) => { disclosure.open = true; });

  return () => states.forEach(([disclosure, wasOpen]) => { disclosure.open = wasOpen; });
};
