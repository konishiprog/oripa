import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateGenreComponent, GenreFormMode } from './createGenre.component';
import { GenreService } from '../../service/genre.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

describe('CreateGenreComponent', () => {
  let component: CreateGenreComponent;
  let fixture: ComponentFixture<CreateGenreComponent>;
  let mockGenreService: any;
  let mockTranslateService: any;
  let mockDialogRef: any;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockGenreService = {
      createGenre: jest.fn().mockResolvedValue({
        id: '1',
        name: 'Test Genre',
      }),
      updateGenre: jest.fn().mockResolvedValue({
        id: '1',
        name: 'Test Genre Updated',
      }),
    };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key) => key),
    };
    mockDialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [CreateGenreComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGenreComponent);
    component = fixture.componentInstance;
    jest.spyOn(component['cdr'], 'detectChanges').mockImplementation(() => {});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form in Create mode', () => {
    expect(component.name).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.mode).toBe(GenreFormMode.Create);
  });

  it('should set mode and name from dialog data in Edit mode', () => {
    const dialogData = {
      mode: GenreFormMode.Edit,
      genre: {
        id: '1',
        name: 'Existing Genre',
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [CreateGenreComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGenreComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.mode).toBe(GenreFormMode.Edit);
    expect(component.name).toBe('Existing Genre');
  });

  it('should call createGenre on submit in Create mode', async () => {
    component.name = 'New Genre';
    component.mode = GenreFormMode.Create;

    await component.onSubmit();

    expect(mockGenreService.createGenre).toHaveBeenCalledWith({
      name: 'New Genre',
    });
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      mode: 'create',
      data: { id: '1', name: 'Test Genre' },
    });
  });

  it('should call updateGenre on submit in Edit mode', async () => {
    const dialogData = {
      mode: GenreFormMode.Edit,
      genre: {
        id: '1',
        name: 'Old Name',
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [CreateGenreComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGenreComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    component.name = 'Updated Name';

    await component.onSubmit();

    expect(mockGenreService.updateGenre).toHaveBeenCalledWith('1', {
      name: 'Updated Name',
    });
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      mode: 'edit',
      data: { id: '1', name: 'Test Genre Updated' },
    });
  });

  it('should show error when name is empty', async () => {
    component.name = '';

    await component.onSubmit();

    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'genre-create.error-required',
    );
    expect(mockGenreService.createGenre).not.toHaveBeenCalled();
  });

  it('should show error when name is whitespace only', async () => {
    component.name = '   ';

    await component.onSubmit();

    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'genre-create.error-required',
    );
    expect(mockGenreService.createGenre).not.toHaveBeenCalled();
  });

  it('should trim whitespace from name on submit', async () => {
    component.name = '  Test Genre  ';
    component.mode = GenreFormMode.Create;

    await component.onSubmit();

    expect(mockGenreService.createGenre).toHaveBeenCalledWith({
      name: 'Test Genre',
    });
  });

  it('should handle 409 conflict error with specific message', async () => {
    const conflictError = { status: 409 };
    mockGenreService.createGenre.mockRejectedValueOnce(conflictError);
    component.name = 'Duplicate Genre';
    component.mode = GenreFormMode.Create;

    await component.onSubmit();

    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'genre-create.error-name-exists',
    );
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should handle generic error', async () => {
    const error = new Error('API Error');
    mockGenreService.createGenre.mockRejectedValueOnce(error);
    component.name = 'New Genre';
    component.mode = GenreFormMode.Create;

    await component.onSubmit();

    expect(mockTranslateService.instant).toHaveBeenCalledWith(
      'genre-create.error',
    );
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should set isLoading to false after successful submit', async () => {
    component.name = 'New Genre';
    component.mode = GenreFormMode.Create;

    expect(component.isLoading).toBe(false);
    const submitPromise = component.onSubmit();
    expect(component.isLoading).toBe(true);
    await submitPromise;
    expect(component.isLoading).toBe(false);
  });

  it('should set isLoading to false after error', async () => {
    mockGenreService.createGenre.mockRejectedValueOnce(new Error('API Error'));
    component.name = 'New Genre';
    component.mode = GenreFormMode.Create;

    expect(component.isLoading).toBe(false);
    const submitPromise = component.onSubmit();
    expect(component.isLoading).toBe(true);
    await submitPromise;
    expect(component.isLoading).toBe(false);
  });

  it('should close dialog without data on onClose', () => {
    component.onClose();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should return correct isEditMode getter', () => {
    component.mode = GenreFormMode.Create;
    expect(component.isEditMode).toBe(false);

    component.mode = GenreFormMode.Edit;
    expect(component.isEditMode).toBe(true);
  });

  it('should set translate language on init', () => {
    component.ngOnInit();

    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('ja');
    expect(mockTranslateService.use).toHaveBeenCalledWith('ja');
  });
});
