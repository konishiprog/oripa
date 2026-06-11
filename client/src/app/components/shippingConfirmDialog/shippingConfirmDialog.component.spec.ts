import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ShippingConfirmDialogComponent } from './shippingConfirmDialog.component';
import { ShippingCardInfo } from '../../service/shipping-info.service';
import { ShipmentPayload } from '../../service/card.service';

describe('ShippingConfirmDialogComponent', () => {
  let component: ShippingConfirmDialogComponent;
  let fixture: ComponentFixture<ShippingConfirmDialogComponent>;
  let dialogRef: any;

  const mockCards: ShippingCardInfo[] = [
    {
      cardId: 'card-uuid-1',
      userId: 'user-uuid-1',
      userName: 'John Doe',
      address: '123 Main Street, Tokyo',
      phone: '09012345678',
      gachaName: 'Premium Gacha',
      cardName: 'Rare Card A',
    },
    {
      cardId: 'card-uuid-2',
      userId: 'user-uuid-1',
      userName: 'John Doe',
      address: '123 Main Street, Tokyo',
      phone: '09012345678',
      gachaName: 'Standard Gacha',
      cardName: 'Common Card B',
    },
    {
      cardId: 'card-uuid-3',
      userId: 'user-uuid-2',
      userName: 'Jane Smith',
      address: '456 Oak Avenue, Osaka',
      phone: '08098765432',
      gachaName: 'Premium Gacha',
      cardName: 'Epic Card C',
    },
  ];

  beforeEach(async () => {
    const dialogRefMock = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [ShippingConfirmDialogComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { cards: mockCards },
        },
      ],
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef);
    fixture = TestBed.createComponent(ShippingConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with cards data from dialog', () => {
      expect(component.cards).toEqual(mockCards);
    });

    it('should initialize trackingByDestination for each unique user', () => {
      expect(Object.keys(component.trackingByDestination).length).toBe(2);
      expect(component.trackingByDestination['user-uuid-1']).toBe('');
      expect(component.trackingByDestination['user-uuid-2']).toBe('');
    });

    it('should set table headers', () => {
      expect(component.tableHeaders.length).toBe(4);
      expect(component.tableHeaders[0].key).toBe('user-name');
      expect(component.tableHeaders[1].key).toBe('address');
      expect(component.tableHeaders[2].key).toBe('phone');
      expect(component.tableHeaders[3].key).toBe('card-info');
    });
  });

  describe('getDestinationKey()', () => {
    it('should return userId as destination key', () => {
      const key = component.getDestinationKey(mockCards[0]);
      expect(key).toBe('user-uuid-1');
    });

    it('should return same key for cards with same userId', () => {
      const key1 = component.getDestinationKey(mockCards[0]);
      const key2 = component.getDestinationKey(mockCards[1]);
      expect(key1).toBe(key2);
    });

    it('should return different keys for cards with different userId', () => {
      const key1 = component.getDestinationKey(mockCards[0]);
      const key3 = component.getDestinationKey(mockCards[2]);
      expect(key1).not.toBe(key3);
    });
  });

  describe('getCellValue()', () => {
    it('should return userName for user-name key', () => {
      const value = component.getCellValue(mockCards[0], 'user-name');
      expect(value).toBe('John Doe');
    });

    it('should return address for address key', () => {
      const value = component.getCellValue(mockCards[0], 'address');
      expect(value).toBe('123 Main Street, Tokyo');
    });

    it('should return phone for phone key', () => {
      const value = component.getCellValue(mockCards[0], 'phone');
      expect(value).toBe('09012345678');
    });

    it('should return card info (name + gacha) for card-info key', () => {
      const value = component.getCellValue(mockCards[0], 'card-info');
      expect(value).toBe('Rare Card A(Premium Gacha)');
    });

    it('should return empty string for unknown key', () => {
      const value = component.getCellValue(mockCards[0], 'unknown');
      expect(value).toBe('');
    });
  });

  describe('isAllTrackingFilled()', () => {
    it('should return false when no tracking numbers are filled', () => {
      expect(component.isAllTrackingFilled()).toBe(false);
    });

    it('should return false when only one user has tracking number', () => {
      component.trackingByDestination['user-uuid-1'] = 'TRK123456';
      expect(component.isAllTrackingFilled()).toBe(false);
    });

    it('should return true when all users have tracking numbers', () => {
      component.trackingByDestination['user-uuid-1'] = 'TRK123456';
      component.trackingByDestination['user-uuid-2'] = 'TRK789012';
      expect(component.isAllTrackingFilled()).toBe(true);
    });

    it('should return false if tracking number is only whitespace', () => {
      component.trackingByDestination['user-uuid-1'] = '   ';
      component.trackingByDestination['user-uuid-2'] = 'TRK789012';
      expect(component.isAllTrackingFilled()).toBe(false);
    });

    it('should return true if tracking numbers have whitespace (will be trimmed)', () => {
      component.trackingByDestination['user-uuid-1'] = '  TRK123456  ';
      component.trackingByDestination['user-uuid-2'] = 'TRK789012';
      expect(component.isAllTrackingFilled()).toBe(true);
    });
  });

  describe('onConfirm()', () => {
    it('should not close dialog if tracking numbers are not filled', () => {
      component.onConfirm();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should close dialog with shipments when all tracking numbers are filled', () => {
      component.trackingByDestination['user-uuid-1'] = 'TRK123456';
      component.trackingByDestination['user-uuid-2'] = 'TRK789012';

      component.onConfirm();

      expect(dialogRef.close).toHaveBeenCalled();
      const shipments = dialogRef.close.mock.calls[0][0] as ShipmentPayload[];
      expect(shipments).toBeDefined();
      expect(Array.isArray(shipments)).toBe(true);
      expect(shipments.length).toBe(3);
    });

    it('should map shipments with correct cardId and trackingNumber', () => {
      component.trackingByDestination['user-uuid-1'] = 'TRK123456';
      component.trackingByDestination['user-uuid-2'] = 'TRK789012';

      component.onConfirm();

      const shipments = dialogRef.close.mock.calls[0][0] as ShipmentPayload[];
      expect(shipments[0]).toEqual({
        cardId: 'card-uuid-1',
        trackingNumber: 'TRK123456',
      });
      expect(shipments[1]).toEqual({
        cardId: 'card-uuid-2',
        trackingNumber: 'TRK123456',
      });
      expect(shipments[2]).toEqual({
        cardId: 'card-uuid-3',
        trackingNumber: 'TRK789012',
      });
    });

    it('should trim whitespace from tracking numbers', () => {
      component.trackingByDestination['user-uuid-1'] = '  TRK123456  ';
      component.trackingByDestination['user-uuid-2'] = '\tTRK789012\n';

      component.onConfirm();

      const shipments = dialogRef.close.mock.calls[0][0] as ShipmentPayload[];
      expect(shipments[0].trackingNumber).toBe('TRK123456');
      expect(shipments[2].trackingNumber).toBe('TRK789012');
    });
  });

  describe('onCancel()', () => {
    it('should close dialog with false', () => {
      component.onCancel();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Table rendering', () => {
    it('should display table with correct number of rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);
    });

    it('should display table header with correct columns', () => {
      const headers = fixture.nativeElement.querySelectorAll('thead th');
      expect(headers.length).toBe(5);
      expect(headers[0].textContent).toContain('tracking');
    });

    it('should display tracking input fields', () => {
      const inputs = fixture.nativeElement.querySelectorAll('.tracking-input');
      expect(inputs.length).toBe(3);
    });

    it('should have placeholder text on tracking inputs', () => {
      const inputs = fixture.nativeElement.querySelectorAll(
        '.tracking-input',
      ) as NodeListOf<HTMLInputElement>;
      inputs.forEach((input) => {
        expect(input.placeholder).toBeTruthy();
      });
    });

    it('should display card information in table cells', () => {
      const cells = fixture.nativeElement.querySelectorAll('tbody td');
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('John Doe');
      expect(text).toContain('Jane Smith');
      expect(text).toContain('Rare Card A');
    });
  });

  describe('Button states', () => {
    it('should disable confirm button initially', () => {
      const confirmBtn = fixture.nativeElement.querySelector(
        '.dialog-btn-confirm',
      ) as HTMLButtonElement;
      expect(confirmBtn.disabled).toBe(true);
    });

    it('should enable confirm button when all tracking numbers are filled', async () => {
      const confirmBtn = fixture.nativeElement.querySelector(
        '.dialog-btn-confirm',
      ) as HTMLButtonElement;

      component.trackingByDestination['user-uuid-1'] = 'TRK123456';
      component.trackingByDestination['user-uuid-2'] = 'TRK789012';
      fixture.detectChanges();
      await fixture.whenStable();

      expect(confirmBtn.disabled).toBe(false);
    });

    it('should have cancel button always enabled', () => {
      const cancelBtn = fixture.nativeElement.querySelector(
        '.dialog-btn-cancel',
      ) as HTMLButtonElement;
      expect(cancelBtn.disabled).toBe(false);
    });
  });

  describe('Linked tracking numbers (same userId)', () => {
    it('should share tracking number between cards with same userId', async () => {
      const inputs = fixture.nativeElement.querySelectorAll(
        '.tracking-input',
      ) as NodeListOf<HTMLInputElement>;

      inputs[0].value = 'TRK123456';
      inputs[0].dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.trackingByDestination['user-uuid-1']).toBe('TRK123456');
      expect(component.trackingByDestination['user-uuid-2']).toBe('');
    });

    it('should update both cards with same userId when first input changes', async () => {
      component.trackingByDestination['user-uuid-1'] = 'TRK123456';
      fixture.detectChanges();
      await fixture.whenStable();

      const shipments = component.cards
        .filter((c) => c.userId === 'user-uuid-1')
        .map((c) => ({
          cardId: c.cardId,
          trackingNumber: component.trackingByDestination['user-uuid-1'],
        }));

      expect(shipments).toEqual([
        { cardId: 'card-uuid-1', trackingNumber: 'TRK123456' },
        { cardId: 'card-uuid-2', trackingNumber: 'TRK123456' },
      ]);
    });
  });

  describe('Multiple users scenario', () => {
    it('should handle different tracking numbers for different users', () => {
      component.trackingByDestination['user-uuid-1'] = 'TRK111111';
      component.trackingByDestination['user-uuid-2'] = 'TRK222222';

      component.onConfirm();

      const shipments = dialogRef.close.mock.calls[0][0] as ShipmentPayload[];
      const user1Shipments = shipments.filter(
        (s) => s.cardId === 'card-uuid-1' || s.cardId === 'card-uuid-2',
      );
      const user2Shipments = shipments.filter(
        (s) => s.cardId === 'card-uuid-3',
      );

      user1Shipments.forEach((s) => {
        expect(s.trackingNumber).toBe('TRK111111');
      });
      user2Shipments.forEach((s) => {
        expect(s.trackingNumber).toBe('TRK222222');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty card list', () => {
      const emptyComponent = new ShippingConfirmDialogComponent(
        dialogRef,
        { cards: [] },
      );
      expect(emptyComponent.cards).toEqual([]);
      expect(Object.keys(emptyComponent.trackingByDestination).length).toBe(0);
    });

    it('should handle special characters in tracking number', () => {
      component.trackingByDestination['user-uuid-1'] = 'TRK-123-456-ABC';
      component.trackingByDestination['user-uuid-2'] = 'JP2024001';

      expect(component.isAllTrackingFilled()).toBe(true);
    });

    it('should handle very long tracking numbers', () => {
      const longTrackingNumber = 'A'.repeat(100);
      component.trackingByDestination['user-uuid-1'] = longTrackingNumber;
      component.trackingByDestination['user-uuid-2'] = longTrackingNumber;

      component.onConfirm();
      const shipments = dialogRef.close.mock.calls[0][0] as ShipmentPayload[];
      shipments.forEach((s) => {
        expect(s.trackingNumber).toBe(longTrackingNumber);
      });
    });
  });
});
