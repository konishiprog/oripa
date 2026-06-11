import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ChargeResultPageComponent } from './chargeResultPage.component';
import { ApiConfigService } from '../../service/api-config.service';
import { UserService } from '../../service/user.service';

describe('ChargeResultPageComponent', () => {
  let component: ChargeResultPageComponent;
  let fixture: ComponentFixture<ChargeResultPageComponent>;
  let httpMock: HttpTestingController;
  let mockRouter: any;
  let mockSanitizer: any;
  let mockTranslateService: any;
  let mockApiConfigService: any;
  let mockUserService: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    };

    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html) => html),
    };

    mockTranslateService = {
      instant: jest.fn((key: string) => {
        const translations: { [key: string]: string } = {
          'charge-result.error-no-secret': 'No payment secret found',
          'charge-result.error-stripe-load': 'Failed to load Stripe',
          'charge-result.error-payment-intent': 'Payment intent not found',
        };
        return translations[key] || key;
      }),
    };

    mockApiConfigService = {
      domain: 'http://localhost:3000',
      headers: { 'Content-Type': 'application/json' },
    };

    mockUserService = {
      getUserId: jest.fn().mockReturnValue('user-123'),
      getUserById: jest.fn().mockResolvedValue({
        coin: 500,
        ticket: 50,
      }),
      saveCoin: jest.fn(),
      saveTicket: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [ChargeResultPageComponent],
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ApiConfigService, useValue: mockApiConfigService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargeResultPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const pendingRequests = httpMock.match(() => true);
    pendingRequests.forEach((req) => req.flush(null));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.status).toBe('pending');
    expect(component.amount).toBe(0);
    expect(component.coinAmount).toBe(0);
    expect(component.ticketAmount).toBe(0);
    expect(component.errorMessage).toBe('');
  });

  it('should have empty icons object', () => {
    expect(component.icons).toEqual({});
  });

  it('should navigate to coin charge page', () => {
    component.goToCoinChargePage();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/coinChargePage']);
  });

  it('should navigate to user gacha page with delay', async () => {
    const start = Date.now();
    await component.goToUserGachaPage();
    const elapsed = Date.now() - start;

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
    expect(elapsed).toBeGreaterThanOrEqual(500);
  });

  it('should load icons on component init', async () => {
    component.ngOnInit();
    await fixture.whenStable();

    const iconRequests = httpMock.match((req) => req.url.includes('.svg'));
    expect(iconRequests.length).toBe(3);

    iconRequests.forEach((req) => {
      req.flush('<svg></svg>');
    });

    await fixture.whenStable();
    expect(Object.keys(component.icons).length).toBe(3);
  });

  it('should handle icon loading errors gracefully', async () => {
    component.ngOnInit();
    await fixture.whenStable();

    const iconRequests = httpMock.match((req) => req.url.includes('.svg'));

    iconRequests[0].error(new ErrorEvent('Network error'));
    iconRequests[1].flush('<svg></svg>');
    iconRequests[2].flush('<svg></svg>');

    await fixture.whenStable();
    expect(Object.keys(component.icons).length).toBe(2);
  });

  it('should check payment status on init', async () => {
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });

    component.ngOnInit();
    const iconRequests = httpMock.match((req) => req.url.includes('.svg'));
    iconRequests.forEach((req) => req.flush('<svg></svg>'));

    await fixture.whenStable();

    expect(component.status).toBe('failed');
    expect(component.errorMessage).toBe('No payment secret found');
    expect(component.isLoading).toBe(false);
  });

  it('should call userService methods when payment succeeded', async () => {
    mockUserService.getUserById.mockResolvedValue({
      coin: 600,
      ticket: 60,
    });

    component.ngOnInit();
    const iconRequests = httpMock.match((req) => req.url.includes('.svg'));
    iconRequests.forEach((req) => req.flush('<svg></svg>'));

    await fixture.whenStable();
  });
});
