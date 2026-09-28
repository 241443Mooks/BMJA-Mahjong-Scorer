import type { SourceRecord } from '../../rules-platform/truth-model';
import { versioned } from './records';

export const mcrSourceRecords = [versioned<SourceRecord>('source.mcr-ema-green-book-2006', {
  sourceId: 'source.mcr-ema-green-book-2006',
  citation: 'World Mahjong Organization, Mahjong Competition Rules (2006), English edition distributed by the European Mahjong Association (EMA)',
  authority: 'governing',
  authorityForProfileIds: ['mcr-wmo-2006'],
  publicationVersion: '2006',
  recordedOn: '2026-09-28',
})];
