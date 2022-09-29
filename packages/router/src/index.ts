import { HashRouter } from './hash';
import { HistoryRouter } from './history';
import { ROUTELIST } from './routeList';
import type { RouteList, RouteType } from './types';

//路由模式
const MODE = 'hash';

class WebRouter {
  private router: RouteType;
  constructor({ mode = 'hash', routeList }: { mode: string, routeList: RouteList }) {
    this.router = mode === 'hash' ? new HashRouter(routeList) : new HistoryRouter(routeList);
  }
  push(path: string) {
    this.router.push(path);
  }
  replace(path: string) {
    this.router.replace(path);
  }
  go(num: number) {
    this.router.go(num);
  }
}

const webRouter = new WebRouter({
  mode: MODE,
  routeList: ROUTELIST
});

const btnList = document.querySelector('.btn-list')

if (btnList) {
  btnList.addEventListener('click', e => {
    const event = e || window.event;
    //@ts-ignore
    if (event?.target?.tagName === 'LI') {
      //@ts-ignore
      const url = event.target.dataset.url;
      !url.indexOf('/') ? webRouter.push(url) : webRouter.go(url);
    }
  });
}

const replaceBtn = document.querySelector('.replace-btn');

if (replaceBtn) {
  replaceBtn.addEventListener('click', e => {
    webRouter.replace('/');
  });
}
