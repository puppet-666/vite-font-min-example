import Fontmin from 'fontmin';
import { getCodes, compilerT } from './utils';
import { pluginOptionType } from './type';

const BASE_SRC = './public/font/*.*';
const BASE_DIST = './dist/font';


const fileScanAndFontmin = async (pluginOption: pluginOptionType, text: string) => {
  return new Promise(async (resolve, reject) => {
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
    transform: async (code, id) => {
      return compilerT(pluginOption, code, id)
    },
    closeBundle: async () => {
      const text = await getCodes(pluginOption);
      await fileScanAndFontmin(pluginOption,text);
    },
  };
}