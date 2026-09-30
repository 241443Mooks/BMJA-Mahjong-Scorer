import type { SourceRecord } from '../../rules-platform/truth-model';
import { versioned } from './records';

const source = (record: SourceRecord) => versioned(record.sourceId, record);

export const sourceRecords = [
  source({ sourceId: 'bmja-special-hands', citation: 'British Mahjong Association, Special Hands', authority: 'governing', authorityForProfileIds: ['bmja'], recordedOn: '2026-09-28' }),
  source({ sourceId: 'tm-companion', citation: 'Thompson & Maloney, Player’s Companion', authority: 'published-primary', authorityForProfileIds: ['western-tm'], publicationVersion: '1997', recordedOn: '2026-09-28' }),
  source({ sourceId: 'otb-guide-2026-09', citation: 'Outside the Box club guide', authority: 'club-primary', authorityForProfileIds: ['outside-the-box'], publicationVersion: '2026-09', recordedOn: '2026-09-28' }),
  source({ sourceId: 'buzzard-2000-classical', citation: 'Buzzard 2000 Classical rules, retained original 13-page source snapshot', authority: 'published-primary', authorityForProfileIds: ['buzzard-2000'], publicationVersion: '2000', recordedOn: '2026-09-28' }),
  source({ sourceId: 'classical-atlas-concept-audit-v1', citation: 'Current-Classical Atlas concept and facet audit (v1), §1; superseded in part by the 2026 Buzzard reconciliation', authority: 'secondary', authorityForProfileIds: [], publicationVersion: 'v1', recordedOn: '2026-09-28' }),
  source({ sourceId: 'bmja-approved-site', citation: 'British Mahjong Association approved British rules reference', authority: 'governing', authorityForProfileIds: ['bmja'], recordedOn: '2026-09-30' }),
  source({ sourceId: 'bmja-scoring', citation: 'British Mahjong Association, Working out the scores', authority: 'governing', authorityForProfileIds: ['bmja'], recordedOn: '2026-09-30' }),
  source({ sourceId: 'bmja-qa', citation: 'British Mahjong Association approved rules clarification and playing-the-game Q&A layer', authority: 'governing', authorityForProfileIds: ['bmja'], recordedOn: '2026-09-30' }),
];
