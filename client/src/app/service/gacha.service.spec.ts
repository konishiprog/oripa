import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { GachaService, CreateGachaPayload, UpdateGachaPayload } from './gacha.service';
import { ApiConfigService } from './api-config.service';

describe('GachaService', () => {
  let service: GachaService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockGacha = {
    id: 'test-gacha-id',
    name: 'Test Gacha',
    cost: 100,
    publishStart: '2025-01-01',
    publishEnd: '2025-12-31',
    isPublic: true,
    headerImage: 'header.jpg',
  };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      providers: [
        GachaService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(GachaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createGacha', () => {
    it('should create a gacha with image', async () => {
      const mockFile = new File(['content'], 'header.jpg', { type: 'image/jpeg' });
      const payload: CreateGachaPayload = {
        name: 'Test Gacha',
        cost: 100,
        publishStart: '2025-01-01',
        publishEnd: '2025-12-31',
        isPublic: true,
        headerImageFile: mockFile,
      };

      const result = service.createGacha(payload);

      const req = httpMock.expectOne('http://localhost:3000/api/gacha');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ message: 'Gacha created', data: mockGacha });

      const response = await result;
      expect(response.data).toEqual(mockGacha);
    });
  });

  describe('updateGacha', () => {
    it('should update a gacha with image', async () => {
      const mockFile = new File(['content'], 'header.jpg', { type: 'image/jpeg' });
      const payload: UpdateGachaPayload = {
        name: 'Updated Gacha',
        cost: 200,
        publishStart: '2025-02-01',
        publishEnd: '2025-11-30',
        isPublic: false,
        headerImageFile: mockFile,
      };

      const result = service.updateGacha('test-gacha-id', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/gacha/test-gacha-id',
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ message: 'Gacha updated', data: mockGacha });

      const response = await result;
      expect(response.data).toEqual(mockGacha);
    });

    it('should update a gacha without image', async () => {
      const payload: UpdateGachaPayload = {
        name: 'Updated Gacha',
        cost: 200,
        publishStart: '2025-02-01',
        publishEnd: '2025-11-30',
        isPublic: false,
      };

      const result = service.updateGacha('test-gacha-id', payload);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/gacha/test-gacha-id',
      );
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Gacha updated', data: mockGacha });

      const response = await result;
      expect(response.data).toEqual(mockGacha);
    });
  });

  describe('deleteGacha', () => {
    it('should delete a gacha', async () => {
      const result = service.deleteGacha('test-gacha-id');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/gacha/test-gacha-id',
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Gacha deleted' });

      const response = await result;
      expect(response).toBeTruthy();
    });
  });

  describe('getGachas', () => {
    it('should get all gachas', async () => {
      const mockGachas = [mockGacha];
      const result = service.getGachas();

      const req = httpMock.expectOne('http://localhost:3000/api/gacha');
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Gachas retrieved', data: mockGachas });

      const response = await result;
      expect(response).toEqual(mockGachas);
    });

    it('should return empty array if no data', async () => {
      const result = service.getGachas();

      const req = httpMock.expectOne('http://localhost:3000/api/gacha');
      req.flush({ message: 'Gachas retrieved', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });
  });

  describe('getGachaById', () => {
    it('should get a gacha by id', async () => {
      const result = service.getGachaById('test-gacha-id');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/gacha/test-gacha-id',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Gacha retrieved', data: mockGacha });

      const response = await result;
      expect(response).toEqual(mockGacha);
    });
  });

  describe('drawGacha', () => {
    it('should draw from gacha', async () => {
      const mockDrawResult = {
        drawnCards: [],
        remainingCount: 45,
        userCoin: 900,
      };

      const result = service.drawGacha('test-gacha-id', 'test-user-id', 5);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/gacha/test-gacha-id/draw',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        userId: 'test-user-id',
        drawCount: 5,
      });
      req.flush({ message: 'Draw successful', data: mockDrawResult });

      const response = await result;
      expect(response).toEqual(mockDrawResult);
    });

    it('should draw different counts', async () => {
      const mockDrawResult = {
        drawnCards: [],
        remainingCount: 49,
        userCoin: 800,
      };

      const result = service.drawGacha('test-gacha-id', 'test-user-id', 1);

      const req = httpMock.expectOne(
        'http://localhost:3000/api/gacha/test-gacha-id/draw',
      );
      expect(req.request.body.drawCount).toBe(1);
      req.flush({ message: 'Draw successful', data: mockDrawResult });

      const response = await result;
      expect(response).toEqual(mockDrawResult);
    });
  });
});
