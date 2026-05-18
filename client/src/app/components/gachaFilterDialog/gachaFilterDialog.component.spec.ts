import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  GachaFilterDialogComponent,
  GachaFilterCriteria,
  DEFAULT_GACHA_FILTER_CRITERIA,
} from './gachaFilterDialog.component';

describe('GachaFilterDialogComponent', () => {
  let component: GachaFilterDialogComponent;
  let fixture: ComponentFixture<GachaFilterDialogComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<GachaFilterDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [GachaFilterDialogComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GachaFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default criteria', () => {
    expect(component.criteria).toEqual(DEFAULT_GACHA_FILTER_CRITERIA);
  });

  it('should initialize with provided criteria', async () => {
    const customCriteria: GachaFilterCriteria = {
      publishStartFrom: '2024-01-01',
      publishStartTo: '2024-12-31',
      costMin: 100,
      costMax: 500,
      publicStatus: 'public',
      cardCountPreset: '1-10',
    };

    const dialogData = { criteria: customCriteria };
    await TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [GachaFilterDialogComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    });

    const newFixture = TestBed.createComponent(GachaFilterDialogComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.criteria.publishStartFrom).toBe('2024-01-01');
    expect(newComponent.criteria.costMin).toBe(100);
    expect(newComponent.criteria.publicStatus).toBe('public');
  });

  it('should set public status', () => {
    component.setPublicStatus('private');
    expect(component.criteria.publicStatus).toBe('private');
  });

  it('should set card count preset', () => {
    component.setCardCountPreset('11-50');
    expect(component.criteria.cardCountPreset).toBe('11-50');
  });

  it('should reset criteria to default', () => {
    component.criteria.costMin = 100;
    component.criteria.publicStatus = 'public';
    component.onReset();
    expect(component.criteria).toEqual(DEFAULT_GACHA_FILTER_CRITERIA);
  });

  it('should close dialog without result on close', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close dialog with normalized criteria on apply', () => {
    component.criteria.publishStartFrom = '2024-01-01';
    component.criteria.costMin = 100;
    component.criteria.costMax = 500;
    component.criteria.publicStatus = 'public';
    component.criteria.cardCountPreset = '1-10';

    component.onApply();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      publishStartFrom: '2024-01-01',
      publishStartTo: null,
      costMin: 100,
      costMax: 500,
      publicStatus: 'public',
      cardCountPreset: '1-10',
    });
  });

  it('should normalize empty string to null on apply', () => {
    component.criteria.publishStartFrom = '';
    component.onApply();

    const callArgs = (mockDialogRef.close as jest.Mock).mock.calls[0][0];
    expect(callArgs.publishStartFrom).toBeNull();
  });

  it('should normalize null cost values on apply', () => {
    component.criteria.costMin = null;
    component.criteria.costMax = null;

    component.onApply();

    const callArgs = (mockDialogRef.close as jest.Mock).mock.calls[0][0];
    expect(callArgs.costMin).toBeNull();
    expect(callArgs.costMax).toBeNull();
  });

  it('should generate correct translation key for public status', () => {
    const key = component.getPublicStatusTranslationKey('public');
    expect(key).toBe('filter-dialog.public-status-public');
  });

  it('should generate correct translation key for card count', () => {
    const key = component.getCardCountTranslationKey('11-50');
    expect(key).toBe('filter-dialog.card-count-11-50');
  });

  it('should have correct public status options', () => {
    expect(component.publicStatusOptions).toEqual(['all', 'public', 'private']);
  });

  it('should have correct card count options', () => {
    expect(component.cardCountOptions).toEqual([
      'all',
      '0',
      '1-10',
      '11-50',
      '51-100',
      '101+',
    ]);
  });
});
