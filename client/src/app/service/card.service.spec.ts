import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CardService, CreateCardPayload, UpdateCardPayload } from './card.service';
import { ApiConfigService } from './api-config.service';

describe('CardService', () => {
  let service: CardService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockCard = {
    id: 'test-card-id',
    gachaId: 'test-gacha-id',
    name: 'Test Card',
    cardType: 'normal',
    exchangeType: 'points',
    exchangePoints: 100,
    imageFront: 'front.jpg',
    imageBack: 'back.jpg',
  };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      providers: [
        CardService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCard', () => {
    it('should create a card with files', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const payload: CreateCardPayload = {
        gachaId: 'test-gacha-id',
        name: 'Test Card',
        cardType: 'normal',
        exchangeType: 'points',
        exchangePoints: 100,
        imageFrontFile: mockFile,
        imageBackFile: mockFile,
      };

      const result = service.createCard(payload);

      const req = httpMock.expectOne('http://localhost:3000/api/card');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ message: 'Card created', data: mockCard });

      const response = await result;
      expect(response.data).toEqual(mockCard);
    });

    it('should create a card with null exchangePoints', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const payload: CreateCardPayload = {
        gachaId: 'test-gacha-id',
        name: 'Test Card',
        cardType: 'normal',
        exchangeType: 'none',
        exchangePoints: null,
        imageFrontFile: mockFile,
        imageBackFile: mockFile,
      };

      const result = service.createCard(payload);

      const req = httpMock.expectOne('http://localhost:3000/api/card');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Card created', data: mockCard });

      const response = await result;
      expect(response.data).toEqual(mockCard);
    });
  });

  describe('updateCard', () => {
    it('should update a card with files', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const payload: UpdateCardPayload = {
        name: 'Updated Card',
        cardType: 'rare',
        exchangeType: 'points',
        exchangePoints: 200,
        imageFrontFile: mockFile,
        imageBackFile: mockFile,
      };

      const result = service.updateCard('test-card-id', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/card/test-card-id',
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ message: 'Card updated', data: mockCard });

      const response = await result;
      expect(response.data).toEqual(mockCard);
    });

    it('should update a card without files', async () => {
      const payload: UpdateCardPayload = {
        name: 'Updated Card',
        cardType: 'rare',
        exchangeType: 'points',
        exchangePoints: 200,
      };

      const result = service.updateCard('test-card-id', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/card/test-card-id',
      );
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Card updated', data: mockCard });

      const response = await result;
      expect(response.data).toEqual(mockCard);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      const result = service.deleteCard('test-card-id');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/card/test-card-id',
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Card deleted' });

      const response = await result;
      expect(response).toBeTruthy();
    });
  });

  describe('getAllCards', () => {
    it('should get all cards', async () => {
      const mockCards = [mockCard];
      const result = service.getAllCards();

      const req = httpMock.expectOne('http://localhost:3000/api/card');
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Cards retrieved', data: mockCards });

      const response = await result;
      expect(response).toEqual(mockCards);
    });

    it('should return empty array if no data', async () => {
      const result = service.getAllCards();

      const req = httpMock.expectOne('http://localhost:3000/api/card');
      req.flush({ message: 'Cards retrieved', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });
  });

  describe('getCardsByGachaId', () => {
    it('should filter cards by gacha id', async () => {
      const mockCards = [mockCard, { ...mockCard, id: 'card-2', gachaId: 'other-gacha' }];

      jest.spyOn(service, 'getAllCards').mockResolvedValue(mockCards);

      const result = await service.getCardsByGachaId('test-gacha-id');
      expect(result).toEqual([mockCard]);
    });

    it('should return empty array if no cards match', async () => {
      jest.spyOn(service, 'getAllCards').mockResolvedValue([]);

      const result = await service.getCardsByGachaId('test-gacha-id');
      expect(result).toEqual([]);
    });
  });

  describe('getCardsByUserId', () => {
    it('should filter cards by user id and isDrawn', async () => {
      const drawnCard = { ...mockCard, userId: 'test-user-id', isDrawn: true };
      const undrawnCard = { ...mockCard, userId: 'test-user-id', isDrawn: false };
      const mockCards = [drawnCard, undrawnCard];

      jest.spyOn(service, 'getAllCards').mockResolvedValue(mockCards);

      const result = await service.getCardsByUserId('test-user-id');
      expect(result).toEqual([drawnCard]);
    });

    it('should return empty array if no drawn cards', async () => {
      const undrawnCard = { ...mockCard, userId: 'test-user-id', isDrawn: false };
      jest.spyOn(service, 'getAllCards').mockResolvedValue([undrawnCard]);

      const result = await service.getCardsByUserId('test-user-id');
      expect(result).toEqual([]);
    });
  });
});
