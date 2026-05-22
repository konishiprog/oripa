import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoinChargePageComponent } from './coinChargePage.component';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from '../../service/coin-exchange-rate.service';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('CoinChargePageComponent', () => {
  let component: CoinChargePageComponent;
  let fixture: ComponentFixture<CoinChargePageComponent>;
  let mockRateService: any;
  let mockUserService: any;
  let mockRouter: any;
  let mockTranslateService: any;

  const mockRates: CoinExchangeRate[] = [
    {
      id: 'rate-1',
      point: 100,
      price: 100,
      specialPoint: 0,
    },
    {
      id: 'rate-2',
      point: 500,
      price: 450,
      specialPoint: 50,
    },
    {
      id: 'rate-3',
      point: 1000,
      price: 800,
      specialPoint: 200,
    },
  ];

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRateService = {
      getAllRates: jest.fn().mockResolvedValue(mockRates),
    };

    mockUserService = {
      getUserId: jest.fn().mockReturnValue('user-123'),
      charge: jest.fn().mockResolvedValue({
        userId: 'user-123',
        previousCoin: 100,
        newCoin: 600,
        addedPoint: 500,
        previousSpecialPoint: 0,
        newSpecialPoint: 50,
        addedSpecialPoint: 50,
      }),
      saveCoin: jest.fn(),
      saveSpecialPoint: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key: string, params?: any) => {
        if (key === 'coin-charge.success-charge') {
          return `チャージに成功しました。追加ポイント: ${params?.addedPoint}, 新しいコイン: ${params?.newCoin}`;
        }
        if (key === 'common.unit.yen') {
          return '¥';
        }
        if (key === 'common.unit.point') {
          return 'P';
        }
        if (key === 'coin-exchange-rate.special-point') {
          return 'スペシャルP';
        }
        return 'translated text';
      }),
    };

    await TestBed.configureTestingModule({
      declarations: [CoinChargePageComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: CoinExchangeRateService, useValue: mockRateService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
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

  it('should call loadChargeOptions on ngOnInit', async () => {
    jest.spyOn(component, 'loadChargeOptions');
    component.ngOnInit();
    expect(component.loadChargeOptions).toHaveBeenCalled();
  });

  it('should load charge options on init', async () => {
    await component.loadChargeOptions();

    expect(mockRateService.getAllRates).toHaveBeenCalled();
    expect(component.chargeOptions.length).toBe(3);
    expect(component.chargeOptions[0].label).toBeTruthy();
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
    expect(selected?.point).toBe(100);
  });

  it('should return undefined for selectedOption when no option is selected', () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      label: `¥${rate.price}:${rate.point}P`,
      price: rate.price,
      point: rate.point,
      specialPoint: rate.specialPoint,
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

  it('should not charge if no option is selected', async () => {
    component.selectedOptionId = '';
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await component.onCharge();

    expect(alertSpy).toHaveBeenCalledWith(
      mockTranslateService.instant('coin-charge.error-no-option'),
    );
    expect(mockUserService.charge).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should not charge if user is not logged in', async () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      label: `¥${rate.price}:${rate.point}P`,
      price: rate.price,
      point: rate.point,
      specialPoint: rate.specialPoint,
    }));
    component.selectedOptionId = 'rate-1';

    mockUserService.getUserId.mockReturnValueOnce(null);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await component.onCharge();

    expect(alertSpy).toHaveBeenCalledWith(
      mockTranslateService.instant('common.error-not-logged-in'),
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(mockUserService.charge).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should charge successfully and navigate to userGachaPage', async () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      label: `¥${rate.price}:${rate.point}P`,
      price: rate.price,
      point: rate.point,
      specialPoint: rate.specialPoint,
    }));
    component.selectedOptionId = 'rate-2';

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await component.onCharge();

    expect(mockUserService.charge).toHaveBeenCalledWith('rate-2', 'user-123');
    expect(mockUserService.saveCoin).toHaveBeenCalledWith(600);
    expect(mockUserService.saveSpecialPoint).toHaveBeenCalledWith(50);
    expect(alertSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);

    alertSpy.mockRestore();
  });

  it('should handle charge error', async () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      label: `¥${rate.price}:${rate.point}P`,
      price: rate.price,
      point: rate.point,
      specialPoint: rate.specialPoint,
    }));
    component.selectedOptionId = 'rate-1';

    mockUserService.charge.mockRejectedValueOnce(new Error('Charge API Error'));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await component.onCharge();

    expect(alertSpy).toHaveBeenCalledWith(
      mockTranslateService.instant('coin-charge.error-charge'),
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should mark for check after successful charge', async () => {
    component.chargeOptions = mockRates.map((rate) => ({
      id: rate.id,
      label: `¥${rate.price}:${rate.point}P`,
      price: rate.price,
      point: rate.point,
      specialPoint: rate.specialPoint,
    }));
    component.selectedOptionId = 'rate-1';

    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const cdrSpy = jest.spyOn(component['cdr'], 'markForCheck');

    await component.onCharge();

    expect(cdrSpy).toHaveBeenCalled();
  });

  it('should navigate to userGachaPage on goBack', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should format charge label correctly with special point', async () => {
    await component.loadChargeOptions();

    const rateWithSpecialPoint = component.chargeOptions[1];
    expect(rateWithSpecialPoint.label).toContain('¥450');
    expect(rateWithSpecialPoint.label).toContain('500');
    expect(rateWithSpecialPoint.label).toContain('50');
  });

  it('should format charge label correctly without special point', async () => {
    await component.loadChargeOptions();

    const rateWithoutSpecialPoint = component.chargeOptions[0];
    expect(rateWithoutSpecialPoint.label).toContain('¥100');
    expect(rateWithoutSpecialPoint.label).toContain('100');
    expect(rateWithoutSpecialPoint.label).not.toContain('(+');
  });
});
