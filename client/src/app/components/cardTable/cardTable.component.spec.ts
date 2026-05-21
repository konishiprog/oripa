import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CardTableComponent, Card } from './cardTable.component';
import { CardService } from '../../service/card.service';

describe('CardTableComponent', () => {
  let component: CardTableComponent;
  let fixture: ComponentFixture<CardTableComponent>;
  let cardService: any;
  let translateService: TranslateService;

  const mockCards: Card[] = [
    {
      id: '1',
      gachaId: '1',
      gachaName: 'Gacha 1',
      name: 'Card 1',
      cardType: 'SSR',
      exchangeType: 'BOTH',
      exchangePoints: 100,
      imageFront: 'front1.jpg',
      imageBack: 'back1.jpg',
      isDrawn: '未引き',
    },
    {
      id: '2',
      gachaId: '1',
      gachaName: 'Gacha 1',
      name: 'Card 2',
      cardType: 'R',
      exchangeType: 'SHIPPING_ONLY',
      exchangePoints: null,
      imageFront: 'front2.jpg',
      imageBack: 'back2.jpg',
      isDrawn: '未引き',
    },
    {
      id: '3',
      gachaId: '2',
      gachaName: 'Gacha 2',
      name: 'Card 3',
      cardType: 'SR',
      exchangeType: 'BOTH',
      exchangePoints: 500,
      imageFront: 'front3.jpg',
      imageBack: 'back3.jpg',
      isDrawn: '引かれた',
    },
  ];

  beforeEach(async () => {
    const deleteCardMock = jest.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      declarations: [CardTableComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: CardService,
          useValue: { deleteCard: deleteCardMock },
        },
      ],
    }).compileComponents();

    cardService = TestBed.inject(CardService) as any;
    translateService = TestBed.inject(TranslateService);

    fixture = TestBed.createComponent(CardTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cards).toEqual([]);
    expect(component.filteredCards).toEqual([]);
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

  it('should apply filters when cards input changes', () => {
    jest.spyOn(component, 'applyFilters');
    const changes = { cards: { currentValue: mockCards } } as any;
    component.ngOnChanges(changes);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should not apply filters when other inputs change', () => {
    jest.spyOn(component, 'applyFilters');
    const changes = { someOtherInput: { currentValue: null } } as any;
    component.ngOnChanges(changes);
    expect(component.applyFilters).not.toHaveBeenCalled();
  });

  it('should filter cards by name', () => {
    component.cards = mockCards;
    component.searchQuery = 'Card 1';
    component.applyFilters();
    expect(component.filteredCards.length).toBe(1);
    expect(component.filteredCards[0].name).toBe('Card 1');
  });

  it('should filter cards by gacha name', () => {
    component.cards = mockCards;
    component.searchQuery = 'Gacha 2';
    component.applyFilters();
    expect(component.filteredCards.length).toBe(1);
    expect(component.filteredCards[0].gachaName).toBe('Gacha 2');
  });

  it('should be case insensitive when filtering', () => {
    component.cards = mockCards;
    component.searchQuery = 'card 1';
    component.applyFilters();
    expect(component.filteredCards.length).toBe(1);
    expect(component.filteredCards[0].name).toBe('Card 1');
  });

  it('should return all cards when search query is empty', () => {
    component.cards = mockCards;
    component.searchQuery = '';
    component.applyFilters();
    expect(component.filteredCards.length).toBe(3);
  });

  it('should reset to page 1 when applying filters', () => {
    component.cards = mockCards;
    component.currentPage = 5;
    component.applyFilters();
    expect(component.currentPage).toBe(1);
  });

  it('should get displayed cards for current page', () => {
    component.cards = mockCards;
    component.filteredCards = mockCards;
    component.currentPage = 1;
    component.itemsPerPage = 2;
    const displayed = component.getDisplayedCards();
    expect(displayed.length).toBe(2);
    expect(displayed[0].id).toBe('1');
    expect(displayed[1].id).toBe('2');
  });

  it('should get correct total pages', () => {
    component.filteredCards = mockCards;
    component.itemsPerPage = 2;
    const totalPages = component.getTotalPages();
    expect(totalPages).toBe(2);
  });

  it('should calculate page numbers correctly for small page count', () => {
    component.filteredCards = mockCards;
    component.itemsPerPage = 20;
    component.currentPage = 1;
    const pageNumbers = component.getPageNumbers();
    expect(pageNumbers).toEqual([1]);
  });

  it('should show ellipsis and boundary pages for large page count', () => {
    const largeList = Array.from({ length: 100 }, (_, i) => ({
      ...mockCards[0],
      id: String(i + 1),
    }));
    component.filteredCards = largeList;
    component.itemsPerPage = 5;
    component.currentPage = 15;
    const pageNumbers = component.getPageNumbers();
    expect(pageNumbers[0]).toBe(1);
    expect(pageNumbers[pageNumbers.length - 1]).toBe(20);
    expect(pageNumbers).toContain('...');
  });

  it('should navigate to valid page', () => {
    component.filteredCards = mockCards;
    component.itemsPerPage = 1;
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
  });

  it('should not navigate to invalid page', () => {
    component.filteredCards = mockCards;
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
    component.filteredCards = mockCards;
    component.itemsPerPage = 1;
    component.currentPage = 1;
    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not go beyond total pages', () => {
    component.filteredCards = mockCards;
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

  it('should get card type label', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Super Rare');
    const label = component.getCardTypeLabel('SSR');
    expect(label).toBe('Super Rare');
    expect(translateService.instant).toHaveBeenCalledWith('card-create.card-type-ssr');
  });

  it('should return value when card type not found', () => {
    const label = component.getCardTypeLabel('UNKNOWN');
    expect(label).toBe('UNKNOWN');
  });

  it('should get exchange type label', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Both');
    const label = component.getExchangeTypeLabel('BOTH');
    expect(label).toBe('Both');
    expect(translateService.instant).toHaveBeenCalledWith('card-create.exchange-type-both');
  });

  it('should return value when exchange type not found', () => {
    const label = component.getExchangeTypeLabel('UNKNOWN');
    expect(label).toBe('UNKNOWN');
  });

  it('should display exchange points for BOTH type with points', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('No exchange');
    const result = component.getExchangePointsDisplay(mockCards[0]);
    expect(result).toBe('100');
  });

  it('should display no exchange message for SHIPPING_ONLY type', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('No exchange');
    const result = component.getExchangePointsDisplay(mockCards[1]);
    expect(result).toBe('No exchange');
  });

  it('should emit cardsUpdated after deleting card', async () => {
    jest.spyOn(component.cardsUpdated, 'emit');
    (cardService.deleteCard as jest.Mock).mockResolvedValue(undefined);
    component.cards = mockCards.slice();

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await component.deleteCard(mockCards[0]);
    expect(component.cardsUpdated.emit).toHaveBeenCalled();
  });

  it('should remove deleted card from cards array', async () => {
    (cardService.deleteCard as jest.Mock).mockResolvedValue(undefined);
    component.cards = mockCards.slice();

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await component.deleteCard(mockCards[0]);
    expect(component.cards.find((c) => c.id === '1')).toBeUndefined();
  });

  it('should call applyFilters after deleting card', async () => {
    jest.spyOn(component, 'applyFilters');
    (cardService.deleteCard as jest.Mock).mockResolvedValue(undefined);
    component.cards = mockCards.slice();

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await component.deleteCard(mockCards[0]);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should not delete card if user cancels', async () => {
    (cardService.deleteCard as jest.Mock).mockResolvedValue(undefined);
    component.cards = mockCards.slice();
    const initialLength = component.cards.length;

    jest.spyOn(window, 'confirm').mockReturnValue(false);

    await component.deleteCard(mockCards[0]);
    expect(component.cards.length).toBe(initialLength);
    expect(cardService.deleteCard).not.toHaveBeenCalled();
  });

  it('should get pagination info string', () => {
    jest.spyOn(translateService, 'instant').mockReturnValue('Showing 1-3 of 3');
    component.filteredCards = mockCards;
    component.currentPage = 1;
    component.itemsPerPage = 20;
    component.getPaginationInfo();
    expect(translateService.instant).toHaveBeenCalled();
  });
});
