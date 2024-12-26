import packageData from '../package.json'

export default {
  name: `BitBadges Extension`,
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
  browser_specific_settings: {
    gecko: {
      id: 'bitbadges-extension@bitbadges.io',
    },
  },
  background: {
    scripts: ['src/background/index.ts'],
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
}
