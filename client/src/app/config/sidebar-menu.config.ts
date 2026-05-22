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
      {
        label: 'sidebar.dashboard',
        icon: 'assets/icons/dashboard.svg',
        route: '/adminPanel/dashboard',
      },
      {
        label: 'sidebar.user-management',
        icon: 'assets/icons/user-management.svg',
        route: '/adminPanel/userManagement',
      },
      {
        label: 'sidebar.shipping-info',
        icon: 'assets/icons/truck.svg',
        route: '/adminPanel/shippingInfo',
      },
    ],
  },
  {
    title: 'sidebar.settings',
    items: [
      {
        label: 'sidebar.coin-exchange-rate',
        icon: 'assets/icons/coin.svg',
        route: '/adminPanel/coinExchangeRate',
      },
    ],
  },
  {
    title: 'sidebar.logs',
    items: [
      {
        label: 'sidebar.purchase-log',
        icon: 'assets/icons/purchase-log.svg',
        route: '/adminPanel/coinPurchaseHistory',
      },
    ],
  },
];
