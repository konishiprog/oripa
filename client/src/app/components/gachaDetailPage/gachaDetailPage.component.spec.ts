import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { GachaDetailPageComponent } from './gachaDetailPage.component';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';

describe('GachaDetailPageComponent', () => {
  let component: GachaDetailPageComponent;
  let fixture: ComponentFixture<GachaDetailPageComponent>;
  let mockGachaService: any;
  let mockCardService: any;
  let mockUserService: any;
  let mockTranslateService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockGachaData = {
    id: 'test-gacha-id',
    name: 'Test Gacha',
    headerImage: 'test.jpg',
    consumptionType: 'COIN',
    cost: 2000,
    oncePerUser: false,
    alreadyDrawn: false,
    remainingCount: 100,
    totalCount: 500,
    publishStart: '2026-05-01T00:00:00Z',
    publishEnd: '2026-06-09T23:59:00Z',
    isPublic: true,
    minExchangePoints: 50,
  };

  const mockJackpotCards = [
    {
      id: 'card-1',
      name: 'Jackpot Card 1',
      cardType: 'SSR',
      imageFront: 'card1.jpg',
      exchangePoints: 100,
    },
    {
      id: 'card-2',
      name: 'Jackpot Card 2',
      cardType: 'SSR',
      imageFront: 'card2.jpg',
      exchangePoints: 50,
    },
  ];

  beforeEach(async () => {
    mockGachaService = {
      getGachaById: jest.fn().mockResolvedValue(mockGachaData),
      drawGacha: jest.fn().mockResolvedValue({
        drawnCards: [{ name: 'Test Card', cardType: 'SR' }],
        remainingCount: 99,
        userCoin: 8000,
      }),
    };

    mockCardService = {
      getCardsByGachaId: jest.fn().mockResolvedValue(mockJackpotCards),
    };

    mockUserService = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getUserId: jest.fn().mockReturnValue('test-user-id'),
      getCoin: jest.fn().mockReturnValue(10000),
      getSpecialPoint: jest.fn().mockReturnValue(0),
      saveCoin: jest.fn(),
      saveSpecialPoint: jest.fn(),
    };

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key) => key),
      get: jest.fn((key) => of(key)),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockActivatedRoute = {
      params: of({ id: 'test-gacha-id' }),
    };

    await TestBed.configureTestingModule({
      declarations: [GachaDetailPageComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: CardService, useValue: mockCardService },
        { provide: UserService, useValue: mockUserService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    })
      .overrideComponent(GachaDetailPageComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GachaDetailPageComponent);
    component = fixture.componentInstance;
    component.gachaId = 'test-gacha-id';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load gacha detail on init', async () => {
    await component.loadGachaDetail();
    await fixture.whenStable();

    expect(mockGachaService.getGachaById).toHaveBeenCalledWith('test-gacha-id');
    expect(component.gacha?.name).toBe('Test Gacha');
    expect(component.gacha?.cost).toBe(2000);
    expect(component.gacha?.minExchangePoints).toBe(50);
  });

  it('should load jackpot cards on init', async () => {
    await component.loadJackpotCards();
    await fixture.whenStable();

    expect(mockCardService.getCardsByGachaId).toHaveBeenCalledWith(
      'test-gacha-id',
    );
    expect(component.jackpotCards.length).toBe(2);
    expect(component.jackpotCards[0].name).toBe('Jackpot Card 1');
  });

  it('should format date correctly', () => {
    const dateString = '2026-06-09T00:00:00Z';
    const formatted = component.formatDate(dateString);
    expect(formatted).toMatch(/2026年06月/);
    expect(formatted).toMatch(/日/);
  });

  it('should toggle caution state', () => {
    expect(component.cautionState.isOpen).toBe(false);
    component.toggleCaution();
    expect(component.cautionState.isOpen).toBe(true);
    component.toggleCaution();
    expect(component.cautionState.isOpen).toBe(false);
  });

  it('should calculate effective draw count for regular gacha', () => {
    component.gacha = {
      ...mockGachaData,
      oncePerUser: false,
      remainingCount: 5,
    };

    expect(component.effectiveDrawCount(1)).toBe(1);
    expect(component.effectiveDrawCount(10)).toBe(5);
    expect(component.effectiveDrawCount(100)).toBe(5);
  });

  it('should calculate effective draw count for once-per-user gacha', () => {
    component.gacha = {
      ...mockGachaData,
      oncePerUser: true,
      alreadyDrawn: false,
      remainingCount: 1,
    };

    expect(component.effectiveDrawCount(1)).toBe(1);
  });

  it('should return 0 for already drawn once-per-user gacha', () => {
    component.gacha = {
      ...mockGachaData,
      oncePerUser: true,
      alreadyDrawn: true,
    };

    expect(component.effectiveDrawCount(1)).toBe(0);
  });

  it('should navigate back to userGachaPage', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should navigate to terms page', () => {
    component.navigateToTerms();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/terms']);
  });

  it('should return true for isLoggedIn', () => {
    expect(component.isLoggedIn).toBe(true);
  });

  it('should return false for isLoggedIn when not logged in', () => {
    mockUserService.isLoggedIn.mockReturnValue(false);
    expect(component.isLoggedIn).toBe(false);
  });

  it('should return true for usesSpecialPoint when consumptionType is SPECIAL_POINT', () => {
    component.gacha = {
      ...mockGachaData,
      consumptionType: 'SPECIAL_POINT',
    };

    expect(component.usesSpecialPoint).toBe(true);
  });

  it('should return false for usesSpecialPoint when consumptionType is COIN', () => {
    component.gacha = {
      ...mockGachaData,
      consumptionType: 'COIN',
    };

    expect(component.usesSpecialPoint).toBe(false);
  });

  it('should set isLoading to false after loading gacha', async () => {
    await component.loadGachaDetail();
    await fixture.whenStable();

    expect(component.isLoading).toBe(false);
  });

  it('should handle gacha not found error', async () => {
    mockGachaService.getGachaById.mockRejectedValue(new Error('Not found'));

    await component.loadGachaDetail();
    await fixture.whenStable();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should draw gacha with single count', async () => {
    component.gacha = mockGachaData;
    component.gachaId = 'test-gacha-id';
    mockUserService.getCoin.mockReturnValue(10000);

    await component.draw(1);

    expect(mockGachaService.drawGacha).toHaveBeenCalledWith(
      'test-gacha-id',
      'test-user-id',
      1,
    );
  });

  it('should not draw when not logged in', async () => {
    component.gacha = mockGachaData;
    mockUserService.isLoggedIn.mockReturnValue(false);

    await component.draw(1);

    expect(mockGachaService.drawGacha).not.toHaveBeenCalled();
  });

  it('should not draw when insufficient coins', async () => {
    component.gacha = mockGachaData;
    mockUserService.getCoin.mockReturnValue(1000);

    await component.draw(1);

    expect(mockGachaService.drawGacha).not.toHaveBeenCalled();
  });

  it('should update gacha state after successful draw', async () => {
    component.gacha = mockGachaData;
    component.gachaId = 'test-gacha-id';

    await component.draw(1);

    expect(component.gacha?.remainingCount).toBe(99);
    expect(mockUserService.saveCoin).toHaveBeenCalledWith(8000);
  });
});
