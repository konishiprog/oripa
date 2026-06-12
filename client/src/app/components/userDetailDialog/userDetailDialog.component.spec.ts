import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import {
  UserDetailDialogComponent,
  UserDetailMode,
} from './userDetailDialog.component';
import { User } from '../userManagement/userManagement.component';

describe('UserDetailDialogComponent', () => {
  let component: UserDetailDialogComponent;
  let fixture: ComponentFixture<UserDetailDialogComponent>;
  let dialogRef: any;

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'user@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    nickname: 'Tester',
    coin: 1000,
    postalCode: '123-4567',
    prefecture: 'Tokyo',
    address: '123 Main St',
    buildingName: 'Tower A',
    phone: '09012345678',
  };

  beforeEach(async () => {
    const dialogRefMock = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [UserDetailDialogComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { user: mockUser, mode: UserDetailMode.View },
        },
        TranslateService,
      ],
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(UserDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize with view mode by default', () => {
      expect(component.mode).toBe(UserDetailMode.View);
    });

    it('should initialize with edit mode when provided', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [UserDetailDialogComponent],
        imports: [TranslateModule.forRoot(), FormsModule],
        providers: [
          { provide: MatDialogRef, useValue: { close: jest.fn() } },
          {
            provide: MAT_DIALOG_DATA,
            useValue: { user: mockUser, mode: UserDetailMode.Edit },
          },
          TranslateService,
        ],
      });

      const newFixture = TestBed.createComponent(UserDetailDialogComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.mode).toBe(UserDetailMode.Edit);
    });

    it('should copy user data', () => {
      expect(component.user.email).toBe('user@example.com');
      expect(component.user.firstName).toBe('Test');
      expect(component.user.lastName).toBe('User');
    });
  });

  describe('isEditMode', () => {
    it('should return true when in edit mode', () => {
      component.mode = UserDetailMode.Edit;
      expect(component.isEditMode).toBe(true);
    });

    it('should return false when in view mode', () => {
      component.mode = UserDetailMode.View;
      expect(component.isEditMode).toBe(false);
    });
  });

  describe('onClose', () => {
    it('should close dialog without data', () => {
      component.onClose();

      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.mode = UserDetailMode.Edit;
    });

    it('should validate form before submission', () => {
      component.user.email = '';
      jest.spyOn(component as any, 'isValidForm').mockReturnValue(false);

      component.onSubmit();

      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should close dialog with edited data on valid submission', () => {
      component.user = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'User',
      };
      jest.spyOn(component as any, 'isValidForm').mockReturnValue(true);

      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalledWith({
        mode: 'edit',
        data: expect.objectContaining({
          firstName: 'Updated',
          lastName: 'User',
        }),
      });
    });
  });

  describe('isValidForm', () => {
    beforeEach(() => {
      component.user = { ...mockUser };
    });

    it('should return true for valid form', () => {
      const result = (component as any).isValidForm();

      expect(result).toBe(true);
    });

    it('should return false when email is empty', () => {
      component.user.email = '';
      const result = (component as any).isValidForm();

      expect(result).toBe(false);
    });

    it('should return false when password is empty', () => {
      component.user.password = '';
      const result = (component as any).isValidForm();

      expect(result).toBe(false);
    });

    it('should return false when firstName is empty', () => {
      component.user.firstName = '';
      const result = (component as any).isValidForm();

      expect(result).toBe(false);
    });

    it('should return false when lastName is empty', () => {
      component.user.lastName = '';
      const result = (component as any).isValidForm();

      expect(result).toBe(false);
    });
  });

  describe('view mode rendering', () => {
    it('should display all user information in view mode', () => {
      component.mode = UserDetailMode.View;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('user@example.com');
      expect(compiled.textContent).toContain('Test');
      expect(compiled.textContent).toContain('User');
      expect(compiled.textContent).toContain('1000');
    });

    it('should not display form in view mode', () => {
      component.mode = UserDetailMode.View;
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeFalsy();
    });
  });

  describe('edit mode rendering', () => {
    beforeEach(() => {
      component.mode = UserDetailMode.Edit;
      fixture.detectChanges();
    });

    it('should display form in edit mode', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should have input fields for all editable properties', () => {
      const inputs = fixture.nativeElement.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should display save button in edit mode', () => {
      const saveBtn = fixture.nativeElement.querySelector('.submit-btn');
      expect(saveBtn).toBeTruthy();
      expect(saveBtn).toBeTruthy();
    });
  });
});
