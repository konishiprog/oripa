import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContactService } from './contact.service';
import { ApiConfigService } from './api-config.service';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;
  let mockApiConfigService: any;

  beforeEach(() => {
    mockApiConfigService = {
      domain: 'http://localhost:3000',
      headers: {
        set: jest.fn().mockReturnValue({
          'x-user-id': 'user-123',
        }),
      },
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContactService,
        { provide: ApiConfigService, useValue: mockApiConfigService },
      ],
    });

    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send inquiry with correct parameters', async () => {
    const userId = 'user-123';
    const title = 'Test Inquiry';
    const content = 'This is a test inquiry';
    const mockResponse = { message: 'Inquiry sent successfully' };

    const promise = service.sendInquiry(userId, title, content);

    const req = httpMock.expectOne(
      'http://localhost:3000/api/contact',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title, content });
    expect(mockApiConfigService.headers.set).toHaveBeenCalledWith(
      'x-user-id',
      userId,
    );

    req.flush(mockResponse);

    const result = await promise;
    expect(result.message).toBe('Inquiry sent successfully');
  });

  it('should handle error when sending inquiry', async () => {
    const userId = 'user-123';
    const title = 'Test Inquiry';
    const content = 'This is a test inquiry';

    const promise = service.sendInquiry(userId, title, content);

    const req = httpMock.expectOne(
      'http://localhost:3000/api/contact',
    );
    req.error(new ErrorEvent('Network error'));

    try {
      await promise;
      fail('should have thrown error');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
