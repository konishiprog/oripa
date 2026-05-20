import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { ApiConfigService } from './api-config.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockAdmin = {
    id: 'test-admin-id',
    email: 'admin@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      providers: [
        AdminService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createAdmin', () => {
    it('should create an admin', async () => {
      const result = service.createAdmin('admin@example.com', 'password123');

      const req = httpMock.expectOne('http://localhost:3000/api/admin');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'admin@example.com',
        password: 'password123',
      });
      req.flush({ message: 'Admin created', data: mockAdmin });

      const response = await result;
      expect(response.data).toEqual(mockAdmin);
    });
  });

  describe('updateAdmin', () => {
    it('should update an admin', async () => {
      const updatedAdmin = { ...mockAdmin, email: 'newemail@example.com' };
      const result = service.updateAdmin(
        'test-admin-id',
        'newemail@example.com',
        'newpassword123',
      );

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/test-admin-id',
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        email: 'newemail@example.com',
        password: 'newpassword123',
      });
      req.flush({ message: 'Admin updated', data: updatedAdmin });

      const response = await result;
      expect(response.data).toEqual(updatedAdmin);
    });
  });

  describe('deleteAdmin', () => {
    it('should delete an admin', async () => {
      const result = service.deleteAdmin('test-admin-id');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/test-admin-id',
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Admin deleted' });

      const response = await result;
      expect(response).toBeTruthy();
    });
  });

  describe('getAdminAccounts', () => {
    it('should get all admin accounts', async () => {
      const mockAdmins = [mockAdmin];
      const result = service.getAdminAccounts();

      const req = httpMock.expectOne('http://localhost:3000/api/admin');
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Admins retrieved', data: mockAdmins });

      const response = await result;
      expect(response).toEqual(mockAdmins);
    });

    it('should return empty array if no data', async () => {
      const result = service.getAdminAccounts();

      const req = httpMock.expectOne('http://localhost:3000/api/admin');
      req.flush({ message: 'Admins retrieved', data: null });

      const response = await result;
      expect(response).toEqual([]);
    });
  });
});
