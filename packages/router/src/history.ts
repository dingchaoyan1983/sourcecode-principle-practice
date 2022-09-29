import { BaseRouter } from './base';
import type { RouteList } from './types'; 

export class HistoryRouter extends BaseRouter {
  constructor(list: RouteList) {
    super(list);
    this.handler();
    window.addEventListener('popstate', e => {
      this.handler();
    });
  }
  handler() {
    this.render(this.getState());
  }
  getState() {
    const path = window.location.pathname;
    return path ? path : '/';
  }
  push(path: string) {
    //修改path
    history.pushState(null, '', path);
    //然后主动调用render，因为pushState修改的path不会被onpopstate监听到
    this.handler();
  }
  replace(path: string) {
    //修改path
    history.replaceState(null, '', path);
    //然后主动调用render，因为pushState修改的path不会被onpopstate监听到
    this.handler();
  }
  go(n: number) {
    window.history.go(n);
  }
}