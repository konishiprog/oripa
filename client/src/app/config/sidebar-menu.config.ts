export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const SIDEBAR_MENU: MenuSection[] = [
  {
    title: 'sidebar.main',
    items: [
      { label: 'sidebar.dashboard', icon: 'assets/icons/dashboard.svg', route: '/adminPanel/dashboard' },
      { label: 'sidebar.user-management', icon: 'assets/icons/user-management.svg' },
    ],
  },
  {
    title: 'sidebar.logs',
    items: [
      { label: 'sidebar.purchase-log', icon: 'assets/icons/purchase-log.svg' },
      { label: 'sidebar.point-history', icon: 'assets/icons/point-history.svg' },
    ],
  },
];
