import { TestBed } from '@angular/core/testing';
import { EffectPlayerService } from './effect-player.service';
import { ApiConfigService } from './api-config.service';

describe('EffectPlayerService', () => {
  let service: EffectPlayerService;
  let mockApiConfigService: any;
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    mockApiConfigService = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      providers: [
        EffectPlayerService,
        { provide: ApiConfigService, useValue: mockApiConfigService },
      ],
    });

    service = TestBed.inject(EffectPlayerService);
    windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not open a window when no effect urls are given', () => {
    service.playEffects([]);

    expect(windowOpenSpy).not.toHaveBeenCalled();
  });

  it('should open a new tab with the player url for a single effect', () => {
    const effectUrls = ['https://example.com/explosion.mp4'];

    service.playEffects(effectUrls);

    const expectedParam = encodeURIComponent(JSON.stringify(effectUrls));
    expect(windowOpenSpy).toHaveBeenCalledWith(
      `http://localhost:3000/public/effect-player.html?urls=${expectedParam}`,
      '_blank',
    );
  });

  it('should encode multiple effect urls into the player url', () => {
    const effectUrls = [
      'https://example.com/explosion.mp4',
      'https://example.com/sparkle.mp4',
    ];

    service.playEffects(effectUrls);

    const expectedParam = encodeURIComponent(JSON.stringify(effectUrls));
    expect(windowOpenSpy).toHaveBeenCalledWith(
      `http://localhost:3000/public/effect-player.html?urls=${expectedParam}`,
      '_blank',
    );
  });

  it('should produce a url whose decoded parameter restores the original urls', () => {
    const effectUrls = ['https://example.com/a b&c.mp4'];

    service.playEffects(effectUrls);

    const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
    const param = calledUrl.split('urls=')[1];
    const restored = JSON.parse(decodeURIComponent(param));
    expect(restored).toEqual(effectUrls);
  });

  it('should use the configured api domain', () => {
    mockApiConfigService.domain = 'https://api.example.com';

    service.playEffects(['https://example.com/effect.mp4']);

    const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
    expect(calledUrl.startsWith('https://api.example.com/public/')).toBe(true);
  });
});
