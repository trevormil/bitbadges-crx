import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

export default defineManifest({
  name: `BitBadges Chrome Extension`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/bitbadgeslogo.png',
    32: 'img/bitbadgeslogo.png',
    48: 'img/bitbadgeslogo.png',
    128: 'img/bitbadgeslogo.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/bitbadgeslogo.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/contentScript/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        'img/bitbadgeslogo.png',
        'img/bitbadgeslogo.png',
        'img/bitbadgeslogo.png',
        'img/bitbadgeslogo.png',
      ],
      matches: [],
    },
  ],

  externally_connectable: {
    // matches: ['http://localhost:3000/*', 'https://bitbadges.io/*'],
    matches: ['<all_urls>'],
  },
  permissions: ['storage'],
})
