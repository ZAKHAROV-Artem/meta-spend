import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  name: 'CryptoTrack — MetaMask Card sync',
  description: 'Import MetaMask Card activity from MetaMask card pages into CryptoTrack.',
  version: '0.1.0',
  manifest_version: 3,
  permissions: ['storage', 'tabs'],
  host_permissions: [
    'https://portfolio.metamask.io/*',
    'https://card.metamask.io/*',
    'http://localhost:4001/*',
    'http://127.0.0.1:4001/*',
  ],
  action: {
    default_title: 'CryptoTrack Card',
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://portfolio.metamask.io/*', 'https://card.metamask.io/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
});
