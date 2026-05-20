import { TestBed } from '@angular/core/testing';
import { HttpHeaders } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  let service: ApiConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiConfigService],
    });
    service = TestBed.inject(ApiConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have domain property', () => {
    expect(service.domain).toBeDefined();
    expect(typeof service.domain).toBe('string');
  });

  it('should have headers property', () => {
    expect(service.headers).toBeDefined();
    expect(service.headers instanceof HttpHeaders).toBe(true);
  });

  it('should have Content-Type header set to application/json', () => {
    expect(service.headers.get('Content-Type')).toBe('application/json');
  });
});
