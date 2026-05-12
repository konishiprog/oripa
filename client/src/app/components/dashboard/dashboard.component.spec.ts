import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import {
  CreateGachaComponent,
  GachaFormMode,
} from '../createGacha/createGacha.component';
import { GachaService } from '../../service/gacha.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { of, Subject } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockGachaService: any;
  let mockTranslateService: any;
  let mockMatDialog: any;
  let mockHttpClient: any;
  let mockSanitizer: any;
  let dialogAfterClosed: Subject<any>;

  const buildGacha = (overrides: Partial<any> = {}) => ({
    id: 1,
    name: 'Box A',
    headerImage: '/uploads/a.png',
    consumptionType: '',
    cost: 100,
    isPublic: true,
    publishStart: '2026-01-01',
    publishEnd: '2026-12-31',
    cards: 0,
    ...overrides,
  });

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
    ...overrides,
  });

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockGachaService = {
      getGachas: jest.fn().mockResolvedValue([]),
      deleteGacha: jest.fn().mockResolvedValue({}),
    };
    mockTranslateService = {
      instant: jest.fn(() => 'translated text'),
    };
    dialogAfterClosed = new Subject<any>();
    mockMatDialog = {
      open: jest.fn(() => ({
        afterClosed: () => dialogAfterClosed.asObservable(),
      })),
    };
    mockHttpClient = {
      get: jest.fn(() => of('<svg></svg>')),
    };
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((value: string) => value),
      bypassSecurityTrustUrl: jest.fn((value: string) => value),
    };

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: DomSanitizer, useValue: mockSanitizer },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty state and default pagination', () => {
    expect(component.gachas).toEqual([]);
    expect(component.filteredGachas).toEqual([]);
    expect(component.searchQuery).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(20);
  });

  it('should populate gachas from service and apply filters', async () => {
    mockGachaService.getGachas.mockResolvedValueOnce([
      buildServerGacha({ id: 1, name: 'Box A' }),
      buildServerGacha({ id: 2, name: 'Box B', isPublic: false }),
    ]);

    await component.loadGachas();

    expect(mockGachaService.getGachas).toHaveBeenCalled();
    expect(component.gachas.length).toBe(2);
    expect(component.gachas[0].name).toBe('Box A');
    expect(component.filteredGachas.length).toBe(2);
  });

  it('should log error when loadGachas service fails', async () => {
    mockGachaService.getGachas.mockRejectedValueOnce(new Error('API Error'));

    await component.loadGachas();

    expect(component.gachas).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('should return all gachas when filter query is empty', () => {
    component.gachas = [
      buildGacha({ id: 1, name: 'Spring Box' }),
      buildGacha({ id: 2, name: 'Summer Box' }),
    ];
    component.searchQuery = '';
    component.applyFilters();

    expect(component.filteredGachas.length).toBe(2);
  });

  it('should filter by name case-insensitively', () => {
    component.gachas = [
      buildGacha({ id: 1, name: 'Spring Box' }),
      buildGacha({ id: 2, name: 'Summer Box' }),
      buildGacha({ id: 3, name: 'Winter Set' }),
    ];
    component.searchQuery = 'box';
    component.applyFilters();

    expect(component.filteredGachas.length).toBe(2);
    expect(component.filteredGachas.map((g) => g.id)).toEqual([1, 2]);
  });

  it('should trim whitespace in filter query', () => {
    component.gachas = [
      buildGacha({ id: 1, name: 'Spring Box' }),
      buildGacha({ id: 3, name: 'Winter Set' }),
    ];
    component.searchQuery = '  Winter  ';
    component.applyFilters();

    expect(component.filteredGachas.length).toBe(1);
    expect(component.filteredGachas[0].id).toBe(3);
  });

  it('should return empty array when filter has no match', () => {
    component.gachas = [buildGacha({ id: 1, name: 'Box A' })];
    component.searchQuery = 'xyz';
    component.applyFilters();

    expect(component.filteredGachas).toEqual([]);
  });

  it('should reset currentPage to 1 on applyFilters', () => {
    component.gachas = [buildGacha({ id: 1 })];
    component.currentPage = 5;
    component.searchQuery = '';
    component.applyFilters();

    expect(component.currentPage).toBe(1);
  });

  it('should clear searchQuery and show all gachas on resetFilters', () => {
    component.gachas = [buildGacha({ id: 1 }), buildGacha({ id: 2 })];
    component.searchQuery = 'something';
    component.applyFilters();

    component.resetFilters();

    expect(component.searchQuery).toBe('');
    expect(component.filteredGachas.length).toBe(2);
  });

  it('should slice filteredGachas by current page', () => {
    component.gachas = Array.from({ length: 55 }, (_, i) =>
      buildGacha({ id: i + 1, name: `Box ${i + 1}` }),
    );
    component.applyFilters();
    component.currentPage = 1;

    expect(component.getDisplayedGachas().length).toBe(20);
    expect(component.getDisplayedGachas()[0].id).toBe(1);

    component.currentPage = 3;
    expect(component.getDisplayedGachas().length).toBe(15);
    expect(component.getDisplayedGachas()[0].id).toBe(41);
  });

  it('should compute total pages correctly', () => {
    component.gachas = Array.from({ length: 55 }, (_, i) =>
      buildGacha({ id: i + 1 }),
    );
    component.applyFilters();

    expect(component.getTotalPages()).toBe(3);
  });

  it('should not go below page 1 on previousPage', () => {
    component.currentPage = 1;
    component.previousPage();
    expect(component.currentPage).toBe(1);
  });

  it('should decrement currentPage on previousPage', () => {
    component.currentPage = 2;
    component.previousPage();
    expect(component.currentPage).toBe(1);
  });

  it('should not exceed total pages on nextPage', () => {
    component.gachas = Array.from({ length: 55 }, (_, i) =>
      buildGacha({ id: i + 1 }),
    );
    component.applyFilters();
    component.currentPage = 3;

    component.nextPage();

    expect(component.currentPage).toBe(3);
  });

  it('should increment currentPage on nextPage', () => {
    component.gachas = Array.from({ length: 55 }, (_, i) =>
      buildGacha({ id: i + 1 }),
    );
    component.applyFilters();
    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should ignore goToPage when out of range', () => {
    component.gachas = Array.from({ length: 55 }, (_, i) =>
      buildGacha({ id: i + 1 }),
    );
    component.applyFilters();
    component.currentPage = 2;

    component.goToPage(0);
    expect(component.currentPage).toBe(2);

    component.goToPage(99);
    expect(component.currentPage).toBe(2);
  });

  it('should jump to a valid page on goToPage', () => {
    component.gachas = Array.from({ length: 55 }, (_, i) =>
      buildGacha({ id: i + 1 }),
    );
    component.applyFilters();

    component.goToPage(3);

    expect(component.currentPage).toBe(3);
  });

  it('should return simple page list when total pages <= 5', () => {
    component.gachas = Array.from({ length: 40 }, (_, i) =>
      buildGacha({ id: i + 1 }),
    );
    component.applyFilters();

    expect(component.getPageNumbers()).toEqual([1, 2]);
  });

  it('should include ellipsis in page numbers when current page is far from edges', () => {
    component.gachas = Array.from({ length: 200 }, (_, i) =>
      buildGacha({ id: i + 1 }),
    );
    component.applyFilters();
    component.currentPage = 5;

    const pages = component.getPageNumbers();

    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(10);
    expect(pages).toContain('...');
  });

  it('should count total gachas correctly', () => {
    component.gachas = [buildGacha({ id: 1 }), buildGacha({ id: 2 })];

    expect(component.getTotalGachaCount()).toBe(2);
  });

  it('should count only public gachas', () => {
    component.gachas = [
      buildGacha({ id: 1, isPublic: true }),
      buildGacha({ id: 2, isPublic: false }),
      buildGacha({ id: 3, isPublic: true }),
    ];

    expect(component.getPublicGachaCount()).toBe(2);
  });

  it('should open edit dialog with Edit mode and gacha payload', () => {
    const gacha = buildGacha({ id: 1, name: 'Box A' });

    component.editGacha(gacha as any);

    expect(mockMatDialog.open).toHaveBeenCalledWith(CreateGachaComponent, {
      width: '500px',
      data: {
        mode: GachaFormMode.Edit,
        gacha: {
          id: gacha.id,
          name: gacha.name,
          headerImage: gacha.headerImage,
          cost: gacha.cost,
          isPublic: gacha.isPublic,
          publishStart: gacha.publishStart,
          publishEnd: gacha.publishEnd,
        },
      },
    });
  });

  it('should replace gacha in list when edit dialog returns result', () => {
    const gacha = buildGacha({ id: 1, name: 'Box A' });
    component.gachas = [gacha as any];

    component.editGacha(gacha as any);
    dialogAfterClosed.next({
      mode: 'edit',
      data: buildServerGacha({ id: 1, name: 'Box A Updated', cost: 250 }),
    });

    expect(component.gachas[0].name).toBe('Box A Updated');
    expect(component.gachas[0].cost).toBe(250);
    expect(component.filteredGachas[0].name).toBe('Box A Updated');
  });

  it('should not modify list when edit dialog is cancelled', () => {
    const gacha = buildGacha({ id: 1, name: 'Box A' });
    component.gachas = [gacha as any];

    component.editGacha(gacha as any);
    dialogAfterClosed.next(null);

    expect(component.gachas[0].name).toBe('Box A');
  });

  it('should not call deleteGacha API when confirm is cancelled', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.gachas = [buildGacha({ id: 1 })];

    await component.deleteGacha(component.gachas[0] as any);

    expect(mockGachaService.deleteGacha).not.toHaveBeenCalled();
    expect(component.gachas.length).toBe(1);
  });

  it('should call API and remove gacha from list when delete is confirmed', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.gachas = [
      buildGacha({ id: 1, name: 'Box A' }),
      buildGacha({ id: 2, name: 'Box B' }),
    ];

    await component.deleteGacha(component.gachas[0] as any);

    expect(mockGachaService.deleteGacha).toHaveBeenCalledWith(1);
    expect(component.gachas.length).toBe(1);
    expect(component.gachas[0].id).toBe(2);
  });

  it('should alert and keep gacha in list when delete API fails', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockGachaService.deleteGacha.mockRejectedValueOnce(new Error('API Error'));
    component.gachas = [buildGacha({ id: 1 })];

    await component.deleteGacha(component.gachas[0] as any);

    expect(alertSpy).toHaveBeenCalled();
    expect(component.gachas.length).toBe(1);
  });

  it('should open create dialog with Create mode', () => {
    component.createNewGacha();

    expect(mockMatDialog.open).toHaveBeenCalledWith(CreateGachaComponent, {
      width: '500px',
      data: { mode: GachaFormMode.Create },
    });
  });

  it('should append new gacha to list when create dialog returns result', async () => {
    component.gachas = [];

    component.createNewGacha();
    dialogAfterClosed.next({
      mode: 'create',
      data: buildServerGacha({ id: 10, name: 'New Box' }),
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(component.gachas.length).toBe(1);
    expect(component.gachas[0].id).toBe(10);
    expect(component.gachas[0].name).toBe('New Box');
  });

  it('should not modify list when create dialog returns null', async () => {
    component.gachas = [];

    component.createNewGacha();
    dialogAfterClosed.next(null);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(component.gachas.length).toBe(0);
  });
});
