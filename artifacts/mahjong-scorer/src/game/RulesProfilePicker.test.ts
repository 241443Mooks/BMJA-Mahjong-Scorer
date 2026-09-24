import { Children, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RulesProfilePicker, RulesProfilePickerScalabilityFixture } from './RulesProfilePicker';
import { BMJA_PROFILE_REF } from './ruleset';
import { BUZZARD_2000_PROFILE_REF } from './buzzard-2000';

function profileRadio(profile: typeof BMJA_PROFILE_REF | typeof BUZZARD_2000_PROFILE_REF) {
  const section = RulesProfilePicker({ prompt: 'Choose rules', selectedProfile: BMJA_PROFILE_REF, onSelect: vi.fn() }) as ReactElement<any>;
  const layout = section.props.children[1] as ReactElement<any>;
  const list = layout.props.children[0] as ReactElement<any>;
  const fieldset = list.type(list.props) as ReactElement<any>;
  const label = Children.toArray(fieldset.props.children).find((child) => (child as ReactElement<any>).props['data-testid'] === `rules-card-${profile.id === 'bmja' ? 'british' : 'buzzard'}`) as ReactElement<any>;
  return label.props.children[0] as ReactElement<any>;
}

describe('rules profile picker analytics', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  it('captures the selected descriptor slug when a real profile changes', () => {
    const capture = vi.fn();
    window.posthog = { capture };
    const selected = profileRadio(BUZZARD_2000_PROFILE_REF);
    selected.props.onChange();
    expect(capture).toHaveBeenCalledWith('ruleset_selected', { ruleset: 'buzzard' });
  });

  it('does not attach analytics to disabled scalability fixture choices', () => {
    const capture = vi.fn();
    window.posthog = { capture };
    const fixture = RulesProfilePickerScalabilityFixture() as ReactElement<any>;
    const section = fixture.props.children[2] as ReactElement<any>;
    const list = section.props.children as ReactElement<any>;
    const fieldset = list.type(list.props) as ReactElement<any>;
    const futureChoice = Children.toArray(fieldset.props.children)[5] as ReactElement<any>;
    const radio = futureChoice.props.children[0] as ReactElement<any>;
    expect(radio.props.disabled).toBe(true);
    radio.props.onChange();
    expect(capture).not.toHaveBeenCalled();
  });
});
