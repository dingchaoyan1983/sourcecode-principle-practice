### 该项目的目的是弄清楚webpack的build的过程和原理

首先我们通过一个制作一个打包文件的原型。
假设有两个js模块，这里我们先假设这两个模块是符合commomjs标准的es5模块。
语法和模块化规范转换的事我们先放一放，后面说。
我们的目的是将这两个模块打包为一个能在浏览器端运行的文件，这个文件其实叫bundle.js。
比如
``` js
// index.js
var add = require('add.js').default
console.log(add(1 , 2))

// add.js
exports.default = function(a,b) {return a + b}

```
假设在浏览器中直接执行这个程序肯定会有问题 最主要的问题是浏览器中没有exports对象与require方法所以一定会报错。

我们需要通过模拟exports对象和require方法

### 模拟exports对象

首先我们知道如果在nodejs打包的时候我们会使用fs.readfileSync()来读取js文件。这样的话js文件会是一个字符串。而如果需要将字符串中的代码运行会有两个方法分别是new Function与Eval。
在这里面我们选用执行效率较高的eval。

``` js
exports = {}
eval('exports.default = function(a,b) {return a + b}') // node文件读取后的代码字符串
exports.default(1,3)
```

上面这段代码的运行结果可以将模块中的方法绑定在exports对象中。由于子模块中会声明变量，为了不污染全局我们使用一个自运行函数来封装一下。

``` js
var exports = {}
(function (exports, code) {
	eval(code)
})(exports, 'exports.default = function(a,b){return a + b}')
```

### 模拟require函数

require函数的功能比较简单，就是根据提供的file名称加载对应的模块。

首先我们先看看如果只有一个固定模块应该怎么写
``` js
function require(file) {
	var exports = {};
	(function (exports, code) {
		eval(code)
	})(exports, 'exports.default = function(a,b){return a + b}')
  return exports
}
var add = require('add.js').default
console.log(add(1 , 2))
```

完成了固定模块，我们下面只需要稍加改动，将所有模块的文件名和代码字符串整理为一张key-value表就可以根据传入的文件名加载不同的模块了。
``` js
(function (list) {
  function require(file) {
    var exports = {};
    (function (exports, code) {
      eval(code);
    })(exports, list[file]);
    return exports;
  }
  require("index.js");
})({
  "index.js": `
    var add = require('add.js').default
    console.log(add(1 , 2))
        `,
  "add.js": `exports.default = function(a,b){return a + b}`,
});

```

当然要说明的一点是真正webpack生成的bundle.js文件中还需要增加模块间的依赖关系。

叫做依赖图（Dependency Graph）

类似下面的情况。

```typescript
{
  "./src/index.js": {
    "deps": { "./add.js": "./src/add.js" },
    "code": "....."
  },
  "./src/add.js": {
    "deps": {},
    "code": "......"
  }
}

```

另外，由于大多数前端程序都习惯使用es6语法所以还需要预先将es6语法转换为es5语法。

总结一下思路，webpack打包可以分为以下三个步骤：
1. 分析依赖

2. ES6转ES5

3. 替换exports和require


#### 1. 分析模块

```typescript
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
```

#### 2. 收集依赖
```typescript
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
```

#### 3. 生成bundle文件
```typescript
import parseModules from './parse-modules';

export default function bundle(file: string) {
  const depsGraph = JSON.stringify(parseModules(file));
  return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`;
}
```
