import { renderToString } from 'react-dom/server';
import { RouteContent } from './RouteContent';

export function renderRoute(path: string) {
  return renderToString(<RouteContent path={path} prerender />);
}

export { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
export { default as siteSeo } from './site-seo';
export { PUBLIC_RULES_DESCRIPTORS } from './game/rules-presentation';
