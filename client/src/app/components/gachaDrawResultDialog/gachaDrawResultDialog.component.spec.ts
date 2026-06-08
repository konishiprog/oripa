import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { GachaDrawResultDialogComponent } from './gachaDrawResultDialog.component';

describe('GachaDrawResultDialogComponent', () => {
  let component: GachaDrawResultDialogComponent;
  let fixture: ComponentFixture<GachaDrawResultDialogComponent>;
  let dialogRef: jest.Mocked<MatDialogRef<GachaDrawResultDialogComponent>>;

  const mockDrawnCards = [
    {
      id: 'card-1',
      name: 'カード1',
      imageFront: 'front1.jpg',
      imageBack: 'back.jpg',
      cardType: 'SSR',
      effectUrl: 'effect1.mp4',
    },
    {
      id: 'card-2',
      name: 'カード2',
      imageFront: 'front2.jpg',
      imageBack: 'back.jpg',
      cardType: 'R',
    },
    {
      id: 'card-3',
      name: 'カード3',
      imageFront: 'front3.jpg',
      imageBack: 'back.jpg',
      cardType: 'SR',
      effectUrl: 'effect3.mp4',
    },
  ];

  beforeEach(async () => {
    const dialogRefSpy = {
      close: jest.fn<void, []>(),
      updateSize: jest.fn(),
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
});
