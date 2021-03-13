module.exports = {
  title: 'Etomica',
  tagline: 'Java Molecular Simulation Framework',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'favicon.ico',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'etomica', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Etomica',
      logo: {
        alt: 'Etomica Logo',
        src: 'img/logo_small.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/etomica/etomica',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          items: [
            {
              label: 'Department of Chemical & Biological Engineering',
              href: 'https://www.cheme.buffalo.edu/',
            },
            {
              label: 'Center for Computational Research',
              href: 'https://www.ccr.buffalo.edu',
            },
            {
              label: 'University at Buffalo',
              href: 'https://www.buffalo.edu/',
            },
            {
              label: 'School of Engineering and Applied Sciences',
              href: 'https://www.eng.buffalo.edu'
            }
          ],
        },
      ],
      // copyright: `Copyright © ${new Date().getFullYear()} Etomica. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: ['@docusaurus/plugin-ideal-image']
};
