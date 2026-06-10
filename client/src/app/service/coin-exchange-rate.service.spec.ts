import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  CoinExchangeRateService,
  CoinExchangeRate,
} from './coin-exchange-rate.service';
import { ApiConfigService } from './api-config.service';

describe('CoinExchangeRateService', () => {
  let service: CoinExchangeRateService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockRates: CoinExchangeRate[] = [
    { id: 'rate-1', coin: 100, price: 99, ticket: 10 },
    { id: 'rate-2', coin: 500, price: 490, ticket: 50 },
    { id: 'rate-3', coin: 1000, price: 980, ticket: 100 },
  ];

  const mockRate: CoinExchangeRate = {
    id: 'rate-1',
    coin: 100,
    price: 99,
    ticket: 10,
  };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: { 'Content-Type': 'application/json' },
    };

    TestBed.configureTestingModule({
      providers: [
        CoinExchangeRateService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CoinExchangeRateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllRates', () => {
    it('should fetch all rates', async () => {
      const result = service.getAllRates();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Rates fetched', data: mockRates });

      const response = await result;
      expect(response).toEqual(mockRates);
      expect(response).toHaveLength(3);
    });

    it('should handle empty rate list', async () => {
      const result = service.getAllRates();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate',
      );
      req.flush({ message: 'Rates fetched', data: [] });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should return empty array if response data is null', async () => {
      const result = service.getAllRates();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate',
      );
      req.flush({ message: 'Rates fetched', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });

    it('should handle HTTP error', async () => {
      const result = service.getAllRates();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate',
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

  describe('createRate', () => {
    it('should create a new rate', async () => {
      const payload = { coin: 100, price: 99, ticket: 10 };
      const result = service.createRate(payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'Rate created', data: mockRate });

      const response = await result;
      expect(response).toEqual(mockRate);
      expect(response.coin).toBe(100);
      expect(response.price).toBe(99);
    });

    it('should handle create error with invalid input', async () => {
      const payload = { coin: -100, price: 99, ticket: 10 };
      const result = service.createRate(payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate',
      );
      req.flush(
        { message: 'Invalid input' },
        { status: 400, statusText: 'Bad Request' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(400);
      }
    });

    it('should handle create error with duplicate rate', async () => {
      const payload = { coin: 100, price: 99, ticket: 10 };
      const result = service.createRate(payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate',
      );
      req.flush(
        { message: 'Rate already exists' },
        { status: 409, statusText: 'Conflict' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(409);
      }
    });
  });

  describe('updateRate', () => {
    it('should update an existing rate', async () => {
      const payload = { coin: 200, price: 195, ticket: 20 };
      const updatedRate = { id: 'rate-1', ...payload };
      const result = service.updateRate('rate-1', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate/rate-1',
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'Rate updated', data: updatedRate });

      const response = await result;
      expect(response).toEqual(updatedRate);
      expect(response.coin).toBe(200);
    });

    it('should handle update error when rate not found', async () => {
      const payload = { coin: 200, price: 195, ticket: 20 };
      const result = service.updateRate('nonexistent-id', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate/nonexistent-id',
      );
      req.flush(
        { message: 'Rate not found' },
        { status: 404, statusText: 'Not Found' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });

    it('should handle update error with invalid input', async () => {
      const payload = { coin: -100, price: 195, ticket: 20 };
      const result = service.updateRate('rate-1', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate/rate-1',
      );
      req.flush(
        { message: 'Invalid input' },
        { status: 400, statusText: 'Bad Request' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(400);
      }
    });
  });

  describe('deleteRate', () => {
    it('should delete a rate', async () => {
      const result = service.deleteRate('rate-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate/rate-1',
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Rate deleted' });

      const response = await result;
      expect(response.message).toBe('Rate deleted');
    });

    it('should handle delete error when rate not found', async () => {
      const result = service.deleteRate('nonexistent-id');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate/nonexistent-id',
      );
      req.flush(
        { message: 'Rate not found' },
        { status: 404, statusText: 'Not Found' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });

    it('should handle delete error when rate is in use', async () => {
      const result = service.deleteRate('rate-1');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/coin-exchange-rate/rate-1',
      );
      req.flush(
        { message: 'Cannot delete rate in use' },
        { status: 409, statusText: 'Conflict' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(409);
      }
    });
  });
});
