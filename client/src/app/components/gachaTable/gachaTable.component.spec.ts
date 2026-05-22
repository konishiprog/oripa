import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GachaTableComponent, Gacha } from './gachaTable.component';
import { GachaService } from '../../service/gacha.service';

describe('GachaTableComponent', () => {
  let component: GachaTableComponent;
  let fixture: ComponentFixture<GachaTableComponent>;
  let gachaService: any;
  let translateService: TranslateService;

  const mockGachas: Gacha[] = [
    {
      id: 'gacha-uuid-1',
      name: 'Gacha 1',
      headerImage: 'header1.jpg',
      consumptionType: 'TICKETS',
      cost: 100,
      isPublic: true,
      publishStart: '2024-01-01',
      publishEnd: '2024-12-31',
      cards: 10,
    },
    {
      id: 'gacha-uuid-2',
      name: 'Gacha 2',
      headerImage: 'header2.jpg',
      consumptionType: 'POINTS',
      cost: 50,
      isPublic: false,
      publishStart: '2024-02-01',
      publishEnd: null,
      cards: 15,
    },
    {
      id: 'gacha-uuid-3',
      name: 'Gacha 3',
      headerImage: 'header3.jpg',
      consumptionType: 'TICKETS',
      cost: 200,
      isPublic: true,
      publishStart: '2024-03-01',
      publishEnd: '2024-06-30',
      cards: 20,
    },
  ];

  beforeEach(async () => {
    const deleteGachaMock = jest.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      declarations: [GachaTableComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: GachaService,
          useValue: { deleteGacha: deleteGachaMock },
        },
      ],
    }).compileComponents();

    gachaService = TestBed.inject(GachaService) as any;
    translateService = TestBed.inject(TranslateService);

    fixture = TestBed.createComponent(GachaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.gachas).toEqual([]);
    expect(component.filteredGachas).toEqual([]);
    expect(component.searchQuery).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(20);
  });

  it('should apply filters on init', () => {
    jest.spyOn(component, 'applyFilters');
    component.ngOnInit();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should apply filters when gachas input changes', () => {
    jest.spyOn(component, 'applyFilters');
    const changes = { gachas: { currentValue: mockGachas } } as any;
    component.ngOnChanges(changes);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should not apply filters when other inputs change', () => {
    jest.spyOn(component, 'applyFilters');
    const changes = { someOtherInput: { currentValue: null } } as any;
    component.ngOnChanges(changes);
    expect(component.applyFilters).not.toHaveBeenCalled();
  });

  it('should filter gachas by name', () => {
    component.gachas = mockGachas;
    component.searchQuery = 'Gacha 1';
    component.applyFilters();
    expect(component.filteredGachas.length).toBe(1);
    expect(component.filteredGachas[0].name).toBe('Gacha 1');
  });

  it('should be case insensitive when filtering', () => {
    component.gachas = mockGachas;
    component.searchQuery = 'gacha 2';
    component.applyFilters();
    expect(component.filteredGachas.length).toBe(1);
    expect(component.filteredGachas[0].name).toBe('Gacha 2');
  });

  it('should return all gachas when search query is empty', () => {
    component.gachas = mockGachas;
    component.searchQuery = '';
    component.applyFilters();
    expect(component.filteredGachas.length).toBe(3);
  });

  it('should reset to page 1 when applying filters', () => {
    component.gachas = mockGachas;
    component.currentPage = 5;
    component.applyFilters();
    expect(component.currentPage).toBe(1);
  });

  it('should get displayed gachas for current page', () => {
    component.gachas = mockGachas;
    component.filteredGachas = mockGachas;
    component.currentPage = 1;
    component.itemsPerPage = 2;
    const displayed = component.getDisplayedGachas();
    expect(displayed.length).toBe(2);
    expect(displayed[0].id).toBe('gacha-uuid-1');
    expect(displayed[1].id).toBe('gacha-uuid-2');
  });

  it('should change items per page and reset to page 1', () => {
    component.currentPage = 5;
    component.onItemsPerPageChange(50);
    expect(component.itemsPerPage).toBe(50);
    expect(component.currentPage).toBe(1);
  });

  it('should emit openCardRegistration event', () => {
    jest.spyOn(component.openCardRegistration, 'emit');
    component.onOpenCardRegistration(mockGachas[0]);
    expect(component.openCardRegistration.emit).toHaveBeenCalledWith(
      mockGachas[0],
    );
  });

  it('should get badge label for public gacha', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Active');
    const label = component.getBadgeLabel(true);
    expect(label).toBe('Active');
    expect(translateService.instant).toHaveBeenCalledWith(
      'dashboard.gacha.badge-active',
    );
  });

  it('should get badge label for private gacha', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Inactive');
    const label = component.getBadgeLabel(false);
    expect(label).toBe('Inactive');
    expect(translateService.instant).toHaveBeenCalledWith(
      'dashboard.gacha.badge-inactive',
    );
  });

  it('should get card unit label', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('10 Cards');
    const label = component.getCardUnitLabel(10);
    expect(label).toBe('10 Cards');
    expect(translateService.instant).toHaveBeenCalledWith(
      'dashboard.gacha.unit-cards',
      { count: 10 },
    );
  });

  it('should display publish end date when present', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('No end date');
    const display = component.getPublishEndDisplay('2024-12-31');
    expect(display).toBe('2024-12-31');
  });

  it('should display no end date message when null', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('No end date');
    const display = component.getPublishEndDisplay(null);
    expect(display).toBe('No end date');
    expect(translateService.instant).toHaveBeenCalledWith(
      'dashboard.gacha.no-end-date',
    );
  });

  it('should emit gachasUpdated after deleting gacha', async () => {
    jest.spyOn(component.gachasUpdated, 'emit');
    (gachaService.deleteGacha as jest.Mock).mockResolvedValue(undefined);
    component.gachas = mockGachas.slice();

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await component.deleteGacha(mockGachas[0]);
    expect(component.gachasUpdated.emit).toHaveBeenCalled();
  });

  it('should remove deleted gacha from gachas array', async () => {
    (gachaService.deleteGacha as jest.Mock).mockResolvedValue(undefined);
    component.gachas = mockGachas.slice();

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await component.deleteGacha(mockGachas[0]);
    expect(
      component.gachas.find((gacha) => gacha.id === 'gacha-uuid-1'),
    ).toBeUndefined();
  });

  it('should call applyFilters after deleting gacha', async () => {
    jest.spyOn(component, 'applyFilters');
    (gachaService.deleteGacha as jest.Mock).mockResolvedValue(undefined);
    component.gachas = mockGachas.slice();

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await component.deleteGacha(mockGachas[0]);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should not delete gacha if user cancels', async () => {
    (gachaService.deleteGacha as jest.Mock).mockResolvedValue(undefined);
    component.gachas = mockGachas.slice();
    const initialLength = component.gachas.length;

    jest.spyOn(window, 'confirm').mockReturnValue(false);

    await component.deleteGacha(mockGachas[0]);
    expect(component.gachas.length).toBe(initialLength);
    expect(gachaService.deleteGacha).not.toHaveBeenCalled();
  });

  describe('Filter functionality', () => {
    beforeEach(() => {
      component.gachas = mockGachas;
    });

    it('should filter by publish date range - from date', () => {
      component.filterCriteria = {
        publishStartFrom: '2024-02-01',
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(component.filteredGachas[0].id).toBe('gacha-uuid-2');
      expect(component.filteredGachas[1].id).toBe('gacha-uuid-3');
    });

    it('should filter by publish date range - to date', () => {
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: '2024-02-01',
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(component.filteredGachas[0].id).toBe('gacha-uuid-1');
      expect(component.filteredGachas[1].id).toBe('gacha-uuid-2');
    });

    it('should filter by publish date range - between dates', () => {
      component.filterCriteria = {
        publishStartFrom: '2024-02-01',
        publishStartTo: '2024-02-28',
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(1);
      expect(component.filteredGachas[0].id).toBe('gacha-uuid-2');
    });

    it('should filter by cost range - min cost', () => {
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: 100,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(component.filteredGachas[0].cost).toBe(100);
      expect(component.filteredGachas[1].cost).toBe(200);
    });

    it('should filter by cost range - max cost', () => {
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: 100,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(component.filteredGachas[0].cost).toBe(100);
      expect(component.filteredGachas[1].cost).toBe(50);
    });

    it('should filter by cost range - between costs', () => {
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: 75,
        costMax: 150,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(1);
      expect(component.filteredGachas[0].id).toBe('gacha-uuid-1');
      expect(component.filteredGachas[0].cost).toBe(100);
    });

    it('should filter by public status - public only', () => {
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'public',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(component.filteredGachas[0].isPublic).toBe(true);
      expect(component.filteredGachas[1].isPublic).toBe(true);
    });

    it('should filter by public status - private only', () => {
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'private',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(1);
      expect(component.filteredGachas[0].id).toBe('gacha-uuid-2');
      expect(component.filteredGachas[0].isPublic).toBe(false);
    });

    it('should filter by card count preset - 0', () => {
      const testGachas: Gacha[] = [
        { ...mockGachas[0], cards: 0 },
        { ...mockGachas[1], cards: 5 },
        { ...mockGachas[2], cards: 0 },
      ];
      component.gachas = testGachas;
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: '0',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(component.filteredGachas.every((g) => g.cards === 0)).toBe(true);
    });

    it('should filter by card count preset - 1-10', () => {
      const testGachas: Gacha[] = [
        { ...mockGachas[0], cards: 1 },
        { ...mockGachas[1], cards: 10 },
        { ...mockGachas[2], cards: 15 },
      ];
      component.gachas = testGachas;
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: '1-10',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(
        component.filteredGachas.every((g) => g.cards >= 1 && g.cards <= 10),
      ).toBe(true);
    });

    it('should filter by card count preset - 11-50', () => {
      const testGachas: Gacha[] = [
        { ...mockGachas[0], cards: 11 },
        { ...mockGachas[1], cards: 50 },
        { ...mockGachas[2], cards: 100 },
      ];
      component.gachas = testGachas;
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: '11-50',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
      expect(
        component.filteredGachas.every((g) => g.cards >= 11 && g.cards <= 50),
      ).toBe(true);
    });

    it('should filter by card count preset - 101+', () => {
      const testGachas: Gacha[] = [
        { ...mockGachas[0], cards: 50 },
        { ...mockGachas[1], cards: 100 },
        { ...mockGachas[2], cards: 101 },
      ];
      component.gachas = testGachas;
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: '101+',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(1);
      expect(component.filteredGachas[0].cards).toBe(101);
    });

    it('should apply multiple filters together', () => {
      component.filterCriteria = {
        publishStartFrom: '2024-01-01',
        publishStartTo: '2024-12-31',
        costMin: 100,
        costMax: 150,
        publicStatus: 'public',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(1);
      expect(component.filteredGachas[0].id).toBe('gacha-uuid-1');
    });

    it('should combine search query with filters', () => {
      component.searchQuery = 'Gacha 1';
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: 50,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(1);
      expect(component.filteredGachas[0].name).toBe('Gacha 1');
    });

    it('should return no results when filters are too restrictive', () => {
      component.filterCriteria = {
        publishStartFrom: '2025-01-01',
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(0);
    });

    it('should indicate when filter is active', () => {
      component.filterCriteria = {
        publishStartFrom: null,
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      expect(component.isFilterActive()).toBe(false);

      component.filterCriteria.costMin = 100;
      expect(component.isFilterActive()).toBe(true);
    });

    it('should handle ISO 8601 date format', () => {
      const testGachas: Gacha[] = [
        { ...mockGachas[0], publishStart: '2024-01-01T12:30:45Z' },
        { ...mockGachas[1], publishStart: '2024-02-01' },
        { ...mockGachas[2], publishStart: '2024-03-01T00:00:00Z' },
      ];
      component.gachas = testGachas;
      component.filterCriteria = {
        publishStartFrom: '2024-02-01',
        publishStartTo: null,
        costMin: null,
        costMax: null,
        publicStatus: 'all',
        cardCountPreset: 'all',
      };
      component.applyFilters();
      expect(component.filteredGachas.length).toBe(2);
    });
  });
});
