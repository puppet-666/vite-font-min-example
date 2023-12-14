import Fontmin from 'fontmin';
import { getCodes } from './utils';
import { pluginOptionType } from './type';

const BASE_SRC = './public/font/*.*';
const BASE_DIST = './dist/font';


const fileScanAndFontmin = async (pluginOption: pluginOptionType) => {
  return new Promise(async (resolve, reject) => {
    const text = await getCodes(pluginOption);
    new Fontmin()
      .src(pluginOption && pluginOption.fontSrc ? pluginOption.fontSrc : BASE_SRC)
      .use(Fontmin.glyph({ text }))
      .use(Fontmin.ttf2woff())
      .use(Fontmin.ttf2woff2())
      .dest(pluginOption && pluginOption.fontDest ? pluginOption.fontDest : BASE_DIST)
      .run((err: any, files: any) => {
        if (err) {
          reject(err);
        }
        resolve(files);
      });
  });
};

export default function ViteFontmin(pluginOption: pluginOptionType) {
  return {
    name: 'vite:fontmin',
    apply: 'build',
    enforce: 'post',
    closeBundle: async () => {
      await fileScanAndFontmin(pluginOption);
    },
  };
}