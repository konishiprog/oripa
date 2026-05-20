import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SidebarService } from './sidebar.service';
import { ApiConfigService } from './api-config.service';

describe('SidebarService', () => {
  let service: SidebarService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockAdmin = {
    id: 'test-admin-id',
    email: 'admin@example.com',
  };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      providers: [
        SidebarService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SidebarService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('localStorage operations', () => {
    it('should save admin id to localStorage', () => {
      service.saveAdminId('test-admin-id');
      expect(localStorage.getItem('adminId')).toBe('test-admin-id');
    });

    it('should get admin id from localStorage', () => {
      localStorage.setItem('adminId', 'test-admin-id');
      expect(service.getAdminId()).toBe('test-admin-id');
    });

    it('should return null if admin id not in localStorage', () => {
      expect(service.getAdminId()).toBeNull();
    });

    it('should clear admin id from localStorage', () => {
      localStorage.setItem('adminId', 'test-admin-id');
      service.clearAdminId();
      expect(localStorage.getItem('adminId')).toBeNull();
    });
  });

  describe('getCurrentAdmin', () => {
    it('should get current admin from API', async () => {
      localStorage.setItem('adminId', 'test-admin-id');
      const result = service.getCurrentAdmin();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/test-admin-id',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Admin retrieved', data: mockAdmin });

      const response = await result;
      expect(response).toEqual(mockAdmin);
    });

    it('should return null if no admin id in localStorage', async () => {
      const result = await service.getCurrentAdmin();
      expect(result).toBeNull();
      httpMock.expectNone('http://localhost:3000/api/admin/test-admin-id');
    });

    it('should return null if API returns no data', async () => {
      localStorage.setItem('adminId', 'test-admin-id');
      const result = service.getCurrentAdmin();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/test-admin-id',
      );
      req.flush({ message: 'Admin retrieved', data: null });

      const response = await result;
      expect(response).toBeNull();
    });

    it('should handle API errors', async () => {
      localStorage.setItem('adminId', 'test-admin-id');
      const result = service.getCurrentAdmin();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/test-admin-id',
      );
      req.flush(
        { message: 'Not found' },
        { status: 404, statusText: 'Not Found' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });
});
