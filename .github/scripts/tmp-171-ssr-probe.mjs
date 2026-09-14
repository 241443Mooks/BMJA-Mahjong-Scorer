import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const appDir = path.join(root, 'artifacts', 'mahjong-scorer');
const seo = JSON.parse(await readFile(path.join(appDir, 'src', 'site-seo.json'), 'utf8'));
const server = await createServer({
  root: appDir,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
try {
  const module = await server.ssrLoadModule('/src/tmp-171-prerender-probe.tsx');
  for (const route of seo.routes) {
    const html = module.renderRoute(route.path);
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    const anchorCount = (html.match(/<a\b/g) ?? []).length;
    if (!html.trim() || h1Count < 1 || anchorCount < 1) {
      throw new Error(`${route.path}: SSR output incomplete (${html.length} bytes, ${h1Count} h1, ${anchorCount} anchors)`);
    }
    console.log(`${route.path}\t${html.length} bytes\t${h1Count} h1\t${anchorCount} anchors`);
  }
  console.log('SSR171_PROBE=PASS');
} finally {
  await server.close();
}
