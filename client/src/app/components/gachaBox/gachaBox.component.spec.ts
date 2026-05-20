import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { GachaBoxComponent } from './gachaBox.component';

describe('GachaBoxComponent', () => {
  let component: GachaBoxComponent;
  let fixture: ComponentFixture<GachaBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GachaBoxComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GachaBoxComponent);
    component = fixture.componentInstance;
    component.gacha = {
      id: 'test-gacha-id',
      name: 'Test Gacha',
      headerImage: '',
      cost: 500,
      remainingCount: 5,
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formatPrice should format with yen symbol and commas', () => {
    expect(component.formatPrice(12345)).toBe('¥12,345');
  });

  it('effectiveDrawCount returns min of requested and remaining', () => {
    expect(component.effectiveDrawCount(1)).toBe(1);
    expect(component.effectiveDrawCount(10)).toBe(5);
  });
});
