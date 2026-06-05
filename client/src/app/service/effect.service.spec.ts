import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EffectService, Effect } from './effect.service';
import { ApiConfigService } from './api-config.service';

describe('EffectService', () => {
  let service: EffectService;
  let httpMock: HttpTestingController;
  let mockApiConfigService: any;

  const mockEffects: Effect[] = [
    {
      id: 'effect-1',
      name: 'Explosion',
      url: 'https://example.com/explosion.mp4',
    },
    {
      id: 'effect-2',
      name: 'Sparkle',
      url: 'https://example.com/sparkle.mp4',
    },
  ];

  beforeEach(() => {
    mockApiConfigService = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EffectService,
        { provide: ApiConfigService, useValue: mockApiConfigService },
      ],
    });

    service = TestBed.inject(EffectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all effects', async () => {
    const mockResponse = { message: 'Success', data: mockEffects };

    const promise = service.getAllEffects();

    const req = httpMock.expectOne('http://localhost:3000/api/effect');
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockEffects);
    expect(result.length).toBe(2);
  });

  it('should return empty array when no effects exist', async () => {
    const mockResponse = { message: 'Success', data: null };

    const promise = service.getAllEffects();

    const req = httpMock.expectOne('http://localhost:3000/api/effect');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual([]);
  });

  it('should create effect', async () => {
    const newEffect = { name: 'Fire', url: 'https://example.com/fire.mp4' };
    const mockResponse = {
      message: 'Success',
      data: { id: 'effect-3', ...newEffect },
    };

    const promise = service.createEffect(newEffect);

    const req = httpMock.expectOne('http://localhost:3000/api/effect');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEffect);

    req.flush(mockResponse);

    const result = await promise;
    expect(result.id).toBe('effect-3');
    expect(result.name).toBe('Fire');
  });

  it('should update effect', async () => {
    const effectId = 'effect-1';
    const updateData = { name: 'Updated Explosion', url: 'https://example.com/updated.mp4' };
    const mockResponse = {
      message: 'Success',
      data: { id: effectId, ...updateData },
    };

    const promise = service.updateEffect(effectId, updateData);

    const req = httpMock.expectOne(
      `http://localhost:3000/api/effect/${effectId}`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);

    req.flush(mockResponse);

    const result = await promise;
    expect(result.id).toBe(effectId);
    expect(result.name).toBe('Updated Explosion');
  });

  it('should delete effect', async () => {
    const effectId = 'effect-1';
    const mockResponse = { message: 'Deleted successfully' };

    const promise = service.deleteEffect(effectId);

    const req = httpMock.expectOne(
      `http://localhost:3000/api/effect/${effectId}`,
    );
    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);

    const result = await promise;
    expect(result.message).toBe('Deleted successfully');
  });

  it('should handle error when getting effects', async () => {
    const promise = service.getAllEffects();

    const req = httpMock.expectOne('http://localhost:3000/api/effect');
    req.error(new ErrorEvent('Network error'));

    try {
      await promise;
      fail('should have thrown error');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should handle error when creating effect', async () => {
    const newEffect = { name: 'Fire', url: 'https://example.com/fire.mp4' };

    const promise = service.createEffect(newEffect);

    const req = httpMock.expectOne('http://localhost:3000/api/effect');
    req.error(new ErrorEvent('Network error'));

    try {
      await promise;
      fail('should have thrown error');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
