import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GenreTableComponent } from './genreTable.component';
import { GenreService } from '../../service/genre.service';
import { CreateGenreComponent, GenreFormMode } from '../createGenre/createGenre.component';
import { of } from 'rxjs';

describe('GenreTableComponent', () => {
  let component: GenreTableComponent;
  let fixture: ComponentFixture<GenreTableComponent>;
  let genreService: any;
  let translateService: TranslateService;
  let dialog: MatDialog;

  const mockGenres = [
    { id: 'genre-1', name: 'Action' },
    { id: 'genre-2', name: 'Adventure' },
    { id: 'genre-3', name: 'Comedy' },
    { id: 'genre-4', name: 'Drama' },
    { id: 'genre-5', name: 'Fantasy' },
  ];

  beforeEach(async () => {
    const deleteGenreMock = jest.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      declarations: [GenreTableComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: GenreService,
          useValue: { deleteGenre: deleteGenreMock },
        },
      ],
    }).compileComponents();

    genreService = TestBed.inject(GenreService) as any;
    translateService = TestBed.inject(TranslateService);
    dialog = TestBed.inject(MatDialog);

    fixture = TestBed.createComponent(GenreTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.genres).toEqual([]);
    expect(component.filteredGenres).toEqual([]);
    expect(component.searchQuery).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(20);
  });

  it('should apply filters on init', () => {
    jest.spyOn(component, 'applyFilters');
    component.ngOnInit();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should apply filters when genres input changes', () => {
    jest.spyOn(component, 'applyFilters');
    const changes = { genres: { currentValue: mockGenres } } as any;
    component.ngOnChanges(changes);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should not apply filters when other inputs change', () => {
    jest.spyOn(component, 'applyFilters');
    const changes = { otherProp: { currentValue: 'value' } } as any;
    component.ngOnChanges(changes);
    expect(component.applyFilters).not.toHaveBeenCalled();
  });

  it('should filter genres by search query', () => {
    component.genres = mockGenres;
    component.searchQuery = 'action';
    component.applyFilters();

    expect(component.filteredGenres).toHaveLength(1);
    expect(component.filteredGenres[0].name).toBe('Action');
  });

  it('should be case insensitive for search', () => {
    component.genres = mockGenres;
    component.searchQuery = 'ADVENTURE';
    component.applyFilters();

    expect(component.filteredGenres).toHaveLength(1);
    expect(component.filteredGenres[0].name).toBe('Adventure');
  });

  it('should return all genres when search query is empty', () => {
    component.genres = mockGenres;
    component.searchQuery = '';
    component.applyFilters();

    expect(component.filteredGenres).toEqual(mockGenres);
  });

  it('should trim whitespace from search query', () => {
    component.genres = mockGenres;
    component.searchQuery = '  comedy  ';
    component.applyFilters();

    expect(component.filteredGenres).toHaveLength(1);
    expect(component.filteredGenres[0].name).toBe('Comedy');
  });

  it('should return empty array when search has no matches', () => {
    component.genres = mockGenres;
    component.searchQuery = 'nonexistent';
    component.applyFilters();

    expect(component.filteredGenres).toEqual([]);
  });

  it('should reset page to 1 when filters are applied', () => {
    component.genres = mockGenres;
    component.currentPage = 5;
    component.applyFilters();

    expect(component.currentPage).toBe(1);
  });

  it('should update search query and apply filters on onSearchInput', () => {
    jest.spyOn(component, 'applyFilters');
    component.genres = mockGenres;
    component.onSearchInput('drama');

    expect(component.searchQuery).toBe('drama');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should get displayed genres based on current page', () => {
    component.genres = mockGenres;
    component.itemsPerPage = 2;
    component.applyFilters();

    component.currentPage = 1;
    expect(component.getDisplayedGenres()).toHaveLength(2);
    expect(component.getDisplayedGenres()[0].name).toBe('Action');

    component.currentPage = 2;
    expect(component.getDisplayedGenres()).toHaveLength(2);
    expect(component.getDisplayedGenres()[0].name).toBe('Comedy');

    component.currentPage = 3;
    expect(component.getDisplayedGenres()).toHaveLength(1);
    expect(component.getDisplayedGenres()[0].name).toBe('Fantasy');
  });

  it('should change current page on onPageChange', () => {
    component.onPageChange(3);
    expect(component.currentPage).toBe(3);
  });

  it('should change items per page and reset to page 1 on onItemsPerPageChange', () => {
    component.currentPage = 5;
    component.onItemsPerPageChange(50);

    expect(component.itemsPerPage).toBe(50);
    expect(component.currentPage).toBe(1);
  });

  it('should open edit dialog with genre data', () => {
    const dialogSpy = jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);

    component.editGenre(mockGenres[0]);

    expect(dialogSpy).toHaveBeenCalledWith(CreateGenreComponent, {
      width: '480px',
      data: { mode: GenreFormMode.Edit, genre: mockGenres[0] },
    });
  });

  it('should emit genresUpdated when edit dialog closes with success', (done) => {
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ mode: 'edit', data: { id: 'genre-1', name: 'Updated' } }),
    } as any);

    component.genresUpdated.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    component.editGenre(mockGenres[0]);
  });

  it('should not emit genresUpdated when edit dialog is closed without save', (done) => {
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);

    const emitSpy = jest.spyOn(component.genresUpdated, 'emit');

    component.editGenre(mockGenres[0]);

    setTimeout(() => {
      expect(emitSpy).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should call genreService.deleteGenre and emit genresUpdated on successful delete', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const emitSpy = jest.spyOn(component.genresUpdated, 'emit');

    await component.deleteGenre(mockGenres[0]);

    expect(genreService.deleteGenre).toHaveBeenCalledWith('genre-1');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not call deleteGenre when user cancels confirm dialog', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    await component.deleteGenre(mockGenres[0]);

    expect(genreService.deleteGenre).not.toHaveBeenCalled();
  });

  it('should show delete confirmation with genre name', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const instantSpy = jest.spyOn(translateService, 'instant').mockReturnValue('Delete?');

    await component.deleteGenre(mockGenres[0]);

    expect(instantSpy).toHaveBeenCalledWith(
      'dashboard.delete-confirm-genre',
      { name: mockGenres[0].name },
    );
    expect(confirmSpy).toHaveBeenCalledWith('Delete?');
  });

  it('should handle delete error and show alert', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const deleteError = new Error('API Error');
    genreService.deleteGenre.mockRejectedValueOnce(deleteError);

    const instantSpy = jest.spyOn(translateService, 'instant');
    await component.deleteGenre(mockGenres[0]);

    expect(instantSpy).toHaveBeenCalledWith('dashboard.delete-error');
  });

  it('should call cdr.markForCheck after successful delete', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const cdrSpy = jest.spyOn(component['cdr'], 'markForCheck');

    await component.deleteGenre(mockGenres[0]);

    expect(cdrSpy).toHaveBeenCalled();
  });

  it('should call cdr.markForCheck after successful edit', (done) => {
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ mode: 'edit', data: { id: 'genre-1', name: 'Updated' } }),
    } as any);

    const cdrSpy = jest.spyOn(component['cdr'], 'markForCheck');

    component.editGenre(mockGenres[0]);

    setTimeout(() => {
      expect(cdrSpy).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle multiple genres with pagination correctly', () => {
    const manyGenres = Array.from({ length: 50 }, (_, i) => ({
      id: `genre-${i + 1}`,
      name: `Genre ${i + 1}`,
    }));

    component.genres = manyGenres;
    component.itemsPerPage = 10;
    component.applyFilters();

    expect(component.filteredGenres).toHaveLength(50);

    component.currentPage = 1;
    expect(component.getDisplayedGenres()).toHaveLength(10);

    component.currentPage = 5;
    expect(component.getDisplayedGenres()).toHaveLength(10);

    component.currentPage = 6;
    expect(component.getDisplayedGenres()).toHaveLength(0);
  });

  it('should filter and paginate correctly together', () => {
    const genresWithPrefix = Array.from({ length: 30 }, (_, i) => ({
      id: `genre-${i + 1}`,
      name: `Action ${i + 1}`,
    }));

    component.genres = genresWithPrefix;
    component.searchQuery = 'action';
    component.itemsPerPage = 5;
    component.applyFilters();

    expect(component.filteredGenres).toHaveLength(30);

    component.currentPage = 1;
    expect(component.getDisplayedGenres()).toHaveLength(5);

    component.currentPage = 6;
    expect(component.getDisplayedGenres()).toHaveLength(5);
  });
});
