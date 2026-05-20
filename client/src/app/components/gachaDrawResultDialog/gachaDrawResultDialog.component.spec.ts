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
      cardType: 'rare',
    },
    {
      id: 'card-2',
      name: 'カード2',
      imageFront: 'front2.jpg',
      imageBack: 'back.jpg',
      cardType: 'common',
    },
    {
      id: 'card-3',
      name: 'カード3',
      imageFront: 'front3.jpg',
      imageBack: 'back.jpg',
      cardType: 'sr',
    },
  ];

  beforeEach(async () => {
    const dialogRefSpy = {
      close: jest.fn<void, []>(),
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
  });

  it('currentCard should return card at current index', () => {
    expect(component.currentCard).toEqual(mockDrawnCards[0]);
    component.currentIndex = 1;
    expect(component.currentCard).toEqual(mockDrawnCards[1]);
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

  it('reveal should mark current card as revealed', () => {
    expect(component.revealed[0]).toBe(false);
    component.reveal();
    expect(component.revealed[0]).toBe(true);
  });

  it('reveal should not change if already revealed', () => {
    component.revealed[0] = true;
    component.reveal();
    expect(component.revealed[0]).toBe(true);
  });

  it('next should reveal if not yet revealed', () => {
    expect(component.revealed[0]).toBe(false);
    component.next();
    expect(component.revealed[0]).toBe(true);
    expect(component.currentIndex).toBe(0);
  });

  it('next should advance to next card if already revealed', () => {
    component.revealed[0] = true;
    component.next();
    expect(component.currentIndex).toBe(1);
  });

  it('next should show summary if already revealed and is last card', () => {
    component.currentIndex = 2;
    component.revealed[2] = true;
    component.next();
    expect(component.showSummary).toBe(true);
  });

  it('revealAll should mark all cards as revealed and show summary', () => {
    component.revealAll();
    expect(component.revealed).toEqual([true, true, true]);
    expect(component.showSummary).toBe(true);
  });

  it('close should close the dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should handle empty drawn cards gracefully', () => {
    component.drawnCards = [];
    component.revealed = [];
    expect(component.currentCard).toBe(null);
    expect(component.isLast).toBe(true);
  });
});
