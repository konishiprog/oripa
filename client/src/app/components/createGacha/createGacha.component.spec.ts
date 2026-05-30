import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateGachaComponent, GachaFormMode } from './createGacha.component';
import { GachaService } from '../../service/gacha.service';
import { GenreService } from '../../service/genre.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ApiConfigService } from '../../service/api-config.service';
import { of } from 'rxjs';

describe('CreateGachaComponent', () => {
  let component: CreateGachaComponent;
  let fixture: ComponentFixture<CreateGachaComponent>;
  let mockGachaService: any;
  let mockGenreService: any;
  let mockTranslateService: any;
  let mockDialogRef: any;
  let mockSanitizer: any;
  let mockApiConfigService: any;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockGachaService = {
      createGacha: jest.fn().mockResolvedValue({
        data: { id: 1, name: 'Test Gacha', cardsCount: 0 },
      }),
      updateGacha: jest.fn().mockResolvedValue({
        data: { id: 1, name: 'Test Gacha Updated', cardsCount: 0 },
      }),
    };
    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key) => key),
      get: jest.fn((key) => of({ [key]: key })),
      currentLanguage: 'ja',
    };
    mockDialogRef = { close: jest.fn() };
    mockSanitizer = {
      bypassSecurityTrustUrl: jest.fn((value) => value),
      bypassSecurityTrustHtml: jest.fn((value) => value),
    };
    mockApiConfigService = { domain: 'http://localhost:3000' };
    mockGenreService = {
      getAllGenres: jest.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      declarations: [CreateGachaComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: ApiConfigService, useValue: mockApiConfigService },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGachaComponent);
    component = fixture.componentInstance;
    jest.spyOn(component['cdr'], 'detectChanges').mockImplementation(() => {});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form in Create mode', () => {
    expect(component.name).toBe('');
    expect(component.cost).toBeNull();
    expect(component.publishStart).toBe('');
    expect(component.publishEnd).toBe('');
    expect(component.isPublic).toBe(false);
    expect(component.mode).toBe(GachaFormMode.Create);
  });

  it('should set mode from dialog data', () => {
    component.ngOnInit();
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('ja');
    expect(mockTranslateService.use).toHaveBeenCalledWith('ja');
  });

  it('should prefill fields in Edit mode with gacha data', () => {
    const dialogData = {
      mode: GachaFormMode.Edit,
      gacha: {
        id: 1,
        name: 'Box A',
        headerImage: '/uploads/a.png',
        cost: 100,
        isPublic: true,
        publishStart: '2026-01-01',
        publishEnd: '2026-12-31',
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [CreateGachaComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: ApiConfigService, useValue: mockApiConfigService },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGachaComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.mode).toBe(GachaFormMode.Edit);
    expect(component.name).toBe('Box A');
    expect(component.cost).toBe(100);
    expect(component.isPublic).toBe(true);
    expect(component.publishStart).toBe('2026-01-01');
    expect(component.publishEnd).toBe('2026-12-31');
  });

  it('should handle ISO date format in Edit mode', () => {
    const dialogData = {
      mode: GachaFormMode.Edit,
      gacha: {
        id: 1,
        name: 'Box',
        headerImage: '',
        cost: 100,
        isPublic: false,
        publishStart: '2026-01-01T00:00:00Z',
        publishEnd: '2026-12-31T23:59:59Z',
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [CreateGachaComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: ApiConfigService, useValue: mockApiConfigService },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGachaComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.publishStart).toBe('2026-01-01');
    expect(component.publishEnd).toBe('2026-12-31');
  });

  it('should set headerImagePreview from absolute URL', () => {
    const dialogData = {
      mode: GachaFormMode.Edit,
      gacha: {
        id: 1,
        name: 'Box',
        headerImage: 'http://example.com/image.png',
        cost: 100,
        isPublic: false,
        publishStart: '2026-01-01',
        publishEnd: '2026-12-31',
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [CreateGachaComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: ApiConfigService, useValue: mockApiConfigService },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGachaComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(
      'http://example.com/image.png',
    );
  });

  it('should prepend domain to relative image URL', () => {
    const dialogData = {
      mode: GachaFormMode.Edit,
      gacha: {
        id: 1,
        name: 'Box',
        headerImage: '/uploads/a.png',
        cost: 100,
        isPublic: false,
        publishStart: '2026-01-01',
        publishEnd: '2026-12-31',
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [CreateGachaComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: GachaService, useValue: mockGachaService },
        { provide: GenreService, useValue: mockGenreService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: ApiConfigService, useValue: mockApiConfigService },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGachaComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(
      'http://localhost:3000/uploads/a.png',
    );
  });

  it('should return false for isEditMode in Create mode', () => {
    component.mode = GachaFormMode.Create;
    expect(component.isEditMode).toBe(false);
  });

  it('should return true for isEditMode in Edit mode', () => {
    component.mode = GachaFormMode.Edit;
    expect(component.isEditMode).toBe(true);
  });

  it('should clear headerImageFile and preview when no file selected', () => {
    const event = { target: { files: [] } };
    component.headerImageFile = new File(['test'], 'test.jpg');
    component.headerImagePreview = 'data:image/png;base64,abc' as any;

    component.onFileSelected(event);

    expect(component.headerImageFile).toBeNull();
    expect(component.headerImagePreview).toBeNull();
  });

  it('should reject non-image files on onFileSelected', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file], value: '' } };

    component.onFileSelected(event);

    expect(component.headerImageFile).toBeNull();
    expect(component.errorMessage).toBe('gacha-create.error-invalid-image');
    expect(event.target.value).toBe('');
  });

  it('should accept image files and set preview', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.headerImageFile).toBe(file);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalled();
  });

  it('should show error when required fields are missing on Create submit', async () => {
    component.mode = GachaFormMode.Create;
    component.name = '';
    component.cost = 100;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';
    component.headerImageFile = null;

    await component.onSubmit();

    expect(component.errorMessage).toBe('gacha-create.error-required');
    expect(mockGachaService.createGacha).not.toHaveBeenCalled();
  });

  it('should show error when cost is negative', async () => {
    component.mode = GachaFormMode.Create;
    component.name = 'Box';
    component.cost = -10;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';
    component.headerImageFile = new File(['test'], 'test.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('gacha-create.error-cost');
    expect(mockGachaService.createGacha).not.toHaveBeenCalled();
  });

  it('should show error when publishEnd is before publishStart', async () => {
    component.mode = GachaFormMode.Create;
    component.name = 'Box';
    component.cost = 100;
    component.publishStart = '2026-12-31';
    component.publishEnd = '2026-01-01';
    component.headerImageFile = new File(['test'], 'test.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('gacha-create.error-date-range');
    expect(mockGachaService.createGacha).not.toHaveBeenCalled();
  });

  it('should call createGacha and close dialog on success', async () => {
    component.mode = GachaFormMode.Create;
    component.name = 'Box A';
    component.cost = 100;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';
    component.isPublic = true;
    component.headerImageFile = new File(['test'], 'test.jpg', {
      type: 'image/jpeg',
    });

    await component.onSubmit();

    expect(mockGachaService.createGacha).toHaveBeenCalledWith({
      name: 'Box A',
      genreId: null,
      consumptionType: 'COIN',
      cost: 100,
      oncePerUser: false,
      publishStart: '2026-01-01',
      publishEnd: '2026-12-31',
      isPublic: true,
      headerImageFile: component.headerImageFile,
    });
    expect(component.successMessage).toBe('gacha-create.success');
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      mode: 'create',
      data: { id: 1, name: 'Test Gacha', cardsCount: 0 },
    });
  });

  it('should show error-name-exists on 409 conflict during create', async () => {
    mockGachaService.createGacha.mockRejectedValueOnce({ status: 409 });
    component.mode = GachaFormMode.Create;
    component.name = 'Existing Box';
    component.cost = 100;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';
    component.headerImageFile = new File(['test'], 'test.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('gacha-create.error-name-exists');
    expect(component.isLoading).toBe(false);
  });

  it('should show generic error on other API errors during create', async () => {
    mockGachaService.createGacha.mockRejectedValueOnce(new Error('API Error'));
    component.mode = GachaFormMode.Create;
    component.name = 'Box';
    component.cost = 100;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';
    component.headerImageFile = new File(['test'], 'test.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('gacha-create.error');
    expect(component.isLoading).toBe(false);
  });

  it('should allow submission without new image in edit mode', async () => {
    component.mode = GachaFormMode.Edit;
    (component as any).editingGachaId = 1;
    component.name = 'Box Updated';
    component.cost = 150;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';
    component.headerImageFile = null;

    await component.onSubmit();

    expect(mockGachaService.updateGacha).toHaveBeenCalledWith(1, {
      name: 'Box Updated',
      genreId: null,
      consumptionType: 'COIN',
      cost: 150,
      oncePerUser: false,
      publishStart: '2026-01-01',
      publishEnd: '2026-12-31',
      isPublic: false,
      headerImageFile: null,
    });
  });

  it('should call updateGacha with new image if provided', async () => {
    const newFile = new File(['new'], 'new.jpg', { type: 'image/jpeg' });
    component.mode = GachaFormMode.Edit;
    (component as any).editingGachaId = 1;
    component.name = 'Box Updated';
    component.cost = 150;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';
    component.headerImageFile = newFile;
    component.isPublic = true;

    await component.onSubmit();

    expect(mockGachaService.updateGacha).toHaveBeenCalledWith(1, {
      name: 'Box Updated',
      genreId: null,
      consumptionType: 'COIN',
      cost: 150,
      oncePerUser: false,
      publishStart: '2026-01-01',
      publishEnd: '2026-12-31',
      isPublic: true,
      headerImageFile: newFile,
    });
    expect(component.successMessage).toBe('gacha-create.success-edit');
  });

  it('should show error when editingGachaId is null during edit', async () => {
    component.mode = GachaFormMode.Edit;
    (component as any).editingGachaId = null;
    component.name = 'Box';
    component.cost = 100;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';

    await component.onSubmit();

    expect(component.errorMessage).toBe('gacha-create.error');
    expect(mockGachaService.updateGacha).not.toHaveBeenCalled();
  });

  it('should show error-name-exists on 409 conflict during edit', async () => {
    mockGachaService.updateGacha.mockRejectedValueOnce({ status: 409 });
    component.mode = GachaFormMode.Edit;
    (component as any).editingGachaId = 1;
    component.name = 'Duplicate Name';
    component.cost = 100;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';

    await component.onSubmit();

    expect(component.errorMessage).toBe('gacha-create.error-name-exists');
  });

  it('should close dialog with edit result on success', async () => {
    component.mode = GachaFormMode.Edit;
    (component as any).editingGachaId = 1;
    component.name = 'Updated Box';
    component.cost = 200;
    component.publishStart = '2026-01-01';
    component.publishEnd = '2026-12-31';

    await component.onSubmit();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      mode: 'edit',
      data: { id: 1, name: 'Test Gacha Updated', cardsCount: 0 },
    });
  });

  it('should close dialog without result on onClose', () => {
    component.onClose();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});
