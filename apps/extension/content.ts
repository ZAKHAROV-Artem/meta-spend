import type { PlasmoCSConfig } from 'plasmo';
import './src/content/index';

export const config: PlasmoCSConfig = {
  matches: ['https://portfolio.metamask.io/*', 'https://card.metamask.io/*'],
  run_at: 'document_idle',
};
