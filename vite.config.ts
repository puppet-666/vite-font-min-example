import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteFontmin from './build/font-min'

// https://vitejs.dev/config/
export default defineConfig({
  build: {

  },
  plugins: [
    vue(),
    ViteFontmin({
      fontSrc: 'fonts/*.*',
      fontDest: 'dist/fonts',
      fileExt: ['vue'],
      include: 'src/**/*',
    }) as any
  ],
})
