import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ['https://portfolio.metamask.io/*', 'https://card.metamask.io/*'],
  run_at: 'document_idle',
};

import '../content';
