import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActionMenuComponent } from './actionMenu.component';

describe('ActionMenuComponent', () => {
  let component: ActionMenuComponent;
  let fixture: ComponentFixture<ActionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActionMenuComponent],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatMenuModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event when onEdit is called', () => {
    jest.spyOn(component.edit, 'emit');
    component.onEdit();
    expect(component.edit.emit).toHaveBeenCalled();
  });

  it('should emit delete event when onDelete is called', () => {
    jest.spyOn(component.delete, 'emit');
    component.onDelete();
    expect(component.delete.emit).toHaveBeenCalled();
  });

  it('should not emit delete when onEdit is called', () => {
    jest.spyOn(component.delete, 'emit');
    component.onEdit();
    expect(component.delete.emit).not.toHaveBeenCalled();
  });

  it('should not emit edit when onDelete is called', () => {
    jest.spyOn(component.edit, 'emit');
    component.onDelete();
    expect(component.edit.emit).not.toHaveBeenCalled();
  });
});
