import { ROUTELIST } from './routeList';
import { HashRouter } from './hash';
import { HistoryRouter } from './history';

export type RouteList = typeof ROUTELIST;
export type RouteType = HashRouter | HistoryRouter