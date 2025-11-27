// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config

export default defineConfig({
  site: 'https://ravikisha.github.io',
  base: '/relaxicons/',
  integrations: [
    starlight({
      title: "Relaxicons",
      description:
        "CLI to fetch & transform Iconify icons into framework components.",
      head: [
        { tag: 'meta', attrs: { name: 'author', content: 'Relaxicons' } },
      ],
      components: {
        Layout: './src/layouts/MainLayout.astro',
      },
      logo: {
        src: "./logo.png",
        replacesTitle: true,
        alt: "Relaxicons logo",
      },
      favicon: "./logo.png",
      customCss: ["./src/styles/theme.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Ravikisha/relaxicons",
        },
      ],
      sidebar: [
        {
          label: "Overview",
          items: [
            { label: "Getting Started", link: "/getting-started/" },
            { label: "CLI Reference", link: "/cli/" },
            { label: "Icon Explorer", link: "/icon-explorer/" },
            { label: "FAQ", link: "/faq/" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Configuration", link: "/configuration/" },
            { label: "Framework Adapters", link: "/framework-adapters/" },
            { label: "Transform Pipeline", link: "/transform/" },
          ],
        },
      ],
  }),
  sitemap(),
  ],
});
