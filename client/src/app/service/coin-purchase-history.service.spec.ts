import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  CoinPurchaseHistoryService,
  CoinPurchaseHistoryItem,
} from './coin-purchase-history.service';
import { ApiConfigService } from './api-config.service';

describe('CoinPurchaseHistoryService', () => {
  let service: CoinPurchaseHistoryService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockHistories: CoinPurchaseHistoryItem[] = [
    {
      id: 'history-1',
      userId: 'user-1',
      'User.name': 'John Doe',
      price: 99,
      coin: 100,
      ticket: 10,
      status: 'completed',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'history-2',
      userId: 'user-2',
      'User.name': 'Jane Smith',
      price: 490,
      coin: 500,
      ticket: 50,
      status: 'completed',
      createdAt: new Date('2025-01-02'),
    },
    {
      id: 'history-3',
      userId: 'user-1',
      'User.name': 'John Doe',
      price: 980,
      coin: 1000,
      ticket: 100,
      status: 'pending',
      createdAt: new Date('2025-01-03'),
    },
  ];

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: { 'Content-Type': 'application/json' },
    };

    TestBed.configureTestingModule({
      providers: [
        CoinPurchaseHistoryService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CoinPurchaseHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllHistories', () => {
    it('should fetch all purchase histories', async () => {
      const result = service.getAllHistories();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Histories fetched', data: mockHistories });

      const response = await result;
      expect(response).toEqual(mockHistories);
      expect(response).toHaveLength(3);
    });

    it('should handle empty history list', async () => {
      const result = service.getAllHistories();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history',
      );
      req.flush({ message: 'Histories fetched', data: [] });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should return empty array if response data is null', async () => {
      const result = service.getAllHistories();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history',
      );
      req.flush({ message: 'Histories fetched', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should include user info and status in response', async () => {
      const result = service.getAllHistories();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history',
      );
      req.flush({ message: 'Histories fetched', data: mockHistories });

      const response = await result;
      expect(response[0]['User.name']).toBe('John Doe');
      expect(response[0].status).toBe('completed');
    });

    it('should handle HTTP error', async () => {
      const result = service.getAllHistories();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history',
      );
      req.error(new ErrorEvent('Network error'));

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('getUserHistories', () => {
    it('should fetch histories for a specific user', async () => {
      const userHistories = mockHistories.filter((h) => h.userId === 'user-1');
      const result = service.getUserHistories('user-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/user/user-1',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'User histories fetched', data: userHistories });

      const response = await result;
      expect(response).toEqual(userHistories);
      expect(response).toHaveLength(2);
      expect(response.every((h) => h.userId === 'user-1')).toBe(true);
    });

    it('should handle user with no purchase history', async () => {
      const result = service.getUserHistories('user-nonexistent');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/user/user-nonexistent',
      );
      req.flush({ message: 'User histories fetched', data: [] });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should return empty array if response data is null', async () => {
      const result = service.getUserHistories('user-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/user/user-1',
      );
      req.flush({ message: 'User histories fetched', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should properly handle userId with special characters', async () => {
      const result = service.getUserHistories('user-123-abc');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/user/user-123-abc',
      );
      req.flush({ message: 'User histories fetched', data: [] });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should handle HTTP error for user histories', async () => {
      const result = service.getUserHistories('user-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/user/user-1',
      );
      req.error(new ErrorEvent('Network error'));

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle 404 error when user not found', async () => {
      const result = service.getUserHistories('nonexistent-user');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/user/nonexistent-user',
      );
      req.flush(
        { message: 'User not found' },
        { status: 404, statusText: 'Not Found' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });

    it('should include user info and status in user-specific response', async () => {
      const userHistories = mockHistories.filter((h) => h.userId === 'user-1');
      const result = service.getUserHistories('user-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/user/user-1',
      );
      req.flush({ message: 'User histories fetched', data: userHistories });

      const response = await result;
      expect(response[0]['User.name']).toBe('John Doe');
      expect(response[0].status).toBeDefined();
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent', async () => {
      const mockPaymentResponse = {
        clientSecret: 'pi_test_secret',
        chargeHistoryId: 'charge-history-123',
      };

      const result = service.createPaymentIntent('user-123', 450, 500, 50);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/charge/create-payment-intent',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        userId: 'user-123',
        amount: 450,
        coin: 500,
        ticket: 50,
      });
      req.flush({ message: 'Payment intent created', data: mockPaymentResponse });

      const response = await result;
      expect(response.clientSecret).toBe('pi_test_secret');
      expect(response.chargeHistoryId).toBe('charge-history-123');
    });

    it('should create payment intent without ticket', async () => {
      const mockPaymentResponse = {
        clientSecret: 'pi_test_secret_2',
        chargeHistoryId: 'charge-history-124',
      };

      const result = service.createPaymentIntent('user-456', 99, 100);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/charge/create-payment-intent',
      );
      expect(req.request.body).toEqual({
        userId: 'user-456',
        amount: 99,
        coin: 100,
        ticket: 0,
      });
      req.flush({ message: 'Payment intent created', data: mockPaymentResponse });

      const response = await result;
      expect(response.clientSecret).toBe('pi_test_secret_2');
    });

    it('should handle error when creating payment intent', async () => {
      const result = service.createPaymentIntent('user-123', 450, 500, 50);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/charge/create-payment-intent',
      );
      req.error(new ErrorEvent('Network error'));

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('getChargeHistory', () => {
    it('should fetch charge history for a user', async () => {
      const chargeHistories = mockHistories.filter((h) => h.userId === 'user-1');
      const result = service.getChargeHistory('user-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/charge/history/user-1',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Charge history fetched', data: chargeHistories });

      const response = await result;
      expect(response).toEqual(chargeHistories);
      expect(response.every((h) => h.userId === 'user-1')).toBe(true);
    });

    it('should handle empty charge history', async () => {
      const result = service.getChargeHistory('user-nonexistent');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/charge/history/user-nonexistent',
      );
      req.flush({ message: 'Charge history fetched', data: [] });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should return empty array if response data is null', async () => {
      const result = service.getChargeHistory('user-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/charge/history/user-1',
      );
      req.flush({ message: 'Charge history fetched', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should handle HTTP error when fetching charge history', async () => {
      const result = service.getChargeHistory('user-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-purchase-history/charge/history/user-1',
      );
      req.error(new ErrorEvent('Network error'));

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error).toBeTruthy();
      }
    });
  });
});
