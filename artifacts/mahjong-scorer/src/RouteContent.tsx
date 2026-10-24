import { PUBLIC_CONCEPT_ROUTES } from './rules-knowledge/reference-topics';
import type { ReactNode } from 'react';
import App from './App';
import { SiteFooter } from './components/SiteFooter';
import { EvidenceDocumentPage } from './evidence/EvidenceDocumentPage';
import { publicEvidenceDocumentForSlug } from './evidence/public-evidence';
import { ProfileLearningPage } from './guide/ProfileLearningPage';
import { ReaderRulesProvider } from './guide/ReaderRulesContext';
import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';
import { ScoringExamplesPage } from './guide/ScoringExamplesPage';
import { AboutPage } from './home/AboutPage';
import { FeaturesPage } from './home/FeaturesPage';
import { HelpPage } from './home/HelpPage';
import { HomePage } from './home/HomePage';
import { HowItWorksPage } from './home/HowItWorksPage';
import { MahjongRulesComparedPage } from './home/MahjongRulesComparedPage';
import { MahjongSettlementPage } from './home/MahjongSettlementPage';
import { PrivacyPage } from './home/PrivacyPage';
import { UnderTheHoodPage } from './home/UnderTheHoodPage';
import { WhatsNewPage } from './home/WhatsNewPage';
import NotFound from './pages/not-found';
import { ClubRulesPage } from './rules/ClubRulesPage';
import { RulesHubPage, RulesProfilePage } from './rules/RulesReference';
import { descriptorForSlug, PUBLIC_RULES_DESCRIPTORS, publicRulesSlugFromGamePath } from './game/rules-presentation';
import { RulesProfilePickerScalabilityFixture } from './game/RulesProfilePicker';
import { PreviousGamesPage } from './game/PreviousGamesPage';
import { EncyclopaediaHubPage, FlowersAndSeasonsReferencePage, PublicReferencePage, PublicScoringConceptPage } from './rules-knowledge/PublicReferencePage';

function withFooter(content: ReactNode, options: { variant?: 'full' | 'compact'; showTileCredit?: boolean } = {}) {
  return <>{content}<SiteFooter variant={options.variant} showTileCredit={options.showTileCredit} /></>;
}

export function RouteContent({ path, prerender = false }: { path: string; prerender?: boolean }) {
  if (import.meta.env.DEV && path === '/__fixtures/rules-profile-picker') return <RulesProfilePickerScalabilityFixture />;
  if (path === '/') return withFooter(<HomePage />);
  if (path === '/previous-games') return withFooter(<PreviousGamesPage />);
  if (path.startsWith('/previous-games/')) {
    const id = decodeURIComponent(path.slice('/previous-games/'.length));
    return id ? withFooter(<App finishedLedgerId={id} prerenderOnly={prerender} />, { variant: 'compact' }) : <NotFound />;
  }
  if (path === '/game' || path.startsWith('/game/')) {
    const slug = publicRulesSlugFromGamePath(path);
    const explicitProfile = path === '/game' ? undefined : slug ? descriptorForSlug(slug).profile : undefined;
    return slug ? withFooter(<App initialRulesProfile={explicitProfile} prerenderOnly={prerender} />, { variant: 'compact' }) : <NotFound />;
  }
  if (path === '/hand') return withFooter(<App initialView="hand" standaloneHand prerenderOnly={prerender} />, { showTileCredit: true });
  if (path === '/scoring-examples') return withFooter(<ScoringExamplesPage />, { showTileCredit: true });
  if (path === '/guide' || path === '/beginner-guide') return withFooter(<ReaderRulesProvider><ProfileLearningPage topic="scoring" /></ReaderRulesProvider>, { showTileCredit: true });
  if (path === '/special-hands' || path === '/special-hand-catalogue') return withFooter(<ReaderRulesProvider specialHands><SpecialHandsCatalogue /></ReaderRulesProvider>, { showTileCredit: true });
  if (path === '/encyclopaedia') return withFooter(<ReaderRulesProvider><EncyclopaediaHubPage /></ReaderRulesProvider>);
  if (PUBLIC_CONCEPT_ROUTES[path]) return withFooter(<ReaderRulesProvider><PublicReferencePage conceptId={PUBLIC_CONCEPT_ROUTES[path]!} /></ReaderRulesProvider>);
  if (path === '/encyclopaedia/flowers-and-seasons') return withFooter(<ReaderRulesProvider><FlowersAndSeasonsReferencePage /></ReaderRulesProvider>);
  if (path === '/encyclopaedia/scoring-systems') return withFooter(<ReaderRulesProvider><PublicScoringConceptPage /></ReaderRulesProvider>);
  if (path === '/gameplay-basics') return withFooter(<ReaderRulesProvider><ProfileLearningPage topic="gameplay" /></ReaderRulesProvider>, { showTileCredit: true });
  if (path === '/features') return withFooter(<FeaturesPage />);
  if (path === '/help') return withFooter(<HelpPage />);
  if (path === '/how-it-works') return withFooter(<HowItWorksPage />);
  if (path === '/under-the-hood') return withFooter(<UnderTheHoodPage />);
  if (path === '/whats-new') return withFooter(<WhatsNewPage />);
  if (path.startsWith('/evidence/')) {
    const slug = path.slice('/evidence/'.length);
    const document = publicEvidenceDocumentForSlug(slug);
    return document ? withFooter(<EvidenceDocumentPage document={document} />) : <NotFound />;
  }
  if (path === '/mahjong-rules-compared') return withFooter(<MahjongRulesComparedPage />);
  if (path === '/mahjong-settlement') return withFooter(<MahjongSettlementPage />);
  if (path === '/rules') return withFooter(<RulesHubPage />);
  if (path.startsWith('/rules/')) {
    const slug = path.slice('/rules/'.length);
    const descriptor = PUBLIC_RULES_DESCRIPTORS.find((item) => item.slug === slug && item.availability.rulesReference);
    if (!descriptor) return <NotFound />;
    return withFooter(<ReaderRulesProvider pageProfile={descriptor}>{slug === 'club' ? <ClubRulesPage /> : <RulesProfilePage slug={slug} descriptor={descriptor} />}</ReaderRulesProvider>);
  }
  if (path === '/about') return withFooter(<AboutPage />);
  if (path === '/privacy') return withFooter(<PrivacyPage />);
  return <NotFound />;
}
