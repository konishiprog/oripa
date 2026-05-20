import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoginService } from './login.service';
import { ApiConfigService } from './api-config.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockLoginResponse = {
    message: 'Login successful',
    data: {
      id: 'test-admin-id',
      email: 'admin@example.com',
    },
  };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login with email and password', async () => {
      const result = service.login('admin@example.com', 'password123');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/login',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'admin@example.com',
        password: 'password123',
      });
      req.flush(mockLoginResponse);

      const response = await result;
      expect(response).toEqual(mockLoginResponse);
    });

    it('should send correct credentials', async () => {
      const result = service.login('test@example.com', 'test123');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/login',
      );
      expect(req.request.body.email).toBe('test@example.com');
      expect(req.request.body.password).toBe('test123');
      req.flush(mockLoginResponse);

      await result;
    });

    it('should handle failed login', async () => {
      const result = service.login('wrong@example.com', 'wrongpassword');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/admin/login',
      );
      req.flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' },
      );

      try {
        await result;
        fail('should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(401);
      }
    });
  });
});
