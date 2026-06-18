import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { UserGachaPageComponent } from './userGachaPage.component';
import { GachaService } from '../../service/gacha.service';
import { GenreService } from '../../service/genre.service';
import { UserService } from '../../service/user.service';

describe('UserGachaPageComponent', () => {
  let component: UserGachaPageComponent;
  let fixture: ComponentFixture<UserGachaPageComponent>;
  let gachaService: jest.Mocked<GachaService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const gachaSpy = {
      getGachas: jest.fn<Promise<any[]>, []>(),
    };
    const genreSpy = {
      getAllGenres: jest.fn<Promise<any[]>, []>().mockResolvedValue([]),
    };
    const userSpy = {
      isLoggedIn: jest.fn<boolean, []>(),
      getUserId: jest.fn<string | null, []>().mockReturnValue(null),
      clearUserId: jest.fn<void, []>(),
      clearCoin: jest.fn<void, []>(),
    };

    await TestBed.configureTestingModule({
      declarations: [UserGachaPageComponent],
      imports: [TranslateModule.forRoot(), MatDialogModule],
      providers: [
        { provide: GachaService, useValue: gachaSpy },
        { provide: GenreService, useValue: genreSpy },
        { provide: UserService, useValue: userSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    gachaService = TestBed.inject(GachaService) as jest.Mocked<GachaService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;

    fixture = TestBed.createComponent(UserGachaPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading).toBe(true);
    expect(component.gachas.length).toBe(0);
  });

  it('should load gachas on init', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Test Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        remainingCount: 5,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.gachas.length).toBe(1);
    expect(component.gachas[0].remainingCount).toBe(5);
    expect(component.isLoading).toBe(false);
  });

  it('should default remainingCount to 0 when API does not return it', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Test Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.gachas[0].remainingCount).toBe(0);
  });

  it('should filter only public gachas', async () => {
    const mockGachas = [
      {
        id: 1,
        name: 'Public Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        remainingCount: 3,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
      {
        id: 2,
        name: 'Private Gacha',
        headerImage: 'test.jpg',
        cost: 100,
        remainingCount: 3,
        isPublic: false,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.gachas.length).toBe(1);
    expect(component.gachas[0].name).toBe('Public Gacha');
  });

  it('should preserve the order returned by the service (server sorts)', async () => {
    const mockGachas = [
      {
        id: 3,
        name: 'Newest',
        headerImage: '',
        cost: 100,
        remainingCount: 1,
        isPublic: true,
        publishStart: '2026-01-03',
        publishEnd: null,
      },
      {
        id: 2,
        name: 'Mid',
        headerImage: '',
        cost: 100,
        remainingCount: 1,
        isPublic: true,
        publishStart: '2026-01-02',
        publishEnd: null,
      },
      {
        id: 1,
        name: 'Old',
        headerImage: '',
        cost: 100,
        remainingCount: 1,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: null,
      },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.gachas.map((gacha) => gacha.id)).toEqual([3, 2, 1]);
  });

  it('should handle error when loading gachas fails', async () => {
    gachaService.getGachas.mockRejectedValue(new Error('API Error'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isLoading).toBe(false);
    expect(component.gachas.length).toBe(0);
  });

  it('selectGenre should update selectedGenreId', () => {
    component.selectGenre('genre-1');
    expect(component.selectedGenreId).toBe('genre-1');
  });

  it('filteredAndSortedGachas should return all gachas when no genre selected', async () => {
    const mockGachas = [
      { id: '1', name: 'A', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-01', publishEnd: null, genreId: 'genre-1' },
      { id: '2', name: 'B', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-02', publishEnd: null, genreId: 'genre-2' },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    component.selectedGenreId = '';
    expect(component.filteredAndSortedGachas.length).toBe(2);
  });

  it('filteredAndSortedGachas should filter by selected genre', async () => {
    const mockGachas = [
      { id: '1', name: 'A', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-01', publishEnd: null, genreId: 'genre-1' },
      { id: '2', name: 'B', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-02', publishEnd: null, genreId: 'genre-2' },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    component.selectGenre('genre-1');
    expect(component.filteredAndSortedGachas.length).toBe(1);
    expect(component.filteredAndSortedGachas[0].id).toBe('1');
  });

  it('filteredAndSortedGachas should sort by cost-high', async () => {
    const mockGachas = [
      { id: '1', name: 'Cheap', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-01', publishEnd: null },
      { id: '2', name: 'Expensive', headerImage: '', consumptionType: 'COIN', cost: 1000, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-02', publishEnd: null },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    component.sortOrder = 'cost-high';
    const sorted = component.filteredAndSortedGachas;
    expect(sorted[0].cost).toBe(1000);
    expect(sorted[1].cost).toBe(100);
  });

  it('filteredAndSortedGachas should sort by cost-low', async () => {
    const mockGachas = [
      { id: '1', name: 'Expensive', headerImage: '', consumptionType: 'COIN', cost: 1000, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-01', publishEnd: null },
      { id: '2', name: 'Cheap', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-02', publishEnd: null },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    component.sortOrder = 'cost-low';
    const sorted = component.filteredAndSortedGachas;
    expect(sorted[0].cost).toBe(100);
  });

  it('filteredAndSortedGachas should sort by remaining-high', async () => {
    const mockGachas = [
      { id: '1', name: 'Few', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 2, isPublic: true, publishStart: '2026-01-01', publishEnd: null },
      { id: '2', name: 'Many', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 10, isPublic: true, publishStart: '2026-01-02', publishEnd: null },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    component.sortOrder = 'remaining-high';
    expect(component.filteredAndSortedGachas[0].remainingCount).toBe(10);
  });

  it('filteredAndSortedGachas should sort by remaining-low', async () => {
    const mockGachas = [
      { id: '1', name: 'Many', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 10, isPublic: true, publishStart: '2026-01-01', publishEnd: null },
      { id: '2', name: 'Few', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 2, isPublic: true, publishStart: '2026-01-02', publishEnd: null },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    component.sortOrder = 'remaining-low';
    expect(component.filteredAndSortedGachas[0].remainingCount).toBe(2);
  });

  it('filteredAndSortedGachas should put expired gachas at end', async () => {
    const mockGachas = [
      { id: '1', name: 'Active', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2026-01-02', publishEnd: null },
      { id: '2', name: 'Expired', headerImage: '', consumptionType: 'COIN', cost: 100, oncePerUser: false, alreadyDrawn: false, remainingCount: 1, isPublic: true, publishStart: '2020-01-01', publishEnd: '2020-12-31T00:00:00Z' },
    ];
    gachaService.getGachas.mockResolvedValue(mockGachas);
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    const sorted = component.filteredAndSortedGachas;
    expect(sorted[0].name).toBe('Active');
    expect(sorted[1].name).toBe('Expired');
  });
});
