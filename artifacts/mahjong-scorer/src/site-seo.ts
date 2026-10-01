import baseSiteSeo from './site-seo.json';
import { publicEvidenceDocuments } from './evidence/public-evidence';

const evidenceRoutes = publicEvidenceDocuments.map((document) => ({
  path: `/evidence/${document.slug}`,
  title: `${document.title} | Evidence & Methods | Mahjong Reference`,
  description: document.description,
  indexable: true,
}));

export const siteSeo = {
  ...baseSiteSeo,
  routes: [...baseSiteSeo.routes, ...evidenceRoutes],
};

export default siteSeo;
