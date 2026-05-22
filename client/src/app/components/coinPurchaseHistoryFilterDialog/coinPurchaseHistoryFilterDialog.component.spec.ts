import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CoinPurchaseHistoryFilterDialogComponent } from './coinPurchaseHistoryFilterDialog.component';

describe('CoinPurchaseHistoryFilterDialogComponent', () => {
  let component: CoinPurchaseHistoryFilterDialogComponent;
  let fixture: ComponentFixture<CoinPurchaseHistoryFilterDialogComponent>;
  let dialogRef: jest.Mocked<
    MatDialogRef<CoinPurchaseHistoryFilterDialogComponent>
  >;

  beforeEach(async () => {
    dialogRef = {
      close: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [CoinPurchaseHistoryFilterDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            criteria: {
              minPrice: 100,
              maxPrice: 1000,
              minPoint: 50,
              maxPoint: 500,
              startDate: '2026-01-01',
              endDate: '2026-12-31',
              yearFilter: '2026',
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoinPurchaseHistoryFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided criteria from dialog data', () => {
    expect(component.criteria.minPrice).toBe(100);
    expect(component.criteria.maxPrice).toBe(1000);
    expect(component.criteria.minPoint).toBe(50);
    expect(component.criteria.maxPoint).toBe(500);
    expect(component.criteria.startDate).toBe('2026-01-01');
    expect(component.criteria.endDate).toBe('2026-12-31');
    expect(component.criteria.yearFilter).toBe('2026');
  });

  it('should initialize with default values when no data is provided', async () => {
    const defaultDialogRef = {
      close: jest.fn(),
    } as any;

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      declarations: [CoinPurchaseHistoryFilterDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: defaultDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const newFixture = TestBed.createComponent(
      CoinPurchaseHistoryFilterDialogComponent,
    );
    const newComponent = newFixture.componentInstance;

    expect(newComponent.criteria.minPrice).toBeNull();
    expect(newComponent.criteria.maxPrice).toBeNull();
    expect(newComponent.criteria.minPoint).toBeNull();
    expect(newComponent.criteria.maxPoint).toBeNull();
    expect(newComponent.criteria.startDate).toBe('');
    expect(newComponent.criteria.endDate).toBe('');
    expect(newComponent.criteria.yearFilter).toBe('');
  });

  it('should generate year filter options for last 3 years', () => {
    const currentYear = new Date().getFullYear();
    const expectedYears = [currentYear - 2, currentYear - 1, currentYear];

    expect(component.yearFilterOptions).toEqual(expectedYears);
  });

  it('should reset criteria to default values', () => {
    component.criteria.minPrice = 500;
    component.criteria.maxPrice = 5000;
    component.criteria.minPoint = 100;
    component.criteria.maxPoint = 1000;
    component.criteria.startDate = '2025-01-01';
    component.criteria.endDate = '2025-12-31';
    component.criteria.yearFilter = '2025';

    component.onReset();

    expect(component.criteria.minPrice).toBeNull();
    expect(component.criteria.maxPrice).toBeNull();
    expect(component.criteria.minPoint).toBeNull();
    expect(component.criteria.maxPoint).toBeNull();
    expect(component.criteria.startDate).toBe('');
    expect(component.criteria.endDate).toBe('');
    expect(component.criteria.yearFilter).toBe('');
  });

  it('should close dialog with normalized criteria on apply', () => {
    component.criteria.minPrice = 100;
    component.criteria.maxPrice = null;
    component.criteria.minPoint = 50;
    component.criteria.maxPoint = null;
    component.criteria.startDate = '2026-01-01';
    component.criteria.endDate = '';
    component.criteria.yearFilter = '2026';

    component.onApply();

    expect(dialogRef.close).toHaveBeenCalledWith({
      minPrice: 100,
      maxPrice: null,
      minPoint: 50,
      maxPoint: null,
      startDate: '2026-01-01',
      endDate: '',
      yearFilter: '2026',
    });
  });

  it('should close dialog without value on close', () => {
    component.onClose();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should convert empty string to empty string in toNullableString', () => {
    const result = (component as any).toNullableString('');
    expect(result).toBe('');
  });

  it('should convert whitespace to empty string in toNullableString', () => {
    const result = (component as any).toNullableString('   ');
    expect(result).toBe('');
  });

  it('should trim and return non-empty string in toNullableString', () => {
    const result = (component as any).toNullableString('  2026  ');
    expect(result).toBe('2026');
  });

  it('should return null for null in toNullableNumber', () => {
    const result = (component as any).toNullableNumber(null);
    expect(result).toBeNull();
  });

  it('should return null for undefined in toNullableNumber', () => {
    const result = (component as any).toNullableNumber(undefined);
    expect(result).toBeNull();
  });

  it('should return number for valid number in toNullableNumber', () => {
    const result = (component as any).toNullableNumber(500);
    expect(result).toBe(500);
  });

  it('should return null for NaN in toNullableNumber', () => {
    const result = (component as any).toNullableNumber(NaN);
    expect(result).toBeNull();
  });

  it('should return null for Infinity in toNullableNumber', () => {
    const result = (component as any).toNullableNumber(Infinity);
    expect(result).toBeNull();
  });

  it('should normalize mixed criteria correctly', () => {
    component.criteria = {
      minPrice: 100,
      maxPrice: null,
      minPoint: 50,
      maxPoint: null,
      startDate: '2026-01-01',
      endDate: '',
      yearFilter: '2026',
    };

    component.onApply();

    const expectedNormalized = {
      minPrice: 100,
      maxPrice: null,
      minPoint: 50,
      maxPoint: null,
      startDate: '2026-01-01',
      endDate: '',
      yearFilter: '2026',
    };

    expect(dialogRef.close).toHaveBeenCalledWith(expectedNormalized);
  });
});
