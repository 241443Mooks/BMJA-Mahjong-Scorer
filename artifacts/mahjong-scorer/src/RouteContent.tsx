import type { ReactNode } from 'react';
import App from './App';
import { SiteFooter } from './components/SiteFooter';
import { EvidenceDocumentPage } from './evidence/EvidenceDocumentPage';
import { publicEvidenceDocumentForSlug } from './evidence/public-evidence';
import { BeginnerGuide } from './guide/BeginnerGuide';
import { GameplayBasics } from './guide/GameplayBasics';
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
import NotFound from './pages/not-found';
import { ClubRulesPage } from './rules/ClubRulesPage';
import { RulesHubPage, RulesProfilePage } from './rules/RulesReference';
import { descriptorForSlug, publicRulesSlugFromGamePath } from './game/rules-presentation';
import { RulesProfilePickerScalabilityFixture } from './game/RulesProfilePicker';

function returnHome() {
  if (typeof window !== 'undefined') window.location.assign('/');
}

function withFooter(content: ReactNode, options: { variant?: 'full' | 'compact'; showTileCredit?: boolean } = {}) {
  return <>{content}<SiteFooter variant={options.variant} showTileCredit={options.showTileCredit} /></>;
}

export function RouteContent({ path, prerender = false }: { path: string; prerender?: boolean }) {
  if (import.meta.env.DEV && path === '/__fixtures/rules-profile-picker') return <RulesProfilePickerScalabilityFixture />;
  if (path === '/') return withFooter(<HomePage />);
  if (path === '/game' || path.startsWith('/game/')) {
    const slug = publicRulesSlugFromGamePath(path);
    const explicitProfile = path === '/game' ? undefined : slug ? descriptorForSlug(slug).profile : undefined;
    return slug ? withFooter(<App initialRulesProfile={explicitProfile} prerenderOnly={prerender} />, { variant: 'compact' }) : <NotFound />;
  }
  if (path === '/hand') return withFooter(<App initialView="hand" standaloneHand prerenderOnly={prerender} />, { showTileCredit: true });
  if (path === '/scoring-examples') return withFooter(<ScoringExamplesPage />, { showTileCredit: true });
  if (path === '/guide' || path === '/beginner-guide') return withFooter(<BeginnerGuide onClose={returnHome} />, { showTileCredit: true });
  if (path === '/special-hands' || path === '/special-hand-catalogue') return withFooter(<SpecialHandsCatalogue />, { showTileCredit: true });
  if (path === '/gameplay-basics') return withFooter(<GameplayBasics />, { showTileCredit: true });
  if (path === '/features') return withFooter(<FeaturesPage />);
  if (path === '/help') return withFooter(<HelpPage />);
  if (path === '/how-it-works') return withFooter(<HowItWorksPage />);
  if (path === '/under-the-hood') return withFooter(<UnderTheHoodPage />);
  if (path.startsWith('/evidence/')) {
    const slug = path.slice('/evidence/'.length);
    const document = publicEvidenceDocumentForSlug(slug);
    return document ? withFooter(<EvidenceDocumentPage document={document} />) : <NotFound />;
  }
  if (path === '/mahjong-rules-compared') return withFooter(<MahjongRulesComparedPage />);
  if (path === '/mahjong-settlement') return withFooter(<MahjongSettlementPage />);
  if (path === '/rules') return withFooter(<RulesHubPage />);
  if (path === '/rules/british') return withFooter(<RulesProfilePage slug="british" />);
  if (path === '/rules/western') return withFooter(<RulesProfilePage slug="western" />);
  if (path === '/rules/club') return withFooter(<ClubRulesPage />);
  if (path === '/rules/buzzard') return withFooter(<RulesProfilePage slug="buzzard" />);
  if (path === '/rules/mcr') return withFooter(<RulesProfilePage slug="mcr" />);
  if (path === '/about') return withFooter(<AboutPage />);
  if (path === '/privacy') return withFooter(<PrivacyPage />);
  return <NotFound />;
}
