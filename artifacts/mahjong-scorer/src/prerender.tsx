import { renderToString } from 'react-dom/server';
import { RouteContent } from './RouteContent';

export function renderRoute(path: string) {
  return renderToString(<RouteContent path={path} prerender />);
}
