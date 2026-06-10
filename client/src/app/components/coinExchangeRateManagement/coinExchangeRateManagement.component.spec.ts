import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoinExchangeRateManagementComponent } from './coinExchangeRateManagement.component';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from '../../service/coin-exchange-rate.service';
import { of } from 'rxjs';

describe('CoinExchangeRateManagementComponent', () => {
  let component: CoinExchangeRateManagementComponent;
  let fixture: ComponentFixture<CoinExchangeRateManagementComponent>;
  let mockRateService: any;
  let mockRouter: any;
  let mockDialog: any;

  const mockRates: CoinExchangeRate[] = [
    { id: '1', coin: 100, price: 100, ticket: 0 },
    { id: '2', coin: 200, price: 200, ticket: 50 },
    { id: '3', coin: 300, price: 300, ticket: 100 },
  ];

  beforeEach(async () => {
    let dialogClosedData: any = null;

    mockRateService = {
      getAllRates: () => Promise.resolve([...mockRates]),
      deleteRate: () => Promise.resolve(),
    };

    mockRouter = {
      navigate: () => Promise.resolve(true),
    };

    mockDialog = {
      open: () => ({
        afterClosed: () => of(dialogClosedData),
      }),
      setDialogResult: (data: any) => {
        dialogClosedData = data;
      },
    };

    await TestBed.configureTestingModule({
      declarations: [CoinExchangeRateManagementComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: CoinExchangeRateService, useValue: mockRateService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: TranslateService, useValue: { instant: () => 'text' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoinExchangeRateManagementComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty rates and not loading', () => {
      expect(component.rates).toEqual([]);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Load Rates', () => {
    it('should load rates successfully', async () => {
      await component.loadRates();

      expect(component.rates.length).toBe(3);
      expect(component.rates[0].id).toBe('1');
      expect(component.isLoading).toBe(false);
    });

    it('should set isLoading during load', async () => {
      const loadPromise = component.loadRates();
      expect(component.isLoading).toBe(true);

      await loadPromise;
      expect(component.isLoading).toBe(false);
    });

    it('should handle load error gracefully', async () => {
      mockRateService.getAllRates = () => Promise.reject(new Error('Failed'));

      await component.loadRates();

      expect(component.rates).toEqual([]);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Create Dialog', () => {
    beforeEach(() => {
      component.rates = [...mockRates];
    });

    it('should open create dialog', () => {
      let openCalled = false;
      mockDialog.open = () => {
        openCalled = true;
        return { afterClosed: () => of(null) };
      };

      component.openCreateDialog();

      expect(openCalled).toBe(true);
    });

    it('should add new rate when dialog returns create result', (done) => {
      const newRate: CoinExchangeRate = {
        id: '4',
        coin: 400,
        price: 400,
        ticket: 150,
      };

      mockDialog.open = () => ({
        afterClosed: () => of({ mode: 'create', data: newRate }),
      });

      component.openCreateDialog();

      setTimeout(() => {
        expect(component.rates.length).toBe(4);
        expect(component.rates[3].id).toBe('4');
        done();
      }, 10);
    });
  });

  describe('Edit Dialog', () => {
    beforeEach(() => {
      component.rates = [...mockRates];
    });

    it('should open edit dialog', () => {
      let openCalled = false;
      mockDialog.open = () => {
        openCalled = true;
        return { afterClosed: () => of(null) };
      };

      component.openEditDialog(mockRates[0]);

      expect(openCalled).toBe(true);
    });

    it('should update rate when dialog returns edit result', (done) => {
      const updatedRate: CoinExchangeRate = {
        id: '1',
        coin: 100,
        price: 150,
        ticket: 50,
      };

      mockDialog.open = () => ({
        afterClosed: () => of({ mode: 'edit', data: updatedRate }),
      });

      component.openEditDialog(mockRates[0]);

      setTimeout(() => {
        expect(component.rates[0].price).toBe(150);
        expect(component.rates[0].ticket).toBe(50);
        done();
      }, 10);
    });
  });

  describe('Delete Rate', () => {
    beforeEach(() => {
      component.rates = [...mockRates];
    });

    it('should request confirmation before deleting', async () => {
      let confirmCalled = false;
      const originalConfirm = window.confirm;
      (window as any).confirm = () => {
        confirmCalled = true;
        return true;
      };

      await component.deleteRate(mockRates[0]);

      expect(confirmCalled).toBe(true);
      (window as any).confirm = originalConfirm;
    });

    it('should not delete if user cancels confirmation', async () => {
      const originalConfirm = window.confirm;
      (window as any).confirm = () => false;

      const initialLength = component.rates.length;
      await component.deleteRate(mockRates[0]);

      expect(component.rates.length).toBe(initialLength);
      (window as any).confirm = originalConfirm;
    });

    it('should delete rate after confirmation', async () => {
      const originalConfirm = window.confirm;
      (window as any).confirm = () => true;

      await component.deleteRate(mockRates[0]);

      expect(component.rates.length).toBe(2);
      expect(component.rates.some((r) => r.id === '1')).toBe(false);
      (window as any).confirm = originalConfirm;
    });

    it('should call service deleteRate with correct ID', async () => {
      const originalConfirm = window.confirm;
      (window as any).confirm = () => true;

      let deleteCalledWith = '';
      mockRateService.deleteRate = (id: string) => {
        deleteCalledWith = id;
        return Promise.resolve();
      };

      await component.deleteRate(mockRates[0]);

      expect(deleteCalledWith).toBe('1');
      (window as any).confirm = originalConfirm;
    });

    it('should handle delete error gracefully', async () => {
      const originalConfirm = window.confirm;
      (window as any).confirm = () => true;
      mockRateService.deleteRate = () =>
        Promise.reject(new Error('Delete failed'));

      const initialLength = component.rates.length;
      await component.deleteRate(mockRates[0]);

      expect(component.rates.length).toBe(initialLength);
      (window as any).confirm = originalConfirm;
    });
  });

  describe('Navigation', () => {
    it('should navigate to admin panel on goBack', () => {
      let navigateCalledWith: any = null;
      mockRouter.navigate = (path: string[]) => {
        navigateCalledWith = path;
        return Promise.resolve(true);
      };

      component.goBack();

      expect(navigateCalledWith).toEqual(['/adminPanel']);
    });
  });
});
