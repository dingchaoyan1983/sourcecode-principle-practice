import getModuleInfo from '../get-module-info';
import parseModules from '../parse-modules';
import bundle from '../bundle';

type Exports = { default: (...args: any[]) => any };
const defaultFnc = () => {}

describe('@dingchao/webpack', () => {
  it('模拟exports对象', () => {
    const exports: Exports = { default: defaultFnc };
    eval('exports.default = (a,b) => a + b');

    console.log(exports.default(1, 3))
 });

 it('模拟exports对象并且不污染全局环境', () => {
  const exports: Exports = { default: defaultFnc };
  (function(exports, code){
         eval(code);
     })(exports, 'exports.default = (a,b) => a + b')
     
     console.log(exports.default(1, 3))
  });

  it('模拟require函数', () => {
     const codes: Record<string, string> = {
         'index.js': 'exports.default = (a,b) => a + b',
     };
     const require = (file: string) => {
         const exports: Exports = { default: defaultFnc };
         (function(exports, code){
             eval(code);
         })(exports, codes[file]);
         return exports;
     }
     console.log(require('index.js').default(1, 3));
  });

  it('模拟require的依赖关系', () => {
     (function(list: Record<string, string>) {
         const require = (file: string) => {
             const exports: Exports = { default: defaultFnc };
             (function(exports, code){
                 eval(code);
             })(exports, list[file]);
             return exports;
         }
         require('index.js');
     })({
         "index.js": `
             var add = require('add.js').default
             console.log(add(1 , 2))
         `,
         "add.js": `exports.default = function(a,b){return a + b}`,
     })
  });

  it('使用函数getModuleInfo获取一个模块的信息, 信息包括模块的依赖和转换成es5之后的代码', () => {
    const module = getModuleInfo('./tests/fixtures/index.js')

    console.log(module);
  });

  it('使用函数parseModules解析依赖关系', () => {
    const modules = parseModules('./tests/fixtures/index.js')

    console.log(modules);
  });

  it('使用bundle对代码进行bundle', () => {
    const bundler = bundle('./tests/fixtures/index.js')

    console.log(bundler);

    // 执行budler
    eval(bundler);
  });
})