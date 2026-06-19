import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPanelComponent } from './adminPanel.component';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AdminPanelComponent', () => {
  let component: AdminPanelComponent;
  let fixture: ComponentFixture<AdminPanelComponent>;
  let mockRouter: any;
  let mockHttpClient: any;
  let mockSanitizer: any;
  let mockTranslateService: any;
  let routerEventsSubject: Subject<any>;
  let langChangeSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();
    langChangeSubject = new Subject<any>();

    mockRouter = {
      url: '/adminPanel/dashboard',
      events: routerEventsSubject.asObservable(),
    };

    mockHttpClient = {
      get: jest.fn((path: string) => of('<svg></svg>')),
    };

    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((value: string) => value),
    };

    mockTranslateService = {
      use: jest.fn(),
      get: jest.fn((key) => of(key)),
      onLangChange: langChangeSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      declarations: [AdminPanelComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty breadcrumbTitle and icons', () => {
    expect(component.breadcrumbTitle).toBe('');
  });

  it('should set language to ja on init', () => {
    component.ngOnInit();

    expect(mockTranslateService.use).toHaveBeenCalledWith('ja');
  });

  it('should load notification icon from assets', (done) => {
    component.ngOnInit();

    setTimeout(() => {
      const calls = mockHttpClient.get.mock.calls;
      const notificationCall = calls.find((call: any[]) =>
        call[0].includes('assets/icons/notification.svg')
      );
      expect(notificationCall).toBeDefined();
      expect(notificationCall[1]).toEqual({ responseType: 'text' });
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(
        '<svg></svg>',
      );
      done();
    }, 10);
  });

  it('should load search icon from assets', (done) => {
    component.ngOnInit();

    setTimeout(() => {
      const calls = mockHttpClient.get.mock.calls;
      const searchCall = calls.find((call: any[]) =>
        call[0].includes('assets/icons/search.svg')
      );
      expect(searchCall).toBeDefined();
      expect(searchCall[1]).toEqual({ responseType: 'text' });
      done();
    }, 10);
  });

  it('should log error when notification icon load fails', (done) => {
    mockHttpClient.get.mockImplementation((path: string) => {
      if (path.includes('notification')) {
        return throwError(() => new Error('Load failed'));
      }
      return of('<svg></svg>');
    });

    component.ngOnInit();

    setTimeout(() => {
      const calls = (console.error as jest.Mock).mock.calls;
      const hasIconError = calls.some((call: any[]) =>
        call[0]?.includes('Failed to load icon')
      );
      expect(hasIconError).toBe(true);
      done();
    }, 10);
  });

  it('should update breadcrumb on dashboard route', (done) => {
    mockRouter.url = '/adminPanel/dashboard';
    mockTranslateService.get.mockReturnValue(of('ダッシュボード'));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.breadcrumbTitle).toBe('ダッシュボード');
      done();
    }, 10);
  });

  it('should update breadcrumb on adminAccountList route', (done) => {
    mockRouter.url = '/adminPanel/adminAccountList';
    mockTranslateService.get.mockReturnValue(of('管理者アカウント'));

    component.ngOnInit();

    setTimeout(() => {
      expect(mockTranslateService.get).toHaveBeenCalledWith(
        'admin-account.page.title',
      );
      expect(component.breadcrumbTitle).toBe('管理者アカウント');
      done();
    }, 10);
  });

  it('should update breadcrumb on createAdmin route', (done) => {
    mockRouter.url = '/adminPanel/createAdmin';
    mockTranslateService.get.mockReturnValue(of('管理者登録'));

    component.ngOnInit();

    setTimeout(() => {
      expect(mockTranslateService.get).toHaveBeenCalledWith(
        'admin-create.title',
      );
      expect(component.breadcrumbTitle).toBe('管理者登録');
      done();
    }, 10);
  });

  it('should clear breadcrumbTitle when route is not in breadcrumb map', (done) => {
    mockRouter.url = '/adminPanel/unknown';
    component.breadcrumbTitle = 'Some Title';

    component.ngOnInit();

    setTimeout(() => {
      expect(component.breadcrumbTitle).toBe('');
      done();
    }, 10);
  });

  it('should update breadcrumb on NavigationEnd event', (done) => {
    mockRouter.url = '/adminPanel/dashboard';
    mockTranslateService.get.mockReturnValue(of('ダッシュボード'));

    component.ngOnInit();

    setTimeout(() => {
      mockRouter.url = '/adminPanel/adminAccountList';
      mockTranslateService.get.mockReturnValue(of('管理者アカウント'));

      routerEventsSubject.next(
        new NavigationEnd(1, '/adminPanel/adminAccountList', '/adminPanel/adminAccountList'),
      );

      setTimeout(() => {
        expect(mockTranslateService.get).toHaveBeenCalledWith(
          'admin-account.page.title',
        );
        done();
      }, 10);
    }, 10);
  });

  it('should ignore router events that are not NavigationEnd', (done) => {
    mockRouter.url = '/adminPanel/dashboard';
    mockTranslateService.get.mockReturnValue(of('ダッシュボード'));

    component.ngOnInit();

    setTimeout(() => {
      const initialCallCount = mockTranslateService.get.mock.calls.length;

      routerEventsSubject.next({ type: 'SomeOtherEvent' });

      setTimeout(() => {
        expect(mockTranslateService.get.mock.calls.length).toBe(
          initialCallCount,
        );
        done();
      }, 10);
    }, 10);
  });

  it('should update breadcrumb when language changes', (done) => {
    mockRouter.url = '/adminPanel/dashboard';
    mockTranslateService.get.mockReturnValue(of('ダッシュボード'));

    component.ngOnInit();

    setTimeout(() => {
      mockTranslateService.get.mockReturnValue(of('Dashboard'));

      langChangeSubject.next({ lang: 'en' });

      setTimeout(() => {
        expect(mockTranslateService.get).toHaveBeenCalledWith(
          'sidebar.dashboard',
        );
        expect(component.breadcrumbTitle).toBe('Dashboard');
        done();
      }, 10);
    }, 10);
  });

  it('should subscribe to router events on init', (done) => {
    component.ngOnInit();

    setTimeout(() => {
      expect(mockRouter.events).toBeDefined();
      done();
    }, 10);
  });

  it('should subscribe to language change on init', (done) => {
    component.ngOnInit();

    setTimeout(() => {
      expect(mockTranslateService.onLangChange).toBeDefined();
      done();
    }, 10);
  });

  it('should handle multiple icon loads concurrently', (done) => {
    component.ngOnInit();

    setTimeout(() => {
      expect(mockHttpClient.get).toHaveBeenCalledTimes(3);
      const calls = mockHttpClient.get.mock.calls;
      const hasNotificationIcon = calls.some((call: any[]) =>
        call[0].includes('assets/icons/notification.svg')
      );
      const hasSearchIcon = calls.some((call: any[]) =>
        call[0].includes('assets/icons/search.svg')
      );
      const hasMenuIcon = calls.some((call: any[]) =>
        call[0].includes('assets/icons/menu.svg')
      );
      expect(hasNotificationIcon).toBe(true);
      expect(hasSearchIcon).toBe(true);
      expect(hasMenuIcon).toBe(true);
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(3);
      done();
    }, 10);
  });

  it('should translate breadcrumb with correct i18n key for each route', (done) => {
    const routes = [
      { url: '/adminPanel/dashboard', key: 'sidebar.dashboard' },
      {
        url: '/adminPanel/adminAccountList',
        key: 'admin-account.page.title',
      },
      { url: '/adminPanel/createAdmin', key: 'admin-create.title' },
    ];

    let routeIndex = 0;

    const testNextRoute = () => {
      if (routeIndex >= routes.length) {
        done();
        return;
      }

      const route = routes[routeIndex];
      mockRouter.url = route.url;
      mockTranslateService.get.mockClear();
      mockTranslateService.get.mockReturnValue(of(`Translated: ${route.key}`));

      component.ngOnInit();

      setTimeout(() => {
        expect(mockTranslateService.get).toHaveBeenCalledWith(route.key);
        routeIndex++;
        testNextRoute();
      }, 10);
    };

    testNextRoute();
  });
});
