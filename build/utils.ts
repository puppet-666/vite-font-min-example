import fs from 'fs';
import FastGlob from 'fast-glob';
import path from 'path';
import { pluginOptionType } from './type';

const FILE_EXT = ['ts', 'js', 'tsx', 'jsx', 'vue', 'scss', 'sass', 'html', 'json'];

const BASE_URL = 'src/**/*';

const staticReg = /\$t\((['"`])(.*?)\1\)/g;

/**
 * @description: 扫描所有指定文件并返回所有出现过的字符
 * @param {*} options
 */
export const getCodes = async (options: pluginOptionType) => {
  const codeSet = new Set<string>();

  if (!options) {
    options = { include: BASE_URL };
  }
  if (!options.include) {
    options.include = BASE_URL;
  }

  const getFileCodeSet: (newFilePath: string) => Promise<Set<string>> = newFilePath => {
    return new Promise(resolve => {
      const str = fs.readFileSync(newFilePath, 'utf-8');
      // 精确匹配
      if(options.exact) {
        const code = checkT(str);
        const newSet = new Set(code.split(''));
        resolve(newSet);
      }else {
        const newSet = new Set(str.split(''));
        resolve(newSet);
      }

    });
  };

  const setCodeSet = async () => {
    const files = await fileScanner(options!);
    const setters = files.map(
      filePath =>
        new Promise(async resolve => {
          const newSet = await getFileCodeSet(filePath);
          newSet.forEach(c => {
            if (!codeSet.has(c)) {
              codeSet.add(c);
            }
          });
          resolve(true);
        })
    );

    await Promise.all(setters);
  };

  await setCodeSet();
  console.log(codeSet,'---code');
  return Array(...codeSet).join('');
};

const toStringArray = (str: string | string[]): string[] => {
  if (typeof str === 'string') {
    return [str];
  }
  return str;
};

const toFixExt = (fileUrls: string | string[], fileExt: string) => {
  return toStringArray(fileUrls).map(i => {
    const infos = i.split(path.sep);
    const endInfo = infos[infos.length - 1];
    if (endInfo.includes('.')) {
      return i;
    }
    if (endInfo === '**') {
      return i;
    }
    return `${i}.${fileExt}`;
  });
};

const getFileExt = (fileExt?: string | string[]): string => {
  if (!fileExt) {
    return `{${FILE_EXT.join(',')}}`;
  }
  if (fileExt instanceof Array && fileExt.length === 0) {
    return '*';
  }
  return `{${toStringArray(fileExt).join(',')}}`;
};

const getFileExtByExact = (fileExt?: string | string[]): string[] => {
  if (!fileExt) {
    return FILE_EXT;
  }

  if (fileExt instanceof Array && fileExt.length === 0) {
    return ['*'];
  }

  return toStringArray(fileExt);
};

/**
 * @description: get all request files
 * @param {*} options
 */
export async function fileScanner(options: pluginOptionType) {
  const fileExt = getFileExt(options.fileExt);
  const includes = toFixExt(options.include!, fileExt);
  const excludes = options.exclude ? toFixExt(options.exclude, fileExt) : [];
  return await FastGlob(includes, { ignore: excludes, dot: true });
}

function transT(code: string) {
  const replacedCode = code.replace(staticReg, (match, quote, content) => {
    // 对 $t() 内的字符串进行处理
    return `'${content}'`;
  });
  return replacedCode;
}

function checkT(code: string) {
  let replacedCode = '';
  let match = staticReg.exec(code);
  while (match !== null) {
    // 提取 $t() 函数的参数内容
    const content = match[2];
    // 如果参数内容不为空，则添加到替换后的字符串中
    if (content) {
      replacedCode += content;
    }

    match = staticReg.exec(code);
  }

  return replacedCode;
}

export function compilerT(pluginOption: pluginOptionType, code: string, id: string) {
  const fileExt = getFileExtByExact(pluginOption.fileExt);

  if(pluginOption.exact) {
    const isAll = fileExt.length === 1 && fileExt[0] === '*';
    if (isAll || fileExt.some(ext => id.endsWith(ext))) {
      return {
        code: transT(code),
      };
    }
    return {
      code,
    };
  }

  return {
    code,
  }
}