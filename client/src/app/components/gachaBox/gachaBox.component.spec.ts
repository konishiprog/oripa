import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GachaBoxComponent } from './gachaBox.component';

describe('GachaBoxComponent', () => {
  let component: GachaBoxComponent;
  let fixture: ComponentFixture<GachaBoxComponent>;
  let mockTranslateService: any;

  beforeEach(async () => {
    mockTranslateService = {
      instant: jest.fn((key) => (key === 'common.unit.point' ? 'P' : '')),
    };

    await TestBed.configureTestingModule({
      declarations: [GachaBoxComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GachaBoxComponent);
    component = fixture.componentInstance;
    component.gacha = {
      id: 'test-gacha-id',
      name: 'Test Gacha',
      headerImage: '',
      consumptionType: 'COIN',
      cost: 500,
      oncePerUser: false,
      alreadyDrawn: false,
      remainingCount: 5,
      publishEnd: null,
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formatPrice should format with P suffix and commas', () => {
    expect(component.formatPrice(12345)).toBe('12,345P');
  });
});
