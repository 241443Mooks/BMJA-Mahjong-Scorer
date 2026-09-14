import { renderToString } from 'react-dom/server';
import App from './App';
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
import { RulesHubPage, RulesProfilePage } from './rules/RulesReference';
import { descriptorForSlug, publicRulesSlugFromGamePath } from './game/rules-presentation';

function RouteContent({ path }: { path: string }) {
  if (path === '/') return <HomePage />;
  if (path === '/game' || path === '/game/british' || path === '/game/western' || path === '/game/club') return <App initialRulesProfile={descriptorForSlug(publicRulesSlugFromGamePath(path)).profile} />;
  if (path === '/hand') return <App initialView="hand" standaloneHand />;
  if (path === '/scoring-examples') return <ScoringExamplesPage />;
  if (path === '/guide') return <BeginnerGuide onClose={() => undefined} />;
  if (path === '/special-hands') return <SpecialHandsCatalogue />;
  if (path === '/gameplay-basics') return <GameplayBasics />;
  if (path === '/features') return <FeaturesPage />;
  if (path === '/help') return <HelpPage />;
  if (path === '/how-it-works') return <HowItWorksPage />;
  if (path === '/mahjong-rules-compared') return <MahjongRulesComparedPage />;
  if (path === '/mahjong-settlement') return <MahjongSettlementPage />;
  if (path === '/rules') return <RulesHubPage />;
  if (path === '/rules/british') return <RulesProfilePage slug="british" />;
  if (path === '/rules/western') return <RulesProfilePage slug="western" />;
  if (path === '/about') return <AboutPage />;
  throw new Error(`No prerender route for ${path}`);
}

export function renderRoute(path: string) {
  return renderToString(<RouteContent path={path} />);
}
