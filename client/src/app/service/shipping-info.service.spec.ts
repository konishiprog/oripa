import { TestBed } from '@angular/core/testing';
import { ShippingInfoService, ShippingCardInfo } from './shipping-info.service';
import { CardService } from './card.service';
import { UserService } from './user.service';
import { GachaService } from './gacha.service';
import { CARD_STATUS } from '../constants/card';

describe('ShippingInfoService', () => {
  let service: ShippingInfoService;
  let cardService: any;
  let userService: any;
  let gachaService: any;

  const mockCards = [
    {
      id: 'card-1',
      name: 'Card 1',
      userId: 'user-1',
      gachaId: 'gacha-1',
      isDrawn: CARD_STATUS.SHIPPING_PENDING,
    },
    {
      id: 'card-2',
      name: 'Card 2',
      userId: 'user-2',
      gachaId: 'gacha-1',
      isDrawn: CARD_STATUS.SHIPPING_PENDING,
    },
    {
      id: 'card-3',
      name: 'Card 3',
      userId: 'user-1',
      gachaId: 'gacha-2',
      isDrawn: CARD_STATUS.NOT_DRAWN,
    },
    {
      id: 'card-4',
      name: 'Card 4',
      userId: 'user-3',
      gachaId: 'gacha-1',
      isDrawn: CARD_STATUS.SHIPPING_PENDING,
    },
  ];

  const mockUsers = [
    {
      id: 'user-1',
      name: 'John Doe',
      address: '123 Main St',
      phone: '555-0001',
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      address: '456 Oak Ave',
      phone: '555-0002',
    },
    { id: 'user-3', name: 'Bob Johnson', address: null, phone: null },
  ];

  const mockGachas = [
    { id: 'gacha-1', name: 'Fantasy Box' },
    { id: 'gacha-2', name: 'Adventure Box' },
  ];

  beforeEach(async () => {
    const cardServiceMock = {
      getAllCards: jest.fn().mockResolvedValue(mockCards),
    };

    const userServiceMock = {
      getAllUsers: jest.fn().mockResolvedValue(mockUsers),
    };

    const gachaServiceMock = {
      getGachas: jest.fn().mockResolvedValue(mockGachas),
    };

    await TestBed.configureTestingModule({
      providers: [
        ShippingInfoService,
        { provide: CardService, useValue: cardServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: GachaService, useValue: gachaServiceMock },
      ],
    }).compileComponents();

    service = TestBed.inject(ShippingInfoService);
    cardService = TestBed.inject(CardService);
    userService = TestBed.inject(UserService);
    gachaService = TestBed.inject(GachaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getShippingCards', () => {
    it('should fetch shipping cards with user and gacha info', async () => {
      const result = await service.getShippingCards();

      expect(cardService.getAllCards).toHaveBeenCalled();
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(gachaService.getGachas).toHaveBeenCalled();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        cardId: 'card-1',
        userName: 'John Doe',
        address: '123 Main St',
        phone: '555-0001',
        gachaName: 'Fantasy Box',
        cardName: 'Card 1',
      });
    });

    it('should filter only shipping pending cards', async () => {
      const result = await service.getShippingCards();

      expect(result).toHaveLength(3);
      const cardIds = result.map((card) => card.cardId);
      expect(cardIds).toContain('card-1');
      expect(cardIds).toContain('card-2');
      expect(cardIds).toContain('card-4');
      expect(cardIds).not.toContain('card-3');
    });

    it('should use default text for missing user info', async () => {
      const result = await service.getShippingCards();

      const bobCard = result.find((card) => card.cardName === 'Card 4');
      expect(bobCard?.userName).toBe('Bob Johnson');
      expect(bobCard?.address).toBe('-');
      expect(bobCard?.phone).toBe('-');
    });

    it('should use default text for missing card name', async () => {
      const cardsWithMissingName = [
        {
          id: 'card-5',
          name: null,
          userId: 'user-1',
          gachaId: 'gacha-1',
          isDrawn: CARD_STATUS.SHIPPING_PENDING,
        },
      ];
      cardService.getAllCards.mockResolvedValueOnce(cardsWithMissingName);

      const result = await service.getShippingCards();

      expect(result[0].cardName).toBe('-');
    });

    it('should use default text for missing gacha', async () => {
      const cardsWithUnknownGacha = [
        {
          id: 'card-6',
          name: 'Card 6',
          userId: 'user-1',
          gachaId: 'unknown-gacha',
          isDrawn: CARD_STATUS.SHIPPING_PENDING,
        },
      ];
      cardService.getAllCards.mockResolvedValueOnce(cardsWithUnknownGacha);

      const result = await service.getShippingCards();

      expect(result[0].gachaName).toBe('-');
    });

    it('should use default text for missing user', async () => {
      const cardsWithUnknownUser = [
        {
          id: 'card-7',
          name: 'Card 7',
          userId: 'unknown-user',
          gachaId: 'gacha-1',
          isDrawn: CARD_STATUS.SHIPPING_PENDING,
        },
      ];
      cardService.getAllCards.mockResolvedValueOnce(cardsWithUnknownUser);

      const result = await service.getShippingCards();

      expect(result[0].userName).toBe('-');
      expect(result[0].address).toBe('-');
      expect(result[0].phone).toBe('-');
    });

    it('should handle empty card list', async () => {
      cardService.getAllCards.mockResolvedValueOnce([]);

      const result = await service.getShippingCards();

      expect(result).toEqual([]);
    });

    it('should handle no shipping cards in the system', async () => {
      const cardsWithoutShipping = mockCards.filter(
        (card) => card.isDrawn !== CARD_STATUS.SHIPPING_PENDING,
      );
      cardService.getAllCards.mockResolvedValueOnce(cardsWithoutShipping);

      const result = await service.getShippingCards();

      expect(result).toEqual([]);
    });

    it('should handle error from card service', async () => {
      cardService.getAllCards.mockRejectedValueOnce(new Error('API Error'));

      try {
        await service.getShippingCards();
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('API Error');
      }
    });

    it('should handle error from user service', async () => {
      userService.getAllUsers.mockRejectedValueOnce(
        new Error('User API Error'),
      );

      try {
        await service.getShippingCards();
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('User API Error');
      }
    });

    it('should handle error from gacha service', async () => {
      gachaService.getGachas.mockRejectedValueOnce(
        new Error('Gacha API Error'),
      );

      try {
        await service.getShippingCards();
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('Gacha API Error');
      }
    });

    it('should correctly map multiple shipping cards', async () => {
      const result = await service.getShippingCards();

      const card2 = result.find((card) => card.cardId === 'card-2');
      expect(card2).toEqual({
        cardId: 'card-2',
        userName: 'Jane Smith',
        address: '456 Oak Ave',
        phone: '555-0002',
        gachaName: 'Fantasy Box',
        cardName: 'Card 2',
      });

      const card4 = result.find((card) => card.cardId === 'card-4');
      expect(card4).toEqual({
        cardId: 'card-4',
        userName: 'Bob Johnson',
        address: '-',
        phone: '-',
        gachaName: 'Fantasy Box',
        cardName: 'Card 4',
      });
    });

    it('should maintain card id mapping', async () => {
      const result = await service.getShippingCards();

      result.forEach((shippingCard) => {
        const originalCard = mockCards.find(
          (card) => card.id === shippingCard.cardId,
        );
        expect(originalCard).toBeDefined();
        expect(originalCard?.isDrawn).toBe(CARD_STATUS.SHIPPING_PENDING);
      });
    });
  });
});
