import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ConfirmUpdateDialogComponent, ConfirmDialogData } from './confirm-update-dialog.component';

describe('ConfirmUpdateDialogComponent', () => {
  let component: ConfirmUpdateDialogComponent;
  let fixture: ComponentFixture<ConfirmUpdateDialogComponent>;
  let mockDialogRef: any;
  let mockTranslateService: any;

  const mockDialogData: ConfirmDialogData = {
    labelKey: 'my-page.address',
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn(),
    };
    mockTranslateService = {
      instant: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [ConfirmUpdateDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmUpdateDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive dialog data', () => {
    expect(component.data).toEqual(mockDialogData);
  });

  it('should close dialog with true on confirm', () => {
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
