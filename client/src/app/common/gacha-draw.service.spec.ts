import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GachaDrawService, DrawableGacha } from './gacha-draw.service';
import { GachaService } from '../service/gacha.service';
import { UserService } from '../service/user.service';

describe('GachaDrawService', () => {
  let service: GachaDrawService;
  let mockGachaService: any;
  let mockUserService: any;
  let mockTranslateService: any;
  let mockDialog: any;

  const baseGacha: DrawableGacha = {
    id: 'gacha-1',
    cost: 100,
    oncePerUser: false,
    alreadyDrawn: false,
    remainingCount: 10,
    consumptionType: 'COIN',
  };

  beforeEach(() => {
    mockGachaService = {
      drawGacha: jest.fn().mockResolvedValue({
        drawnCards: [{ id: 'card-1', name: 'Card1', effectUrl: null, exchangeType: 'BOTH', exchangeCoins: 100 }],
        remainingCount: 9,
        userCoin: 900,
        userTicket: undefined,
      }),
    };

    mockUserService = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getUserId: jest.fn().mockReturnValue('user-1'),
      getCoin: jest.fn().mockReturnValue(1000),
      getTicket: jest.fn().mockReturnValue(10),
      saveCoin: jest.fn(),
      saveTicket: jest.fn(),
    };

    mockTranslateService = {
      instant: jest.fn((key: string) => key),
    };

    mockDialog = {
      open: jest.fn().mockReturnValue({}),
    };

    TestBed.configureTestingModule({
      providers: [
        GachaDrawService,
        { provide: GachaService, useValue: mockGachaService },
        { provide: UserService, useValue: mockUserService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    service = TestBed.inject(GachaDrawService);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('usesTicket', () => {
    it('should return true when consumptionType is TICKET', () => {
      expect(service.usesTicket({ ...baseGacha, consumptionType: 'TICKET' })).toBe(true);
    });

    it('should return false when consumptionType is COIN', () => {
      expect(service.usesTicket(baseGacha)).toBe(false);
    });
  });

  describe('effectiveDrawCount', () => {
    it('should return Math.min(requested, remainingCount) for normal gacha', () => {
      expect(service.effectiveDrawCount(baseGacha, 5)).toBe(5);
      expect(service.effectiveDrawCount(baseGacha, 20)).toBe(10);
    });

    it('should return 1 for oncePerUser gacha not yet drawn', () => {
      const gacha = { ...baseGacha, oncePerUser: true, alreadyDrawn: false };
      expect(service.effectiveDrawCount(gacha, 10)).toBe(1);
    });

    it('should return 0 for oncePerUser gacha already drawn', () => {
      const gacha = { ...baseGacha, oncePerUser: true, alreadyDrawn: true };
      expect(service.effectiveDrawCount(gacha, 1)).toBe(0);
    });
  });

  describe('draw', () => {
    it('should return null when not logged in', async () => {
      mockUserService.isLoggedIn.mockReturnValue(false);
      const result = await service.draw(baseGacha, 1);
      expect(result).toBeNull();
    });

    it('should return null when userId is null', async () => {
      mockUserService.getUserId.mockReturnValue(null);
      const result = await service.draw(baseGacha, 1);
      expect(result).toBeNull();
    });

    it('should alert and return null when oncePerUser and alreadyDrawn', async () => {
      const gacha = { ...baseGacha, oncePerUser: true, alreadyDrawn: true };
      const result = await service.draw(gacha, 1);
      expect(result).toBeNull();
      expect(window.alert).toHaveBeenCalled();
    });

    it('should return null when effectiveDrawCount is 0', async () => {
      const gacha = { ...baseGacha, remainingCount: 0 };
      const result = await service.draw(gacha, 1);
      expect(result).toBeNull();
    });

    it('should return null when insufficient coin', async () => {
      mockUserService.getCoin.mockReturnValue(50);
      const result = await service.draw(baseGacha, 1);
      expect(result).toBeNull();
      expect(window.alert).toHaveBeenCalled();
    });

    it('should return null when insufficient ticket', async () => {
      mockUserService.getTicket.mockReturnValue(0);
      const gacha = { ...baseGacha, consumptionType: 'TICKET', cost: 100 };
      const result = await service.draw(gacha, 1);
      expect(result).toBeNull();
    });

    it('should call drawGacha and return outcome on success', async () => {
      const result = await service.draw(baseGacha, 1);
      expect(mockGachaService.drawGacha).toHaveBeenCalledWith('gacha-1', 'user-1', 1);
      expect(result?.remainingCount).toBe(9);
    });

    it('should save coin when userCoin is returned', async () => {
      await service.draw(baseGacha, 1);
      expect(mockUserService.saveCoin).toHaveBeenCalledWith(900);
    });

    it('should save ticket when userTicket is returned', async () => {
      mockGachaService.drawGacha.mockResolvedValue({
        drawnCards: [],
        remainingCount: 9,
        userTicket: 5,
      });
      await service.draw(baseGacha, 1);
      expect(mockUserService.saveTicket).toHaveBeenCalledWith(5);
    });

    it('should open dialog when drawnCards are returned', async () => {
      await service.draw(baseGacha, 1);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should not open dialog when drawnCards is empty', async () => {
      mockGachaService.drawGacha.mockResolvedValue({ drawnCards: [], remainingCount: 9 });
      await service.draw(baseGacha, 1);
      expect(mockDialog.open).not.toHaveBeenCalled();
    });
  });

  describe('resolveDrawErrorMessage', () => {
    it('should return translated key when error message is in ERROR_KEY_MAP', () => {
      const error = { error: { error: 'GACHA_NOT_FOUND' } };
      const result = service.resolveDrawErrorMessage(error);
      expect(typeof result).toBe('string');
    });

    it('should return fallback message with server message when not in map', () => {
      const error = { message: 'Unknown error' };
      service.resolveDrawErrorMessage(error);
      expect(mockTranslateService.instant).toHaveBeenCalled();
    });

    it('should return fallback message when error is empty', () => {
      service.resolveDrawErrorMessage({});
      expect(mockTranslateService.instant).toHaveBeenCalled();
    });
  });
});
