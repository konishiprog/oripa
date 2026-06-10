import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { GachaDetailPageComponent } from './gachaDetailPage.component';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { GachaDrawService } from '../../common/gacha-draw.service';

describe('GachaDetailPageComponent', () => {
  let component: GachaDetailPageComponent;
  let fixture: ComponentFixture<GachaDetailPageComponent>;
  let mockGachaService: any;
  let mockCardService: any;
  let mockUserService: any;
  let mockGachaDrawService: any;
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
    minExchangeCoins: 50,
  };

  const mockJackpotCards = [
    {
      id: 'card-1',
      gachaId: '1',
      gachaName: 'Gacha 1',
      name: 'Jackpot Card 1',
      cardType: 'SSR',
      exchangeType: 'BOTH',
      exchangeCoins: 100,
      effectId: null,
      effectName: '',
      imageFront: 'card1.jpg',
      imageBack: 'back1.jpg',
      isDrawn: '未引き',
    },
    {
      id: 'card-2',
      gachaId: '1',
      gachaName: 'Gacha 1',
      name: 'Jackpot Card 2',
      cardType: 'SSR',
      exchangeType: 'BOTH',
      exchangeCoins: 50,
      effectId: null,
      effectName: '',
      imageFront: 'card2.jpg',
      imageBack: 'back2.jpg',
      isDrawn: '未引き',
    },
  ];

  beforeEach(async () => {
    mockGachaService = {
      getGachaById: jest.fn().mockResolvedValue(mockGachaData),
    };

    mockCardService = {
      getCardsByGachaId: jest.fn().mockResolvedValue(mockJackpotCards),
    };

    mockUserService = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getUserId: jest.fn().mockReturnValue('test-user-id'),
    };

    mockGachaDrawService = {
      draw: jest.fn().mockResolvedValue({
        remainingCount: 99,
        dialogRef: {
          afterClosed: jest.fn().mockReturnValue(of(void 0)),
        },
      }),
      resolveDrawErrorMessage: jest.fn((error) => 'Error message'),
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
        { provide: GachaDrawService, useValue: mockGachaDrawService },
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
    expect(component.gacha?.minExchangeCoins).toBe(50);
  });

  it('should set isLoading to false after loading gacha', async () => {
    expect(component.isLoading).toBe(true);
    await component.loadGachaDetail();
    await fixture.whenStable();

    expect(component.isLoading).toBe(false);
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

  it('should filter jackpot cards to only SSR', async () => {
    const allCards = [
      { id: '1', name: 'SSR Card', cardType: 'SSR', imageFront: 'ssr.jpg', exchangeCoins: 100 },
      { id: '2', name: 'SR Card', cardType: 'SR', imageFront: 'sr.jpg', exchangeCoins: 50 },
      { id: '3', name: 'R Card', cardType: 'R', imageFront: 'r.jpg', exchangeCoins: 10 },
    ];
    mockCardService.getCardsByGachaId.mockResolvedValue(allCards);

    await component.loadJackpotCards();
    await fixture.whenStable();

    expect(component.jackpotCards.length).toBe(1);
    expect(component.jackpotCards[0].name).toBe('SSR Card');
    expect(component.jackpotCards[0].id).toBe('1');
  });

  it('should format date correctly', () => {
    const dateString = '2026-06-09T00:00:00Z';
    const formatted = component.formatDate(dateString);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('06');
    expect(formatted).toContain('09');
    expect(formatted).toContain('日');
  });

  it('should toggle caution state', () => {
    expect(component.cautionState.isOpen).toBe(false);
    component.toggleCaution();
    expect(component.cautionState.isOpen).toBe(true);
    component.toggleCaution();
    expect(component.cautionState.isOpen).toBe(false);
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

  it('should handle gacha not found error', async () => {
    mockGachaService.getGachaById.mockRejectedValue(new Error('Not found'));

    await component.loadGachaDetail();
    await fixture.whenStable();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/userGachaPage']);
    expect(component.isLoading).toBe(false);
  });

  it('should draw gacha using GachaDrawService', async () => {
    component.gacha = mockGachaData;
    component.gachaId = 'test-gacha-id';

    await component.draw(1);

    expect(mockGachaDrawService.draw).toHaveBeenCalledWith(mockGachaData, 1);
  });

  it('should update gacha state after successful draw', async () => {
    component.gacha = mockGachaData;

    await component.draw(1);
    await fixture.whenStable();

    expect(component.gacha?.remainingCount).toBe(99);
    expect(component.gacha?.alreadyDrawn).toBe(false);
  });

  it('should mark gacha as already drawn for once-per-user', async () => {
    component.gacha = { ...mockGachaData, oncePerUser: true, alreadyDrawn: false };

    await component.draw(1);
    await fixture.whenStable();

    expect(component.gacha?.alreadyDrawn).toBe(true);
  });

  it('should not draw when gacha is null', async () => {
    component.gacha = null;

    await component.draw(1);

    expect(mockGachaDrawService.draw).not.toHaveBeenCalled();
  });

  it('should not draw when already drawing', async () => {
    component.gacha = mockGachaData;
    component.isDrawing = true;

    await component.draw(1);

    expect(mockGachaDrawService.draw).not.toHaveBeenCalled();
  });

  it('should handle draw error', async () => {
    component.gacha = mockGachaData;
    const error = new Error('Draw failed');
    mockGachaDrawService.draw.mockRejectedValue(error);
    jest.spyOn(window, 'alert').mockImplementation();

    await component.draw(1);
    await fixture.whenStable();

    expect(window.alert).toHaveBeenCalled();
    expect(component.isDrawing).toBe(false);
  });

  it('should set isDrawing to false after draw completes', async () => {
    component.gacha = mockGachaData;
    expect(component.isDrawing).toBe(false);

    const drawPromise = component.draw(1);
    expect(component.isDrawing).toBe(true);

    await drawPromise;
    await fixture.whenStable();

    expect(component.isDrawing).toBe(false);
  });
});
