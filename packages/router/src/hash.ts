import { BaseRouter } from './base';
import type { RouteList } from './types';

export class HashRouter extends BaseRouter {
  constructor(list: RouteList) {
    super(list);
    this.handler();
    window.addEventListener('hashchange', e => {
      this.handler();
    });
  }
  handler() {
    this.render(this.getState());
  }
  getState() {
    const hash = window.location.hash;
    return hash ? hash.slice(1) : '/';
  }
  getUrl(path: string) {
    const href = window.location.href;
    const i = href.indexOf('#');
    const base = i >= 0 ? href.slice(0, i) : href;
    return `${base}#${path}`;
  }
  push(path: string) {
    // 修改hash会被onhashchange 监听到
    window.location.hash = path;
  }
  replace(path: string) {
    // 修改hash会被onhashchange 监听到
    window.location.replace(this.getUrl(path));
  }
  go(n: number) {
    window.history.go(n);
  }
}