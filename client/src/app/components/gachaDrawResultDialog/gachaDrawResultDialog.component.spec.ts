import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CardService } from '../../service/card.service';
import { UserService } from '../../service/user.service';
import { GachaDrawResultDialogComponent } from './gachaDrawResultDialog.component';

describe('GachaDrawResultDialogComponent', () => {
  let component: GachaDrawResultDialogComponent;
  let fixture: ComponentFixture<GachaDrawResultDialogComponent>;
  let dialogRef: jest.Mocked<MatDialogRef<GachaDrawResultDialogComponent>>;
  let mockCardService: any;
  let mockUserService: any;

  const mockDrawnCards = [
    {
      id: 'card-1',
      name: 'カード1',
      imageFront: 'front1.jpg',
      imageBack: 'back.jpg',
      cardType: 'SSR',
      effectUrl: 'effect1.mp4',
      exchangeType: 'BOTH',
      exchangeCoins: 100,
    },
    {
      id: 'card-2',
      name: 'カード2',
      imageFront: 'front2.jpg',
      imageBack: 'back.jpg',
      cardType: 'R',
      exchangeType: 'SHIPPING_ONLY',
      exchangeCoins: null,
    },
    {
      id: 'card-3',
      name: 'カード3',
      imageFront: 'front3.jpg',
      imageBack: 'back.jpg',
      cardType: 'SR',
      effectUrl: 'effect3.mp4',
      exchangeType: 'COIN_ONLY',
      exchangeCoins: 50,
    },
  ];

  beforeEach(async () => {
    const dialogRefSpy = {
      close: jest.fn<void, []>(),
      updateSize: jest.fn(),
    };

    mockCardService = {
      exchangeCard: jest.fn().mockResolvedValue({}),
    };

    mockUserService = {
      getUserId: jest.fn().mockReturnValue('test-user-id'),
      getCoin: jest.fn().mockReturnValue(1000),
      saveCoin: jest.fn(),
      updateUser: jest.fn().mockResolvedValue({}),
    };

    await TestBed.configureTestingModule({
      declarations: [GachaDrawResultDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { drawnCards: mockDrawnCards },
        },
        { provide: CardService, useValue: mockCardService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jest.Mocked<
      MatDialogRef<GachaDrawResultDialogComponent>
    >;

    fixture = TestBed.createComponent(GachaDrawResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with drawn cards and empty revealed array', () => {
    expect(component.drawnCards).toEqual(mockDrawnCards);
    expect(component.revealed).toEqual([false, false, false]);
    expect(component.currentIndex).toBe(0);
    expect(component.showSummary).toBe(false);
    expect(component.isPlayingEffect).toBe(true);
  });

  it('currentCard should return card at current index', () => {
    expect(component.currentCard).toEqual(mockDrawnCards[0]);
    component.currentIndex = 1;
    expect(component.currentCard).toEqual(mockDrawnCards[1]);
  });

  it('currentCard should return null when no cards', () => {
    component.drawnCards = [];
    expect(component.currentCard).toBeNull();
  });

  it('isCurrentRevealed should return revealed state of current card', () => {
    expect(component.isCurrentRevealed).toBe(false);
    component.revealed[0] = true;
    expect(component.isCurrentRevealed).toBe(true);
  });

  it('isLast should return true only for last card', () => {
    expect(component.isLast).toBe(false);
    component.currentIndex = 2;
    expect(component.isLast).toBe(true);
  });

  it('hasEffectUrl should return true only when current card has effectUrl', () => {
    expect(component.hasEffectUrl).toBe(true);
    component.currentIndex = 1;
    expect(component.hasEffectUrl).toBe(false);
    component.currentIndex = 2;
    expect(component.hasEffectUrl).toBe(true);
  });

  it('isShowingEffect should return true when playing effect or has effect url', () => {
    component.isPlayingEffect = true;
    expect(component.isShowingEffect).toBe(true);
    component.isPlayingEffect = false;
    expect(component.isShowingEffect).toBe(true);
    component.currentIndex = 1;
    expect(component.isShowingEffect).toBe(false);
  });

  it('isShowingEffect should return false when showing summary', () => {
    component.showSummary = true;
    expect(component.isShowingEffect).toBe(false);
  });

  it('reveal should mark current card as revealed', () => {
    component.isPlayingEffect = false;
    expect(component.revealed[0]).toBe(false);
    component.reveal();
    expect(component.revealed[0]).toBe(true);
  });

  it('reveal should not change if already revealed', () => {
    component.isPlayingEffect = false;
    component.revealed[0] = true;
    component.reveal();
    expect(component.revealed[0]).toBe(true);
  });

  it('reveal should not change if effect is playing', () => {
    component.isPlayingEffect = true;
    component.reveal();
    expect(component.revealed[0]).toBe(false);
  });

  it('next should reveal if not yet revealed', () => {
    component.isPlayingEffect = false;
    expect(component.revealed[0]).toBe(false);
    component.next();
    expect(component.revealed[0]).toBe(true);
    expect(component.currentIndex).toBe(0);
  });

  it('next should advance to next card if already revealed', () => {
    component.isPlayingEffect = false;
    component.revealed[0] = true;
    component.next();
    expect(component.currentIndex).toBe(1);
  });

  it('next should show summary if already revealed and is last card', () => {
    component.isPlayingEffect = false;
    component.currentIndex = 2;
    component.revealed[2] = true;
    component.next();
    expect(component.showSummary).toBe(true);
  });

  it('next should not advance if effect is playing', () => {
    component.isPlayingEffect = true;
    component.currentIndex = 0;
    component.next();
    expect(component.currentIndex).toBe(0);
  });

  it('revealAll should mark all cards as revealed and show summary', () => {
    component.revealAll();
    expect(component.revealed).toEqual([true, true, true]);
    expect(component.showSummary).toBe(true);
  });

  it('revealAll should stop playing effect', () => {
    component.isPlayingEffect = true;
    component.revealAll();
    expect(component.isPlayingEffect).toBe(false);
  });

  it('onEffectEnded should mark current card as revealed', () => {
    component.isPlayingEffect = true;
    component.onEffectEnded();
    expect(component.revealed[0]).toBe(true);
    expect(component.isPlayingEffect).toBe(false);
  });

  it('onEffectEnded should do nothing if not playing effect', () => {
    component.isPlayingEffect = false;
    component.revealed[0] = false;
    component.onEffectEnded();
    expect(component.revealed[0]).toBe(false);
  });

  it('skipCurrentEffect should call onEffectEnded if playing effect', () => {
    const onEffectEndedSpy = jest.spyOn(component, 'onEffectEnded');
    component.isPlayingEffect = true;
    component.skipCurrentEffect();
    expect(onEffectEndedSpy).toHaveBeenCalled();
  });

  it('skipCurrentEffect should do nothing if not playing effect', () => {
    const onEffectEndedSpy = jest.spyOn(component, 'onEffectEnded');
    component.isPlayingEffect = false;
    component.skipCurrentEffect();
    expect(onEffectEndedSpy).not.toHaveBeenCalled();
  });

  it('close should close the dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should handle empty drawn cards gracefully', () => {
    component.drawnCards = [];
    component.revealed = [];
    expect(component.currentCard).toBeNull();
    expect(component.isLast).toBe(true);
    expect(component.hasEffectUrl).toBe(false);
  });

  it('isExchangeable should return true for BOTH and COIN_ONLY exchange types', () => {
    const bothCard = mockDrawnCards[0];
    const shippingCard = mockDrawnCards[1];
    const coinCard = mockDrawnCards[2];

    expect(component.isExchangeable(bothCard)).toBe(true);
    expect(component.isExchangeable(shippingCard)).toBe(false);
    expect(component.isExchangeable(coinCard)).toBe(true);
  });

  it('toggleSelect should add/remove card from selection', () => {
    const card = mockDrawnCards[0];
    expect(component.selectedCardIds.has(card.id)).toBe(false);

    component.toggleSelect(card);
    expect(component.selectedCardIds.has(card.id)).toBe(true);

    component.toggleSelect(card);
    expect(component.selectedCardIds.has(card.id)).toBe(false);
  });

  it('toggleSelect should not add non-exchangeable cards', () => {
    const shippingCard = mockDrawnCards[1];
    component.toggleSelect(shippingCard);
    expect(component.selectedCardIds.has(shippingCard.id)).toBe(false);
  });

  it('selectedTotalCoins should calculate total coins from selected cards', () => {
    component.selectedCardIds.add(mockDrawnCards[0].id);
    component.selectedCardIds.add(mockDrawnCards[2].id);
    expect(component.selectedTotalCoins).toBe(150);
  });

  it('selectedTotalCoins should return 0 when no cards selected', () => {
    expect(component.selectedTotalCoins).toBe(0);
  });

  it('hasSelectedCards should return true only when cards are selected', () => {
    expect(component.hasSelectedCards).toBe(false);
    component.selectedCardIds.add(mockDrawnCards[0].id);
    expect(component.hasSelectedCards).toBe(true);
  });

  it('executeExchange should exchange selected cards', async () => {
    component.selectedCardIds.add(mockDrawnCards[0].id);
    component.selectedCardIds.add(mockDrawnCards[2].id);

    await component.executeExchange();

    expect(mockCardService.exchangeCard).toHaveBeenCalledWith(
      mockDrawnCards[0].id,
    );
    expect(mockCardService.exchangeCard).toHaveBeenCalledWith(
      mockDrawnCards[2].id,
    );
    expect(mockUserService.updateUser).toHaveBeenCalled();
    expect(mockUserService.saveCoin).toHaveBeenCalledWith(1150);
  });

  it('executeExchange should remove exchanged cards from drawnCards', async () => {
    component.selectedCardIds.add(mockDrawnCards[0].id);

    await component.executeExchange();

    expect(component.drawnCards.length).toBe(2);
    expect(
      component.drawnCards.find((c) => c.id === mockDrawnCards[0].id),
    ).toBeUndefined();
  });

  it('executeExchange should clear selected cards after exchange', async () => {
    component.selectedCardIds.add(mockDrawnCards[0].id);

    await component.executeExchange();

    expect(component.selectedCardIds.size).toBe(0);
  });
});
