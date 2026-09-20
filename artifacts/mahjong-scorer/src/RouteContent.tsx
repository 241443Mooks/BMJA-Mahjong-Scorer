import type { ReactNode } from 'react';
import App from './App';
import { SiteFooter } from './components/SiteFooter';
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
import NotFound from './pages/not-found';
import { RulesHubPage, RulesProfilePage } from './rules/RulesReference';
import { descriptorForSlug, publicRulesSlugFromGamePath } from './game/rules-presentation';
import { RulesProfilePickerScalabilityFixture } from './game/RulesProfilePicker';

function returnHome() {
  if (typeof window !== 'undefined') window.location.assign('/');
}

function withFullFooter(content: ReactNode) {
  return <>{content}<SiteFooter /></>;
}

export function RouteContent({ path, prerender = false }: { path: string; prerender?: boolean }) {
  if (import.meta.env.DEV && path === '/__fixtures/rules-profile-picker') return <RulesProfilePickerScalabilityFixture />;
  if (path === '/') return withFullFooter(<HomePage />);
  if (path === '/game' || path === '/game/british' || path === '/game/western' || path === '/game/club' || path === '/game/buzzard') {
    return <App initialRulesProfile={descriptorForSlug(publicRulesSlugFromGamePath(path)).profile} prerenderOnly={prerender} />;
  }
  if (path === '/hand') return <App initialView="hand" standaloneHand prerenderOnly={prerender} />;
  if (path === '/scoring-examples') return withFullFooter(<ScoringExamplesPage />);
  if (path === '/guide' || path === '/beginner-guide') return withFullFooter(<BeginnerGuide onClose={returnHome} />);
  if (path === '/special-hands' || path === '/special-hand-catalogue') return withFullFooter(<SpecialHandsCatalogue />);
  if (path === '/gameplay-basics') return withFullFooter(<GameplayBasics />);
  if (path === '/features') return withFullFooter(<FeaturesPage />);
  if (path === '/help') return withFullFooter(<HelpPage />);
  if (path === '/how-it-works') return withFullFooter(<HowItWorksPage />);
  if (path === '/mahjong-rules-compared') return withFullFooter(<MahjongRulesComparedPage />);
  if (path === '/mahjong-settlement') return withFullFooter(<MahjongSettlementPage />);
  if (path === '/rules') return withFullFooter(<RulesHubPage />);
  if (path === '/rules/british') return withFullFooter(<RulesProfilePage slug="british" />);
  if (path === '/rules/western') return withFullFooter(<RulesProfilePage slug="western" />);
  if (path === '/rules/buzzard') return withFullFooter(<RulesProfilePage slug="buzzard" />);
  if (path === '/about') return withFullFooter(<AboutPage />);
  return <NotFound />;
}
