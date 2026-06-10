import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { GachaService } from '../../service/gacha.service';
import { CardService } from '../../service/card.service';
import { GenreService } from '../../service/genre.service';
import { EffectService } from '../../service/effect.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockGachaService: any;
  let mockCardService: any;
  let mockGenreService: any;
  let mockEffectService: any;

  const buildServerGacha = (overrides: Partial<any> = {}) => ({
    id: 1,
    name: 'Box A',
    headerImage: '/uploads/a.png',
    consumptionType: '',
    cost: 100,
    isPublic: true,
    publishStart: '2026-01-01',
    publishEnd: '2026-12-31',
    cardsCount: 0,
    cards: [],
    ...overrides,
  });

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockGachaService = {
      getGachas: jest.fn().mockResolvedValue([]),
    };
    mockCardService = {};
    mockGenreService = {
      getAllGenres: jest.fn().mockResolvedValue([]),
    };
    mockEffectService = {
      getAllEffects: jest.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: CardService, useValue: mockCardService },
        { provide: GenreService, useValue: mockGenreService },
        { provide: EffectService, useValue: mockEffectService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty gachas and cards', () => {
    expect(component.gachas).toEqual([]);
    expect(component.cards).toEqual([]);
  });

  it('should populate gachas from service on loadGachas', async () => {
    mockGachaService.getGachas.mockResolvedValueOnce([
      buildServerGacha({ id: 1, name: 'Box A' }),
      buildServerGacha({ id: 2, name: 'Box B' }),
    ]);

    await component.loadGachas();

    expect(mockGachaService.getGachas).toHaveBeenCalled();
    expect(component.gachas.length).toBe(2);
    expect(component.gachas[0].name).toBe('Box A');
    expect(component.gachas[1].name).toBe('Box B');
  });

  it('should extract cards from gachas on loadGachas', async () => {
    mockGachaService.getGachas.mockResolvedValueOnce([
      buildServerGacha({
        id: 1,
        name: 'Box A',
        cards: [
          {
            id: 1,
            name: 'Card 1',
            cardType: 'SSR',
            exchangeType: 'BOTH',
            exchangeCoins: 100,
            effectId: null,
            effectName: null,
            imageFront: '/img/front.png',
            imageBack: '/img/back.png',
          },
        ],
      }),
    ]);

    await component.loadGachas();

    expect(component.cards.length).toBe(1);
    expect(component.cards[0].name).toBe('Card 1');
    expect(component.cards[0].gachaId).toBe(1);
    expect(component.cards[0].gachaName).toBe('Box A');
  });

  it('should log error when loadGachas service fails', async () => {
    mockGachaService.getGachas.mockRejectedValueOnce(new Error('API Error'));

    await component.loadGachas();

    expect(component.gachas).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle missing cardsCount gracefully', async () => {
    mockGachaService.getGachas.mockResolvedValueOnce([
      buildServerGacha({ id: 1, cardsCount: undefined }),
    ]);

    await component.loadGachas();

    expect(component.gachas[0].cards).toBe(0);
  });
});
