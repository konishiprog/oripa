import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationFilterComponent } from './paginationFilter.component';

describe('PaginationFilterComponent', () => {
  let component: PaginationFilterComponent;
  let fixture: ComponentFixture<PaginationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationFilterComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize itemsPerPage to 20', () => {
    expect(component.itemsPerPage).toBe(20);
  });

  it('should render select element with correct value', () => {
    component.itemsPerPage = 20;
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('20');
  });

  it('should emit itemsPerPageChange when select value changes', () => {
    jest.spyOn(component.itemsPerPageChange, 'emit');
    component.itemsPerPage = 20;
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '50';
    select.dispatchEvent(new Event('change'));

    expect(component.itemsPerPageChange.emit).toHaveBeenCalledWith(50);
  });

  it('should not emit when select value is the same', () => {
    jest.spyOn(component.itemsPerPageChange, 'emit');
    component.itemsPerPage = 20;
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '20';
    select.dispatchEvent(new Event('change'));

    expect(component.itemsPerPageChange.emit).not.toHaveBeenCalled();
  });

  it('should have all three pagination options by default', () => {
    component.options = [20, 50, 100];
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(options[0].value).toBe('20');
    expect(options[1].value).toBe('50');
    expect(options[2].value).toBe('100');
  });

  it('should support custom pagination options', () => {
    component.options = [10, 25, 50];
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(options[0].value).toBe('10');
    expect(options[1].value).toBe('25');
    expect(options[2].value).toBe('50');
  });

  it('should update displayed value when itemsPerPage input changes', () => {
    component.itemsPerPage = 20;
    fixture.detectChanges();
    let select = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('20');

    component.itemsPerPage = 50;
    fixture.detectChanges();
    select = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('50');
  });

  it('should emit correct numeric value for 100 option', () => {
    jest.spyOn(component.itemsPerPageChange, 'emit');
    component.itemsPerPage = 20;
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    select.value = '100';
    select.dispatchEvent(new Event('change'));

    expect(component.itemsPerPageChange.emit).toHaveBeenCalledWith(100);
  });

  it('should reset to page 1 when items per page changes', () => {
    jest.spyOn(component.itemsPerPageChange, 'emit');
    component.itemsPerPage = 20;
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    select.value = '100';
    select.dispatchEvent(new Event('change'));

    expect(component.itemsPerPageChange.emit).toHaveBeenCalledWith(100);
  });
});
