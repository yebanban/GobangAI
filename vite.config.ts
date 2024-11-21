import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify, presetIcons } from 'unocss'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unocss({
      shortcuts: [
        ['btn', 'px-3 py-1 rounded-md bg-teal-600 text-white cursor-pointer hover:bg-teal-700 text-base border-none'],
        ['btn-logo', ' opacity-75 cursor-pointer outline-none hover:text-teal-600/100 text-xl border-0']
      ],
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          warn: true,
        }),
      ],
    }),
  ],
})
