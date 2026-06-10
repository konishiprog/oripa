import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, of, BehaviorSubject } from 'rxjs';
import { AppHeaderComponent } from './appHeader.component';
import { UserService } from '../../service/user.service';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let mockUserService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockTranslateService: any;
  let mockSanitizer: any;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const coinSubject = new BehaviorSubject<number | null>(null);
    const ticketSubject = new BehaviorSubject<number | null>(null);

    mockUserService = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      getCoin: jest.fn(() => coinSubject.value),
      getTicket: jest.fn(() => ticketSubject.value),
      coin$$: coinSubject.asObservable(),
      ticket$$: ticketSubject.asObservable(),
      saveCoin: jest.fn((coin: number) => coinSubject.next(coin)),
      saveTicket: jest.fn((sp: number) => ticketSubject.next(sp)),
      clearUserId: jest.fn(),
      clearCoin: jest.fn(() => coinSubject.next(null)),
      clearTicket: jest.fn(() => ticketSubject.next(null)),
      _coinSubject: coinSubject,
      _ticketSubject: ticketSubject,
    };
    const routerEventsSubject = new Subject();
    mockRouter = {
      navigate: jest.fn(),
      url: '/userGachaPage',
      events: routerEventsSubject.asObservable(),
    };
    mockDialog = {
      open: jest.fn(),
    };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => key),
    };
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((value: string) => value),
    };

    await TestBed.configureTestingModule({
      declarations: [AppHeaderComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: DomSanitizer, useValue: mockSanitizer },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with logged in state', () => {
    mockUserService.isLoggedIn.mockReturnValue(true);
    component.ngOnInit();

    const menuReq = httpMock.expectOne('assets/icons/menu.svg');
    menuReq.flush('<svg></svg>');
    const closeReq = httpMock.expectOne('assets/icons/close.svg');
    closeReq.flush('<svg></svg>');
    const myPageReq = httpMock.expectOne('assets/icons/user-profile.svg');
    myPageReq.flush('<svg></svg>');
    const coinReq = httpMock.expectOne('assets/icons/coin-gold.svg');
    coinReq.flush('<svg></svg>');

    expect(component.isLoggedIn).toBe(true);
  });

  it('should navigate to my page', () => {
    component.goToMyPage();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/myPage']);
  });

  it('should logout and navigate to gacha page', () => {
    component.logout();
    expect(mockUserService.clearUserId).toHaveBeenCalled();
    expect(mockUserService.clearCoin).toHaveBeenCalled();
    expect(mockUserService.clearTicket).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should navigate to coin charge page when charge button is clicked', () => {
    component.goToCharge();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/coinCharge']);
  });

  it('should load coin and ticket on init', () => {
    mockUserService._coinSubject.next(1000);
    mockUserService._ticketSubject.next(100);
    component.ngOnInit();

    const menuReq = httpMock.expectOne('assets/icons/menu.svg');
    menuReq.flush('<svg></svg>');
    const closeReq = httpMock.expectOne('assets/icons/close.svg');
    closeReq.flush('<svg></svg>');
    const myPageReq = httpMock.expectOne('assets/icons/user-profile.svg');
    myPageReq.flush('<svg></svg>');
    const coinReq = httpMock.expectOne('assets/icons/coin-gold.svg');
    coinReq.flush('<svg></svg>');

    expect(component.userCoin).toBe(1000);
    expect(component.userTicket).toBe(100);
  });

  it('should load icons on init', () => {
    component.ngOnInit();

    const menuReq = httpMock.expectOne('assets/icons/menu.svg');
    expect(menuReq.request.method).toBe('GET');
    menuReq.flush('<svg>menu</svg>');

    const closeReq = httpMock.expectOne('assets/icons/close.svg');
    expect(closeReq.request.method).toBe('GET');
    closeReq.flush('<svg>close</svg>');

    const myPageReq = httpMock.expectOne('assets/icons/user-profile.svg');
    expect(myPageReq.request.method).toBe('GET');
    myPageReq.flush('<svg>my-page</svg>');

    const coinReq = httpMock.expectOne('assets/icons/coin-gold.svg');
    expect(coinReq.request.method).toBe('GET');
    coinReq.flush('<svg>coin</svg>');

    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(4);
  });

  it('should toggle mobile menu', () => {
    component.isMobileMenuOpen = false;
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(true);
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(false);
  });

  it('should close mobile menu', () => {
    component.isMobileMenuOpen = true;
    component.closeMobileMenu();
    expect(component.isMobileMenuOpen).toBe(false);
  });

  it('should check if admin page on init', () => {
    mockRouter.url = '/adminPanel/dashboard';
    component.ngOnInit();

    const menuReq = httpMock.expectOne('assets/icons/menu.svg');
    menuReq.flush('<svg></svg>');
    const closeReq = httpMock.expectOne('assets/icons/close.svg');
    closeReq.flush('<svg></svg>');
    const myPageReq = httpMock.expectOne('assets/icons/user-profile.svg');
    myPageReq.flush('<svg></svg>');
    const coinReq = httpMock.expectOne('assets/icons/coin-gold.svg');
    coinReq.flush('<svg></svg>');

    expect(component.isAdminPage).toBe(true);
  });

  it('should open login dialog', () => {
    const mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(null)),
    };
    mockDialog.open.mockReturnValue(mockDialogRef);
    component.isMobileMenuOpen = true;

    component.openLoginDialog();

    expect(component.isMobileMenuOpen).toBe(false);
    expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
      width: '420px',
    });
  });

  it('should navigate to signup page', () => {
    component.goToSignup();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userSignup']);
  });

  it('should navigate to admin page', () => {
    component.goToAdminPage();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to gacha page', () => {
    component.goToGachaPage();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
