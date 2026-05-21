import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ShippingCardDetailDialogComponent } from './shippingCardDetailDialog.component';
import { ShippingCardInfo } from '../../service/shipping-info.service';

describe('ShippingCardDetailDialogComponent', () => {
  let component: ShippingCardDetailDialogComponent;
  let fixture: ComponentFixture<ShippingCardDetailDialogComponent>;
  let dialogRef: any;

  const mockCard: ShippingCardInfo = {
    cardId: 'card-uuid-1',
    userName: 'John Doe',
    address: '123 Main Street, Tokyo, Japan',
    phone: '09012345678',
    gachaName: 'Premium Gacha',
    cardName: 'Rare Card A',
  };

  beforeEach(async () => {
    const dialogRefMock = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [ShippingCardDetailDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { card: mockCard },
        },
        TranslateService,
      ],
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(ShippingCardDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize with card data', () => {
      expect(component.card).toEqual(mockCard);
    });

    it('should set default language to Japanese', () => {
      const spy = jest.spyOn(component['translateService'], 'setDefaultLang');
      component.ngOnInit();
      expect(spy).toHaveBeenCalledWith('ja');
    });

    it('should use Japanese language', () => {
      const spy = jest.spyOn(component['translateService'], 'use');
      component.ngOnInit();
      expect(spy).toHaveBeenCalledWith('ja');
    });
  });

  describe('onClose', () => {
    it('should close dialog without data', () => {
      component.onClose();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('card data rendering', () => {
    it('should display card user name', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('John Doe');
    });

    it('should display card address', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('123 Main Street, Tokyo, Japan');
    });

    it('should display card phone', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('09012345678');
    });

    it('should display gacha name', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Premium Gacha');
    });

    it('should display card name', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Rare Card A');
    });
  });

  describe('UI elements', () => {
    it('should display close button', () => {
      const closeBtn = fixture.nativeElement.querySelector('.close-btn');
      expect(closeBtn).toBeTruthy();
    });

    it('should close dialog when close button is clicked', () => {
      const closeBtn = fixture.nativeElement.querySelector('.close-btn');
      closeBtn.click();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });

    it('should display detail-list with 5 rows for card information', () => {
      const detailRows = fixture.nativeElement.querySelectorAll('.detail-row');
      expect(detailRows.length).toBe(5);
    });

    it('should have proper styling classes for detail rows', () => {
      const detailRows = fixture.nativeElement.querySelectorAll('.detail-row');
      detailRows.forEach((row: HTMLElement) => {
        expect(row.querySelector('.detail-label')).toBeTruthy();
        expect(row.querySelector('.detail-value')).toBeTruthy();
      });
    });
  });

  describe('different card data', () => {
    it('should handle card with different data', () => {
      const newCard: ShippingCardInfo = {
        cardId: 'card-uuid-2',
        userName: 'Jane Smith',
        address: '456 Oak Avenue, Osaka',
        phone: '08098765432',
        gachaName: 'Standard Gacha',
        cardName: 'Common Card B',
      };

      component.card = newCard;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Jane Smith');
      expect(compiled.textContent).toContain('456 Oak Avenue, Osaka');
      expect(compiled.textContent).toContain('08098765432');
      expect(compiled.textContent).toContain('Standard Gacha');
      expect(compiled.textContent).toContain('Common Card B');
    });

    it('should handle card with special characters in data', () => {
      const specialCard: ShippingCardInfo = {
        cardId: 'card-uuid-3',
        userName: '田中 太郎',
        address: '東京都渋谷区道玄坂1-2-3',
        phone: '09012345678',
        gachaName: 'スペシャルガチャ',
        cardName: 'レアカード',
      };

      component.card = specialCard;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('田中 太郎');
      expect(compiled.textContent).toContain('東京都渋谷区道玄坂1-2-3');
      expect(compiled.textContent).toContain('スペシャルガチャ');
      expect(compiled.textContent).toContain('レアカード');
    });
  });
});
