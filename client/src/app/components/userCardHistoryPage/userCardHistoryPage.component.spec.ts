import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {
  UserCardHistoryPageComponent,
  UserCard,
} from './userCardHistoryPage.component';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { CARD_STATUS } from '../../constants/card';

describe('UserCardHistoryPageComponent', () => {
  let component: UserCardHistoryPageComponent;
  let fixture: ComponentFixture<UserCardHistoryPageComponent>;
  let cardService: any;
  let userService: any;
  let router: any;
  let dialog: MatDialog;

  const mockUserCards: UserCard[] = [
    {
      id: '1',
      gachaId: '1',
      name: 'Card 1',
      imageFront: 'front1.jpg',
      imageBack: 'back1.jpg',
      cardType: 'SSR',
      exchangeType: 'BOTH',
      exchangeCoins: 100,
      isDrawn: CARD_STATUS.NOT_DRAWN,
      gachaName: 'Gacha 1',
      status: 'unselected',
      trackingNumber: null,
    },
    {
      id: '2',
      gachaId: '1',
      name: 'Card 2',
      imageFront: 'front2.jpg',
      imageBack: 'back2.jpg',
      cardType: 'R',
      exchangeType: 'SHIPPING_ONLY',
      exchangeCoins: null,
      isDrawn: CARD_STATUS.NOT_DRAWN,
      gachaName: 'Gacha 1',
      status: 'unselected',
      trackingNumber: null,
    },
    {
      id: '3',
      gachaId: '2',
      name: 'Card 3',
      imageFront: 'front3.jpg',
      imageBack: 'back3.jpg',
      cardType: 'SR',
      exchangeType: 'BOTH',
      exchangeCoins: 500,
      isDrawn: CARD_STATUS.REFUNDED,
      gachaName: 'Gacha 2',
      status: 'unselected',
      trackingNumber: null,
    },
  ];

  beforeEach(async () => {
    const getCardsByUserIdMock = jest.fn().mockResolvedValue(mockUserCards);
    const exchangeCardMock = jest.fn().mockResolvedValue(undefined);
    const getUserIdMock = jest.fn().mockReturnValue('user-123');
    const getCoinMock = jest.fn().mockReturnValue(1000);
    const updateUserMock = jest.fn().mockResolvedValue(undefined);
    const saveCoinMock = jest.fn();
    const notifyCardExchangeMock = jest.fn().mockResolvedValue(undefined);
    const updateCardStatusMock = jest.fn().mockResolvedValue(undefined);
    const deleteCardMock = jest.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      declarations: [UserCardHistoryPageComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: CardService,
          useValue: {
            getCardsByUserId: getCardsByUserIdMock,
            exchangeCard: exchangeCardMock,
            updateCardStatus: updateCardStatusMock,
            deleteCard: deleteCardMock,
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserId: getUserIdMock,
            getCoin: getCoinMock,
            updateUser: updateUserMock,
            saveCoin: saveCoinMock,
            notifyCardExchange: notifyCardExchangeMock,
          },
        },
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
      ],
    }).compileComponents();

    cardService = TestBed.inject(CardService) as any;
    userService = TestBed.inject(UserService) as any;
    router = TestBed.inject(Router) as any;
    dialog = TestBed.inject(MatDialog);

    fixture = TestBed.createComponent(UserCardHistoryPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    fixture.detectChanges();
    expect(component.activeTab).toBe('unselected');
    expect(component.isLoading).toBe(true);
    expect(component.cards).toEqual([]);
    expect(component.selectedCardIds.size).toBe(0);
  });

  it('should navigate to userGachaPage when no userId', async () => {
    userService.getUserId.mockReturnValue(null);
    await component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/userGachaPage']);
  });

  it('should load cards on init', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    expect(cardService.getCardsByUserId).toHaveBeenCalledWith('user-123');
    expect(component.cards.length).toBe(2);
  });

  it('should filter out refunded cards', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    const refundedCards = component.cards.filter(
      (c) => c.isDrawn === CARD_STATUS.REFUNDED,
    );
    expect(refundedCards.length).toBe(0);
  });

  it('should set isLoading to false after loading cards', async () => {
    fixture.detectChanges();
    expect(component.isLoading).toBe(true);
    await component.ngOnInit();
    expect(component.isLoading).toBe(false);
  });

  it('should switch tabs', () => {
    fixture.detectChanges();
    component.selectTab('pending');
    expect(component.activeTab).toBe('pending');
    component.selectTab('shipped');
    expect(component.activeTab).toBe('shipped');
  });

  it('should return correct empty message for unselected tab', () => {
    component.activeTab = 'unselected';
    expect(component.emptyMessageKey).toBe('card-history.empty-unselected');
  });

  it('should return correct empty message for pending tab', () => {
    component.activeTab = 'pending';
    expect(component.emptyMessageKey).toBe('card-history.empty-pending');
  });

  it('should return correct empty message for shipped tab', () => {
    component.activeTab = 'shipped';
    expect(component.emptyMessageKey).toBe('card-history.empty-shipped');
  });

  it('should filter cards by active tab', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    component.cards[0].status = 'unselected';
    component.cards[1].status = 'pending';

    component.selectTab('pending');
    expect(component.filteredCards.length).toBe(1);
    expect(component.filteredCards[0].status).toBe('pending');
  });

  it('should determine exchangeable cards correctly', () => {
    const exchangeableCard = mockUserCards[0];
    const nonExchangeableCard = mockUserCards[1];
    expect(component.isExchangeable(exchangeableCard)).toBe(true);
    expect(component.isExchangeable(nonExchangeableCard)).toBe(false);
  });

  it('should toggle card selection', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    const card = component.cards[0];

    component.toggleSelect(card);
    expect(component.selectedCardIds.has(card.id)).toBe(true);

    component.toggleSelect(card);
    expect(component.selectedCardIds.has(card.id)).toBe(false);
  });

  it('should not toggle selection for non-exchangeable card', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    const nonExchangeableCard = component.cards[1];

    component.toggleSelect(nonExchangeableCard);
    expect(component.selectedCardIds.has(nonExchangeableCard.id)).toBe(false);
  });

  it('should calculate selected total coins correctly', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    const card1 = component.cards[0];

    component.selectedCardIds.add(card1.id);
    component.cards[0].status = 'unselected';

    const totalCoins = component.selectedTotalCoins;
    expect(totalCoins).toBe(100);
  });

  it('should return true for hasSelectedCards when cards are selected', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    component.selectedCardIds.add(component.cards[0].id);
    expect(component.hasSelectedCards).toBe(true);
  });

  it('should return false for hasSelectedCards when no cards are selected', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    expect(component.hasSelectedCards).toBe(false);
  });

  it('should navigate back to myPage', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/myPage']);
  });

  it('should open exchange dialog with selected coins', async () => {
    fixture.detectChanges();
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => ({ subscribe: jest.fn() }),
    } as any);

    component.selectedCardIds.add('1');
    component.cards = [{ ...mockUserCards[0], status: 'unselected' }];

    component.openExchangeDialog();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should update card isDrawn status to REFUNDED after exchange', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    const card = component.cards[0];

    component.selectedCardIds.add(card.id);
    component.cards[0].status = 'unselected';

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      await component.executeExchange();
    } catch (error) {
      // Exchange may fail due to mocking, but we check if card status was updated
    }

    expect(card.isDrawn).toBe(CARD_STATUS.REFUNDED);
  });

  it('should clear selected cards after exchange', async () => {
    fixture.detectChanges();
    await component.ngOnInit();
    component.selectedCardIds.add(component.cards[0].id);
    component.cards[0].status = 'unselected';

    await component.executeExchange();

    expect(component.selectedCardIds.size).toBe(0);
  });

  it('should have CARD_STATUS constant available in template', () => {
    expect(component.CARD_STATUS).toBe(CARD_STATUS);
  });
});
