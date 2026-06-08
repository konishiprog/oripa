import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GachaDrawButtonsComponent } from './gachaDrawButtons.component';
import { GachaDrawService } from '../gacha-draw.service';

describe('GachaDrawButtonsComponent', () => {
  let component: GachaDrawButtonsComponent;
  let fixture: ComponentFixture<GachaDrawButtonsComponent>;
  let mockGachaDrawService: any;

  const mockGacha = {
    id: 'gacha-1',
    cost: 1000,
    oncePerUser: false,
    alreadyDrawn: false,
    remainingCount: 100,
    consumptionType: 'COIN',
  };

  beforeEach(async () => {
    mockGachaDrawService = {
      effectiveDrawCount: jest.fn((gacha, requested) => {
        return Math.min(requested, gacha.remainingCount);
      }),
    };

    await TestBed.configureTestingModule({
      declarations: [GachaDrawButtonsComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: GachaDrawService, useValue: mockGachaDrawService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GachaDrawButtonsComponent);
    component = fixture.componentInstance;
    component.gacha = mockGacha;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have compact variant by default', () => {
    expect(component.variant).toBe('compact');
  });

  it('should accept full variant', () => {
    component.variant = 'full';
    expect(component.variant).toBe('full');
  });

  it('should emit drawRequested with correct count on button click', () => {
    let emittedCount: number | undefined;
    component.drawRequested.subscribe((count) => {
      emittedCount = count;
    });

    component.onDraw(new Event('click'), 10);

    expect(emittedCount).toBe(10);
  });

  it('should emit drawRequested for all remaining cards', () => {
    let emittedCount: number | undefined;
    component.drawRequested.subscribe((count) => {
      emittedCount = count;
    });

    component.onDraw(new Event('click'), component.gacha.remainingCount);

    expect(emittedCount).toBe(component.gacha.remainingCount);
  });

  it('should calculate effective draw count via service', () => {
    const result = component.effectiveDrawCount(10);

    expect(mockGachaDrawService.effectiveDrawCount).toHaveBeenCalledWith(
      mockGacha,
      10,
    );
    expect(result).toBe(10);
  });

  it('should return effective draw count when limited by remaining', () => {
    component.gacha = { ...mockGacha, remainingCount: 5 };
    const result = component.effectiveDrawCount(10);

    expect(result).toBe(5);
  });

  it('should disable single draw button when not logged in', () => {
    component.isLoggedIn = false;
    fixture.detectChanges();

    const singleBtn = fixture.nativeElement.querySelector('.draw-btn-single');
    expect(singleBtn.disabled).toBe(true);
  });

  it('should disable draw buttons when drawing', () => {
    component.isLoggedIn = true;
    component.isDrawing = true;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.draw-btn');
    buttons.forEach((btn: HTMLButtonElement) => {
      expect(btn.disabled).toBe(true);
    });
  });

  it('should disable ten button when remaining < 10', () => {
    component.isLoggedIn = true;
    component.gacha = { ...mockGacha, remainingCount: 5 };
    fixture.detectChanges();

    const tenBtn = fixture.nativeElement.querySelector('.draw-btn-ten');
    expect(tenBtn.disabled).toBe(true);
  });

  it('should disable hundred button when remaining < 100', () => {
    component.isLoggedIn = true;
    component.gacha = { ...mockGacha, remainingCount: 50 };
    fixture.detectChanges();

    const hundredBtn = fixture.nativeElement.querySelector('.draw-btn-hundred');
    expect(hundredBtn.disabled).toBe(true);
  });

  it('should show login notice when not logged in', () => {
    component.isLoggedIn = false;
    fixture.detectChanges();

    const notice = fixture.nativeElement.querySelector('.login-notice');
    expect(notice).toBeTruthy();
  });

  it('should hide login notice when logged in', () => {
    component.isLoggedIn = true;
    fixture.detectChanges();

    const notice = fixture.nativeElement.querySelector('.login-notice');
    expect(notice).toBeFalsy();
  });

  it('should show already-drawn notice for once-per-user gacha when already drawn', () => {
    component.isLoggedIn = true;
    component.gacha = { ...mockGacha, oncePerUser: true, alreadyDrawn: true };
    fixture.detectChanges();

    const notice = fixture.nativeElement.querySelector('.already-drawn-notice');
    expect(notice).toBeTruthy();
  });

  it('should show out-of-stock notice when remaining count is 0', () => {
    component.isLoggedIn = true;
    component.gacha = { ...mockGacha, remainingCount: 0 };
    fixture.detectChanges();

    const notice = fixture.nativeElement.querySelector('.out-of-stock');
    expect(notice).toBeTruthy();
  });

  it('should apply compact class when variant is compact', () => {
    component.variant = 'compact';
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector(
      '.draw-buttons-wrapper',
    );
    expect(wrapper.classList.contains('compact')).toBe(true);
    expect(wrapper.classList.contains('full')).toBe(false);
  });

  it('should apply full class when variant is full', () => {
    component.variant = 'full';
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector(
      '.draw-buttons-wrapper',
    );
    expect(wrapper.classList.contains('full')).toBe(true);
    expect(wrapper.classList.contains('compact')).toBe(false);
  });

  it('should stop propagation on button click', () => {
    const event = new Event('click');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    component.onDraw(event, 1);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
