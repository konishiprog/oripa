import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GachaBoxComponent } from './gachaBox.component';
import { GachaDrawService } from '../../common/gacha-draw.service';
import { UserService } from '../../service/user.service';

describe('GachaBoxComponent', () => {
  let component: GachaBoxComponent;
  let fixture: ComponentFixture<GachaBoxComponent>;
  let mockTranslateService: any;
  let mockUserService: any;
  let mockGachaDrawService: any;
  let mockRouter: any;
  let mockDialog: any;

  const baseGacha = {
    id: 'test-gacha-id',
    name: 'Test Gacha',
    headerImage: '',
    consumptionType: 'COIN',
    cost: 500,
    oncePerUser: false,
    alreadyDrawn: false,
    remainingCount: 5,
    publishEnd: null,
  };

  beforeEach(async () => {
    mockTranslateService = {
      instant: jest.fn((key: string) => {
        if (key === 'common.unit.coin') return 'P';
        if (key === 'common.unit.ticket') return 'T';
        return '';
      }),
    };

    mockUserService = {
      isLoggedIn: jest.fn().mockReturnValue(true),
    };

    mockGachaDrawService = {
      draw: jest.fn().mockResolvedValue({ remainingCount: 4, dialogRef: null }),
      resolveDrawErrorMessage: jest.fn().mockReturnValue('エラー'),
    };

    mockRouter = { navigate: jest.fn() };

    mockDialog = { open: jest.fn().mockReturnValue({ afterClosed: () => ({ subscribe: jest.fn() }) }) };

    await TestBed.configureTestingModule({
      declarations: [GachaBoxComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: UserService, useValue: mockUserService },
        { provide: GachaDrawService, useValue: mockGachaDrawService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GachaBoxComponent);
    component = fixture.componentInstance;
    component.gacha = { ...baseGacha };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formatPrice should format with P suffix and commas', () => {
    expect(component.formatPrice(12345)).toBe('12,345P');
  });

  it('formatPrice should use ticket unit when consumptionType is TICKET', () => {
    component.gacha = { ...baseGacha, consumptionType: 'TICKET' };
    expect(component.formatPrice(100)).toBe('100T');
  });

  it('isLoggedIn should return value from userService', () => {
    mockUserService.isLoggedIn.mockReturnValue(true);
    expect(component.isLoggedIn).toBe(true);

    mockUserService.isLoggedIn.mockReturnValue(false);
    expect(component.isLoggedIn).toBe(false);
  });

  it('usesTicket should return true when consumptionType is TICKET', () => {
    component.gacha = { ...baseGacha, consumptionType: 'TICKET' };
    expect(component.usesTicket).toBe(true);
  });

  it('usesTicket should return false when consumptionType is COIN', () => {
    expect(component.usesTicket).toBe(false);
  });

  it('isExpired should return false when publishEnd is null', () => {
    expect(component.isExpired).toBe(false);
  });

  it('isExpired should return true when publishEnd is in the past', () => {
    component.gacha = { ...baseGacha, publishEnd: '2020-01-01T00:00:00Z' };
    expect(component.isExpired).toBe(true);
  });

  it('isExpired should return false when publishEnd is in the future', () => {
    component.gacha = { ...baseGacha, publishEnd: '2099-01-01T00:00:00Z' };
    expect(component.isExpired).toBe(false);
  });

  it('isSoldOut should return true when remainingCount is 0', () => {
    component.gacha = { ...baseGacha, remainingCount: 0 };
    expect(component.isSoldOut).toBe(true);
  });

  it('isSoldOut should return false when remainingCount is > 0', () => {
    expect(component.isSoldOut).toBe(false);
  });

  it('isUnavailable should return true when sold out', () => {
    component.gacha = { ...baseGacha, remainingCount: 0 };
    expect(component.isUnavailable).toBe(true);
  });

  it('isUnavailable should return true when expired', () => {
    component.gacha = { ...baseGacha, publishEnd: '2020-01-01T00:00:00Z' };
    expect(component.isUnavailable).toBe(true);
  });

  it('isUnavailable should return false when available', () => {
    expect(component.isUnavailable).toBe(false);
  });

  it('navigateToDetail should navigate to gacha detail page', () => {
    component.navigateToDetail();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/gacha', 'test-gacha-id']);
  });

  it('openWinnersDialog should open dialog with gacha data', () => {
    component.openWinnersDialog();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('draw should call gachaDrawService.draw and update remainingCount', async () => {
    await component.draw(1);
    expect(mockGachaDrawService.draw).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-gacha-id' }),
      1,
    );
    expect(component.gacha.remainingCount).toBe(4);
    expect(component.isDrawing).toBe(false);
  });

  it('draw should set alreadyDrawn when oncePerUser is true', async () => {
    component.gacha = { ...baseGacha, oncePerUser: true };
    await component.draw(1);
    expect(component.gacha.alreadyDrawn).toBe(true);
  });

  it('draw should not start when already drawing', async () => {
    component.isDrawing = true;
    await component.draw(1);
    expect(mockGachaDrawService.draw).not.toHaveBeenCalled();
  });

  it('draw should handle error and show alert', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGachaDrawService.draw.mockRejectedValue(new Error('draw error'));

    await component.draw(1);

    expect(alertSpy).toHaveBeenCalledWith('エラー');
    expect(component.isDrawing).toBe(false);
    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
