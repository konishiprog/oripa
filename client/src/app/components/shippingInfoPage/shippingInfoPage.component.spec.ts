import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ShippingInfoPageComponent } from './shippingInfoPage.component';
import {
  ShippingInfoService,
  ShippingCardInfo,
} from '../../service/shipping-info.service';
import { CardService } from '../../service/card.service';
import { CARD_STATUS } from '../../constants/card';

describe('ShippingInfoPageComponent', () => {
  let component: ShippingInfoPageComponent;
  let fixture: ComponentFixture<ShippingInfoPageComponent>;
  let mockShippingInfoService: jest.Mocked<ShippingInfoService>;
  let mockCardService: jest.Mocked<CardService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockDialog: jest.Mocked<MatDialog>;

  const mockShippingCards: ShippingCardInfo[] = [
    {
      cardId: '1',
      userName: 'User 1',
      address: '東京都渋谷区',
      phone: '09012345678',
      gachaName: 'ガチャA',
      cardName: 'カードA',
    },
    {
      cardId: '2',
      userName: 'User 2',
      address: '大阪府大阪市',
      phone: '09087654321',
      gachaName: 'ガチャB',
      cardName: 'カードB',
    },
  ];

  beforeEach(async () => {
    mockShippingInfoService = {
      getShippingCards: jest.fn(),
    } as unknown as jest.Mocked<ShippingInfoService>;

    mockCardService = {
      updateCardStatus: jest.fn(),
    } as unknown as jest.Mocked<CardService>;

    mockTranslateService = {
      instant: jest.fn((key: string) => {
        const translations: { [key: string]: string } = {
          'shipping-info.error': 'Error loading cards',
          'shipping-info.no-selection': 'Please select cards',
          'shipping-info.complete-confirm': 'Are you sure?',
          'shipping-info.complete-success': 'Completed successfully',
          'shipping-info.complete-error': 'Failed to complete',
        };
        return translations[key] || key;
      }),
    } as unknown as jest.Mocked<TranslateService>;

    mockDialog = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      declarations: [ShippingInfoPageComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ShippingInfoService, useValue: mockShippingInfoService },
        { provide: CardService, useValue: mockCardService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingInfoPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load shipping cards on init', (done) => {
      mockShippingInfoService.getShippingCards.mockResolvedValue(
        mockShippingCards,
      );

      component.ngOnInit();

      setTimeout(() => {
        expect(mockShippingInfoService.getShippingCards).toHaveBeenCalled();
        expect(component.shippingCards).toEqual(mockShippingCards);
        expect(component.isLoading).toBe(false);
        expect(component.error).toBeNull();
        done();
      }, 0);
    });

    it('should handle error when loading shipping cards', (done) => {
      const error = new Error('Network error');
      mockShippingInfoService.getShippingCards.mockRejectedValue(error);

      component.ngOnInit();

      setTimeout(() => {
        expect(component.shippingCards).toEqual([]);
        expect(component.error).toBe('Error loading cards');
        expect(component.isLoading).toBe(false);
        done();
      }, 0);
    });

    it('should set isLoading to true initially', () => {
      mockShippingInfoService.getShippingCards.mockResolvedValue([]);

      expect(component.isLoading).toBe(true);

      component.ngOnInit();

      expect(component.isLoading).toBe(true);
    });
  });

  describe('getCellValue', () => {
    it('should return user name for user-name key', () => {
      const card = mockShippingCards[0];
      const result = component.getCellValue(card, 'user-name');
      expect(result).toBe('User 1');
    });

    it('should return address for address key', () => {
      const card = mockShippingCards[0];
      const result = component.getCellValue(card, 'address');
      expect(result).toBe('東京都渋谷区');
    });

    it('should return phone for phone key', () => {
      const card = mockShippingCards[0];
      const result = component.getCellValue(card, 'phone');
      expect(result).toBe('09012345678');
    });

    it('should return formatted card info for card-info key', () => {
      const card = mockShippingCards[0];
      const result = component.getCellValue(card, 'card-info');
      expect(result).toBe('カードA(ガチャA)');
    });

    it('should return empty string for unknown key', () => {
      const card = mockShippingCards[0];
      const result = component.getCellValue(card, 'unknown');
      expect(result).toBe('');
    });
  });

  describe('getTotalCards', () => {
    it('should return the total number of shipping cards', () => {
      component.shippingCards = mockShippingCards;
      expect(component.getTotalCards()).toBe(2);
    });

    it('should return 0 when no cards', () => {
      component.shippingCards = [];
      expect(component.getTotalCards()).toBe(0);
    });
  });

  describe('viewCardDetail', () => {
    it('should open detail dialog with card data', () => {
      const card = mockShippingCards[0];
      component.viewCardDetail(card);

      expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
        width: '500px',
        data: {
          card: card,
        },
      });
    });
  });

  describe('toggleCardSelection', () => {
    it('should add card id to selected set if not present', () => {
      const cardId = '1';
      component.toggleCardSelection(cardId);
      expect(component.selectedCardIds.has(cardId)).toBe(true);
    });

    it('should remove card id from selected set if present', () => {
      const cardId = '1';
      component.selectedCardIds.add(cardId);
      component.toggleCardSelection(cardId);
      expect(component.selectedCardIds.has(cardId)).toBe(false);
    });
  });

  describe('isCardSelected', () => {
    it('should return true if card is selected', () => {
      const cardId = '1';
      component.selectedCardIds.add(cardId);
      expect(component.isCardSelected(cardId)).toBe(true);
    });

    it('should return false if card is not selected', () => {
      expect(component.isCardSelected('1')).toBe(false);
    });
  });

  describe('toggleAllCards', () => {
    it('should select all cards if none are selected', () => {
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.clear();

      component.toggleAllCards();

      expect(component.selectedCardIds.size).toBe(2);
      expect(component.selectedCardIds.has('1')).toBe(true);
      expect(component.selectedCardIds.has('2')).toBe(true);
    });

    it('should deselect all cards if all are selected', () => {
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');
      component.selectedCardIds.add('2');

      component.toggleAllCards();

      expect(component.selectedCardIds.size).toBe(0);
    });

    it('should select all cards if some are selected', () => {
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');

      component.toggleAllCards();

      expect(component.selectedCardIds.size).toBe(2);
      expect(component.selectedCardIds.has('1')).toBe(true);
      expect(component.selectedCardIds.has('2')).toBe(true);
    });
  });

  describe('completeShipping', () => {
    beforeEach(() => {
      mockShippingInfoService.getShippingCards.mockResolvedValue(
        mockShippingCards,
      );
      mockCardService.updateCardStatus.mockResolvedValue({
        message: 'Updated',
      });
    });

    it('should alert when no cards are selected', (done) => {
      jest.spyOn(window, 'alert').mockImplementation();
      component.selectedCardIds.clear();

      component.completeShipping();

      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith('Please select cards');
        done();
      }, 0);
    });

    it('should return early if user cancels confirmation', (done) => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');

      component.completeShipping();

      setTimeout(() => {
        expect(mockCardService.updateCardStatus).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should update card status to SHIPPED for selected cards', (done) => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');
      component.selectedCardIds.add('2');

      component.completeShipping();

      setTimeout(() => {
        expect(mockCardService.updateCardStatus).toHaveBeenCalledWith(
          '1',
          CARD_STATUS.SHIPPED,
        );
        expect(mockCardService.updateCardStatus).toHaveBeenCalledWith(
          '2',
          CARD_STATUS.SHIPPED,
        );
        done();
      }, 0);
    });

    it('should clear selected cards after successful update', (done) => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');

      component.completeShipping();

      setTimeout(() => {
        expect(component.selectedCardIds.size).toBe(0);
        done();
      }, 0);
    });

    it('should reload shipping cards after successful update', (done) => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');

      component.completeShipping();

      setTimeout(() => {
        expect(mockShippingInfoService.getShippingCards).toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should show success alert after completing shipping', (done) => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');

      component.completeShipping();

      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith('Completed successfully');
        done();
      }, 0);
    });

    it('should show error alert when update fails', (done) => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      mockCardService.updateCardStatus.mockRejectedValue(
        new Error('Update failed'),
      );
      component.shippingCards = mockShippingCards;
      component.selectedCardIds.add('1');

      component.completeShipping();

      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to complete');
        done();
      }, 0);
    });
  });

  describe('table headers', () => {
    it('should have correct table headers', () => {
      expect(component.tableHeaders.length).toBe(4);
      expect(component.tableHeaders[0].key).toBe('user-name');
      expect(component.tableHeaders[1].key).toBe('address');
      expect(component.tableHeaders[2].key).toBe('phone');
      expect(component.tableHeaders[3].key).toBe('card-info');
    });
  });

  describe('error handling', () => {
    it('should display error message when loading fails', (done) => {
      const error = new Error('Load failed');
      mockShippingInfoService.getShippingCards.mockRejectedValue(error);

      component.ngOnInit();

      setTimeout(() => {
        expect(component.error).toBe('Error loading cards');
        expect(component.shippingCards).toEqual([]);
        done();
      }, 0);
    });

    it('should clear error when reload succeeds', (done) => {
      component.error = 'Previous error';
      mockShippingInfoService.getShippingCards.mockResolvedValue(
        mockShippingCards,
      );

      component.ngOnInit();

      setTimeout(() => {
        expect(component.error).toBeNull();
        done();
      }, 0);
    });
  });

  describe('loading state', () => {
    it('should set isLoading to false after loading completes', (done) => {
      mockShippingInfoService.getShippingCards.mockResolvedValue(
        mockShippingCards,
      );

      component.ngOnInit();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 0);
    });

    it('should set isLoading to false when loading fails', (done) => {
      mockShippingInfoService.getShippingCards.mockRejectedValue(
        new Error('Error'),
      );

      component.ngOnInit();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 0);
    });
  });
});
