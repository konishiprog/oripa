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
      id: 1,
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
      id: 2,
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
      id: 3,
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

  it('should load icons on init', () => {
    jest.spyOn(component as any, 'loadIcons');
    component.ngOnInit();
    expect(component['loadIcons']).toHaveBeenCalled();
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
    expect(displayed[0].id).toBe(1);
    expect(displayed[1].id).toBe(2);
  });

  it('should get correct total pages', () => {
    component.filteredGachas = mockGachas;
    component.itemsPerPage = 2;
    const totalPages = component.getTotalPages();
    expect(totalPages).toBe(2);
  });

  it('should calculate page numbers correctly for small page count', () => {
    component.filteredGachas = mockGachas;
    component.itemsPerPage = 20;
    component.currentPage = 1;
    const pageNumbers = component.getPageNumbers();
    expect(pageNumbers).toEqual([1]);
  });

  it('should show ellipsis and boundary pages for large page count', () => {
    const largeList = Array.from({ length: 100 }, (_, i) => ({
      ...mockGachas[0],
      id: i + 1,
    }));
    component.filteredGachas = largeList;
    component.itemsPerPage = 5;
    component.currentPage = 15;
    const pageNumbers = component.getPageNumbers();
    expect(pageNumbers[0]).toBe(1);
    expect(pageNumbers[pageNumbers.length - 1]).toBe(20);
    expect(pageNumbers).toContain('...');
  });

  it('should navigate to valid page', () => {
    component.filteredGachas = mockGachas;
    component.itemsPerPage = 1;
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
  });

  it('should not navigate to invalid page', () => {
    component.filteredGachas = mockGachas;
    component.itemsPerPage = 1;
    component.currentPage = 1;
    component.goToPage(999);
    expect(component.currentPage).toBe(1);
  });

  it('should go to previous page', () => {
    component.currentPage = 3;
    component.previousPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not go below page 1', () => {
    component.currentPage = 1;
    component.previousPage();
    expect(component.currentPage).toBe(1);
  });

  it('should go to next page', () => {
    component.filteredGachas = mockGachas;
    component.itemsPerPage = 1;
    component.currentPage = 1;
    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not go beyond total pages', () => {
    component.filteredGachas = mockGachas;
    component.itemsPerPage = 1;
    component.currentPage = 3;
    component.nextPage();
    expect(component.currentPage).toBe(3);
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
    expect(component.gachas.find((g) => g.id === 1)).toBeUndefined();
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

  it('should get pagination info string', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Showing 1-3 of 3');
    component.filteredGachas = mockGachas;
    component.currentPage = 1;
    component.itemsPerPage = 20;
    const info = component.getPaginationInfo();
    expect(translateService.instant).toHaveBeenCalled();
  });
});
