import { resolve } from 'path';
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'vite-plugin-md'
import Pages from 'vite-plugin-pages'
import fs from 'fs-extra'
import matter from 'gray-matter'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@/', replacement: `${resolve(__dirname, 'src')}/` },
      { find: '~/', replacement: `${resolve(__dirname, 'src')}/` }
    ],
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
    ],
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
      template: {
        compilerOptions: {
          isCustomElement: tag => {
            return tag === 'BlogPost';
          }
        },
      },
    }),
    Pages({
      extensions: ['vue', 'md'],
      pagesDir: 'pages',
      dirs: [
        { dir: 'pages', baseRoute: '' },
      ],
      extendRoute(route) {
        const path = resolve(__dirname, route.component.slice(1))
        const md = fs.readFileSync(path, 'utf-8')
        const { data } = matter(md)
        route.meta = Object.assign(route.meta || {}, { frontmatter: data })
        return route
      }
    }),
    Markdown({
      wrapperComponent: 'blog-post',
      wrapperClasses: 'prose',
      headEnabled: true,
      markdownItOptions: {
        quotes: '""\'\'',
      },
    }),
    Components({
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/head',
      ]
    }),
  ],
})
