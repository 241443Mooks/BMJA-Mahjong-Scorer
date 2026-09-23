import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HandScorer } from './App';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { RulesProfilePicker } from './game/RulesProfilePicker';

const mcrProfile = { id: 'mcr-wmo-2006', version: '0.1' };

describe('C1 shared standalone scorer workspace', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('renders the original visual hand workspace and MCR evidence/result surfaces for MCR', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={mcrProfile} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toContain('data-testid="working-picker"');
    expect(html).toContain('data-testid="hand-so-far"');
    expect(html).toContain('data-testid="button-layout-special"');
    expect(html).toContain('data-testid="mcr-evidence-controls"');
    expect(html).toContain('data-testid="mcr-score-result"');
    expect(html).not.toContain('data-testid="button-apply-score-mobile"');
    expect(html).not.toMatch(/\bdouble(s)?\b|table limit|fishing/i);
    const handPicker = renderToStaticMarkup(<RulesProfilePicker surface="hand" prompt="Hand rules" selectedProfile={mcrProfile} onSelect={vi.fn()} />);
    const gamePicker = renderToStaticMarkup(<RulesProfilePicker surface="game" prompt="Game rules" selectedProfile={{ id: 'bmja', version: '1.0' }} onSelect={vi.fn()} />);
    expect(handPicker.match(/data-testid="rules-card-/g)).toHaveLength(5);
    expect(handPicker).toContain('rules-card-mcr');
    expect(gamePicker.match(/data-testid="rules-card-/g)).toHaveLength(4);
    expect(gamePicker).not.toContain('rules-card-mcr');
  });
});
