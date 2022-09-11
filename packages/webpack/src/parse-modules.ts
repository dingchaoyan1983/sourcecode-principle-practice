import getModuleInfo from './get-module-info';
import { ModuleInfo } from './types';
/**
 * 模块解析
 * @param {*} file 
 * @returns 
 */
export default function parseModules(file: string) {
  const entry = getModuleInfo(file);
  const temp = [entry];
  const depsGraph: Record<string, any> = {};

  getDeps(temp, entry);

  temp.forEach((moduleInfo) => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code,
    };
  });
  return depsGraph;
}

/**
 * 获取依赖
 * @param {*} temp 
 * @param {*} param1 
 */
function getDeps(temp: ModuleInfo[], { deps }: { deps: ModuleInfo['deps'] }) {
  Object.keys(deps).forEach((key) => {
    const child = getModuleInfo(deps[key]);
    temp.push(child);
    getDeps(temp, child);
  });
}