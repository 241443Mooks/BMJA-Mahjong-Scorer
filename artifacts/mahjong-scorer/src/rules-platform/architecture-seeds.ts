import { categoryForId, type RegistryEntry } from './registry';

const ids = [
  'family.classical-western','family.hong-kong','family.mcr','family.taiwanese-16-tile','family.riichi','family.riichi-sanma','family.zung-jung','family.american-nmjl-style',
  'source.mahjong-time.european-classical','source.mahjong-time.hong-kong','source.mcr-ema-green-book-2006','source.mahjong-time.taiwanese','source.ema-riichi-2025','source.mahjong-time.sanma','source.zung-jung-1.03','source.nmjl-annual-card-ecosystem',
  'tiles.flowers-144','tiles.riichi-136','tiles.sanma-108','tiles.standard-136','tiles.american-joker-capable',
  'seats.winds-4','seats.riichi-winds-4','seats.riichi-sanma-east-south-west','seats.american-four-player',
  'shape.four-sets-pair','shape.five-sets-pair','shape.target-catalogue',
  'validation.classical-standard','validation.hk-profile','validation.mcr-winning-shape','validation.mcr-minimum-win-context','validation.taiwanese-five-sets-pair','validation.riichi-winning-shape','validation.riichi-yaku-required','validation.sanma-no-chii','validation.zung-jung-winning-shape','validation.target-catalogue-match',
  'evidence.winning-method','evidence.winning-tile-provenance','evidence.seat-wind','evidence.round-wind',
  'evidence-policy.classical-winning-context','evidence-policy.mt-european-classical-waits','evidence-policy.hk-profile','evidence-policy.mcr-wmo-2006','evidence-policy.taiwanese-profile','evidence-policy.riichi-ema-2025','evidence-policy.riichi-sanma','evidence-policy.zung-jung-1.03','evidence-policy.american-nmjl-style',
  'classical.standard','classical.bindings.mt-european-classical',
  'catalogue.pattern.mt-european-classical-specials','catalogue.pattern.hk-profile-specials','catalogue.pattern.hk-profile','catalogue.pattern.mcr-special-shapes','catalogue.pattern.mcr-wmo-2006','catalogue.pattern.taiwanese-profile-specials','catalogue.pattern.taiwanese-profile','catalogue.pattern.riichi-ema-2025-special-shapes','catalogue.pattern.sanma-profile-special-shapes','catalogue.pattern.zung-jung-special-shapes','catalogue.pattern.zung-jung-1.03-44',
  'catalogue.yaku.riichi-ema-2025','catalogue.yaku.sanma-profile','catalogue.yakuman.riichi-ema-2025','catalogue.yakuman.sanma-profile','catalogue.target.nmjl-2026-external-placeholder',
  'interaction.hk-profile','interaction.mcr-2006-non-combination','interaction.taiwanese-profile','interaction.zung-jung-same-series-highest-only','qualification.hk-profile','qualification.mcr-8-before-flowers','qualification.taiwanese-profile','qualification.none','interpretation.max-lawful-profile','conversion.hk-fan-payment-table','conversion.identity','value-policy.hk-profile','value-policy.optional-table-cap','value-policy.zung-jung-zero-pattern-one','value-policy.zung-jung-320-listed-limit','post-qualification-bonus.mcr-flowers',
  'dora.riichi-ema-2025','dora.sanma-profile-with-nuki','fu.riichi-ema-2025','fu.sanma-profile','riichi-decomposition.ema-2025-enumerate-max','riichi-decomposition.compatible-enumerate-max','riichi-limit-tier.ema-2025','riichi-limit-tier.sanma-profile','riichi-hand-value.ema-2025','riichi-hand-value.sanma-profile',
  'target-match.nmjl-style','substitution.nmjl-style-joker','target-exposure.nmjl-style','target-value.catalogue-defined',
  'settlement.classical-pairwise','settlement.hk-profile','settlement.mcr-2006','settlement.taiwanese-winner-only','settlement.riichi-ema-2025-four-player','settlement.riichi-sanma','settlement.zung-jung-formal','settlement.american-profile','progression.rotate-every-hand','progression.hk-profile','progression.always-pass','progression.taiwanese-profile','progression.riichi-ema-2025-renchan','progression.riichi-sanma-renchan','progression.zung-jung-profile','progression.american-profile','game-end.four-round-always-pass','game-end.hk-profile','game-end.taiwanese-profile','game-end.riichi-ema-2025','game-end.riichi-sanma','game-end.zung-jung-profile','game-end.american-profile','hand-mode.bmja-goulash','hand-mode.outside-the-box-goulash','hand-mode.none','incident.false-mah-jong','procedure.riichi-ema-2025-social',
] as const;

export const architectureSeedEntries: readonly RegistryEntry[] = ids.map((id) => ({
  id,
  category: categoryForId(id),
  status: categoryForId(id) === 'source' ? 'metadata' : 'architecture-only',
}));
