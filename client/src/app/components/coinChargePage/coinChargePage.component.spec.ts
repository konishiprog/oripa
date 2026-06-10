import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoinChargePageComponent } from './coinChargePage.component';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from '../../service/coin-exchange-rate.service';
import { UserService } from '../../service/user.service';
import { CoinPurchaseHistoryService } from '../../service/coin-purchase-history.service';
import { ApiConfigService } from '../../service/api-config.service';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CoinChargePageComponent', () => {
  let component: CoinChargePageComponent;
  let fixture: ComponentFixture<CoinChargePageComponent>;
  let mockRateService: any;
  let mockUserService: any;
  let mockChargeService: any;
  let mockRouter: any;
  let mockTranslateService: any;

  const mockRates: CoinExchangeRate[] = [
    {
      id: 'rate-1',
      coin: 100,
      price: 100,
      ticket: 0,
    },
    {
      id: 'rate-2',
      coin: 500,
      price: 450,
      ticket: 50,
    },
    {
      id: 'rate-3',
      coin: 1000,
      price: 800,
      ticket: 200,
    },
  ];

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRateService = {
      getAllRates: jest.fn().mockResolvedValue(mockRates),
    };

    mockUserService = {
      getUserId: jest.fn().mockReturnValue('user-123'),
    };

    mockChargeService = {
      createPaymentIntent: jest.fn().mockResolvedValue({
        clientSecret: 'pi_test_secret',
        chargeHistoryId: 'charge-history-123',
      }),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string) => {
        if (key === 'coin-charge.error-no-option') {
          return 'オプションを選択してください';
        }
        if (key === 'common.error-not-logged-in') {
          return 'ログインしてください';
        }
        if (key === 'coin-charge.error-charge') {
          return 'チャージに失敗しました';
        }
        if (key === 'coin-charge.error-load') {
          return 'オプションの読み込みに失敗しました';
        }
        if (key === 'common.unit.yen') {
          return '¥';
        }
        if (key === 'common.unit.coin') {
          return 'P';
        }
        if (key === 'coin-exchange-rate.ticket') {
          return 'チケット';
        }
        return 'translated text';
      }),
    };

    await TestBed.configureTestingModule({
      declarations: [CoinChargePageComponent],
      imports: [
        FormsModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: CoinExchangeRateService, useValue: mockRateService },
        { provide: UserService, useValue: mockUserService },
        { provide: CoinPurchaseHistoryService, useValue: mockChargeService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
        {
          provide: ApiConfigService,
          useValue: { domain: 'http://localhost', headers: {} },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoinChargePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty chargeOptions', () => {
    expect(component.chargeOptions).toEqual([]);
    expect(component.selectedOptionId).toBe('');
    expect(component.isLoading).toBe(false);
  });

  it('should load charge options on ngOnInit', async () => {
    await component.loadChargeOptions();

    expect(mockRateService.getAllRates).toHaveBeenCalled();
    expect(component.chargeOptions.length).toBe(3);
    expect(component.chargeOptions[0].id).toBe('rate-1');
    expect(component.isLoading).toBe(false);
  });

  it('should automatically select the first option on load', async () => {
    await component.loadChargeOptions();

    expect(component.selectedOptionId).toBe('rate-1');
  });

  it('should return selectedOption getter correctly', async () => {
    await component.loadChargeOptions();

    const selected = component.selectedOption;
    expect(selected).toBeDefined();
    expect(selected?.id).toBe('rate-1');
    expect(selected?.coin).toBe(100);
  });

  it('should return undefined for selectedOption when no option is selected', () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      price: rate.price,
      coin: rate.coin,
      ticket: rate.ticket,
    }));
    component.selectedOptionId = '';

    const selected = component.selectedOption;
    expect(selected).toBeUndefined();
  });

  it('should handle error when loading charge options', async () => {
    mockRateService.getAllRates.mockRejectedValueOnce(new Error('API Error'));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await component.loadChargeOptions();

    expect(component.isLoading).toBe(false);
    expect(alertSpy).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should not create payment intent if no option is selected', async () => {
    component.selectedOptionId = '';

    await component.onCharge();

    expect(mockChargeService.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('should not create payment intent if user is not logged in', async () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      price: rate.price,
      coin: rate.coin,
      ticket: rate.ticket,
    }));
    component.selectedOptionId = 'rate-1';

    mockUserService.getUserId.mockReturnValueOnce(null);

    await component.onCharge();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(mockChargeService.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('should create payment intent and show payment form on charge', async () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      price: rate.price,
      coin: rate.coin,
      ticket: rate.ticket,
    }));
    component.selectedOptionId = 'rate-2';
    component['stripe'] = {
      elements: jest.fn().mockResolvedValue({}),
    } as any;

    await component.onCharge();
    await fixture.whenStable();

    expect(mockChargeService.createPaymentIntent).toHaveBeenCalledWith(
      'user-123',
      450,
      500,
      50,
    );
    expect(component.showPaymentForm).toBe(true);
  });

  it('should handle payment intent creation error', async () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      price: rate.price,
      coin: rate.coin,
      ticket: rate.ticket,
    }));
    component.selectedOptionId = 'rate-1';
    component['stripe'] = {} as any;

    mockChargeService.createPaymentIntent.mockRejectedValueOnce(
      new Error('Payment Intent Error'),
    );

    await component.onCharge();

    expect(component.paymentMessage).toBe(
      mockTranslateService.instant('coin-charge.error-charge'),
    );
  });

  it('should navigate to userGachaPage on goBack', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should load charge options with correct properties', async () => {
    await component.loadChargeOptions();

    const rateWithTicket = component.chargeOptions[1];
    expect(rateWithTicket.price).toBe(450);
    expect(rateWithTicket.coin).toBe(500);
    expect(rateWithTicket.ticket).toBe(50);
  });

  it('should load charge options without ticket', async () => {
    await component.loadChargeOptions();

    const rateWithoutTicket = component.chargeOptions[0];
    expect(rateWithoutTicket.price).toBe(100);
    expect(rateWithoutTicket.coin).toBe(100);
    expect(rateWithoutTicket.ticket).toBe(0);
  });

  it('should cancel payment form', () => {
    component.showPaymentForm = true;
    component.paymentMessage = 'test';
    component['paymentElement'] = { unmount: jest.fn() };

    component.onCancelPayment();

    expect(component.showPaymentForm).toBe(false);
    expect(component.paymentMessage).toBe('');
    expect(component['paymentElement']).toBeNull();
  });
});
