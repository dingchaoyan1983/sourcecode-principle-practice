import { RouteList } from './types';

const ELEMENT = document.querySelector('#page') as HTMLDivElement;

export class BaseRouter {
  private list: RouteList
  constructor(list: RouteList) {
    this.list = list;
  }
  render(state: string) {
    let ele = this.list.find(ele => ele.path === state);
    ele = ele ? ele : this.list.find(ele => ele.path === '*');
    if (ELEMENT && ele) {
      ELEMENT.innerText = ele.component;
    }
  }
}