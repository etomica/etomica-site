const remarkMath = require('remark-math')
const rehypeKatex = require('rehype-katex')
const remarkFootnotes = require('remark-footnotes')

module.exports = {
  title: 'Etomica',
  tagline: 'Java Molecular Simulation Framework',
  url: 'https://www.etomica.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'favicon.ico',
  organizationName: 'etomica', // Usually your GitHub org/user name.
  projectName: 'etomica', // Usually your repo name.
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-t5CR+zwDAROtph0PXGte6ia8heboACF9R5l/DiY+WZ3P2lxNgvJkQk5n7GPvLMYw',
      crossorigin: 'anonymous'
    },
  ],
  scripts: [
    // {
    //   src: "//gc.zgo.at/count.js",
    //   async: true,
    //   "data-goatcounter": "https://etomica.goatcounter.com/count",
    // },

    // <script defer data-domain="etomica.org" src="https://plausible.io/js/plausible.js"></script>
    {
      src: "https://plausible.io/js/plausible.js",
      defer: true,
      "data-domain": "etomica.org"
    }
  ],
  themeConfig: {
    prism: {
      theme: require('./src/darcula'),
    },
    navbar: {
      title: 'Etomica',
      logo: {
        alt: 'Etomica Logo',
        src: 'img/logo_small.png',
        height: '56px'
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          to: 'modules/',
          activeBasePath: 'modules',
          label: 'Modules',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Apps',
          items: [
            {
              href: 'pathname:///apps/LJ_EOS/',
              label: 'LJ_EOS',
            },
            { href: 'pathname:///apps/virial/',
              label: 'Virial Coefficients',
            },
            { href: 'pathname:///apps/simulation/',
              label: 'Simulation',
            }
          ]
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
      copyright: `<small><i>Etomica is dedicated to the memory of Bryan Mihalick.</i> <br> Copyright © ${new Date().getFullYear()} Etomica Group. Built with Docusaurus.</small>`,
    },
    hideableSidebar: true,
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/etomica/etomica-site/edit/master/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // editUrl:
          //   'https://github.com/etomica/etomica-site/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    '@docusaurus/plugin-ideal-image',

    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'modules',
        path: 'modules',
        routeBasePath: 'modules',
        sidebarPath: require.resolve('./sidebarsModules.js'),
        remarkPlugins: [remarkMath, remarkFootnotes],
        rehypePlugins: [rehypeKatex],
        editUrl: 'https://github.com/etomica/etomica-site/edit/master/',
      }
    ],

  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexPages: true,
        docsRouteBasePath: ["/docs", "/modules"],
        docsDir: ["docs", "modules"]

      }
    ]
  ]

  // webpack: {
  //   jsLoader: (isServer) => ({
  //     loader: require.resolve('esbuild-loader'),
  //     options: {
  //       loader: 'tsx',
  //       format: isServer ? 'cjs' : undefined,
  //       target: isServer ? 'node12' : 'es2017',
  //     },
  //   }),
  // },
};
