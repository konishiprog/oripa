export interface BreadcrumbItem {
  route: string;
  i18nKey: string;
}

export const BREADCRUMB_MAP: BreadcrumbItem[] = [
  { route: '/adminPanel/dashboard', i18nKey: 'sidebar.dashboard' },
  {
    route: '/adminPanel/adminAccountList',
    i18nKey: 'admin-account.page.title',
  },
  { route: '/adminPanel/createAdmin', i18nKey: 'admin-create.title' },
];
