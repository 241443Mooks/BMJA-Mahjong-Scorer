import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HandScorer } from '../App';
import type { RulesProfileRef } from '../game/types';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';

const classicalProfile: RulesProfileRef = { id: 'bmja', version: '1.0' };
const mcrProfile: RulesProfileRef = { id: 'mcr-wmo-2006', version: '0.1' };
let selectProfile: ((profile: RulesProfileRef) => void) | undefined;

function MountedHandScorer() {
  const [profile, setProfile] = useState(classicalProfile);
  selectProfile = setProfile;
  return <HandScorer
    context={null}
    onClose={() => undefined}
    standaloneHand
    standaloneRulesProfile={profile}
    onStandaloneRulesProfileChange={setProfile}
  />;
}

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const status = document.querySelector<HTMLOutputElement>('[data-testid="regression-status"]');
const rootElement = document.getElementById('root');
if (!status || !rootElement) throw new Error('Regression harness elements are missing.');
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const root = createRoot(rootElement);
const has = (testId: string) => document.querySelector(`[data-testid="${testId}"]`) !== null;
const pageText = () => document.body.textContent ?? '';

void (async () => {
  try {
    await initialiseCurrentRulesRuntimes();
    await act(async () => { root.render(<MountedHandScorer />); });
    assert(has('remaining-tiles-disclosure'), 'Classical non-winner should expose Remaining tiles before switching.');

    await act(async () => { selectProfile?.(mcrProfile); });
    assert(has('mcr-evidence-controls'), 'MCR evidence controls did not appear after the mounted switch.');
    assert(has('mcr-score-result'), 'MCR result surface did not appear after the mounted switch.');
    assert(!has('remaining-tiles-disclosure'), 'Classical Remaining tiles appeared under MCR.');
    assert(!pageText().includes('Partial evidence'), 'Classical partial-evidence copy appeared under MCR.');
    assert(!/\bbase points?\b|\bdoubles?\b|table limit|\bfishing\b/i.test(pageText()), 'Classical scoring terminology appeared under MCR.');

    await act(async () => { selectProfile?.(classicalProfile); });
    assert(has('remaining-tiles-disclosure'), 'Classical non-winner state was not restored after the round trip.');
    assert(!has('mcr-evidence-controls'), 'MCR-specific evidence remained visible after returning to Classical.');
    assert(!has('mcr-score-result'), 'MCR result remained visible after returning to Classical.');
    assert(pageText().toLowerCase().includes('table limit'), 'Classical scorer controls did not return after the round trip.');
    assert(has('mobile-live-result'), 'Classical partial-hand score summary did not return after the round trip.');
    status.value = 'PASS: mounted Classical → MCR → Classical switch';
    document.body.dataset.regression = 'passed';
  } catch (error) {
    status.value = `FAIL: ${error instanceof Error ? error.message : String(error)}`;
    document.body.dataset.regression = 'failed';
    console.error(error);
  }
})();
