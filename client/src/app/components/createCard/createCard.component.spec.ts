import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCardComponent } from './createCard.component';
import { CardService } from '../../service/card.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('CreateCardComponent', () => {
  let component: CreateCardComponent;
  let fixture: ComponentFixture<CreateCardComponent>;
  let mockCardService: any;
  let mockTranslateService: any;
  let mockDialogRef: any;
  let mockSanitizer: any;

  const dialogData = { gachaId: 1, gachaName: 'Test Gacha' };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockCardService = {
      createCard: jest.fn().mockResolvedValue({
        data: {
          id: 1,
          gachaId: 1,
          name: 'Test Card',
          cardType: 'SSR',
          exchangeType: 'SHIPPING_ONLY',
          isDrawn: false,
        },
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

    await TestBed.configureTestingModule({
      declarations: [CreateCardComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: CardService, useValue: mockCardService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCardComponent);
    component = fixture.componentInstance;
    jest.spyOn(component['cdr'], 'detectChanges').mockImplementation(() => {});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.name).toBe('');
    expect(component.cardType).toBe('SSR');
    expect(component.exchangeType).toBe('SHIPPING_ONLY');
    expect(component.imageFrontFile).toBeNull();
    expect(component.imageFrontPreview).toBeNull();
    expect(component.imageBackFile).toBeNull();
    expect(component.imageBackPreview).toBeNull();
    expect(component.isLoading).toBe(false);
  });

  it('should set translation language on ngOnInit', () => {
    component.ngOnInit();
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('ja');
    expect(mockTranslateService.use).toHaveBeenCalledWith('ja');
  });

  it('should receive gacha data from dialog', () => {
    expect(component.data.gachaId).toBe(1);
    expect(component.data.gachaName).toBe('Test Gacha');
  });

  it('should have all 5 card types defined', () => {
    expect(component.cardTypes.length).toBe(5);
    expect(component.cardTypes.map((cardType) => cardType.value)).toEqual([
      'SSR',
      'SR',
      'R',
      'N',
      'LAST',
    ]);
  });

  it('should have 2 exchange types defined', () => {
    expect(component.exchangeTypes.length).toBe(2);
    expect(
      component.exchangeTypes.map((exchangeType) => exchangeType.value),
    ).toEqual(['SHIPPING_ONLY', 'BOTH']);
  });

  it('should clear imageFrontFile and preview when no file selected', () => {
    const event = { target: { files: [] } };
    component.imageFrontFile = new File(['test'], 'test.jpg');
    component.imageFrontPreview = 'data:image/png;base64,abc' as any;

    component.onImageFrontSelected(event);

    expect(component.imageFrontFile).toBeNull();
    expect(component.imageFrontPreview).toBeNull();
  });

  it('should reject non-image files on onImageFrontSelected', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file], value: '' } };

    component.onImageFrontSelected(event);

    expect(component.imageFrontFile).toBeNull();
    expect(component.errorMessage).toBe('card-create.error-invalid-image');
    expect(event.target.value).toBe('');
  });

  it('should accept image files and set imageFront preview', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onImageFrontSelected(event);

    expect(component.imageFrontFile).toBe(file);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalled();
  });

  it('should clear imageBackFile and preview when no file selected', () => {
    const event = { target: { files: [] } };
    component.imageBackFile = new File(['test'], 'test.jpg');
    component.imageBackPreview = 'data:image/png;base64,abc' as any;

    component.onImageBackSelected(event);

    expect(component.imageBackFile).toBeNull();
    expect(component.imageBackPreview).toBeNull();
  });

  it('should reject non-image files on onImageBackSelected', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file], value: '' } };

    component.onImageBackSelected(event);

    expect(component.imageBackFile).toBeNull();
    expect(component.errorMessage).toBe('card-create.error-invalid-image');
    expect(event.target.value).toBe('');
  });

  it('should accept image files and set imageBack preview', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onImageBackSelected(event);

    expect(component.imageBackFile).toBe(file);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalled();
  });

  it('should show error when name is missing on submit', async () => {
    component.name = '';
    component.cardType = 'SSR';
    component.exchangeType = 'SHIPPING_ONLY';
    component.imageFrontFile = new File(['front'], 'front.jpg');
    component.imageBackFile = new File(['back'], 'back.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('card-create.error-required');
    expect(mockCardService.createCard).not.toHaveBeenCalled();
  });

  it('should show error when cardType is missing on submit', async () => {
    component.name = 'Test Card';
    component.cardType = '';
    component.exchangeType = 'SHIPPING_ONLY';
    component.imageFrontFile = new File(['front'], 'front.jpg');
    component.imageBackFile = new File(['back'], 'back.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('card-create.error-required');
    expect(mockCardService.createCard).not.toHaveBeenCalled();
  });

  it('should show error when exchangeType is missing on submit', async () => {
    component.name = 'Test Card';
    component.cardType = 'SSR';
    component.exchangeType = '';
    component.imageFrontFile = new File(['front'], 'front.jpg');
    component.imageBackFile = new File(['back'], 'back.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('card-create.error-required');
    expect(mockCardService.createCard).not.toHaveBeenCalled();
  });

  it('should show error when imageFrontFile is missing on submit', async () => {
    component.name = 'Test Card';
    component.cardType = 'SSR';
    component.exchangeType = 'SHIPPING_ONLY';
    component.imageFrontFile = null;
    component.imageBackFile = new File(['back'], 'back.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('card-create.error-required');
    expect(mockCardService.createCard).not.toHaveBeenCalled();
  });

  it('should show error when imageBackFile is missing on submit', async () => {
    component.name = 'Test Card';
    component.cardType = 'SSR';
    component.exchangeType = 'SHIPPING_ONLY';
    component.imageFrontFile = new File(['front'], 'front.jpg');
    component.imageBackFile = null;

    await component.onSubmit();

    expect(component.errorMessage).toBe('card-create.error-required');
    expect(mockCardService.createCard).not.toHaveBeenCalled();
  });

  it('should call createCard and close dialog on success', async () => {
    const frontFile = new File(['front'], 'front.jpg', { type: 'image/jpeg' });
    const backFile = new File(['back'], 'back.jpg', { type: 'image/jpeg' });
    component.name = 'Test Card';
    component.cardType = 'SSR';
    component.exchangeType = 'SHIPPING_ONLY';
    component.exchangePoints = null;
    component.imageFrontFile = frontFile;
    component.imageBackFile = backFile;

    await component.onSubmit();

    expect(mockCardService.createCard).toHaveBeenCalledWith({
      gachaId: 1,
      name: 'Test Card',
      cardType: 'SSR',
      exchangeType: 'SHIPPING_ONLY',
      exchangePoints: null,
      imageFrontFile: frontFile,
      imageBackFile: backFile,
    });
    expect(component.successMessage).toBe('card-create.success');
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      mode: 'create',
      data: {
        id: 1,
        gachaId: 1,
        name: 'Test Card',
        cardType: 'SSR',
        exchangeType: 'SHIPPING_ONLY',
        isDrawn: false,
      },
    });
  });

  it('should show generic error on API failure during submit', async () => {
    mockCardService.createCard.mockRejectedValueOnce(new Error('API Error'));
    component.name = 'Test Card';
    component.cardType = 'SSR';
    component.exchangeType = 'SHIPPING_ONLY';
    component.imageFrontFile = new File(['front'], 'front.jpg');
    component.imageBackFile = new File(['back'], 'back.jpg');

    await component.onSubmit();

    expect(component.errorMessage).toBe('card-create.error');
    expect(component.isLoading).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should set isLoading during submit', async () => {
    let resolveCreate: any;
    mockCardService.createCard.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );
    component.name = 'Test Card';
    component.cardType = 'SSR';
    component.exchangeType = 'SHIPPING_ONLY';
    component.imageFrontFile = new File(['front'], 'front.jpg');
    component.imageBackFile = new File(['back'], 'back.jpg');

    const submitPromise = component.onSubmit();
    expect(component.isLoading).toBe(true);

    resolveCreate({
      data: {
        id: 1,
        gachaId: 1,
        name: 'Test Card',
        cardType: 'SSR',
        exchangeType: 'SHIPPING_ONLY',
        isDrawn: false,
      },
    });
    await submitPromise;
    expect(component.isLoading).toBe(false);
  });

  it('should reset success and error messages before submit', async () => {
    component.successMessage = 'previous success';
    component.errorMessage = 'previous error';
    component.name = 'Test Card';
    component.cardType = 'SSR';
    component.exchangeType = 'SHIPPING_ONLY';
    component.imageFrontFile = new File(['front'], 'front.jpg');
    component.imageBackFile = new File(['back'], 'back.jpg');

    await component.onSubmit();

    expect(component.successMessage).toBe('card-create.success');
  });

  it('should close dialog without result on onClose', () => {
    component.onClose();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});
