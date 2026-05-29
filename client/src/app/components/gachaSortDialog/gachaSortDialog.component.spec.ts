import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  GachaSortDialogComponent,
  GachaSortOrder,
} from './gachaSortDialog.component';

describe('GachaSortDialogComponent', () => {
  let component: GachaSortDialogComponent;
  let fixture: ComponentFixture<GachaSortDialogComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<GachaSortDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [GachaSortDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { sortOrder: 'newest' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GachaSortDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided sort order', () => {
    expect(component.selectedOrder).toBe('newest');
  });

  it('should initialize with default newest when no data provided', async () => {
    await TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [GachaSortDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    });

    const newFixture = TestBed.createComponent(GachaSortDialogComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.selectedOrder).toBe('newest');
  });

  it('should have all 5 sort options', () => {
    expect(component.sortOptions.length).toBe(5);
    expect(component.sortOptions).toEqual([
      'newest',
      'cost-high',
      'cost-low',
      'remaining-high',
      'remaining-low',
    ]);
  });

  it('should select a sort option', () => {
    component.selectOption('cost-high');
    expect(component.selectedOrder).toBe('cost-high');
    expect(mockDialogRef.close).toHaveBeenCalledWith('cost-high');
  });

  it('should close dialog without result on onClose', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should generate correct translation key for newest', () => {
    const key = component.getTranslationKey('newest');
    expect(key).toBe('user-gacha.sort-dialog.newest');
  });

  it('should generate correct translation key for cost-high', () => {
    const key = component.getTranslationKey('cost-high');
    expect(key).toBe('user-gacha.sort-dialog.cost-high');
  });

  it('should generate correct translation key for cost-low', () => {
    const key = component.getTranslationKey('cost-low');
    expect(key).toBe('user-gacha.sort-dialog.cost-low');
  });

  it('should generate correct translation key for remaining-high', () => {
    const key = component.getTranslationKey('remaining-high');
    expect(key).toBe('user-gacha.sort-dialog.remaining-high');
  });

  it('should generate correct translation key for remaining-low', () => {
    const key = component.getTranslationKey('remaining-low');
    expect(key).toBe('user-gacha.sort-dialog.remaining-low');
  });

  it('should update selected order when different option is selected', () => {
    component.selectedOrder = 'newest';
    component.selectOption('remaining-low');
    expect(component.selectedOrder).toBe('remaining-low');
  });
});
