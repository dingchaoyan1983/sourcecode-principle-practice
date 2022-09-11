import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { transformFromAstSync } from '@babel/core';

import { ModuleInfo } from './types';

const getModuleInfo = (file: string): ModuleInfo =>  {

  // 读取文件
  const body = fs.readFileSync(path.resolve(__dirname, file), "utf-8");
  // 转化AST语法树
  const ast = parse(body, {
    sourceType: "module", //表示我们要解析的是ES模块
  });

  // 依赖收集
  const deps: Record<string, string> = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file);
      const abspath = "./" + path.join(dirname, node.source.value);
      deps[node.source.value] = abspath;
    },
  });

  // ES6转成ES5
  const result = transformFromAstSync(ast, undefined, {
    presets: ["@babel/preset-env"],
  });
  if (result) {
    const code = result.code;
    const moduleInfo = { file, deps, code };
    return moduleInfo;
  } else {
    return {} as ModuleInfo;
  }
}

export default getModuleInfo;