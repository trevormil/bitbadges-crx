import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

export default defineManifest({
  name: `BitBadges Chrome Extension`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    128: 'img/bitbadgeslogo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/bitbadgeslogo.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  web_accessible_resources: [
    {
      resources: ['img/bitbadgeslogo.png', 'img/bitbadgeslogo-128.png'],
      matches: [],
    },
  ],

  externally_connectable: {
    matches: ['http://localhost:3000/*', 'https://bitbadges.io/*'],
  },
  permissions: ['storage'],
})
