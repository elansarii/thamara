// Centralized route configuration - single source of truth

export const ROUTES = {
  HOME: '/',
  WELCOME: '/welcome',
  MAP: '/map',
  LOG_PLOT: '/log-plot',
  ASSESSMENT: '/assessment',
  CROP_PLAN: '/crop-plan',
  WATER: '/water',
  RAINREADY: '/rainready',
  EXCHANGE: '/exchange',
  DROPS: '/drops',
} as const;

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: 'map', label: 'Map', icon: 'Map', route: ROUTES.MAP },
  { id: 'guide', label: 'Guide', icon: 'BookOpen', route: ROUTES.CROP_PLAN },
  { id: 'exchange', label: 'Exchange', icon: 'Handshake', route: ROUTES.EXCHANGE },
  { id: 'water', label: 'Water', icon: 'Droplets', route: ROUTES.WATER },
];

export const FAB_ROUTE = ROUTES.LOG_PLOT;
