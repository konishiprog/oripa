import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoinPurchaseHistoryPageComponent } from './coinPurchaseHistoryPage.component';
import {
  CoinPurchaseHistoryService,
  CoinPurchaseHistoryItem,
} from '../../service/coin-purchase-history.service';

describe('CoinPurchaseHistoryPageComponent', () => {
  let component: CoinPurchaseHistoryPageComponent;
  let fixture: ComponentFixture<CoinPurchaseHistoryPageComponent>;
  let historyService: any;
  let translateService: TranslateService;

  const mockHistories: CoinPurchaseHistoryItem[] = [
    {
      id: '1',
      userId: 'user-1',
      'User.name': 'テストユーザー1',
      price: 500,
      point: 100,
      specialPoint: 50,
      status: '完了',
      createdAt: new Date('2026-05-20T10:30:00'),
    },
    {
      id: '2',
      userId: 'user-2',
      'User.name': 'テストユーザー2',
      price: 1000,
      point: 200,
      specialPoint: 100,
      status: '完了',
      createdAt: new Date('2026-05-21T15:45:00'),
    },
  ];

  beforeEach(async () => {
    const getAllHistoriesMock = jest.fn().mockResolvedValue(mockHistories);

    await TestBed.configureTestingModule({
      declarations: [CoinPurchaseHistoryPageComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        {
          provide: CoinPurchaseHistoryService,
          useValue: { getAllHistories: getAllHistoriesMock },
        },
      ],
    }).compileComponents();

    historyService = TestBed.inject(CoinPurchaseHistoryService) as any;
    translateService = TestBed.inject(TranslateService);

    fixture = TestBed.createComponent(CoinPurchaseHistoryPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.histories).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should load histories on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(historyService.getAllHistories).toHaveBeenCalled();
    expect(component.histories).toEqual(mockHistories);
  });

  it('should set isLoading to true during load', (done) => {
    historyService.getAllHistories.mockImplementation(() => {
      expect(component.isLoading).toBe(true);
      done();
      return Promise.resolve(mockHistories);
    });
    component.loadHistories();
  });

  it('should set isLoading to false after load completes', async () => {
    await component.loadHistories();
    expect(component.isLoading).toBe(false);
  });

  it('should handle error when loading histories fails', async () => {
    const errorMessage = 'Failed to load';
    historyService.getAllHistories.mockRejectedValue(new Error(errorMessage));
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(window, 'alert').mockImplementation();
    jest
      .spyOn(translateService, 'instant')
      .mockReturnValue('エラーが発生しました');

    await component.loadHistories();

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should have correct table headers', () => {
    expect(component.tableHeaders).toBeDefined();
    expect(component.tableHeaders.length).toBe(6);
    expect(component.tableHeaders[0].key).toBe('user-id');
    expect(component.tableHeaders[1].key).toBe('price');
    expect(component.tableHeaders[2].key).toBe('point');
    expect(component.tableHeaders[3].key).toBe('special-point');
    expect(component.tableHeaders[4].key).toBe('status');
    expect(component.tableHeaders[5].key).toBe('date');
  });

  it('should have correct table cells', () => {
    expect(component.tableCells).toBeDefined();
    expect(component.tableCells.length).toBe(6);
    expect(component.tableCells[0].methodName).toBe('getUserName');
    expect(component.tableCells[1].methodName).toBe('getPrice');
    expect(component.tableCells[2].methodName).toBe('getPoint');
    expect(component.tableCells[3].methodName).toBe('getSpecialPoint');
    expect(component.tableCells[4].type).toBe('text');
    expect(component.tableCells[5].methodName).toBe('getDate');
  });

  it('should get text cell value', () => {
    const cell = { key: 'status', type: 'text' as const, dataKey: 'status' };
    const result = component.getTextCellValue(cell, mockHistories[0]);
    expect(result).toBe('完了');
  });

  it('should return empty string for text cell with no dataKey', () => {
    const cell = { key: 'test', type: 'text' as const };
    const result = component.getTextCellValue(cell, mockHistories[0]);
    expect(result).toBe('');
  });

  it('should get method cell value for getUserName', () => {
    const cell = {
      key: 'user-id',
      type: 'method' as const,
      methodName: 'getUserName',
    };
    const result = component.getMethodCellValue(cell, mockHistories[0]);
    expect(result).toBe('テストユーザー1');
  });

  it('should get method cell value for getPrice', () => {
    const cell = {
      key: 'price',
      type: 'method' as const,
      methodName: 'getPrice',
    };
    const result = component.getMethodCellValue(cell, mockHistories[0]);
    expect(result).toContain('¥');
    expect(result).toContain('500');
  });

  it('should get method cell value for getPoint', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('P');
    const cell = {
      key: 'point',
      type: 'method' as const,
      methodName: 'getPoint',
    };
    const result = component.getMethodCellValue(cell, mockHistories[0]);
    expect(result).toContain('100');
    expect(result).toContain('P');
  });

  it('should get method cell value for getSpecialPoint', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('P');
    const cell = {
      key: 'special-point',
      type: 'method' as const,
      methodName: 'getSpecialPoint',
    };
    const result = component.getMethodCellValue(cell, mockHistories[0]);
    expect(result).toContain('+');
    expect(result).toContain('50');
    expect(result).toContain('P');
  });

  it('should get method cell value for getDate', () => {
    const cell = {
      key: 'date',
      type: 'method' as const,
      methodName: 'getDate',
    };
    const result = component.getMethodCellValue(cell, mockHistories[0]);
    expect(result).toContain('2026');
    expect(result).toContain('05');
    expect(result).toContain('20');
  });

  it('should format price with yen symbol and number format', () => {
    const cell = {
      key: 'price',
      type: 'method' as const,
      methodName: 'getPrice',
    };
    const result = component.getMethodCellValue(cell, mockHistories[1]);
    expect(result).toContain('¥');
    expect(result).toContain('1,000');
  });

  it('should return user name from User.name field', () => {
    const cell = {
      key: 'user-id',
      type: 'method' as const,
      methodName: 'getUserName',
    };
    const result = component.getMethodCellValue(cell, mockHistories[0]);
    expect(result).toBe('テストユーザー1');
  });

  it('should fallback to userId when User.name is not available', () => {
    const historyWithoutName = { ...mockHistories[0], 'User.name': undefined };
    const cell = {
      key: 'user-id',
      type: 'method' as const,
      methodName: 'getUserName',
    };
    const result = component.getMethodCellValue(
      cell,
      historyWithoutName as any,
    );
    expect(result).toBe('user-1');
  });

  it('should return empty string for unknown method', () => {
    const cell = {
      key: 'unknown',
      type: 'method' as const,
      methodName: 'unknownMethod',
    };
    const result = component.getMethodCellValue(cell, mockHistories[0]);
    expect(result).toBe('');
  });
});
