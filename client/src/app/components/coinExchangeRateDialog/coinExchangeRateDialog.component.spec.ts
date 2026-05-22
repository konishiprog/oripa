import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CoinExchangeRateDialogComponent } from './coinExchangeRateDialog.component';
import { CoinExchangeRateService } from '../../service/coin-exchange-rate.service';

describe('CoinExchangeRateDialogComponent', () => {
  let component: CoinExchangeRateDialogComponent;
  let fixture: ComponentFixture<CoinExchangeRateDialogComponent>;
  let mockDialogRef: any;
  let mockRateService: any;

  beforeEach(async () => {
    let closeCalled = false;
    mockDialogRef = {
      close: () => {
        closeCalled = true;
      },
      wasCloseCalled: () => closeCalled,
      resetCloseCalled: () => {
        closeCalled = false;
      },
    };

    mockRateService = {
      createRate: () =>
        Promise.resolve({
          id: 'test',
          point: 100,
          price: 100,
          specialPoint: 0,
        }),
      updateRate: () =>
        Promise.resolve({
          id: 'test',
          point: 100,
          price: 100,
          specialPoint: 0,
        }),
    };

    await TestBed.configureTestingModule({
      declarations: [CoinExchangeRateDialogComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: CoinExchangeRateService, useValue: mockRateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoinExchangeRateDialogComponent);
    component = fixture.componentInstance;

    const translateService = TestBed.inject(TranslateService);
    translateService.use('ja');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.point).toBe(1000);
    expect(component.price).toBe(1000);
    expect(component.specialPoint).toBe(0);
    expect(component.isLoading).toBe(false);
  });

  it('should have isEditMode false in create mode', () => {
    expect(component.isEditMode).toBe(false);
  });

  it('should show error for invalid point (0)', async () => {
    component.point = 0;
    component.price = 100;
    component.specialPoint = 0;

    await component.onSubmit();

    expect(component.errorMessage).not.toBe('');
  });

  it('should show error for negative point', async () => {
    component.point = -10;
    component.price = 100;
    component.specialPoint = 0;

    await component.onSubmit();

    expect(component.errorMessage).not.toBe('');
  });

  it('should show error for invalid price (0)', async () => {
    component.point = 100;
    component.price = 0;
    component.specialPoint = 0;

    await component.onSubmit();

    expect(component.errorMessage).not.toBe('');
  });

  it('should show error for negative price', async () => {
    component.point = 100;
    component.price = -50;
    component.specialPoint = 0;

    await component.onSubmit();

    expect(component.errorMessage).not.toBe('');
  });

  it('should show error for negative specialPoint', async () => {
    component.point = 100;
    component.price = 100;
    component.specialPoint = -5;

    await component.onSubmit();

    expect(component.errorMessage).not.toBe('');
  });

  it('should accept valid values', async () => {
    component.point = 100;
    component.price = 100;
    component.specialPoint = 0;

    mockDialogRef.resetCloseCalled();
    await component.onSubmit();

    expect(mockDialogRef.wasCloseCalled()).toBe(true);
  });

  it('should close dialog on cancel', () => {
    mockDialogRef.resetCloseCalled();
    component.onClose();

    expect(mockDialogRef.wasCloseCalled()).toBe(true);
  });

  it('should validate integer values only', async () => {
    component.point = 100.5 as any;
    component.price = 100;
    component.specialPoint = 0;

    await component.onSubmit();

    expect(component.errorMessage).not.toBe('');
  });
});
